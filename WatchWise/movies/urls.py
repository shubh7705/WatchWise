from django.urls import path
from . import views

app_name = "movies"

urlpatterns = [
    path("", views.movie_list_view, name="list"),
    path("add/", views.add_movie_view, name="add"),
    path("<int:movie_id>/", views.movie_detail_view, name="detail"),
]
