from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages

from .models import Review
from movies.models import Movie


@login_required
def add_or_update_review(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)

    review = Review.objects.filter(
        user=request.user,
        movie=movie
    ).first()

    if request.method == "POST":
        rating = request.POST.get("rating")
        review_text = request.POST.get("review_text")

        if not rating:
            messages.error(request, "Please select a rating.")
            return redirect("movies:detail", movie_id=movie.id)

        if review:
            # Update existing review
            review.rating = rating
            review.review_text = review_text
            review.save()
            messages.success(request, "Review updated successfully.")
        else:
            # Create new review
            Review.objects.create(
                user=request.user,
                movie=movie,
                rating=rating,
                review_text=review_text
            )
            messages.success(request, "Review added successfully.")

        return redirect("movies:detail", movie_id=movie.id)

    context = {
        "movie": movie,
        "review": review,
        "rating_choices": Review.RATING_CHOICES,
    }

    return render(request, "reviews/review_form.html", context)


@login_required
def delete_review(request, review_id):
    review = get_object_or_404(
        Review,
        id=review_id,
        user=request.user
    )

    movie_id = review.movie.id
    review.delete()

    messages.success(request, "Review deleted successfully.")
    return redirect("movies:detail", movie_id=movie_id)
