import requests
from django.conf import settings

url_movie = "https://api.themoviedb.org/3/search/movie"
url_movie_details = "https://api.themoviedb.org/3/movie"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/original"

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
    if year:
        params["year"] = year

    try:
        # Step 1: Search movie
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

        # Step 2: Get extended details with videos
        runtime = None
        genre_ids = []
        tagline = ""
        trailer_url = "https://www.youtube.com/watch?v=tQ0mzXRk-oI"

        try:
            details_response = requests.get(
                f"{url_movie_details}/{movie_id}",
                headers=HEADERS,
                params={"language": "en-US", "append_to_response": "videos"},
                timeout=5
            )
            if details_response.ok:
                details = details_response.json()
                runtime = details.get("runtime")
                genre_ids = [g["id"] for g in details.get("genres", [])]
                tagline = details.get("tagline", "")

                videos = details.get("videos", {}).get("results", [])
                for v in videos:
                    if v.get("type") == "Trailer" and v.get("site") == "YouTube":
                        trailer_url = f"https://www.youtube.com/watch?v={v.get('key')}"
                        break
        except requests.exceptions.RequestException as e:
            print("Details API failed:", e)

        raw_lang = movie.get("original_language", "en")
        lang_map = {
            "hi": "Hindi",
            "te": "Telugu",
            "ta": "Tamil",
            "ml": "Malayalam",
            "kn": "Kannada",
            "en": "English",
            "ko": "Korean",
            "ja": "Japanese",
            "es": "Spanish",
            "fr": "French",
        }

        return {
            "tmdb_id": movie_id,
            "title": movie.get("title", ""),
            "original_title": movie.get("original_title", ""),
            "original_language": raw_lang,
            "language": lang_map.get(raw_lang, raw_lang.title()),
            "overview": movie.get("overview", ""),
            "release_year": int(movie.get("release_date", "")[:4]) if movie.get("release_date") else None,
            "release_date": movie.get("release_date", ""),
            "duration_minutes": runtime or 135,
            "vote_average": round(float(movie.get("vote_average", 0.0)), 1),
            "vote_count": int(movie.get("vote_count", 0)),
            "popularity": round(float(movie.get("popularity", 0.0)), 1),
            "poster": (
                TMDB_IMAGE_BASE + movie["poster_path"]
                if movie.get("poster_path") else ""
            ),
            "backdrop": (
                TMDB_BACKDROP_BASE + movie["backdrop_path"]
                if movie.get("backdrop_path") else ""
            ),
            "genre_ids": genre_ids,
            "tagline": tagline,
            "trailer_url": trailer_url
        }

    except requests.exceptions.RequestException as e:
        print("TMDB API failed:", e)
        return None