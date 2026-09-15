import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Star,
  Film,
  Compass,
  BookmarkCheck,
  History,
  TrendingUp,
  ArrowRight,
  Tv,
  ListPlus
} from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { HeroSpotlight } from '../components/HeroSpotlight';
import { MovieCard } from '../components/MovieCard';

export const HomePage = ({ onSelectMovie }) => {
  const navigate = useNavigate();
  const { movies, genres, watchHistory, isWatched, getMovieRatingStats } = useMovies();
  const { currentUser, isAuthenticated } = useAuth();


  // Get list of watched movie objects for the current user
  const watchedMovieIds = useMemo(() => {
    if (!currentUser) return [];
    return watchHistory
      .filter(w => w.user_id === currentUser.id)
      .map(w => w.movie_id);
  }, [watchHistory, currentUser]);

  const watchedMovies = useMemo(() => {
    return watchedMovieIds
      .map(id => movies.find(m => m.id === id))
      .filter(Boolean);
  }, [watchedMovieIds, movies]);

  // Compute favorite genre IDs from watched history
  const favoriteGenreIds = useMemo(() => {
    const genreCounts = {};
    watchedMovies.forEach(movie => {
      (movie.genres || []).forEach(gId => {
        genreCounts[gId] = (genreCounts[gId] || 0) + 1;
      });
    });
    // Sort genres by frequency
    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([gId]) => Number(gId));
  }, [watchedMovies]);

  // Favorite genre names for display
  const favoriteGenreNames = useMemo(() => {
    return favoriteGenreIds
      .slice(0, 3)
      .map(gId => genres.find(g => g.id === gId)?.name)
      .filter(Boolean);
  }, [favoriteGenreIds, genres]);

  // Personalized Recommended Movies (Unwatched movies matching favorite genres or high rating)
  const recommendedMovies = useMemo(() => {
    const unwatched = movies.filter(m => !watchedMovieIds.includes(m.id));

    if (favoriteGenreIds.length > 0) {
      // Score unwatched movies based on genre overlap and rating
      const scored = unwatched.map(m => {
        const movieGenres = m.genres || [];
        const matchCount = movieGenres.filter(g => favoriteGenreIds.includes(g)).length;
        const ratingScore = (m.vote_average || 0) / 2; // scale 0-5
        const popularityScore = Math.min((m.popularity || 0) / 50, 2);
        return {
          movie: m,
          score: matchCount * 3 + ratingScore + popularityScore
        };
      });

      scored.sort((a, b) => b.score - a.score);
      return scored.map(s => s.movie);
    }

    // Fallback if no watch history: show top-rated and featured movies
    return [...unwatched].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  }, [movies, watchedMovieIds, favoriteGenreIds]);

  // Most recent watched movie for "Because You Watched X" recommendation
  const lastWatchedMovie = watchedMovies[0] || null;
  const becauseYouWatched = useMemo(() => {
    if (!lastWatchedMovie) return [];
    const targetGenres = lastWatchedMovie.genres || [];
    return movies
      .filter(m => m.id !== lastWatchedMovie.id && !watchedMovieIds.includes(m.id))
      .filter(m => (m.genres || []).some(g => targetGenres.includes(g)))
      .slice(0, 4);
  }, [movies, lastWatchedMovie, watchedMovieIds]);

  // Top trending / critically acclaimed
  const topTrending = useMemo(() => {
    return [...movies]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 8);
  }, [movies]);

  return (
    <div className="app-container" style={{ paddingBottom: '70px' }}>
      {/* Hero Spotlight Header */}
      <HeroSpotlight onSelectMovie={onSelectMovie} />

      {/* Discovery Quick Action Banner */}
      <div
        className="glass-card"
        style={{
          margin: '24px 0 40px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              className="badge"
              style={{
                background: 'var(--primary)',
                color: '#090c15',
                fontWeight: 800,
                fontSize: '0.75rem'
              }}
            >
              AI RECOMMENDER
            </span>
            {favoriteGenreNames.length > 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Tuned to your taste in{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {favoriteGenreNames.join(', ')}
                </strong>
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Personalized Movie Stream
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {watchedMovies.length > 0
              ? `Curated based on ${watchedMovies.length} film${watchedMovies.length > 1 ? 's' : ''} you've watched.`
              : 'Mark films you have seen to train your AI recommendation algorithm.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/explore')}
            className="btn btn-primary"
          >
            <Compass size={17} />
            <span>Explore Full Catalog ({movies.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PRIMARY PERSONALIZED RECOMMENDATIONS */}
      <section style={{ marginBottom: '50px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
              <Sparkles size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tailored For You
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
              Recommended Movies
            </h2>
          </div>

          <button
            onClick={() => navigate('/explore')}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--primary)' }}
          >
            <span>View All ({movies.length})</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {recommendedMovies.length > 0 ? (
          <div className="movie-grid">
            {recommendedMovies.slice(0, 12).map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelectMovie={onSelectMovie}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Film size={44} color="var(--primary)" />
            <h3>No unwatched recommendations remaining</h3>
            <p>You have watched all currently available movies in our catalog!</p>
          </div>
        )}
      </section>

      {/* SECTION 2: BECAUSE YOU WATCHED [LAST MOVIE] */}
      {lastWatchedMovie && becauseYouWatched.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '4px' }}>
              <TrendingUp size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Similar Vibe
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
              Because you watched <span style={{ color: 'var(--primary)' }}>"{lastWatchedMovie.title}"</span>
            </h2>
          </div>

          <div className="movie-grid">
            {becauseYouWatched.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelectMovie={onSelectMovie}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: YOUR PREVIOUSLY WATCHED MOVIES */}
      {watchedMovies.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '4px' }}>
                <History size={18} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Viewing History
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
                Movies You Previously Watched ({watchedMovies.length})
              </h2>
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="btn btn-ghost btn-sm"
              style={{ color: '#10b981' }}
            >
              <span>Manage History</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="movie-grid">
            {watchedMovies.slice(0, 8).map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelectMovie={onSelectMovie}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: TRENDING & POPULAR SPOTLIGHT */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '4px' }}>
              <Flame size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Global Trends
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
              Trending Across Cinema
            </h2>
          </div>

          <button
            onClick={() => navigate('/explore')}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--primary)' }}
          >
            <span>Explore All</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="movie-grid">
          {topTrending.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelectMovie={onSelectMovie}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
