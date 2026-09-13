from django.db import models
from django.contrib.auth.models import User


class Group(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True, default="")
    avatar = models.URLField(blank=True, null=True, max_length=500)
    category = models.CharField(max_length=100, blank=True, default="Discussion")

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_groups"
    )

    members = models.ManyToManyField(
        User,
        related_name="joined_groups",
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class GroupPost(models.Model):
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="posts"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="group_posts"
    )

    content = models.TextField()
    image = models.URLField(blank=True, null=True, max_length=500)
    likes_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} in {self.group.name}"


class GroupComment(models.Model):
    post = models.ForeignKey(
        GroupPost,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="group_comments"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} on post {self.post.id}"
