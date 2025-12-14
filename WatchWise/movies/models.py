from django.db import models
from django.contrib.auth.models import User

class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    release_year = models.PositiveIntegerField()
    language = models.CharField(max_length=50)

    genres = models.ManyToManyField(
        Genre,
        related_name="movies"
    )

    poster = models.ImageField(
        upload_to="movies/posters/",
        blank=True,
        null=True
    )

    duration_minutes = models.PositiveIntegerField(
        help_text="Duration in minutes"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title



