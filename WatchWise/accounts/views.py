from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.shortcuts import render, redirect
from .models import UserProfile


def signup_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(
                request,
                "Account created successfully. Please log in."
            )
            return redirect("login")
    else:
        form = UserCreationForm()

    return render(
        request,
        "accounts/signup.html",
        {"form": form}
    )


@login_required
def profile_view(request):
    watch_history = request.user.watch_history.filter(
        watched=True
    ).select_related("movie").order_by("-watched_at")

    return render(
        request,
        "accounts/profile.html",
        {
            "user": request.user,
            "profile": getattr(request.user, "profile", None),
            "watch_history": watch_history,  # 👈 ADD THIS
        }
    )


@login_required
def watch_history_view(request):
    watch_history = request.user.watch_history.filter(
        watched=True
    ).select_related("movie").order_by("-watched_at")

    return render(
        request,
        "accounts/watch_history.html",
        {"watch_history": watch_history}
    )


@login_required
def edit_profile_view(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == "POST":
        bio = request.POST.get("bio", "")
        profile_image = request.FILES.get("profile_image")
        
        profile.bio = bio
        if profile_image:
            profile.profile_image = profile_image
            
        profile.save()
        messages.success(request, "Profile updated successfully.")
        return redirect("accounts:profile")
        
    return render(request, "accounts/profile_edit.html", {"profile": profile})