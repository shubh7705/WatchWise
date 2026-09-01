import React, { useMemo } from 'react';
import {
  Film,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { HeroSpotlight } from '../components/HeroSpotlight';
import { MovieCard } from '../components/MovieCard';

export const MoviesPage = ({ onSelectMovie, onOpenAddMovie }) => {
  const {
    movies,
    genres,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    setSortBy,
    getMovieRatingStats
  } = useMovies();

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let list = [...movies];

    // Filter by genre
    if (selectedGenre) {
      list = list.filter(m => m.genres && m.genres.includes(selectedGenre));
    }

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        m =>
          m.title.toLowerCase().includes(q) ||
          m.overview?.toLowerCase().includes(q) ||
          m.language?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'popularity') {
      list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortBy === 'tmdb_rating') {
      list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => {
        const avgA = getMovieRatingStats(a.id).average || 0;
        const avgB = getMovieRatingStats(b.id).average || 0;
        return avgB - avgA;
      });
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
    } else if (sortBy === 'duration') {
      list.sort((a, b) => (b.duration_minutes || 0) - (a.duration_minutes || 0));
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [movies, searchQuery, selectedGenre, sortBy]);

  return (
    <div className="app-container" style={{ paddingBottom: '60px' }}>
      {/* Featured Spotlight Banner (Shown when not actively searching) */}
      {!searchQuery && !selectedGenre && (
        <HeroSpotlight onSelectMovie={onSelectMovie} />
      )}

      {/* Discovery Filters Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          margin: '24px 0 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Top Controls Row: Search summary, sort & add */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <Film size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Explore Catalog</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing {filteredMovies.length} {filteredMovies.length === 1 ? 'title' : 'titles'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-modern"
                style={{
                  padding: '8px 32px 8px 12px',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-full)',
                  height: '38px',
                  width: 'auto'
                }}
              >
                <option value="recommended">Featured / Curated</option>
                <option value="popularity">Trending & Popularity 🔥</option>
                <option value="tmdb_rating">TMDb Top Rated ⭐</option>
                <option value="rating">Community Top Rated</option>
                <option value="newest">Release Year (Newest)</option>
                <option value="duration">Runtime (Longest)</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>

            <button
              onClick={onOpenAddMovie}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <Plus size={16} /> Add Movie
            </button>
          </div>
        </div>

        {/* Genres Pill Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          <button
            onClick={() => setSelectedGenre(null)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: selectedGenre === null ? 'var(--primary)' : 'var(--bg-surface-elevated)',
              color: selectedGenre === null ? '#090c15' : 'var(--text-secondary)',
              border: selectedGenre === null ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            All Genres
          </button>

          {genres.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(isSelected ? null : g.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: isSelected ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                  color: isSelected ? '#090c15' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="movie-grid">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onSelectMovie={onSelectMovie} />
          ))}
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            margin: '40px auto',
            maxWidth: '500px'
          }}
        >
          <Film size={48} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Movies Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            We couldn't find any titles matching "{searchQuery}".
          </p>
          <button onClick={onOpenAddMovie} className="btn btn-primary">
            <Plus size={16} /> Add "{searchQuery}" with TMDb Autofill
          </button>
        </div>
      )}
    </div>
  );
};
