from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from movies.models import Movie


class Review(models.Model):

    SKIP = 1
    TIMEPASS = 2
    GO_FOR_IT = 3
    MUST_WATCH = 4
    PERFECTION = 5

    RATING_CHOICES = [
        (SKIP, "Skip"),
        (TIMEPASS, "Time Pass"),
        (GO_FOR_IT, "Go For It"),
        (MUST_WATCH, "Must Watch"),
        (PERFECTION, "Perfection"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES
    )

    review_text = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "movie")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.movie.title} ({self.get_rating_display()})"
