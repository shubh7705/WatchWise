#!/usr/bin/env python3
"""
WatchWise Movie Importer
------------------------
Reads a text file containing movie names and space-separated release years
(one movie per line), fetches authentic metadata from TMDb, and adds them to
the database via the backend API route (POST /api/movies/) or direct Django ORM.

Usage:
    python import_movies.py [path_to_movies.txt]

File format example (movies.txt):
    Inception 2010
    The Dark Knight 2008
    Interstellar 2014
    Spider-Man: Across the Spider-Verse 2023
    RRR 2022
    Oppenheimer 2023
    Kantara
"""

import sys
import os
import re
import requests

# Enable UTF-8 encoding on standard output for Windows compatibility
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Default configuration
API_BASE_URL = os.environ.get("WATCHWISE_API_URL", "http://127.0.0.1:8000/api")
ADMIN_USERNAME = os.environ.get("WATCHWISE_ADMIN_USER", "shubh")
TMDB_API_KEY = (
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NmM0ZWFmNmM3ZGNiMTRiMjQ5Njg4NTZkMjVjYmM2OSIsIm5iZiI6MTc2NTc2OTE3Ni4wMDcsInN1YiI6IjY5M2Y3ZmQ4MjJhMDg5ZDY3Njk5OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.L3KfPPqnwglsr-alY7hVHxOmAkAGFP13Xu_YUW0vseg"
)

TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
TMDB_DETAILS_URL = "https://api.themoviedb.org/3/movie"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/original"

HEADERS_TMDB = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_API_KEY}"
}

# Lazy Django initialization holder
_DJANGO_INITIALIZED = False


def init_django():
    """Initializes Django environment for direct ORM operations if backend server is offline."""
    global _DJANGO_INITIALIZED
    if _DJANGO_INITIALIZED:
        return True
    try:
        import django
        base_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.join(base_dir, "backend")
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WatchWise.settings")
        django.setup()
        _DJANGO_INITIALIZED = True
        return True
    except Exception as e:
        return False


def parse_movie_line(line):
    """
    Parses a line formatted as '<movie title> <optional 4-digit year>' or '<movie title> (<year>)'.
    Returns (title, year).
    """
    line = line.strip()
    if not line or line.startswith("#") or line.startswith("//"):
        return None, None

    # Check for title (year) format: e.g. "Inception (2010)"
    match_paren = re.search(r"^(.*?)\s*\((\d{4})\)$", line)
    if match_paren:
        title = match_paren.group(1).strip()
        year = int(match_paren.group(2))
        return title, year

    # Check for space-separated year at the end: e.g. "The Dark Knight 2008"
    match_space = re.search(r"^(.*?)\s+(\d{4})$", line)
    if match_space:
        title = match_space.group(1).strip()
        year = int(match_space.group(2))
        if 1880 <= year <= 2099:
            return title, year

    # No year provided, entire line is title
    return line, None


def fetch_tmdb_metadata(title, year=None):
    """
    Searches TMDb and retrieves comprehensive movie metadata.
    """
    params = {
        "query": title,
        "include_adult": False,
        "language": "en-US",
        "page": 1,
    }
    if year:
        params["year"] = year

    try:
        res = requests.get(TMDB_SEARCH_URL, headers=HEADERS_TMDB, params=params, timeout=10)
        res.raise_for_status()
        results = res.json().get("results", [])

        # If search with year returned nothing, retry without year restriction
        if not results and year:
            params.pop("year", None)
            res = requests.get(TMDB_SEARCH_URL, headers=HEADERS_TMDB, params=params, timeout=10)
            if res.ok:
                results = res.json().get("results", [])

        if not results:
            return None

        movie = results[0]
        movie_id = movie.get("id")

        # Fetch detailed information (runtime, trailer, tagline, genres)
        details = {}
        trailer_url = "https://www.youtube.com/watch?v=tQ0mzXRk-oI"
        runtime = None
        genre_ids = movie.get("genre_ids", [])
        tagline = ""

        try:
            d_res = requests.get(
                f"{TMDB_DETAILS_URL}/{movie_id}",
                headers=HEADERS_TMDB,
                params={"language": "en-US", "append_to_response": "videos"},
                timeout=10,
            )
            if d_res.ok:
                details = d_res.json()
                runtime = details.get("runtime")
                genre_ids = [g["id"] for g in details.get("genres", [])] or genre_ids
                tagline = details.get("tagline", "")

                videos = details.get("videos", {}).get("results", [])
                for v in videos:
                    if v.get("type") == "Trailer" and v.get("site") == "YouTube":
                        trailer_url = f"https://www.youtube.com/watch?v={v.get('key')}"
                        break
        except Exception:
            pass

        raw_lang = details.get("original_language") or movie.get("original_language", "en")
        lang_map = {
            "hi": "Hindi", "te": "Telugu", "ta": "Tamil", "ml": "Malayalam",
            "kn": "Kannada", "en": "English", "ko": "Korean", "ja": "Japanese",
            "es": "Spanish", "fr": "French", "de": "German", "zh": "Chinese"
        }

        vote_avg = details.get("vote_average") if details.get("vote_average") is not None else movie.get("vote_average", 0.0)
        vote_cnt = details.get("vote_count") if details.get("vote_count") is not None else movie.get("vote_count", 0)
        popularity = details.get("popularity") if details.get("popularity") is not None else movie.get("popularity", 0.0)
        release_date = details.get("release_date") or movie.get("release_date", "")
        resolved_year = int(release_date[:4]) if release_date and len(release_date) >= 4 else (year or None)

        poster_path = details.get("poster_path") or movie.get("poster_path")
        backdrop_path = details.get("backdrop_path") or movie.get("backdrop_path")

        return {
            "title": details.get("title") or movie.get("title", title),
            "original_title": details.get("original_title") or movie.get("original_title", ""),
            "original_language": raw_lang,
            "language": lang_map.get(raw_lang, raw_lang.title()),
            "overview": details.get("overview") or movie.get("overview", ""),
            "tagline": tagline,
            "release_year": resolved_year,
            "release_date": release_date,
            "duration_minutes": runtime or 130,
            "vote_average": round(float(vote_avg), 1),
            "vote_count": int(vote_cnt),
            "popularity": round(float(popularity), 1),
            "poster": f"{TMDB_IMAGE_BASE}{poster_path}" if poster_path else "",
            "backdrop": f"{TMDB_BACKDROP_BASE}{backdrop_path}" if backdrop_path else "",
            "trailer_url": trailer_url,
            "genres": genre_ids,
            "tmdb_id": movie_id,
            "streaming_on": ["Netflix", "Prime Video"],
            "mood_tags": ["Trending", "Must Watch"],
            "featured": False,
            "username": ADMIN_USERNAME,
        }

    except Exception as e:
        print(f"   [!] Error querying TMDb for '{title}': {e}")
        return None


def get_existing_movies(use_direct_db=False):
    """
    Fetches the list of existing movies from API or direct DB to avoid duplicates.
    """
    if not use_direct_db:
        try:
            res = requests.get(f"{API_BASE_URL}/movies/", timeout=3)
            if res.ok:
                data = res.json().get("movies", [])
                existing_tmdb_ids = {m.get("tmdb_id") for m in data if m.get("tmdb_id")}
                existing_titles = {m.get("title", "").strip().lower() for m in data}
                return existing_tmdb_ids, existing_titles
        except Exception:
            pass

    # Direct database lookup
    if init_django():
        from movies.models import Movie
        existing_tmdb_ids = set(Movie.objects.filter(tmdb_id__isnull=False).values_list("tmdb_id", flat=True))
        existing_titles = {t.strip().lower() for t in Movie.objects.values_list("title", flat=True)}
        return existing_tmdb_ids, existing_titles

    return set(), set()


def add_movie_via_api(payload):
    """
    Sends POST request to the backend movie creation endpoint (POST /api/movies/).
    """
    url = f"{API_BASE_URL}/movies/"
    try:
        res = requests.post(url, json=payload, timeout=10)
        if res.status_code == 201:
            return True, res.json().get("movie", {})
        else:
            try:
                err_msg = res.json().get("error", res.text)
            except Exception:
                err_msg = res.text
            return False, err_msg
    except requests.exceptions.ConnectionError:
        return None, "CONNECTION_OFFLINE"
    except Exception as e:
        return False, str(e)


def add_movie_via_orm(payload):
    """
    Directly adds movie to database using Django ORM (fallback when backend server is offline).
    """
    if not init_django():
        return False, "Django initialization failed"

    from movies.models import Movie, Genre
    from django.contrib.auth.models import User
    from django.db.models import Q

    try:
        user = User.objects.filter(username__iexact=ADMIN_USERNAME).first()
        movie = Movie.objects.create(
            title=payload.get("title", "Untitled"),
            original_title=payload.get("original_title", ""),
            original_language=payload.get("original_language", "en"),
            overview=payload.get("overview", ""),
            tagline=payload.get("tagline", ""),
            release_year=payload.get("release_year"),
            release_date=payload.get("release_date", ""),
            language=payload.get("language", "English"),
            vote_average=float(payload.get("vote_average", 0.0) or 0.0),
            vote_count=int(payload.get("vote_count", 0) or 0),
            popularity=float(payload.get("popularity", 0.0) or 0.0),
            poster=payload.get("poster"),
            backdrop=payload.get("backdrop"),
            trailer_url=payload.get("trailer_url"),
            duration_minutes=payload.get("duration_minutes"),
            streaming_on=payload.get("streaming_on", []),
            mood_tags=payload.get("mood_tags", []),
            featured=payload.get("featured", False),
            tmdb_id=payload.get("tmdb_id"),
            created_by=user,
        )

        genre_ids = payload.get("genres", [])
        if genre_ids:
            genres = Genre.objects.filter(Q(id__in=genre_ids) | Q(tmdb_id__in=genre_ids))
            movie.genres.set(genres)

        return True, {"id": movie.id, "title": movie.title, "vote_average": movie.vote_average}
    except Exception as e:
        return False, str(e)


def main():
    print("=" * 60)
    print("WatchWise Bulk Movie Importer")
    print(f"Target Backend API: {API_BASE_URL}/movies/")
    print(f"Admin Username    : {ADMIN_USERNAME}")
    print("=" * 60)

    # Determine input file path
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = "movies.txt"

    if not os.path.exists(file_path):
        print(f"\n[!] Input file '{file_path}' was not found.")
        print(f"    Creating a sample '{file_path}' for you...")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write("# Add movie names with optional space-separated release years\n")
            f.write("Inception 2010\n")
            f.write("The Dark Knight 2008\n")
            f.write("Interstellar 2014\n")
            f.write("Spider-Man: Across the Spider-Verse 2023\n")
            f.write("RRR 2022\n")
        print(f"    Created '{file_path}'. Add your movie titles and re-run this script!\n")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    lines = [l.strip() for l in lines if l.strip() and not l.strip().startswith(("#", "//"))]
    if not lines:
        print(f"\n[!] '{file_path}' contains no movie entries.\n")
        return

    print(f"\nFound {len(lines)} movie(s) to process in '{file_path}'.\n")

    # Check mode (API vs direct DB fallback)
    use_direct_db = False
    try:
        check_res = requests.get(f"{API_BASE_URL}/movies/", timeout=2)
        if check_res.ok:
            print("[✓] Connected to live backend API (http://127.0.0.1:8000/api/movies/)")
        else:
            use_direct_db = True
    except Exception:
        use_direct_db = True
        print("[i] Backend server not detected at http://127.0.0.1:8000. Using direct Database ORM mode.")

    # Fetch existing movies to prevent duplicates
    existing_tmdb_ids, existing_titles = get_existing_movies(use_direct_db)

    added_count = 0
    skipped_count = 0
    failed_count = 0

    for idx, line in enumerate(lines, 1):
        title, year = parse_movie_line(line)
        if not title:
            continue

        display_search = f"{title} ({year})" if year else title
        print(f"[{idx}/{len(lines)}] Searching TMDb for: '{display_search}'...")

        metadata = fetch_tmdb_metadata(title, year)
        if not metadata:
            print(f"   [X] Not found on TMDb: '{display_search}'")
            failed_count += 1
            continue

        tmdb_id = metadata.get("tmdb_id")
        movie_title = metadata.get("title", title)
        movie_year = metadata.get("release_year") or year or ""

        # Check for duplicate
        if tmdb_id and tmdb_id in existing_tmdb_ids:
            print(f"   [-] Skipped: '{movie_title} ({movie_year})' is already in the database.")
            skipped_count += 1
            continue

        if movie_title.strip().lower() in existing_titles:
            print(f"   [-] Skipped: '{movie_title}' already exists in database.")
            skipped_count += 1
            continue

        # Add movie
        if not use_direct_db:
            success, result = add_movie_via_api(metadata)
            if success is None and result == "CONNECTION_OFFLINE":
                use_direct_db = True
                print("   [i] Switching to direct DB mode...")
                success, result = add_movie_via_orm(metadata)
        else:
            success, result = add_movie_via_orm(metadata)

        if success:
            movie_id = result.get("id")
            rating = result.get("vote_average", metadata.get("vote_average"))
            print(f"   [+] Successfully Added: '{movie_title} ({movie_year})' | Rating: {rating} / 10 | ID: {movie_id}")
            added_count += 1
            if tmdb_id:
                existing_tmdb_ids.add(tmdb_id)
            existing_titles.add(movie_title.strip().lower())
        else:
            print(f"   [X] Failed to add '{movie_title}': {result}")
            failed_count += 1

    print("\n" + "=" * 60)
    print("Import Summary:")
    print(f"   - Total Processed : {len(lines)}")
    print(f"   - Added to DB     : {added_count}")
    print(f"   - Skipped (Exist) : {skipped_count}")
    print(f"   - Failed / Errors : {failed_count}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
