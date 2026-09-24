import os
import sys
import sqlite3
import json

# Force UTF-8 encoding on standard streams for Windows
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WatchWise.settings")

import django
django.setup()

from django.db import connection, transaction
from django.contrib.auth.models import User
from movies.models import Movie, Genre, Playlist, WatchHistory
from reviews.models import Review
from groups.models import Group, GroupPost, GroupComment

def find_sqlite_file():
    candidates = [
        os.path.join(backend_dir, "db.sqlite3"),
        os.path.join(os.path.dirname(backend_dir), "db.sqlite3"),
        os.path.join(os.getcwd(), "db.sqlite3"),
        os.path.join(os.getcwd(), "backend", "db.sqlite3"),
    ]
    for c in candidates:
        if os.path.isfile(c) and os.path.getsize(c) > 0:
            return c
    return None

def migrate_all():
    sqlite_path = find_sqlite_file()
    if not sqlite_path:
        print("[X] SQLite database file db.sqlite3 was not found.", flush=True)
        return

    print("=" * 65, flush=True)
    print("WatchWise SQLite -> PostgreSQL Migration Engine", flush=True)
    print(f"Source SQLite : {sqlite_path} ({os.path.getsize(sqlite_path) // 1024} KB)", flush=True)
    print(f"Target Postgres: {connection.settings_dict.get('HOST')} ({connection.settings_dict.get('NAME')})", flush=True)
    print("=" * 65, flush=True)

    conn_sqlite = sqlite3.connect(sqlite_path)
    conn_sqlite.row_factory = sqlite3.Row
    cursor_sqlite = conn_sqlite.cursor()

    # 1. Migrate Users
    print("\n[1/7] Migrating Users...", flush=True)
    user_id_map = {}
    try:
        cursor_sqlite.execute("SELECT id, username, email, password, is_staff, is_superuser, is_active FROM auth_user")
        sqlite_users = cursor_sqlite.fetchall()
        for u in sqlite_users:
            user, created = User.objects.get_or_create(
                username=u["username"],
                defaults={
                    "email": u["email"] or "",
                    "is_staff": bool(u["is_staff"]),
                    "is_superuser": bool(u["is_superuser"]),
                    "is_active": bool(u["is_active"])
                }
            )
            if u["password"]:
                user.password = u["password"]
                user.save()
            user_id_map[u["id"]] = user
        print(f"   [+] Synced {len(user_id_map)} users.", flush=True)
    except Exception as e:
        print(f"   [!] Note on users: {e}", flush=True)

    # 2. Migrate Genres
    print("\n[2/7] Migrating Genres...", flush=True)
    genre_id_map = {}
    try:
        cursor_sqlite.execute("SELECT id, name, tmdb_id FROM movies_genre")
        sqlite_genres = cursor_sqlite.fetchall()
        for g in sqlite_genres:
            genre, _ = Genre.objects.get_or_create(
                name=g["name"],
                defaults={"tmdb_id": g["tmdb_id"]}
            )
            genre_id_map[g["id"]] = genre
        print(f"   [+] Synced {len(genre_id_map)} genres.", flush=True)
    except Exception as e:
        print(f"   [!] Note on genres: {e}", flush=True)

    # 3. Migrate Movies
    print("\n[3/7] Migrating Movies & Media...", flush=True)
    movie_id_map = {}
    try:
        cursor_sqlite.execute("""
            SELECT id, title, overview, tagline, release_year, release_date,
                   language, original_title, original_language, vote_average,
                   vote_count, popularity, tmdb_id, poster, backdrop,
                   trailer_url, duration_minutes, streaming_on, mood_tags,
                   featured, created_by_id
            FROM movies_movie
        """)
        sqlite_movies = cursor_sqlite.fetchall()

        cursor_sqlite.execute("SELECT movie_id, genre_id FROM movies_movie_genres")
        movie_genre_links = cursor_sqlite.fetchall()
        movie_to_genres = {}
        for row in movie_genre_links:
            movie_to_genres.setdefault(row["movie_id"], []).append(row["genre_id"])

        for m in sqlite_movies:
            streaming_val = m["streaming_on"]
            if isinstance(streaming_val, str) and streaming_val:
                try:
                    streaming_val = json.loads(streaming_val)
                except Exception:
                    streaming_val = []
            elif not streaming_val:
                streaming_val = []

            mood_val = m["mood_tags"]
            if isinstance(mood_val, str) and mood_val:
                try:
                    mood_val = json.loads(mood_val)
                except Exception:
                    mood_val = []
            elif not mood_val:
                mood_val = []

            creator = user_id_map.get(m["created_by_id"])

            movie, created = Movie.objects.update_or_create(
                title=m["title"],
                release_year=m["release_year"],
                defaults={
                    "overview": m["overview"] or "",
                    "tagline": m["tagline"] or "",
                    "release_date": m["release_date"] or "",
                    "language": m["language"] or "English",
                    "original_title": m["original_title"] or "",
                    "original_language": m["original_language"] or "en",
                    "vote_average": float(m["vote_average"] or 0.0),
                    "vote_count": int(m["vote_count"] or 0),
                    "popularity": float(m["popularity"] or 0.0),
                    "tmdb_id": m["tmdb_id"],
                    "poster": m["poster"] or "",
                    "backdrop": m["backdrop"] or "",
                    "trailer_url": m["trailer_url"] or "",
                    "duration_minutes": m["duration_minutes"] or 120,
                    "streaming_on": streaming_val,
                    "mood_tags": mood_val,
                    "featured": bool(m["featured"]),
                    "created_by": creator
                }
            )
            movie_id_map[m["id"]] = movie

            genre_pks = movie_to_genres.get(m["id"], [])
            attached_genres = [genre_id_map[g_id] for g_id in genre_pks if g_id in genre_id_map]
            if attached_genres:
                movie.genres.set(attached_genres)

        print(f"   [+] Synced {len(movie_id_map)} movies with genres, trailers & posters.", flush=True)
    except Exception as e:
        print(f"   [!] Error migrating movies: {e}", flush=True)

    # 4. Migrate Reviews
    print("\n[4/7] Migrating Reviews & Ratings...", flush=True)
    review_count = 0
    try:
        cursor_sqlite.execute("SELECT id, movie_id, user_id, rating, review_text, contains_spoiler FROM reviews_review")
        sqlite_reviews = cursor_sqlite.fetchall()
        for r in sqlite_reviews:
            movie = movie_id_map.get(r["movie_id"])
            user = user_id_map.get(r["user_id"])
            if movie and user:
                Review.objects.update_or_create(
                    movie=movie,
                    user=user,
                    defaults={
                        "rating": r["rating"],
                        "review_text": r["review_text"] or "",
                        "contains_spoiler": bool(r["contains_spoiler"])
                    }
                )
                review_count += 1
        print(f"   [+] Synced {review_count} user reviews.", flush=True)
    except Exception as e:
        print(f"   [!] Note on reviews: {e}", flush=True)

    # 5. Migrate Watch History
    print("\n[5/7] Migrating Watch History...", flush=True)
    watch_count = 0
    try:
        cursor_sqlite.execute("SELECT user_id, movie_id, watched, rating FROM movies_watchhistory")
        sqlite_watch = cursor_sqlite.fetchall()
        for w in sqlite_watch:
            movie = movie_id_map.get(w["movie_id"])
            user = user_id_map.get(w["user_id"])
            if movie and user:
                WatchHistory.objects.update_or_create(
                    user=user,
                    movie=movie,
                    defaults={
                        "watched": bool(w["watched"]),
                        "rating": w["rating"]
                    }
                )
                watch_count += 1
        print(f"   [+] Synced {watch_count} watch history records.", flush=True)
    except Exception as e:
        print(f"   [!] Note on watch history: {e}", flush=True)

    # 6. Migrate Playlists
    print("\n[6/7] Migrating Playlists...", flush=True)
    playlist_count = 0
    try:
        cursor_sqlite.execute("SELECT id, title, description, cover, created_by_id FROM movies_playlist")
        sqlite_playlists = cursor_sqlite.fetchall()

        cursor_sqlite.execute("SELECT playlist_id, movie_id FROM movies_playlist_movies")
        playlist_movie_links = cursor_sqlite.fetchall()
        playlist_to_movies = {}
        for row in playlist_movie_links:
            playlist_to_movies.setdefault(row["playlist_id"], []).append(row["movie_id"])

        for p in sqlite_playlists:
            user = user_id_map.get(p["created_by_id"])
            if user:
                playlist, _ = Playlist.objects.update_or_create(
                    title=p["title"],
                    created_by=user,
                    defaults={
                        "description": p["description"] or "",
                        "cover": p["cover"] or ""
                    }
                )
                movie_pks = playlist_to_movies.get(p["id"], [])
                p_movies = [movie_id_map[m_id] for m_id in movie_pks if m_id in movie_id_map]
                if p_movies:
                    playlist.movies.set(p_movies)
                playlist_count += 1
        print(f"   [+] Synced {playlist_count} playlists.", flush=True)
    except Exception as e:
        print(f"   [!] Note on playlists: {e}", flush=True)

    # 7. Migrate Groups / Clubs
    print("\n[7/7] Migrating Community Clubs...", flush=True)
    club_count = 0
    try:
        cursor_sqlite.execute("SELECT id, name, description, avatar, category, created_by_id FROM groups_group")
        sqlite_groups = cursor_sqlite.fetchall()

        cursor_sqlite.execute("SELECT group_id, user_id FROM groups_group_members")
        group_member_links = cursor_sqlite.fetchall()
        group_to_members = {}
        for row in group_member_links:
            group_to_members.setdefault(row["group_id"], []).append(row["user_id"])

        for g in sqlite_groups:
            creator = user_id_map.get(g["created_by_id"])
            club, _ = Group.objects.update_or_create(
                name=g["name"],
                defaults={
                    "description": g["description"] or "",
                    "avatar": g["avatar"] or "",
                    "category": g["category"] or "Discussion",
                    "created_by": creator
                }
            )
            member_ids = group_to_members.get(g["id"], [])
            club_members = [user_id_map[u_id] for u_id in member_ids if u_id in user_id_map]
            if club_members:
                club.members.set(club_members)
            club_count += 1
        print(f"   [+] Synced {club_count} community clubs.", flush=True)
    except Exception as e:
        print(f"   [!] Note on clubs: {e}", flush=True)

    conn_sqlite.close()

    print("\n" + "=" * 65, flush=True)
    print("Migration Complete! All SQLite data is now live in PostgreSQL.", flush=True)
    print("=" * 65, flush=True)

if __name__ == "__main__":
    migrate_all()
