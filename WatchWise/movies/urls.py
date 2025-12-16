from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

app_name = "movies"

urlpatterns = [
    path("", views.movie_list_view, name="list"),
    path("add/", views.add_movie_view, name="add"),
    path("<int:movie_id>/", views.movie_detail_view, name="detail"),
    path("autofill/", views.tmdb_autofill_view, name="autofill"),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
