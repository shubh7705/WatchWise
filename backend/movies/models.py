from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Genre(models.Model):
    tmdb_id = models.PositiveIntegerField(unique=True, null=True, blank=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=255)
    overview = models.TextField(blank=True, default="")
    tagline = models.CharField(max_length=255, blank=True, default="")
    release_year = models.PositiveIntegerField(null=True, blank=True)
    release_date = models.CharField(max_length=50, blank=True, default="")
    language = models.CharField(max_length=50, blank=True, default="English")
    original_title = models.CharField(max_length=255, blank=True, default="")
    original_language = models.CharField(max_length=20, blank=True, default="en")
    vote_average = models.FloatField(default=0.0)
    vote_count = models.PositiveIntegerField(default=0)
    popularity = models.FloatField(default=0.0)
    tmdb_id = models.PositiveIntegerField(unique=True, null=True, blank=True)

    genres = models.ManyToManyField(
        Genre,
        related_name="movies",
        blank=True
    )

    poster = models.URLField(blank=True, null=True, max_length=500)
    backdrop = models.URLField(blank=True, null=True, max_length=500)
    trailer_url = models.URLField(blank=True, null=True, max_length=500)

    duration_minutes = models.PositiveIntegerField(
        help_text="Duration in minutes",
        null=True,
        blank=True
    )

    streaming_on = models.JSONField(default=list, blank=True)
    mood_tags = models.JSONField(default=list, blank=True)
    featured = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="movies"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["title"]),
            models.Index(fields=["release_year"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.release_year or 'N/A'})"


class Playlist(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    cover = models.URLField(blank=True, null=True, max_length=500)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="playlists")
    movies = models.ManyToManyField(Movie, related_name="in_playlists", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} (by {self.created_by.username})"


class WatchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watch_history")
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="watched_by")
    watched = models.BooleanField(default=True)
    rating = models.IntegerField(
        null=True,
        blank=True,
        help_text="User rating (1-5)"
    )
    watched_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "movie")

    def __str__(self):
        return f"{self.user.username} watched {self.movie.title}"