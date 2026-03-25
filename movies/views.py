from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .tmdb import fetch_movie_data
from django.db.models import Avg
from .recommender import get_recommendations

from .models import Movie, Genre, WatchHistory


def movie_list_view(request):
    movies = Movie.objects.all()
    genres = Genre.objects.all()

    # 🔍 Filter by genre
    genre_id = request.GET.get("genre")
    if genre_id:
        genre_id = int(genre_id)
        movies = movies.filter(genres__id=genre_id)

    # 🔍 Search
    query = request.GET.get("q")
    if query:
        movies = movies.filter(
            Q(title__icontains=query) |
            Q(overview__icontains=query)
        )

    # 🎯 Get recommendations (only if logged in and no search/filter active)
    recommended_movies = []
    if request.user.is_authenticated and not query and not genre_id:
        recommended_movies = get_recommendations(request.user)

    context = {
        "movies": movies,
        "recommended_movies": recommended_movies,  # 👈 ADD THIS
        "genres": genres,
        "selected_genre": genre_id,
        "query": query,
    }

    return render(request, "movies/movie_list.html", context)


@login_required
def movie_detail_view(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)

    reviews = movie.reviews.select_related("user").all()
    user_review = reviews.filter(user=request.user).first()

    avg_rating = reviews.aggregate(avg=Avg("rating"))["avg"]

    # ✅ Check if watched
    is_watched = WatchHistory.objects.filter(
        user=request.user,
        movie=movie,
        watched=True
    ).exists()

    return render(
        request,
        "movies/movie_detail.html",
        {
            "movie": movie,
            "reviews": reviews,
            "user_review": user_review,
            "avg_rating": avg_rating,
            "is_watched": is_watched,  # 👈 send to template
        }
    )

@login_required
def add_movie_view(request):
    genres = Genre.objects.all()

    if request.method == "POST":
        title = request.POST.get("title")
        overview = request.POST.get("overview")
        release_year = request.POST.get("release_year")
        language = request.POST.get("language")
        duration = request.POST.get("duration")
        genre_ids = request.POST.getlist("genres")
        poster = request.POST.get("poster")  # URL, not file

        if not title or not release_year or not duration:
            messages.error(request, "Please fill all required fields.")
            return redirect("movies:add")

        movie = Movie.objects.create(
            title=title,
            overview=overview,
            release_year=release_year,
            language=language,
            duration_minutes=duration,
            poster=poster,
            created_by=request.user
        )

        genres = Genre.objects.filter(tmdb_id__in=genre_ids)
        movie.genres.set(genres)

        messages.success(request, "Movie added successfully.")
        return redirect("movies:detail", movie_id=movie.id)

    return render(
        request,
        "movies/add_movie.html",
        {"genres": genres}
    )


@login_required
def tmdb_autofill_view(request):
    title = request.GET.get("title")
    year = request.GET.get("year")

    data = fetch_movie_data(title, year)
    if not data:
        return JsonResponse({"error": "Movie not found"}, status=404)

    return JsonResponse(data)

@require_POST
@login_required
def toggle_watch(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)

    obj, created = WatchHistory.objects.get_or_create(
        user=request.user,
        movie=movie
    )

    if obj.watched:
        obj.watched = False
        status = "removed"
    else:
        obj.watched = True
        status = "added"

    obj.save()

    return JsonResponse({
        "status": status,
        "watched": obj.watched
    })

