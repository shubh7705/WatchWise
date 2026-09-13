from django.contrib import admin
from .models import Movie, Genre, Playlist, WatchHistory


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "release_year", "language", "duration_minutes", "featured", "created_at")
    list_filter = ("featured", "language", "genres")
    search_fields = ("title", "overview", "tagline")


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name", "tmdb_id")
    search_fields = ("name",)


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ("title", "created_by", "created_at")
    search_fields = ("title", "description", "created_by__username")


@admin.register(WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display = ("user", "movie", "watched", "watched_at")
    list_filter = ("watched",)
