from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from movies.models import Movie, Genre, Playlist, WatchHistory
from reviews.models import Review
from groups.models import Group, GroupPost, GroupComment


class Command(BaseCommand):
    help = "Seed the WatchWise SQLite database with initial movies, genres, reviews, playlists, and clubs"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # 1. Users
        users_data = [
            ("shubh", "shubh@example.com", "pass123"),
            ("shubham", "shubham@example.com", "pass123"),
            ("sanket", "sanket@example.com", "pass123"),
            ("India", "india@example.com", "pass123"),
            ("user1", "user1@example.com", "pass123"),
        ]

        created_users = {}
        for username, email, pwd in users_data:
            user, created = User.objects.get_or_create(username=username, defaults={"email": email})
            if created:
                user.set_password(pwd)
                user.save()
            created_users[username] = user

        shubh = created_users["shubh"]
        shubham = created_users["shubham"]
        sanket = created_users["sanket"]
        india = created_users["India"]

        # 2. Genres
        genres_data = [
            (28, "Action"),
            (12, "Adventure"),
            (878, "Sci-Fi"),
            (10749, "Romance"),
            (18, "Drama"),
            (35, "Comedy"),
            (53, "Thriller"),
            (9648, "Mystery"),
            (80, "Crime"),
            (14, "Fantasy"),
        ]

        genre_objs = {}
        for tmdb_id, name in genres_data:
            g, _ = Genre.objects.get_or_create(name=name, defaults={"tmdb_id": tmdb_id})
            genre_objs[name] = g

        # 3. Movies
        movies_data = [
            {
                "title": "War 2",
                "tagline": "The ultimate covert showdown begins.",
                "overview": "Major Kabir Dhaliwal faces off against an elusive, highly skilled rogue operative across exotic global terrains in a high-stakes espionage battle of wits and raw power.",
                "release_year": 2025,
                "language": "Hindi",
                "duration_minutes": 164,
                "poster": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
                "backdrop": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
                "trailer_url": "https://www.youtube.com/watch?v=tQ0mzXRk-oM",
                "streaming_on": ["Theatres", "Prime Video"],
                "mood_tags": ["adrenaline", "popcorn"],
                "featured": True,
                "genres": ["Action", "Thriller", "Adventure"]
            },
            {
                "title": "Dhurandhar",
                "tagline": "Duty is forged in the shadows.",
                "overview": "A gripping geopolitical espionage thriller chronicling undercover Indian operatives infiltrating hostile territories to neutralize an imminent national threat.",
                "release_year": 2025,
                "language": "Hindi",
                "duration_minutes": 158,
                "poster": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80",
                "backdrop": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=80",
                "trailer_url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
                "streaming_on": ["Netflix"],
                "mood_tags": ["adrenaline", "dark"],
                "featured": True,
                "genres": ["Action", "Crime", "Thriller"]
            },
            {
                "title": "Jawan",
                "tagline": "Ready or not, here he comes.",
                "overview": "A driven man on a personal vendetta rectifies social corruption through explosive, theatrical heists while keeping a deep emotional promise from his past.",
                "release_year": 2023,
                "language": "Hindi",
                "duration_minutes": 169,
                "poster": "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=600&q=80",
                "backdrop": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80",
                "trailer_url": "https://www.youtube.com/watch?v=COv52Qyctws",
                "streaming_on": ["Netflix"],
                "mood_tags": ["adrenaline", "popcorn", "masterpiece"],
                "featured": True,
                "genres": ["Action", "Thriller", "Drama"]
            },
            {
                "title": "Interstellar",
                "tagline": "Mankind was born on Earth. It was never meant to die here.",
                "overview": "A team of intrepid explorers undertake the most monumental mission in human history: traveling beyond our galaxy through a wormhole to discover whether humanity has a future among the stars.",
                "release_year": 2014,
                "language": "English",
                "duration_minutes": 169,
                "poster": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
                "backdrop": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80",
                "trailer_url": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
                "streaming_on": ["Prime Video", "Apple TV"],
                "mood_tags": ["mystery", "tearjerker", "masterpiece"],
                "featured": True,
                "genres": ["Sci-Fi", "Drama", "Adventure"]
            },
            {
                "title": "Om Shanti Om",
                "tagline": "For some love stories, one lifetime is not enough.",
                "overview": "In the vibrant 1970s, junior artist Om falls hopelessly in love with superstar Shantipriya. After a tragic death, he is reincarnated in the present day to avenge her murder and fulfill their destiny.",
                "release_year": 2007,
                "language": "Hindi",
                "duration_minutes": 162,
                "poster": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=600&q=80",
                "backdrop": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80",
                "trailer_url": "https://www.youtube.com/watch?v=1V_xTqIA6-U",
                "streaming_on": ["Netflix"],
                "mood_tags": ["romance", "popcorn"],
                "featured": False,
                "genres": ["Romance", "Comedy", "Drama"]
            },
            {
                "title": "Sita Ramam",
                "tagline": "Love written across boundaries of time and conflict.",
                "overview": "Lieutenant Ram, an orphaned army officer serving at the Kashmir border, receives an anonymous letter from a woman named Sita Mahalakshmi, igniting an unforgettable love story.",
                "release_year": 2022,
                "language": "Telugu",
                "duration_minutes": 163,
                "poster": "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=600&q=80",
                "backdrop": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80",
                "trailer_url": "https://www.youtube.com/watch?v=F0O2d_L6aeg",
                "streaming_on": ["Disney+ Hotstar", "Prime Video"],
                "mood_tags": ["romance", "tearjerker", "masterpiece"],
                "featured": False,
                "genres": ["Romance", "Drama", "Mystery"]
            },
            {
                "title": "Inception",
                "tagline": "Your mind is the scene of the crime.",
                "overview": "A skilled thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
                "release_year": 2010,
                "language": "English",
                "duration_minutes": 148,
                "poster": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
                "backdrop": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
                "trailer_url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
                "streaming_on": ["Netflix", "Prime Video"],
                "mood_tags": ["mystery", "adrenaline", "masterpiece"],
                "featured": True,
                "genres": ["Sci-Fi", "Action", "Adventure"]
            },
        ]

        created_movies = {}
        for m_data in movies_data:
            genres_list = m_data.pop("genres")
            movie, _ = Movie.objects.get_or_create(
                title=m_data["title"],
                defaults=m_data
            )
            for g_name in genres_list:
                if g_name in genre_objs:
                    movie.genres.add(genre_objs[g_name])
            created_movies[movie.title] = movie

        # 4. Reviews
        reviews_data = [
            (created_movies["War 2"], shubh, 5, "Hrithik and Jr. NTR dynamic is pure adrenaline! Unmatched spectacle and mind-bending action sequences.", False),
            (created_movies["War 2"], sanket, 4, "High voltage action cinema. Climax sets up the next spy universe chapter perfectly!", True),
            (created_movies["Dhurandhar"], shubham, 4, "Gripping intelligence espionage thriller. Fast-paced with zero dull moments.", False),
            (created_movies["Jawan"], india, 5, "SRK is electrifying! Mass cinema done with immense heart and grand visual style.", False),
            (created_movies["Interstellar"], shubh, 5, "An absolute cinematic triumph. Hans Zimmer's score paired with the black hole visuals is unforgettable.", False),
            (created_movies["Interstellar"], shubham, 5, "The docking scene alone is worth watching ten times over. Pure perfection.", False),
            (created_movies["Sita Ramam"], sanket, 5, "One of the most poetic love stories of this decade. Kept me in tears.", False),
            (created_movies["Inception"], india, 5, "Christopher Nolan's magnum opus of dream architecture. Never gets old.", True),
        ]

        for mov, usr, rat, txt, sp in reviews_data:
            Review.objects.update_or_create(
                movie=mov,
                user=usr,
                defaults={"rating": rat, "review_text": txt, "contains_spoiler": sp}
            )

        # 5. Playlists
        playlists_data = [
            {
                "title": "High-Octane Spy & Action Universe",
                "description": "Explosive blockbusters, adrenaline stunts, and covert operations.",
                "cover": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
                "created_by": shubh,
                "movies": [created_movies["War 2"], created_movies["Dhurandhar"], created_movies["Jawan"], created_movies["Inception"]]
            },
            {
                "title": "Tearjerker Romance & Soulful Cinema",
                "description": "Emotional rollercoasters, classic reincarnations, and timeless love.",
                "cover": "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=600&q=80",
                "created_by": shubham,
                "movies": [created_movies["Om Shanti Om"], created_movies["Sita Ramam"], created_movies["Interstellar"]]
            },
            {
                "title": "Mind-Bending & Oscar Winners",
                "description": "Complex narratives, cosmic journeys, and cinematic masterpieces.",
                "cover": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
                "created_by": sanket,
                "movies": [created_movies["Interstellar"], created_movies["Inception"]]
            },
        ]

        for p_data in playlists_data:
            p_movies = p_data.pop("movies")
            playlist, _ = Playlist.objects.get_or_create(
                title=p_data["title"],
                defaults=p_data
            )
            playlist.movies.set(p_movies)

        # 6. Clubs
        clubs_data = [
            {
                "name": "Spyverse & Action Fanatics",
                "description": "Dedicated to undercover agents, high-speed car chases, and explosive fight choreography across Indian & Hollywood cinema.",
                "avatar": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80",
                "category": "Action & Espionage",
                "created_by": shubh,
                "members": [shubh, shubham, sanket, india]
            },
            {
                "name": "Sci-Fi & Cosmic Horizons",
                "description": "Discussing wormholes, artificial intelligence, time travel, and Christopher Nolan's visionary masterpieces.",
                "avatar": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80",
                "category": "Sci-Fi & Space",
                "created_by": shubham,
                "members": [shubh, shubham, sanket]
            },
            {
                "name": "Bollywood & Classic Romantics",
                "description": "Celebrating the magic of Shah Rukh Khan, grand sets, iconic musical soundtracks, and poetic love stories.",
                "avatar": "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=300&q=80",
                "category": "Romance & Drama",
                "created_by": sanket,
                "members": [shubh, sanket, india]
            }
        ]

        for c_data in clubs_data:
            c_members = c_data.pop("members")
            club, _ = Group.objects.get_or_create(
                name=c_data["name"],
                defaults=c_data
            )
            club.members.set(c_members)

            # Sample post
            if not club.posts.exists():
                post = GroupPost.objects.create(
                    group=club,
                    user=shubh,
                    content=f"Welcome to the official {club.name}! What movie are you most excited to watch this weekend?",
                    likes_count=5
                )
                GroupComment.objects.create(
                    post=post,
                    user=shubham,
                    content="Definitely checking out the new trailers and reviews here!"
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded WatchWise SQLite database!"))
