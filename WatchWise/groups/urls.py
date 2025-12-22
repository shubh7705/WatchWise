from django.urls import path
from . import views

app_name = "groups"

urlpatterns = [
    path("", views.group_list_view, name="list"),
    path("create/", views.create_group_view, name="create"),
    path("<int:group_id>/", views.group_detail_view, name="detail"),
]
