import requests
from django.conf import settings


url_movie = "https://api.themoviedb.org/3/search/movie"
url_movie_details = "https://api.themoviedb.org/3/movie"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

TMDB_API_KEY = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NmM0ZWFmNmM3ZGNiMTRiMjQ5Njg4NTZkMjVjYmM2OSIsIm5iZiI6MTc2NTc2OTE3Ni4wMDcsInN1YiI6IjY5M2Y3ZmQ4MjJhMDg5ZDY3Njk5OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.L3KfPPqnwglsr-alY7hVHxOmAkAGFP13Xu_YUW0vseg"


def fetch_movie_data(title, year=None):
    """
    Fetch movie data from TMDB using title (and optional year)
    """
    if not title:
        return None

    params = {
    "query": title,
    "include_adult": "false",
    "language": "en-US",
    "page": 1
}

    # if year:
    #     params["year"] = year
    headers = {
    "accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NmM0ZWFmNmM3ZGNiMTRiMjQ5Njg4NTZkMjVjYmM2OSIsIm5iZiI6MTc2NTc2OTE3Ni4wMDcsInN1YiI6IjY5M2Y3ZmQ4MjJhMDg5ZDY3Njk5OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.L3KfPPqnwglsr-alY7hVHxOmAkAGFP13Xu_YUW0vseg"
}

    response = requests.get(url_movie, headers=headers, params=params)

    if response.status_code != 200:
        return None

    results = response.json().get("results")
    if not results:
        return None

    movie = results[0]  # best match
    id = movie.get("id")

    details_response = requests.get(
    f"{url_movie_details}/{id}",
    headers=headers,
    params={"language": "en-US"}
)
    runtime = None
    genre_ids = []
    if details_response.status_code == 200:
        details = details_response.json()
        runtime = details.get("runtime")

        # 🔥 THIS IS THE KEY PART
        genre_ids = [g["id"] for g in details.get("genres", [])]

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
