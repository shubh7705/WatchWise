from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages

from .models import Group, GroupPost


def group_list_view(request):
    groups = Group.objects.all()
    return render(request, "groups/group_list.html", {"groups": groups})


@login_required
def create_group_view(request):
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description")

        if not name:
            messages.error(request, "Group name is required.")
            return redirect("groups:create")

        group = Group.objects.create(
            name=name,
            description=description,
            created_by=request.user
        )

        group.members.add(request.user)
        messages.success(request, "Group created successfully.")
        return redirect("groups:detail", group_id=group.id)

    return render(request, "groups/create_group.html")


@login_required
def group_detail_view(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    posts = group.posts.all()

    if request.method == "POST":
        content = request.POST.get("content")
        if content:
            GroupPost.objects.create(
                group=group,
                user=request.user,
                content=content
            )
            return redirect("groups:detail", group_id=group.id)

    return render(
        request,
        "groups/group_detail.html",
        {"group": group, "posts": posts}
    )



