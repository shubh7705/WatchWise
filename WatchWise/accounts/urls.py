from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("signup/", views.signup_view, name="signup"),
    path("profile/", views.profile_view, name="profile"),
    path("profile/edit/", views.edit_profile_view, name="edit_profile"),
    path("watch-history/", views.watch_history_view, name="watch_history"),
]
