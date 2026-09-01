import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  initialMovies,
  initialGenres,
  initialReviews,
  initialWatchHistory,
  initialClubs,
  initialPlaylists
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const MovieContext = createContext();

export const RATING_LEVELS = [
  { value: 1, label: 'Skip', color: '#ef4444', description: 'Not worth your time' },
  { value: 2, label: 'Time Pass', color: '#f97316', description: 'Decent one-time watch' },
  { value: 3, label: 'Go For It', color: '#eab308', description: 'Good entertaining movie' },
  { value: 4, label: 'Must Watch', color: '#3b82f6', description: 'Highly recommended masterpiece' },
  { value: 5, label: 'Perfection', color: '#10b981', description: 'Flawless cinematic glory' }
];

export const MOODS = [
  { id: 'adrenaline', label: '⚡ High-Octane Action', desc: 'Fast, explosive & intense adrenaline', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
  { id: 'mind-bending', label: '🧠 Mind-Bending Mystery', desc: 'Deep twists, psychology & puzzles', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
  { id: 'emotional', label: '💖 Heartfelt & Tearjerker', desc: 'Deep emotional resonance & human bond', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  { id: 'romantic', label: '🌹 Epic Romance', desc: 'Timeless love stories & great soundtracks', color: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
  { id: 'popcorn', label: '🍿 Popcorn Fun & Comedy', desc: 'Pure entertainment, laughter & thrills', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'dark', label: '🌙 Dark & Gritty Thrill', desc: 'Undercover tension & gritty underworlds', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
  { id: 'masterpiece', label: '🏆 Cinematic Masterpiece', desc: 'Award-winning direction & storytelling', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
];

export const MovieProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Storage synced state
  const [movies, setMovies] = useState(() => {
    const saved = localStorage.getItem('watchwise_movies_v2');
    return saved ? JSON.parse(saved) : initialMovies;
  });

  const [genres, setGenres] = useState(initialGenres);

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('watchwise_reviews_v2');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [watchHistory, setWatchHistory] = useState(() => {
    const saved = localStorage.getItem('watchwise_watch_history');
    return saved ? JSON.parse(saved) : initialWatchHistory;
  });

  const [clubs, setClubs] = useState(() => {
    const saved = localStorage.getItem('watchwise_clubs');
    return saved ? JSON.parse(saved) : initialClubs;
  });

  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem('watchwise_playlists');
    return saved ? JSON.parse(saved) : initialPlaylists;
  });

  // Fetch initial data from Django backend API
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [moviesRes, genresRes, reviewsRes, playlistsRes, clubsRes, watchlistRes] = await Promise.all([
          api.getMovies(),
          api.getGenres(),
          api.getReviews(),
          api.getPlaylists(),
          api.getClubs(),
          api.getWatchlist(currentUser?.id),
        ]);

        if (moviesRes?.movies?.length) {
          setMovies(moviesRes.movies);
        }
        if (genresRes?.genres?.length) {
          setGenres(genresRes.genres);
        }
        if (reviewsRes?.reviews?.length) {
          setReviews(reviewsRes.reviews);
        }
        if (playlistsRes?.playlists?.length) {
          setPlaylists(playlistsRes.playlists);
        }
        if (clubsRes?.clubs?.length) {
          setClubs(clubsRes.clubs);
        }
        if (watchlistRes?.watched) {
          const formattedWatch = watchlistRes.watched.map(mId => ({
            user_id: currentUser?.id || 1,
            movie_id: mId,
            watched_at: new Date().toISOString()
          }));
          setWatchHistory(formattedWatch);
        }
      } catch (err) {
        console.info('Using local cached store:', err.message);
      }
    }

    loadBackendData();
  }, [currentUser?.id]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('watchwise_theme') || 'dark';
  });
  const [toast, setToast] = useState(null);

  // Modals & Overlay state
  const [activeTrailer, setActiveTrailer] = useState(null); // { title, url }
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [playlistTargetMovie, setPlaylistTargetMovie] = useState(null);

  useEffect(() => {
    localStorage.setItem('watchwise_movies_v2', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('watchwise_reviews_v2', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('watchwise_watch_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem('watchwise_clubs', JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem('watchwise_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('watchwise_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const openTrailer = (movie) => {
    if (movie.trailer_url) {
      setActiveTrailer({ title: movie.title, url: movie.trailer_url });
    } else {
      showToast(`Searching YouTube for "${movie.title}" Official Trailer...`, 'info');
      const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' Official Trailer')}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  const closeTrailer = () => {
    setActiveTrailer(null);
  };

  const openAddToPlaylist = (movie) => {
    if (!currentUser) {
      showToast('Please sign in to manage playlists', 'error');
      return;
    }
    setPlaylistTargetMovie(movie);
    setIsPlaylistModalOpen(true);
  };

  // Movie Ratings & Reviews helpers
  const getMovieReviews = (movieId) => {
    return reviews.filter(r => r.movie_id === Number(movieId));
  };

  const getMovieRatingStats = (movieId) => {
    const movieReviews = getMovieReviews(movieId);
    if (!movieReviews.length) {
      return { average: null, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }
    const sum = movieReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = (sum / movieReviews.length).toFixed(1);
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    movieReviews.forEach(r => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
    });

    return {
      average: parseFloat(avg),
      count: movieReviews.length,
      distribution
    };
  };

  const addOrUpdateReview = async ({ movieId, rating, reviewText, containsSpoiler = false }) => {
    if (!currentUser) {
      showToast('Please log in to submit a review', 'error');
      return false;
    }

    const mId = Number(movieId);
    const rat = Number(rating);
    const ratingObj = RATING_LEVELS.find(r => r.value === rat);
    const existingIndex = reviews.findIndex(r => r.movie_id === mId && r.user_id === currentUser.id);

    // Sync with backend API
    api.saveReview({
      movie_id: mId,
      user_id: currentUser.id,
      rating: rat,
      review_text: reviewText.trim(),
      contains_spoiler: !!containsSpoiler
    });

    if (existingIndex > -1) {
      const updated = [...reviews];
      updated[existingIndex] = {
        ...updated[existingIndex],
        rating: rat,
        rating_label: ratingObj ? ratingObj.label : 'Rated',
        review_text: reviewText.trim(),
        contains_spoiler: !!containsSpoiler,
        updated_at: new Date().toISOString()
      };
      setReviews(updated);
      showToast('Your review has been updated in database!');
    } else {
      const newReview = {
        id: Date.now(),
        movie_id: mId,
        user_id: currentUser.id,
        username: currentUser.username,
        user_avatar: currentUser.avatar,
        rating: rat,
        rating_label: ratingObj ? ratingObj.label : 'Rated',
        review_text: reviewText.trim(),
        contains_spoiler: !!containsSpoiler,
        created_at: new Date().toISOString()
      };
      setReviews(prev => [newReview, ...prev]);
      showToast('Review and rating published to database!');
    }

    if (rat >= 4) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    }

    return true;
  };

  const deleteReview = (reviewId) => {
    api.deleteReview(reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    showToast('Review removed');
  };

  // Watchlist & History
  const isWatched = (movieId, userId = currentUser?.id) => {
    if (!userId) return false;
    return watchHistory.some(w => w.movie_id === Number(movieId) && w.user_id === userId);
  };

  const toggleWatch = (movieId) => {
    if (!currentUser) {
      showToast('Please log in to update your watchlist', 'error');
      return false;
    }

    const mId = Number(movieId);
    const alreadyWatched = isWatched(mId, currentUser.id);
    const movieObj = movies.find(m => m.id === mId);
    const movieTitle = movieObj ? movieObj.title : 'Movie';

    // Sync with backend API
    api.toggleWatchlist(mId, currentUser.id);

    if (alreadyWatched) {
      setWatchHistory(prev => prev.filter(w => !(w.movie_id === mId && w.user_id === currentUser.id)));
      showToast(`Removed "${movieTitle}" from your watched list`);
      return false;
    } else {
      const entry = {
        user_id: currentUser.id,
        movie_id: mId,
        watched_at: new Date().toISOString()
      };
      setWatchHistory(prev => [entry, ...prev]);
      showToast(`Marked "${movieTitle}" as Watched! 🎉`);
      
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
      return true;
    }
  };

  // Playlist management
  const createPlaylist = async ({ title, description, cover }) => {
    if (!currentUser) return null;

    const newPlaylist = {
      id: Date.now(),
      title: title.trim(),
      description: description?.trim() || '',
      cover: cover?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80',
      created_by: currentUser.id,
      created_by_name: currentUser.username,
      movies: [],
      created_at: new Date().toISOString()
    };

    setPlaylists(prev => [newPlaylist, ...prev]);
    showToast(`Playlist "${newPlaylist.title}" saved to database!`);

    // Sync with backend
    const res = await api.createPlaylist({
      title: newPlaylist.title,
      description: newPlaylist.description,
      cover: newPlaylist.cover,
      user_id: currentUser.id
    });

    if (res?.playlist?.id) {
      setPlaylists(prev => prev.map(p => p.id === newPlaylist.id ? { ...p, id: res.playlist.id } : p));
    }

    return newPlaylist;
  };

  const addMovieToPlaylist = (playlistId, movieId) => {
    const mId = Number(movieId);
    const movie = movies.find(m => m.id === mId);

    // Sync with backend
    api.togglePlaylistMovie(playlistId, mId);

    setPlaylists(prev => prev.map(p => {
      if (p.id === Number(playlistId)) {
        if (p.movies.includes(mId)) {
          showToast(`Already in "${p.title}"`, 'info');
          return p;
        }
        showToast(`Added "${movie?.title || 'Movie'}" to "${p.title}"! 🍿`);
        return {
          ...p,
          cover: p.cover || movie?.poster,
          movies: [...p.movies, mId]
        };
      }
      return p;
    }));
  };

  const removeMovieFromPlaylist = (playlistId, movieId) => {
    api.togglePlaylistMovie(playlistId, Number(movieId));
    setPlaylists(prev => prev.map(p => {
      if (p.id === Number(playlistId)) {
        return {
          ...p,
          movies: p.movies.filter(id => id !== Number(movieId))
        };
      }
      return p;
    }));
    showToast('Removed from playlist');
  };

  const deletePlaylist = (playlistId) => {
    api.deletePlaylist(playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== Number(playlistId)));
    showToast('Playlist deleted');
  };

  // Add Movie
  const addMovie = async (movieData) => {
    const newMovie = {
      id: Date.now(),
      title: movieData.title.trim(),
      overview: movieData.overview?.trim() || '',
      release_year: Number(movieData.release_year) || new Date().getFullYear(),
      language: movieData.language || 'English',
      duration_minutes: Number(movieData.duration_minutes) || 120,
      poster: movieData.poster?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80',
      backdrop: movieData.backdrop?.trim() || movieData.poster?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      genres: movieData.genres || [1],
      created_by: currentUser ? currentUser.id : 1,
      created_at: new Date().toISOString(),
      featured: false,
      tagline: movieData.tagline || '',
      trailer_url: movieData.trailer_url || 'https://www.youtube.com/watch?v=tQ0mzXRk-oI',
      streaming_on: movieData.streaming_on || ['Prime Video'],
      mood_tags: movieData.mood_tags || ['adrenaline', 'popcorn'],
      tmdb_id: movieData.tmdb_id || null
    };

    setMovies(prev => [newMovie, ...prev]);
    showToast(`"${newMovie.title}" saved to database!`);

    // Sync with Django backend
    let finalMovie = newMovie;
    try {
      const res = await api.createMovie(newMovie);
      if (res?.movie?.id) {
        finalMovie = { ...newMovie, id: res.movie.id };
        setMovies(prev => prev.map(m => m.id === newMovie.id ? finalMovie : m));
      }
    } catch (err) {
      console.warn('Backend sync error in addMovie', err);
    }

    return finalMovie;
  };

  // TMDb Live Autofill Search API
  const fetchTmdbMovie = async (title, year) => {
    if (!title) return null;
    try {
      const apiKey = "96c4eaf6c7dcb14b24968856d25cbc69";
      let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
      if (year) {
        url += `&year=${encodeURIComponent(year)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch from TMDb');
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const top = data.results[0];
        const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${top.id}?api_key=${apiKey}&append_to_response=videos`);
        const detailData = detailRes.ok ? await detailRes.json() : top;

        let trailerUrl = '';
        if (detailData.videos && detailData.videos.results) {
          const trailer = detailData.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || detailData.videos.results[0];
          if (trailer) {
            trailerUrl = `https://www.youtube.com/watch?v=s${trailer.key}`;
          }
        }

        return {
          title: detailData.title || top.title,
          overview: detailData.overview || top.overview,
          release_year: (detailData.release_date || top.release_date || '').split('-')[0] || year || '',
          language: detailData.original_language === 'hi' ? 'Hindi' : detailData.original_language === 'te' ? 'Telugu' : detailData.original_language === 'en' ? 'English' : detailData.original_language || 'English',
          duration_minutes: detailData.runtime || 135,
          poster: top.poster_path ? `https://image.tmdb.org/t/p/w500${top.poster_path}` : '',
          backdrop: top.backdrop_path ? `https://image.tmdb.org/t/p/original${top.backdrop_path}` : '',
          genres: detailData.genres ? detailData.genres.map(g => {
            const match = genres.find(item => item.tmdb_id === g.id || item.name.toLowerCase() === g.name.toLowerCase());
            return match ? match.id : null;
          }).filter(Boolean) : [1],
          tagline: detailData.tagline || '',
          trailer_url: trailerUrl || 'https://www.youtube.com/watch?v=tQ0mzXRk-oI',
          streaming_on: ["Prime Video", "Netflix"],
          tmdb_id: top.id
        };
      }
    } catch (err) {
      console.warn('TMDb live search error', err);
    }

    return {
      title,
      overview: `${title} is an acclaimed visual movie experience with rich performances and world-building.`,
      release_year: year || new Date().getFullYear(),
      language: 'English',
      duration_minutes: 130,
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80',
      backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
      genres: [1, 7],
      tagline: 'Experience cinema like never before.',
      trailer_url: 'https://www.youtube.com/watch?v=tQ0mzXRk-oI',
      streaming_on: ["Prime Video"]
    };
  };

  // Clubs
  const joinClub = (clubId) => {
    if (!currentUser) {
      showToast('Please log in to join clubs', 'error');
      return;
    }
    api.toggleJoinClub(clubId, currentUser.id);

    setClubs(prev => prev.map(c => {
      if (c.id === clubId) {
        const isMember = c.members ? c.members.includes(currentUser.id) : c.is_member;
        const newMembers = isMember
          ? (c.members || []).filter(id => id !== currentUser.id)
          : [...(c.members || []), currentUser.id];
        showToast(isMember ? `Left ${c.name}` : `Joined ${c.name}! 🎉`);
        return {
          ...c,
          members: newMembers,
          member_count: isMember ? (c.member_count || 1) - 1 : (c.member_count || 0) + 1,
          is_member: !isMember
        };
      }
      return c;
    }));
  };

  const createClub = async (clubData) => {
    if (!currentUser) return;
    const newClub = {
      id: Date.now(),
      name: clubData.name.trim(),
      description: clubData.description?.trim() || '',
      avatar: clubData.banner?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      category: clubData.category || 'Discussion',
      created_by: currentUser.id,
      created_by_name: currentUser.username,
      member_count: 1,
      created_at: new Date().toISOString(),
      members: [currentUser.id],
      is_member: true,
      posts: []
    };

    setClubs(prev => [newClub, ...prev]);
    showToast(`Club "${newClub.name}" created!`);

    const res = await api.createClub({
      name: newClub.name,
      description: newClub.description,
      avatar: newClub.avatar,
      category: newClub.category,
      user_id: currentUser.id
    });

    if (res?.club?.id) {
      setClubs(prev => prev.map(c => c.id === newClub.id ? { ...c, id: res.club.id } : c));
    }

    return newClub;
  };

  const addClubPost = async (clubId, { content, image }) => {
    if (!currentUser) {
      showToast('Please log in to post in clubs', 'error');
      return;
    }
    const newPost = {
      id: Date.now(),
      user_id: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      content: content.trim(),
      image: image || null,
      likes: 0,
      timestamp: "Just now",
      comments: []
    };

    setClubs(prev => prev.map(c => {
      if (c.id === clubId) {
        return {
          ...c,
          posts: [newPost, ...(c.posts || [])]
        };
      }
      return c;
    }));
    showToast('Post published to club feed!');

    api.createClubPost(clubId, {
      content: newPost.content,
      image: newPost.image,
      user_id: currentUser.id
    });
  };

  const addClubComment = (clubId, postId, commentText) => {
    if (!currentUser) {
      showToast('Please log in to comment', 'error');
      return;
    }
    const newComment = {
      id: Date.now(),
      username: currentUser.username,
      avatar: currentUser.avatar,
      text: commentText.trim(),
      time: "Just now"
    };

    setClubs(prev => prev.map(c => {
      if (c.id === clubId) {
        return {
          ...c,
          posts: (c.posts || []).map(p => {
            if (p.id === postId) {
              return {
                ...p,
                comments: [...(p.comments || []), newComment]
              };
            }
            return p;
          })
        };
      }
      return c;
    }));
    showToast('Comment added!');
  };

  const likeClubPost = (clubId, postId) => {
    setClubs(prev => prev.map(c => {
      if (c.id === clubId) {
        return {
          ...c,
          posts: (c.posts || []).map(p => {
            if (p.id === postId) {
              return {
                ...p,
                likes: (p.likes || 0) + 1
              };
            }
            return p;
          })
        };
      }
      return c;
    }));
  };

  return (
    <MovieContext.Provider value={{
      movies,
      genres,
      reviews,
      watchHistory,
      clubs,
      playlists,
      searchQuery,
      setSearchQuery,
      selectedGenre,
      setSelectedGenre,
      sortBy,
      setSortBy,
      theme,
      toggleTheme,
      toast,
      showToast,
      activeTrailer,
      openTrailer,
      closeTrailer,
      isMoodModalOpen,
      setIsMoodModalOpen,
      isPlaylistModalOpen,
      setIsPlaylistModalOpen,
      playlistTargetMovie,
      openAddToPlaylist,
      createPlaylist,
      addMovieToPlaylist,
      removeMovieFromPlaylist,
      deletePlaylist,
      getMovieReviews,
      getMovieRatingStats,
      addOrUpdateReview,
      deleteReview,
      isWatched,
      toggleWatch,
      addMovie,
      fetchTmdbMovie,
      joinClub,
      createClub,
      addClubPost,
      addClubComment,
      likeClubPost
    }}>
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => useContext(MovieContext);
