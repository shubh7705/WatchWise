from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("movie", "user", "rating", "contains_spoiler", "created_at")
    list_filter = ("rating", "contains_spoiler", "created_at")
    search_fields = ("movie__title", "user__username", "review_text")
