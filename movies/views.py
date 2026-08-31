from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.db.models import Q, Avg
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse

from .tmdb import fetch_movie_data
from .recommender import get_recommendations
from .models import Movie, Genre, WatchHistory


def movie_list_view(request):
    """
    Main catalog view. Handles search queries, genre filtering,
    and displays personalized recommendations for logged-in users.
    """
    movies = Movie.objects.all()
    genres = Genre.objects.all()

    # Filter movies by selected genre if provided in query params
    genre_id = request.GET.get("genre")
    if genre_id:
        try:
            genre_id = int(genre_id)
            movies = movies.filter(genres__id=genre_id)
        except (ValueError, TypeError):
            genre_id = None

    # Text search across movie titles and overviews
    query = request.GET.get("q")
    if query:
        query = query.strip()
        movies = movies.filter(
            Q(title__icontains=query) |
            Q(overview__icontains=query)
        )

    # Fetch personalized recommendations only for logged-in users on default browse view
    recommended_movies = []
    if request.user.is_authenticated and not query and not genre_id:
        recommended_movies = get_recommendations(request.user)

    context = {
        "movies": movies,
        "recommended_movies": recommended_movies,
        "genres": genres,
        "selected_genre": genre_id,
        "query": query,
    }

    return render(request, "movies/movie_list.html", context)


@login_required
def movie_detail_view(request, movie_id):
    """
    Displays full details for a specific movie, including aggregate ratings,
    community reviews, and user's watch history status.
    """
    movie = get_object_or_404(Movie, id=movie_id)

    # Prefetch review authors to avoid N+1 query overhead in templates
    reviews = movie.reviews.select_related("user").all()
    user_review = reviews.filter(user=request.user).first()

    avg_rating = reviews.aggregate(avg=Avg("rating"))["avg"]

    # Check if the current user has already marked this movie as watched
    is_watched = WatchHistory.objects.filter(
        user=request.user,
        movie=movie,
        watched=True
    ).exists()

    context = {
        "movie": movie,
        "reviews": reviews,
        "user_review": user_review,
        "avg_rating": avg_rating,
        "is_watched": is_watched,
    }

    return render(request, "movies/movie_detail.html", context)


@login_required
def add_movie_view(request):
    """
    Allows authenticated users to add a new movie to the platform catalog
    manually or with autofilled TMDb data.
    """
    genres = Genre.objects.all()

    if request.method == "POST":
        title = request.POST.get("title")
        overview = request.POST.get("overview")
        release_year = request.POST.get("release_year")
        language = request.POST.get("language")
        duration = request.POST.get("duration")
        genre_ids = request.POST.getlist("genres")
        poster = request.POST.get("poster")  # Remote poster image URL from TMDb

        if not title or not release_year or not duration:
            messages.error(request, "Please fill all required fields.")
            return redirect("movies:add")

        movie = Movie.objects.create(
            title=title.strip(),
            overview=overview.strip() if overview else "",
            release_year=int(release_year),
            language=language or "en",
            duration_minutes=int(duration),
            poster=poster,
            created_by=request.user
        )

        if genre_ids:
            associated_genres = Genre.objects.filter(tmdb_id__in=genre_ids)
            movie.genres.set(associated_genres)

        messages.success(request, f"'{movie.title}' was added successfully.")
        return redirect("movies:detail", movie_id=movie.id)

    return render(
        request,
        "movies/add_movie.html",
        {"genres": genres}
    )


@login_required
def tmdb_autofill_view(request):
    """
    AJAX endpoint: Queries TMDb API by title & release year
    and returns JSON payload for populating movie creation form.
    """
    title = request.GET.get("title")
    year = request.GET.get("year")

    data = fetch_movie_data(title, year)
    if not data:
        return JsonResponse({"error": "Movie not found"}, status=404)

    return JsonResponse(data)


@require_POST
@login_required
def toggle_watch(request, movie_id):
    """
    Toggles the watch state of a movie for the current user.
    Used by async client-side buttons to update watchlists instantly.
    """
    movie = get_object_or_404(Movie, id=movie_id)

    watch_entry, _ = WatchHistory.objects.get_or_create(
        user=request.user,
        movie=movie
    )

    # Invert the watch status
    watch_entry.watched = not watch_entry.watched
    status_msg = "added" if watch_entry.watched else "removed"
    watch_entry.save()

    return JsonResponse({
        "status": status_msg,
        "watched": watch_entry.watched
    })
