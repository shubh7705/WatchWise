import os
import sys
import django

# Set UTF-8 encoding on standard output for Windows
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WatchWise.settings")
django.setup()

from django.db import connection
from django.contrib.auth.models import User
from movies.models import Movie, Genre

def test_connection():
    db_settings = connection.settings_dict
    engine = db_settings.get("ENGINE", "")
    db_name = db_settings.get("NAME", "")
    host = db_settings.get("HOST", "")
    user = db_settings.get("USER", "")

    print("=" * 60)
    print("Database Connection Status:")
    print(f"   - Engine   : {engine}")
    print(f"   - Database : {db_name}")
    print(f"   - Host     : {host}")
    print(f"   - User     : {user}")
    print("=" * 60)

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"\n[+] Successfully connected to PostgreSQL Server!")
            print(f"    Server Version: {version[:80]}...")

        movie_count = Movie.objects.count()
        genre_count = Genre.objects.count()
        user_count = User.objects.count()

        print(f"\nLive Data in PostgreSQL:")
        print(f"   - Movies : {movie_count}")
        print(f"   - Genres : {genre_count}")
        print(f"   - Users  : {user_count}")
        print("=" * 60)

    except Exception as e:
        print(f"\n[X] Connection Failed: {e}")

if __name__ == "__main__":
    test_connection()
