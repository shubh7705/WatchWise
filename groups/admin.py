from django.contrib import admin
from .models import Group, GroupPost, GroupComment


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "created_by", "created_at")
    search_fields = ("name", "description", "category")


@admin.register(GroupPost)
class GroupPostAdmin(admin.ModelAdmin):
    list_display = ("group", "user", "likes_count", "created_at")
    search_fields = ("content", "user__username", "group__name")


@admin.register(GroupComment)
class GroupCommentAdmin(admin.ModelAdmin):
    list_display = ("post", "user", "created_at")
    search_fields = ("content", "user__username")
