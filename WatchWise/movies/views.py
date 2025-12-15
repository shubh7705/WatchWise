from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.shortcuts import render, redirect

from .models import Movie, Genre



def movie_list_view(request):
    movies = Movie.objects.all().order_by("-created_at")
    genres = Genre.objects.all()

    # Filter by genre
    genre_id = request.GET.get("genre")
    if genre_id:
        movies = movies.filter(genres__id=genre_id)

    # Search
    query = request.GET.get("q")
    if query:
        movies = movies.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query)
        )

    context = {
        "movies": movies,
        "genres": genres,
        "selected_genre": genre_id,
        "query": query,
    }

    return render(request, "movies/movie_list.html", context)

@login_required
def movie_detail_view(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)

    return render(
        request,
        "movies/movie_detail.html",
        {"movie": movie}
    )

@login_required
def add_movie_view(request):
    genres = Genre.objects.all()

    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description")
        release_year = request.POST.get("release_year")
        language = request.POST.get("language")
        duration = request.POST.get("duration")
        selected_genres = request.POST.getlist("genres")
        poster = request.FILES.get("poster")

        # Basic validation
        if not title or not release_year or not duration:
            messages.error(request, "Please fill all required fields.")
            return redirect("movies:add")

        movie = Movie.objects.create(
            title=title,
            description=description,
            release_year=release_year,
            language=language,
            duration_minutes=duration,
            poster=poster,
        )

        movie.genres.set(selected_genres)

        messages.success(request, "Movie added successfully.")
        return redirect("movies:detail", movie_id=movie.id)

    return render(
        request,
        "movies/add_movie.html",
        {"genres": genres}
    )



