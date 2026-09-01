import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from .models import Movie, Genre, Playlist, WatchHistory
from reviews.models import Review
from groups.models import Group, GroupPost, GroupComment


def serialize_movie(movie):
    return {
        "id": movie.id,
        "title": movie.title,
        "original_title": movie.original_title or movie.title,
        "original_language": movie.original_language or "en",
        "overview": movie.overview,
        "tagline": movie.tagline,
        "release_year": movie.release_year,
        "release_date": movie.release_date or "",
        "language": movie.language,
        "vote_average": movie.vote_average,
        "vote_count": movie.vote_count,
        "popularity": movie.popularity,
        "genres": list(movie.genres.values_list("id", flat=True)),
        "poster": movie.poster,
        "backdrop": movie.backdrop,
        "duration_minutes": movie.duration_minutes,
        "trailer_url": movie.trailer_url,
        "streaming_on": movie.streaming_on or [],
        "mood_tags": movie.mood_tags or [],
        "featured": movie.featured,
        "tmdb_id": movie.tmdb_id,
        "created_by": movie.created_by.id if movie.created_by else None,
    }


def serialize_review(review):
    return {
        "id": review.id,
        "movie_id": review.movie_id,
        "user_id": review.user_id,
        "username": review.user.username,
        "user_avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={review.user.username}",
        "rating": review.rating,
        "review_text": review.review_text,
        "contains_spoiler": review.contains_spoiler,
        "created_at": review.created_at.isoformat() if review.created_at else None,
    }


def serialize_playlist(playlist):
    return {
        "id": playlist.id,
        "title": playlist.title,
        "description": playlist.description,
        "cover": playlist.cover,
        "created_by": playlist.created_by_id,
        "created_by_name": playlist.created_by.username if playlist.created_by else "Anonymous",
        "movies": list(playlist.movies.values_list("id", flat=True)),
        "created_at": playlist.created_at.isoformat() if playlist.created_at else None,
    }


def serialize_club(group, current_user=None):
    posts_data = []
    for post in group.posts.select_related("user").order_by("-created_at")[:20]:
        posts_data.append({
            "id": post.id,
            "user_id": post.user_id,
            "username": post.user.username,
            "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={post.user.username}",
            "content": post.content,
            "image": post.image,
            "likes": post.likes_count,
            "timestamp": post.created_at.strftime("%b %d, %Y"),
            "comments": [
                {
                    "id": c.id,
                    "user": c.user.username,
                    "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={c.user.username}",
                    "text": c.content,
                    "time": c.created_at.strftime("%b %d")
                }
                for c in post.comments.select_related("user").order_by("created_at")
            ]
        })

    member_ids = list(group.members.values_list("id", flat=True))
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "avatar": group.avatar or f"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80",
        "category": group.category or "Discussion",
        "created_by": group.created_by_id,
        "created_by_name": group.created_by.username if group.created_by else "Admin",
        "member_count": group.members.count(),
        "is_member": (current_user.id in member_ids) if (current_user and current_user.is_authenticated) else False,
        "posts": posts_data,
    }


# ==========================================
# MOVIES API
# ==========================================

@csrf_exempt
def api_movies_list_create(request):
    if request.method == "GET":
        movies = Movie.objects.prefetch_related("genres").all()
        data = [serialize_movie(m) for m in movies]
        return JsonResponse({"movies": data}, safe=False)

    elif request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
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
            )

            genre_ids = payload.get("genres", [])
            if genre_ids:
                genres = Genre.objects.filter(id__in=genre_ids)
                movie.genres.set(genres)

            return JsonResponse({"success": True, "movie": serialize_movie(movie)}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


def api_genres_list(request):
    genres = Genre.objects.all()
    data = [{"id": g.id, "name": g.name, "tmdb_id": g.tmdb_id} for g in genres]
    return JsonResponse({"genres": data}, safe=False)


# ==========================================
# REVIEWS API
# ==========================================

@csrf_exempt
def api_reviews_list_create(request):
    if request.method == "GET":
        movie_id = request.GET.get("movie_id")
        qs = Review.objects.select_related("user", "movie").all()
        if movie_id:
            qs = qs.filter(movie_id=movie_id)
        data = [serialize_review(r) for r in qs]
        return JsonResponse({"reviews": data}, safe=False)

    elif request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
            user_id = payload.get("user_id") or (request.user.id if request.user.is_authenticated else None)
            if not user_id:
                user = User.objects.first()
                user_id = user.id if user else 1

            movie_id = payload.get("movie_id")
            rating = int(payload.get("rating", 4))
            review_text = payload.get("review_text", "")
            contains_spoiler = bool(payload.get("contains_spoiler", False))

            review, created = Review.objects.update_or_create(
                user_id=user_id,
                movie_id=movie_id,
                defaults={
                    "rating": rating,
                    "review_text": review_text,
                    "contains_spoiler": contains_spoiler,
                }
            )

            return JsonResponse({"success": True, "review": serialize_review(review)}, status=200 if not created else 201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def api_review_delete(request, review_id):
    if request.method in ["DELETE", "POST"]:
        try:
            Review.objects.filter(id=review_id).delete()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)


# ==========================================
# PLAYLISTS API
# ==========================================

@csrf_exempt
def api_playlists_list_create(request):
    if request.method == "GET":
        playlists = Playlist.objects.select_related("created_by").prefetch_related("movies").all()
        data = [serialize_playlist(p) for p in playlists]
        return JsonResponse({"playlists": data}, safe=False)

    elif request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
            user_id = payload.get("user_id") or (request.user.id if request.user.is_authenticated else None)
            if not user_id:
                user = User.objects.first()
                user_id = user.id if user else 1

            playlist = Playlist.objects.create(
                title=payload.get("title", "My Playlist"),
                description=payload.get("description", ""),
                cover=payload.get("cover"),
                created_by_id=user_id
            )
            return JsonResponse({"success": True, "playlist": serialize_playlist(playlist)}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def api_playlist_toggle_movie(request, playlist_id):
    if request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
            movie_id = payload.get("movie_id")
            playlist = Playlist.objects.get(id=playlist_id)
            movie = Movie.objects.get(id=movie_id)

            if playlist.movies.filter(id=movie_id).exists():
                playlist.movies.remove(movie)
                action = "removed"
            else:
                playlist.movies.add(movie)
                if not playlist.cover:
                    playlist.cover = movie.poster
                    playlist.save()
                action = "added"

            return JsonResponse({"success": True, "action": action, "playlist": serialize_playlist(playlist)})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def api_playlist_delete(request, playlist_id):
    if request.method in ["DELETE", "POST"]:
        try:
            Playlist.objects.filter(id=playlist_id).delete()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)


# ==========================================
# WATCHLIST API
# ==========================================

@csrf_exempt
def api_watchlist(request):
    user_id = request.GET.get("user_id") or (request.user.id if request.user.is_authenticated else None)
    if not user_id:
        user = User.objects.first()
        user_id = user.id if user else 1

    if request.method == "GET":
        watched_movie_ids = list(WatchHistory.objects.filter(user_id=user_id, watched=True).values_list("movie_id", flat=True))
        return JsonResponse({"watched": watched_movie_ids})

    elif request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
            movie_id = payload.get("movie_id")
            user_id = payload.get("user_id", user_id)

            obj, created = WatchHistory.objects.get_or_create(user_id=user_id, movie_id=movie_id)
            if not created:
                obj.watched = not obj.watched
                obj.save()
            else:
                obj.watched = True
                obj.save()

            return JsonResponse({"success": True, "watched": obj.watched})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


# ==========================================
# CLUBS API
# ==========================================

@csrf_exempt
def api_clubs_list_create(request):
    if request.method == "GET":
        clubs = Group.objects.select_related("created_by").prefetch_related("members", "posts__user", "posts__comments__user").all()
        data = [serialize_club(c, request.user) for c in clubs]
        return JsonResponse({"clubs": data}, safe=False)

    elif request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
            user_id = payload.get("user_id") or (request.user.id if request.user.is_authenticated else None)
            if not user_id:
                user = User.objects.first()
                user_id = user.id if user else 1

            club = Group.objects.create(
                name=payload.get("name"),
                description=payload.get("description", ""),
                avatar=payload.get("avatar"),
                category=payload.get("category", "Discussion"),
                created_by_id=user_id
            )
            club.members.add(user_id)
            return JsonResponse({"success": True, "club": serialize_club(club, request.user)}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def api_club_join_toggle(request, club_id):
    if request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8")) if request.body else {}
            user_id = payload.get("user_id") or (request.user.id if request.user.is_authenticated else None)
            if not user_id:
                user = User.objects.first()
                user_id = user.id if user else 1

            club = Group.objects.get(id=club_id)
            if club.members.filter(id=user_id).exists():
                club.members.remove(user_id)
                is_member = False
            else:
                club.members.add(user_id)
                is_member = True

            return JsonResponse({"success": True, "is_member": is_member, "member_count": club.members.count()})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def api_club_post_create(request, club_id):
    if request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
            user_id = payload.get("user_id") or (request.user.id if request.user.is_authenticated else None)
            if not user_id:
                user = User.objects.first()
                user_id = user.id if user else 1

            post = GroupPost.objects.create(
                group_id=club_id,
                user_id=user_id,
                content=payload.get("content", ""),
                image=payload.get("image")
            )
            return JsonResponse({
                "success": True,
                "post": {
                    "id": post.id,
                    "user_id": post.user_id,
                    "username": post.user.username,
                    "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={post.user.username}",
                    "content": post.content,
                    "image": post.image,
                    "likes": 0,
                    "timestamp": "Just now",
                    "comments": []
                }
            }, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


# ==========================================
# AUTH API
# ==========================================

def api_users_list(request):
    users = User.objects.all().order_by("id")
    data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={u.username}"
        }
        for u in users
    ]
    return JsonResponse({"users": data}, safe=False)


# ==========================================
# TMDB PROXY API
# ==========================================

def api_tmdb_search(request):
    """
    Search TMDb for movie metadata, poster, backdrop, runtime, and genres.
    Usage: /api/tmdb/search/?title=Inception&year=2010
    """
    from .tmdb import fetch_movie_data

    title = request.GET.get("title", "").strip()
    year = request.GET.get("year", "").strip()

    if not title:
        return JsonResponse({"error": "Title parameter is required"}, status=400)

    movie_data = fetch_movie_data(title, year if year else None)
    if not movie_data:
        return JsonResponse({"error": "Movie not found on TMDb"}, status=404)

    return JsonResponse(movie_data)

