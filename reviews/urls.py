from django.urls import path
from . import views

app_name = "reviews"

urlpatterns = [
    path("movie/<int:movie_id>/", views.add_or_update_review, name="add_or_update"),
    path("delete/<int:review_id>/", views.delete_review, name="delete"),
]
