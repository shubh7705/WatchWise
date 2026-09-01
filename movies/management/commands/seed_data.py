from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from movies.models import Movie, Genre, Playlist, WatchHistory
from reviews.models import Review
from groups.models import Group, GroupPost, GroupComment


class Command(BaseCommand):
    help = "Seed the WatchWise SQLite database with initial movies, genres, reviews, playlists, and clubs using official TMDb image URLs"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database with official TMDb poster URLs...")

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

        # 3. Movies with official TMDb image URLs
        movies_data = [
            {
                "title": "War",
                "tagline": "Two lethal agents. One brutal showdown.",
                "overview": "Khalid, entrusted with the task of eliminating former soldier turned rogue Kabir, engages in an epic battle with his mentor who taught him everything.",
                "release_year": 2019,
                "language": "Hindi",
                "duration_minutes": 152,
                "poster": "https://image.tmdb.org/t/p/w500/yUtaHkL2SDIAZhRApZAyQrAXygn.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/yUtaHkL2SDIAZhRApZAyQrAXygn.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=tQ0mzXRk-oI",
                "streaming_on": ["Prime Video"],
                "mood_tags": ["adrenaline", "mind-bending", "popcorn"],
                "featured": True,
                "genres": ["Action", "Adventure", "Thriller"],
                "tmdb_id": 585268
            },
            {
                "title": "War 2",
                "tagline": "The spy universe expands into chaos.",
                "overview": "Major Kabir Dhaliwal faces off against an elusive, highly skilled rogue operative across exotic global terrains in a high-stakes espionage battle of wits and raw power.",
                "release_year": 2025,
                "language": "Hindi",
                "duration_minutes": 164,
                "poster": "https://image.tmdb.org/t/p/w500/2Yc8Kl2ldPpDzLrG2M5Ddv62FXB.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/2Yc8Kl2ldPpDzLrG2M5Ddv62FXB.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=tQ0mzXRk-oI",
                "streaming_on": ["Theatres", "Prime Video"],
                "mood_tags": ["adrenaline", "popcorn"],
                "featured": True,
                "genres": ["Action", "Thriller", "Adventure"],
                "tmdb_id": 1109075
            },
            {
                "title": "Dhurandar",
                "tagline": "Deep cover. Zero backup. Infinite stakes.",
                "overview": "An Indian intelligence mission unfolds over ten years as an undercover agent enters Karachi's criminal and political world to dismantle dangerous cross-border terror networks.",
                "release_year": 2025,
                "language": "Hindi",
                "duration_minutes": 158,
                "poster": "https://image.tmdb.org/t/p/w500/8FHOtUpNIk5ZPEay2N2EY5lrxkv.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/8FHOtUpNIk5ZPEay2N2EY5lrxkv.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
                "streaming_on": ["Netflix"],
                "mood_tags": ["adrenaline", "dark"],
                "featured": True,
                "genres": ["Action", "Crime", "Thriller"],
                "tmdb_id": 1289142
            },
            {
                "title": "Jawan",
                "tagline": "Ready or not, here comes the revolution.",
                "overview": "A driven man on a personal vendetta rectifies social corruption through explosive, theatrical heists while keeping a deep emotional promise from his past.",
                "release_year": 2023,
                "language": "Hindi",
                "duration_minutes": 169,
                "poster": "https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=COv52Qyctws",
                "streaming_on": ["Netflix"],
                "mood_tags": ["adrenaline", "popcorn", "masterpiece"],
                "featured": True,
                "genres": ["Action", "Thriller", "Drama"],
                "tmdb_id": 872906
            },
            {
                "title": "Interstellar",
                "tagline": "Mankind was born on Earth. It was never meant to die here.",
                "overview": "A team of intrepid explorers undertake the most monumental mission in human history: traveling beyond our galaxy through a wormhole to discover whether humanity has a future among the stars.",
                "release_year": 2014,
                "language": "English",
                "duration_minutes": 169,
                "poster": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
                "streaming_on": ["Prime Video", "Apple TV"],
                "mood_tags": ["mystery", "tearjerker", "masterpiece"],
                "featured": True,
                "genres": ["Sci-Fi", "Drama", "Adventure"],
                "tmdb_id": 157336
            },
            {
                "title": "Om Shanti Om",
                "tagline": "Picture abhi baaki hai mere dost.",
                "overview": "In the vibrant 1970s, junior artist Om falls hopelessly in love with superstar Shantipriya. After a tragic death, he is reincarnated in the present day to avenge her murder and fulfill their destiny.",
                "release_year": 2007,
                "language": "Hindi",
                "duration_minutes": 162,
                "poster": "https://image.tmdb.org/t/p/w500/oArsQTD4bPPMtRjqr03SO9W6phF.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/oArsQTD4bPPMtRjqr03SO9W6phF.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=1V_xTqIA6-U",
                "streaming_on": ["Netflix", "Prime Video"],
                "mood_tags": ["romance", "popcorn", "masterpiece"],
                "featured": False,
                "genres": ["Romance", "Comedy", "Drama"],
                "tmdb_id": 10567
            },
            {
                "title": "Sita Ramam",
                "tagline": "An immortal love story from the frontlines of war.",
                "overview": "Lieutenant Ram, an orphaned army officer serving at the Kashmir border, receives an anonymous letter from a woman named Sita Mahalakshmi, igniting an unforgettable love story.",
                "release_year": 2022,
                "language": "Telugu",
                "duration_minutes": 163,
                "poster": "https://image.tmdb.org/t/p/w500/g3hk2wEeIsTGhh7JvK8yWFVR7ue.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/g3hk2wEeIsTGhh7JvK8yWFVR7ue.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=F0O2d_L6aeg",
                "streaming_on": ["Disney+ Hotstar", "Prime Video"],
                "mood_tags": ["romance", "tearjerker", "masterpiece"],
                "featured": False,
                "genres": ["Romance", "Drama", "Mystery"],
                "tmdb_id": 966220
            },
            {
                "title": "Inception",
                "tagline": "Your mind is the scene of the crime.",
                "overview": "A skilled thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
                "release_year": 2010,
                "language": "English",
                "duration_minutes": 148,
                "poster": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
                "streaming_on": ["Netflix", "Prime Video"],
                "mood_tags": ["mystery", "adrenaline", "masterpiece"],
                "featured": True,
                "genres": ["Sci-Fi", "Action", "Adventure"],
                "tmdb_id": 27205
            },
            {
                "title": "The Avengers",
                "tagline": "Earth's Mightiest Heroes assemble.",
                "overview": "When an unexpected enemy emerges and threatens global safety and security, Nick Fury, director of S.H.I.E.L.D., initiates the Avengers protocol to assemble Earth's mightiest heroes.",
                "release_year": 2012,
                "language": "English",
                "duration_minutes": 143,
                "poster": "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
                "duration_minutes": 143,
                "trailer_url": "https://www.youtube.com/watch?v=eOrNdBpGMv8",
                "streaming_on": ["Disney+ Hotstar"],
                "mood_tags": ["adrenaline", "popcorn", "masterpiece"],
                "featured": False,
                "genres": ["Action", "Adventure", "Sci-Fi"],
                "tmdb_id": 24428
            },
            {
                "title": "Titanic",
                "tagline": "Nothing on Earth could come between them.",
                "overview": "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic. Jack Dawson and Rose meet and fall deeply in love on the fateful maiden voyage of the RMS Titanic.",
                "release_year": 1997,
                "language": "English",
                "duration_minutes": 194,
                "poster": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=I7c1etV7DCo",
                "streaming_on": ["Disney+ Hotstar", "Apple TV"],
                "mood_tags": ["emotional", "romantic", "masterpiece"],
                "featured": False,
                "genres": ["Drama", "Romance"],
                "tmdb_id": 597
            },
            {
                "title": "Parasite",
                "tagline": "Act like you own the place.",
                "overview": "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
                "release_year": 2019,
                "language": "Korean",
                "duration_minutes": 132,
                "poster": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=5xH0RzeSojI",
                "streaming_on": ["Prime Video", "Apple TV"],
                "mood_tags": ["mind-bending", "dark", "masterpiece"],
                "featured": False,
                "genres": ["Comedy", "Drama", "Thriller"],
                "tmdb_id": 496243
            },
            {
                "title": "Spider-Man",
                "tagline": "With great power comes great responsibility.",
                "overview": "After being bitten by a genetically altered spider at Oscorp, nerdy high school student Peter Parker is endowed with amazing superpowers and discovers that with great power comes great responsibility.",
                "release_year": 2002,
                "language": "English",
                "duration_minutes": 121,
                "poster": "https://image.tmdb.org/t/p/w500/gh4c2Fr07jhOoRv0POW2Gu3ve89.jpg",
                "backdrop": "https://image.tmdb.org/t/p/original/gh4c2Fr07jhOoRv0POW2Gu3ve89.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=t06RUxPbp_c",
                "streaming_on": ["Netflix", "Disney+ Hotstar"],
                "mood_tags": ["adrenaline", "popcorn", "masterpiece"],
                "featured": False,
                "genres": ["Action", "Sci-Fi"],
                "tmdb_id": 557
            }
        ]

        created_movies = {}
        for m_data in movies_data:
            genres_list = m_data.pop("genres")
            movie, _ = Movie.objects.update_or_create(
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
            (created_movies["Dhurandar"], shubham, 4, "Gripping intelligence espionage thriller. Fast-paced with zero dull moments.", False),
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
                "cover": "https://image.tmdb.org/t/p/w500/yUtaHkL2SDIAZhRApZAyQrAXygn.jpg",
                "created_by": shubh,
                "movies": [created_movies["War"], created_movies["War 2"], created_movies["Dhurandar"], created_movies["Jawan"], created_movies["Inception"]]
            },
            {
                "title": "Tearjerker Romance & Soulful Cinema",
                "description": "Emotional rollercoasters, classic reincarnations, and timeless love.",
                "cover": "https://image.tmdb.org/t/p/w500/g3hk2wEeIsTGhh7JvK8yWFVR7ue.jpg",
                "created_by": shubham,
                "movies": [created_movies["Om Shanti Om"], created_movies["Sita Ramam"], created_movies["Titanic"], created_movies["Interstellar"]]
            },
            {
                "title": "Mind-Bending & Oscar Winners",
                "description": "Complex narratives, cosmic journeys, and cinematic masterpieces.",
                "cover": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
                "created_by": sanket,
                "movies": [created_movies["Interstellar"], created_movies["Inception"], created_movies["Parasite"]]
            },
        ]

        for p_data in playlists_data:
            p_movies = p_data.pop("movies")
            playlist, _ = Playlist.objects.update_or_create(
                title=p_data["title"],
                defaults=p_data
            )
            playlist.movies.set(p_movies)

        # 6. Clubs
        clubs_data = [
            {
                "name": "Spyverse & Action Fanatics",
                "description": "Dedicated to undercover agents, high-speed car chases, and explosive fight choreography across Indian & Hollywood cinema.",
                "avatar": "https://image.tmdb.org/t/p/w500/yUtaHkL2SDIAZhRApZAyQrAXygn.jpg",
                "category": "Action & Espionage",
                "created_by": shubh,
                "members": [shubh, shubham, sanket, india]
            },
            {
                "name": "Sci-Fi & Cosmic Horizons",
                "description": "Discussing wormholes, artificial intelligence, time travel, and Christopher Nolan's visionary masterpieces.",
                "avatar": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "category": "Sci-Fi & Space",
                "created_by": shubham,
                "members": [shubh, shubham, sanket]
            },
            {
                "name": "Bollywood & Classic Romantics",
                "description": "Celebrating the magic of Shah Rukh Khan, grand sets, iconic musical soundtracks, and poetic love stories.",
                "avatar": "https://image.tmdb.org/t/p/w500/oArsQTD4bPPMtRjqr03SO9W6phF.jpg",
                "category": "Romance & Drama",
                "created_by": sanket,
                "members": [shubh, sanket, india]
            }
        ]

        for c_data in clubs_data:
            c_members = c_data.pop("members")
            club, _ = Group.objects.update_or_create(
                name=c_data["name"],
                defaults=c_data
            )
            club.members.set(c_members)

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

        self.stdout.write(self.style.SUCCESS("Successfully seeded WatchWise SQLite database with official TMDb posters!"))
