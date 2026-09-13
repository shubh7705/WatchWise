from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import home_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='api_root'),
    path('api/', include('movies.api_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
