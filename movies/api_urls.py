from django.urls import path
from . import api_views

urlpatterns = [
    # Movies & Genres
    path("movies/", api_views.api_movies_list_create, name="api_movies_list_create"),
    path("genres/", api_views.api_genres_list, name="api_genres_list"),

    # Reviews
    path("reviews/", api_views.api_reviews_list_create, name="api_reviews_list_create"),
    path("reviews/<int:review_id>/", api_views.api_review_delete, name="api_review_delete"),

    # Playlists
    path("playlists/", api_views.api_playlists_list_create, name="api_playlists_list_create"),
    path("playlists/<int:playlist_id>/toggle-movie/", api_views.api_playlist_toggle_movie, name="api_playlist_toggle_movie"),
    path("playlists/<int:playlist_id>/", api_views.api_playlist_delete, name="api_playlist_delete"),

    # Watchlist
    path("watchlist/", api_views.api_watchlist, name="api_watchlist"),

    # Clubs
    path("clubs/", api_views.api_clubs_list_create, name="api_clubs_list_create"),
    path("clubs/<int:club_id>/join/", api_views.api_club_join_toggle, name="api_club_join_toggle"),
    path("clubs/<int:club_id>/posts/", api_views.api_club_post_create, name="api_club_post_create"),

    # Auth
    path("auth/users/", api_views.api_users_list, name="api_users_list"),
]
