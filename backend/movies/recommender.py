from collections import Counter
from django.utils import timezone
from datetime import timedelta
from .models import Movie, WatchHistory


def get_user_preferences(user):
    """
    Extract user preference based on watch history
    """
    watched = WatchHistory.objects.filter(
        user=user,
        watched=True
    ).select_related("movie").prefetch_related("movie__genres")

    genre_counter = Counter()

    for entry in watched:
        weight = 1
        
        # 🔥 Bonus: rating boost
        if entry.rating:
            weight += (entry.rating - 3) * 0.5
            
        # 🔥 Bonus: recency boost
        days_ago = (timezone.now() - entry.watched_at).days
        if days_ago < 30:
            weight += 2
            
        for genre in entry.movie.genres.all():
            genre_counter[genre.id] += weight

    return genre_counter


def score_movie(movie, genre_counter):
    """
    Score a movie based on genre similarity
    """
    score = 0

    for genre in movie.genres.all():
        score += genre_counter.get(genre.id, 0)

    return score


def get_recommendations(user, limit=10):
    """
    Main recommendation function
    """
    watched_entries = WatchHistory.objects.filter(
        user=user,
        watched=True
    ).select_related("movie")

    watched_movie_ids = watched_entries.values_list("movie_id", flat=True)

    # If no history → fallback
    if not watched_entries.exists():
        return Movie.objects.all().order_by("-created_at")[:limit]

    # Get user preferences
    genre_counter = get_user_preferences(user)

    # Candidate movies (not watched)
    candidates = Movie.objects.exclude(id__in=watched_movie_ids).prefetch_related("genres")

    scored_movies = []

    for movie in candidates:
        score = score_movie(movie, genre_counter)
        scored_movies.append((movie, score))

    # Sort by score
    scored_movies.sort(key=lambda x: x[1], reverse=True)

    return [movie for movie, score in scored_movies[:limit]]