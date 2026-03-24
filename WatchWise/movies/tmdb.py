import requests
from django.conf import settings

url_movie = "https://api.themoviedb.org/3/search/movie"
url_movie_details = "https://api.themoviedb.org/3/movie"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

HEADERS = {
    "accept": "application/json",
    "Authorization": f"Bearer {settings.TMDB_API_KEY}"
}


def fetch_movie_data(title, year=None):
    if not title:
        return None

    params = {
        "query": title,
        "include_adult": False,
        "language": "en-US",
        "page": 1
    }

    try:
        # 🔥 Step 1: Search movie
        response = requests.get(
            url_movie,
            headers=HEADERS,
            params=params,
            timeout=5
        )
        response.raise_for_status()

        results = response.json().get("results", [])
        if not results:
            return None

        movie = results[0]
        movie_id = movie.get("id")

        # 🔥 Step 2: Get details
        runtime = None
        genre_ids = []

        try:
            details_response = requests.get(
                f"{url_movie_details}/{movie_id}",
                headers=HEADERS,
                params={"language": "en-US"},
                timeout=5
            )
            details_response.raise_for_status()

            details = details_response.json()
            runtime = details.get("runtime")
            genre_ids = [g["id"] for g in details.get("genres", [])]

        except requests.exceptions.RequestException as e:
            print("Details API failed:", e)

        return {
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "release_year": movie.get("release_date", "")[:4],
            "runtime": runtime,
            "language": movie.get("original_language"),
            "poster": (
                TMDB_IMAGE_BASE + movie["poster_path"]
                if movie.get("poster_path") else ""
            ),
            "genre_ids": genre_ids,
        }

    except requests.exceptions.RequestException as e:
        print("TMDB API failed:", e)
        return None