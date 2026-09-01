from django.http import JsonResponse

def home_view(request):
    """
    Root API health check and endpoint directory.
    """
    return JsonResponse({
        "name": "WatchWise API",
        "version": "2.0.0",
        "status": "healthy",
        "endpoints": {
            "movies": "/api/movies/",
            "genres": "/api/genres/",
            "reviews": "/api/reviews/",
            "playlists": "/api/playlists/",
            "clubs": "/api/clubs/",
            "watchlist": "/api/watchlist/",
            "users": "/api/auth/users/",
        }
    })