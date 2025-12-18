from django.db import models
from django.contrib.auth.models import User

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

    def __str__(self):
        return f"{self.title} ({self.release_year})"
