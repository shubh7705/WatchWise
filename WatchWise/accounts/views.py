from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.shortcuts import render, redirect

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
    return render(
        request,
        "accounts/profile.html",
        {
            "user": request.user,
            "profile": request.user.profile
        }
    )

