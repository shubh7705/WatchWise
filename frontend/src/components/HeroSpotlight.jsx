import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Star,
  Clock,
  Calendar,
  Globe,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  Info,
  Play
} from 'lucide-react';
import { useMovies } from '../context/MovieContext';

export const HeroSpotlight = ({ onSelectMovie }) => {
  const { movies, genres, isWatched, toggleWatch, getMovieRatingStats, openTrailer } = useMovies();
  
  // Featured movies pool
  const featuredPool = movies.filter(m => m.featured || m.poster).slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredPool.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredPool.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredPool.length]);

  if (!featuredPool.length) return null;

  const currentMovie = featuredPool[currentIndex] || featuredPool[0];
  const watched = isWatched(currentMovie.id);
  const ratingStats = getMovieRatingStats(currentMovie.id);
  const movieGenres = currentMovie.genres?.map(gId => genres.find(g => g.id === gId)?.name).filter(Boolean) || [];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? featuredPool.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % featuredPool.length);
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        minHeight: '440px',
        display: 'flex',
        alignItems: 'flex-end',
        margin: '24px 0 36px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-glass)',
        background: `url(${currentMovie.backdrop || currentMovie.poster}) center/cover no-repeat`
      }}
    >
      {/* Cinematic Gradient Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(9, 12, 21, 0.2) 0%, rgba(9, 12, 21, 0.85) 65%, rgba(9, 12, 21, 0.98) 100%)',
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(9, 12, 21, 0.95) 0%, rgba(9, 12, 21, 0.6) 45%, transparent 100%)',
          zIndex: 1
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '36px',
          maxWidth: '750px',
          width: '100%'
        }}
      >
        {/* Spotlight Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} /> Spotlight Premiere
          </span>
          {movieGenres.slice(0, 3).map((g, i) => (
            <span key={i} className="badge badge-surface" style={{ color: 'var(--text-secondary)' }}>
              {g}
            </span>
          ))}
          {ratingStats.average && (
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Star size={12} fill="#34d399" /> {ratingStats.average} / 5 ({ratingStats.count} reviews)
            </span>
          )}
        </div>

        {/* Title & Tagline */}
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '8px',
            color: '#ffffff',
            textShadow: '0 4px 16px rgba(0,0,0,0.8)'
          }}
        >
          {currentMovie.title}
        </h1>

        {currentMovie.tagline && (
          <p style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: 600, fontSize: '1rem', marginBottom: '12px' }}>
            "{currentMovie.tagline}"
          </p>
        )}

        {/* Metadata info row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={15} color="var(--primary)" /> {currentMovie.release_year}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={15} color="var(--primary)" /> {currentMovie.duration_minutes} mins
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Globe size={15} color="var(--primary)" /> {currentMovie.language}
          </span>
        </div>

        {/* Synopsis snippet */}
        <p
          style={{
            color: '#cbd5e1',
            fontSize: '0.95rem',
            lineHeight: 1.55,
            marginBottom: '24px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {currentMovie.overview}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onSelectMovie(currentMovie.id)}
            className="btn btn-primary btn-lg"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Info size={18} />
            <span>Explore Details</span>
          </button>

          <button
            onClick={() => openTrailer(currentMovie)}
            className="btn btn-secondary btn-lg"
            style={{
              borderRadius: 'var(--radius-full)',
              borderColor: 'var(--primary)',
              color: 'var(--primary)'
            }}
          >
            <Play size={18} fill="currentColor" />
            <span>Trailer</span>
          </button>

          <button
            onClick={() => toggleWatch(currentMovie.id)}
            className="btn btn-secondary btn-lg"
            style={{
              borderRadius: 'var(--radius-full)',
              borderColor: watched ? 'var(--primary)' : 'var(--border-glass)',
              color: watched ? 'var(--primary)' : 'var(--text-primary)'
            }}
          >
            {watched ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            <span>{watched ? 'In Watchlist' : 'Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Slide Navigation controls */}
      <div
        style={{
          position: 'absolute',
          right: '24px',
          bottom: '24px',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <button
          onClick={handlePrev}
          className="btn btn-secondary"
          style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
          aria-label="Previous spotlight"
        >
          <ChevronLeft size={18} />
        </button>
        <div style={{ display: 'flex', gap: '4px' }}>
          {featuredPool.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentIndex ? 'var(--primary)' : 'var(--border-glass)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="btn btn-secondary"
          style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
          aria-label="Next spotlight"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
