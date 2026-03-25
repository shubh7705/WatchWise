import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WatchWise.settings')
django.setup()

import requests
from django.conf import settings
from movies.models import Genre

url = "https://api.themoviedb.org/3/genre/movie/list"
headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {settings.TMDB_API_KEY}"
}

def populate():
    print("Fetching genres from TMDB...")
    try:
        response = requests.get(url, headers=headers, params={"language": "en"})
        response.raise_for_status()
        
        genres_data = response.json().get('genres', [])
        
        if not genres_data:
            print("No genres found in the TMDB response.")
            return

        added_count = 0
        for g in genres_data:
            obj, created = Genre.objects.update_or_create(
                tmdb_id=g['id'],
                defaults={'name': g['name']}
            )
            if created:
                added_count += 1
                
        print(f"Successfully added/updated {len(genres_data)} genres. ({added_count} new)")
        
    except Exception as e:
        print(f"Error fetching/saving genres: {e}")

if __name__ == '__main__':
    populate()
