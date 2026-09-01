import React, { useState } from 'react';
import { Star, Clock, Calendar, Bookmark, BookmarkCheck, ListPlus, Flame } from 'lucide-react';
import { useMovies } from '../context/MovieContext';

export const MovieCard = ({ movie, onSelectMovie }) => {
  const { genres, isWatched, toggleWatch, getMovieRatingStats, openAddToPlaylist } = useMovies();
  const [imageLoaded, setImageLoaded] = useState(false);

  const watched = isWatched(movie.id);
  const ratingStats = getMovieRatingStats(movie.id);
  const primaryGenre = movie.genres?.length ? genres.find(g => g.id === movie.genres[0])?.name : null;
  const primaryProvider = movie.streaming_on?.[0];
  const tmdbScore = movie.vote_average || ratingStats.average;
  const hasOriginalScript = movie.original_title && movie.original_title !== movie.title;

  return (
    <div
      className="glass-card"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        height: '100%',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
      }}
      onClick={() => onSelectMovie(movie.id)}
    >
      {/* Poster Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '145%', // 2:3 cinematic aspect ratio
          background: 'var(--bg-surface-elevated)',
          overflow: 'hidden'
        }}
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            onLoad={() => setImageLoaded(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease, filter 0.3s ease',
              opacity: imageLoaded ? 1 : 0.6
            }}
            className="movie-poster-img"
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'var(--text-muted)',
              padding: '20px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-surface-elevated))'
            }}
          >
            <span style={{ fontSize: '2rem', marginBottom: '8px' }}>🎬</span>
            <span style={{ fontSize: '0.85rem' }}>No Poster</span>
          </div>
        )}

        {/* Top Badges: Score & Actions */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 3
          }}
        >
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {tmdbScore ? (
              <span
                className="badge"
                style={{
                  background: 'rgba(9, 12, 21, 0.88)',
                  backdropFilter: 'blur(8px)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Star size={11} fill="#fbbf24" color="#fbbf24" /> {tmdbScore}
              </span>
            ) : (
              <span
                className="badge badge-surface"
                style={{
                  background: 'rgba(9, 12, 21, 0.75)',
                  backdropFilter: 'blur(8px)',
                  fontSize: '0.7rem'
                }}
              >
                New
              </span>
            )}

            {movie.popularity > 80 && (
              <span
                title={`Popularity Score: ${movie.popularity}`}
                style={{
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <Flame size={11} fill="#f87171" color="#f87171" /> Hot
              </span>
            )}
          </div>

          {/* Action Buttons: Playlist + Watchlist */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openAddToPlaylist(movie);
              }}
              title="Add to Playlist"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'rgba(9, 12, 21, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-glass)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <ListPlus size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatch(movie.id);
              }}
              title={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: watched ? 'var(--primary)' : 'rgba(9, 12, 21, 0.85)',
                backdropFilter: 'blur(8px)',
                border: watched ? 'none' : '1px solid var(--border-glass)',
                color: watched ? '#090c15' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {watched ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
          </div>
        </div>

        {/* Bottom Tags: Primary Genre + Language + Streaming Provider */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 3
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            {primaryGenre && (
              <span
                className="badge"
                style={{
                  background: 'rgba(9, 12, 21, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.68rem'
                }}
              >
                {primaryGenre}
              </span>
            )}
            {movie.language && (
              <span
                className="badge"
                style={{
                  background: 'rgba(9, 12, 21, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--accent-glow)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.68rem'
                }}
              >
                {movie.language}
              </span>
            )}
          </div>

          {primaryProvider && (
            <span
              className="badge"
              style={{
                background: 'rgba(9, 12, 21, 0.85)',
                backdropFilter: 'blur(8px)',
                color: primaryProvider === 'Netflix' ? '#ff4b55' : primaryProvider === 'Prime Video' ? '#38bdf8' : '#fbbf24',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.68rem',
                textTransform: 'none'
              }}
            >
              {primaryProvider}
            </span>
          )}
        </div>
      </div>

      {/* Movie Details Info */}
      <div
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: hasOriginalScript ? '2px' : '6px',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={movie.title}
          >
            {movie.title}
          </h3>

          {hasOriginalScript && (
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--primary)',
                fontStyle: 'italic',
                marginBottom: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                opacity: 0.85
              }}
            >
              {movie.original_title}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}
          >
            {movie.release_year && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Calendar size={13} color="var(--primary)" /> {movie.release_year}
              </span>
            )}
            {movie.duration_minutes && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={13} color="var(--primary)" /> {movie.duration_minutes}m
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
