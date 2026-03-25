from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Genre(models.Model):
    tmdb_id = models.PositiveIntegerField(unique=True,
        null=True,      # 👈 temporary
        blank=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name



class Movie(models.Model):
    title = models.CharField(max_length=255)
    overview = models.TextField()

    release_year = models.PositiveIntegerField()
    language = models.CharField(max_length=50)

    tmdb_id = models.PositiveIntegerField(unique=True, null=True, blank=True)

    genres = models.ManyToManyField(
        Genre,
        related_name="movies",
        blank=True
    )

    poster = models.URLField(
    blank=True,
    null=True
)


    duration_minutes = models.PositiveIntegerField(
        help_text="Duration in minutes",
        null=True,
        blank=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="movies"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("title", "release_year")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["title"]),
            models.Index(fields=["release_year"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.release_year})"


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