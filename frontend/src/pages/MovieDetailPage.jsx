import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Globe,
  Bookmark,
  BookmarkCheck,
  Edit3,
  Trash2,
  Sparkles,
  MessageSquare,
  User,
  Share2,
  Play,
  ListPlus,
  Tv,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { useMovies, RATING_LEVELS } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from '../components/ReviewModal';
import { MovieCard } from '../components/MovieCard';

export const MovieDetailPage = ({ movieId, onBack, onSelectMovie }) => {
  const {
    movies,
    genres,
    isWatched,
    toggleWatch,
    getMovieReviews,
    getMovieRatingStats,
    deleteReview,
    openTrailer,
    openAddToPlaylist,
    showToast
  } = useMovies();
  const { currentUser } = useAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  const movie = movies.find(m => m.id === Number(movieId) || String(m.id) === String(movieId));

  if (!movie) {
    return (
      <div className="app-container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Movie not found</h2>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to catalog
        </button>
      </div>
    );
  }

  const watched = isWatched(movie.id);
  const reviews = getMovieReviews(movie.id);
  const ratingStats = getMovieRatingStats(movie.id);
  const userReview = currentUser ? reviews.find(r => r.user_id === currentUser.id) : null;
  const movieGenres = movie.genres?.map(gId => genres.find(g => g.id === gId)?.name).filter(Boolean) || [];

  const toggleSpoilerReveal = (reviewId) => {
    setRevealedSpoilers(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Similar movies
  const similarMovies = movies
    .filter(m => m.id !== movie.id && m.genres?.some(g => movie.genres?.includes(g)))
    .slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Movie link copied to clipboard!');
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn btn-ghost btn-sm"
        style={{ margin: '16px 0 20px', borderRadius: 'var(--radius-full)' }}
      >
        <ArrowLeft size={16} /> Back to Movies
      </button>

      {/* Hero Backdrop & Details Glass Panel */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '40px',
          border: '1px solid var(--border-glass)'
        }}
      >
        {/* Blurred backdrop background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${movie.backdrop || movie.poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(30px) brightness(0.25)',
            transform: 'scale(1.1)',
            zIndex: 0
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 280px) 1fr',
            gap: '36px',
            alignItems: 'start'
          }}
          className="movie-detail-grid"
        >
          {/* Movie Poster & Actions */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-glass)',
                aspectRatio: '2/3',
                background: 'var(--bg-surface-elevated)',
                position: 'relative'
              }}
            >
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Poster
                </div>
              )}

              {/* Watch Trailer overlay button */}
              <button
                onClick={() => openTrailer(movie)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(9, 12, 21, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '8px',
                  color: '#ffffff',
                  opacity: 0,
                  transition: 'opacity 0.25s ease',
                  cursor: 'pointer'
                }}
                className="poster-trailer-hover"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#090c15',
                    boxShadow: '0 0 20px var(--primary)'
                  }}
                >
                  <Play size={24} fill="#090c15" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  Play Trailer
                </span>
              </button>
            </div>

            {/* Quick Action buttons below poster */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => toggleWatch(movie.id)}
                className={`btn ${watched ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '110px', borderRadius: 'var(--radius-md)', padding: '10px' }}
              >
                {watched ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                <span>{watched ? 'Watched' : 'Watchlist'}</span>
              </button>

              <button
                onClick={() => openAddToPlaylist(movie)}
                className="btn btn-secondary"
                style={{ borderRadius: 'var(--radius-md)', padding: '10px 14px' }}
                title="Save to Playlist"
              >
                <ListPlus size={16} />
              </button>

              <button
                onClick={handleShare}
                className="btn btn-secondary"
                style={{ width: '42px', height: '42px', padding: 0, borderRadius: 'var(--radius-md)' }}
                title="Share Movie"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Movie Meta Information */}
          <div>
            {/* Genre pills + Streaming Badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
              {movieGenres.map((g, i) => (
                <span key={i} className="badge badge-gold">
                  {g}
                </span>
              ))}
              {movie.language && (
                <span className="badge badge-surface" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Globe size={11} /> {movie.language}
                </span>
              )}
            </div>

            {/* Title & Native Original Title */}
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, marginBottom: '4px', lineHeight: 1.15 }}>
              {movie.title}
            </h1>

            {movie.original_title && movie.original_title !== movie.title && (
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginBottom: '10px',
                  letterSpacing: '0.02em',
                  fontFamily: 'var(--font-display)'
                }}
              >
                {movie.original_title}
              </div>
            )}

            {movie.tagline && (
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1.05rem', marginBottom: '16px' }}>
                "{movie.tagline}"
              </p>
            )}

            {/* Metadata Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px', flexWrap: 'wrap' }}>
              {movie.release_year && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={16} color="var(--primary)" /> {movie.release_year}
                </span>
              )}
              {movie.duration_minutes && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={16} color="var(--primary)" /> {movie.duration_minutes} mins
                </span>
              )}

              <button
                onClick={() => openTrailer(movie)}
                className="btn btn-sm btn-primary"
                style={{ borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.82rem' }}
              >
                <Play size={13} fill="currentColor" /> Watch Official Trailer
              </button>
            </div>

            {/* Streaming Availability Badges */}
            {movie.streaming_on && movie.streaming_on.length > 0 && (
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Tv size={14} color="var(--accent-cyan)" /> Streaming on:
                </span>
                {movie.streaming_on.map((prov, i) => (
                  <span
                    key={i}
                    className="badge"
                    style={{
                      background: prov === 'Netflix' ? 'rgba(229, 9, 20, 0.15)' : prov === 'Prime Video' ? 'rgba(0, 168, 225, 0.15)' : prov === 'Disney+ Hotstar' ? 'rgba(17, 60, 207, 0.15)' : 'var(--bg-surface-elevated)',
                      color: prov === 'Netflix' ? '#ff4b55' : prov === 'Prime Video' ? '#38bdf8' : prov === 'Disney+ Hotstar' ? '#818cf8' : 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.8rem'
                    }}
                  >
                    {prov}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Synopsis
              </h3>
              <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.65 }}>
                {movie.overview || 'No synopsis available for this title.'}
              </p>
            </div>

            {/* Score & Review Action Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                padding: '20px 24px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                {/* WatchWise Community Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))',
                      border: '1px solid var(--border-focus)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Star size={22} fill="var(--primary)" color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                        {ratingStats.average || '—'}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ 5</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      WatchWise ({ratingStats.count})
                    </span>
                  </div>
                </div>

                {/* TMDb Global Score */}
                {movie.vote_average && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-glass)', paddingLeft: '20px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)',
                        fontWeight: 800,
                        fontSize: '0.75rem'
                      }}
                    >
                      TMDb
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                          {movie.vote_average}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ 10</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {movie.vote_count ? `${Number(movie.vote_count).toLocaleString()} votes` : 'Official Score'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <Edit3 size={16} />
                <span>{userReview ? 'Edit Your Review' : 'Rate & Review Movie'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Distribution & Reviews Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', marginBottom: '50px' }}>
        {/* Rating Breakdown card */}
        <div className="glass-card" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary)" /> Rating Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[5, 4, 3, 2, 1].map((lvl) => {
              const lvlObj = RATING_LEVELS.find(r => r.value === lvl);
              const count = ratingStats.distribution[lvl] || 0;
              const percent = ratingStats.count ? Math.round((count / ratingStats.count) * 100) : 0;

              return (
                <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                  <span style={{ width: '75px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {lvlObj.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: lvlObj.color,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                  <span style={{ width: '30px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews Stream */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} color="var(--primary)" /> Community Reviews ({reviews.length})
            </h3>
          </div>

          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((rev) => {
                const isAuthor = currentUser?.id === rev.user_id;
                const ratObj = RATING_LEVELS.find(r => r.value === rev.rating) || RATING_LEVELS[2];
                const isSpoilerHidden = rev.contains_spoiler && !revealedSpoilers[rev.id] && !isAuthor;

                return (
                  <div
                    key={rev.id}
                    className="glass-card"
                    style={{
                      padding: '20px',
                      borderLeft: `4px solid ${ratObj.color}`,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--bg-surface-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            overflow: 'hidden'
                          }}
                        >
                          {rev.user_avatar ? (
                            <img src={rev.user_avatar} alt={rev.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            rev.username[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {rev.username} {isAuthor && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(rev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className="badge"
                          style={{
                            background: `${ratObj.color}22`,
                            color: ratObj.color,
                            border: `1px solid ${ratObj.color}55`,
                            fontWeight: 700
                          }}
                        >
                          <Star size={11} fill={ratObj.color} /> {ratObj.label} ({rev.rating}/5)
                        </span>

                        {isAuthor && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => setIsReviewModalOpen(true)}
                              className="btn btn-ghost"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              title="Edit review"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => deleteReview(rev.id)}
                              className="btn btn-danger btn-sm"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              title="Delete review"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Spoiler Protected Review Text */}
                    {rev.review_text ? (
                      isSpoilerHidden ? (
                        <div
                          style={{
                            position: 'relative',
                            marginTop: '10px',
                            padding: '16px',
                            background: 'rgba(244, 63, 94, 0.08)',
                            border: '1px dashed rgba(244, 63, 94, 0.4)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fb7185', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                            <AlertTriangle size={18} /> Spoiler Warning
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '10px' }}>
                            This review contains key plot points or ending revelations.
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleSpoilerReveal(rev.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ borderRadius: 'var(--radius-full)', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
                          >
                            <Eye size={14} /> Reveal Spoiler
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginTop: '8px' }}>
                          {rev.contains_spoiler && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#fb7185', fontWeight: 700, marginBottom: '4px' }}>
                              <AlertTriangle size={12} /> Contains Spoilers:
                            </div>
                          )}
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                            {rev.review_text}
                          </p>
                        </div>
                      )
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No written commentary provided with this rating.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
              <MessageSquare size={36} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '12px' }} />
              <h4>No Reviews Yet</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px' }}>
                Be the first to share your verdict on "{movie.title}"!
              </p>
              <button onClick={() => setIsReviewModalOpen(true)} className="btn btn-primary btn-sm">
                <Edit3 size={15} /> Write a Review
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Similar Movies Carousel */}
      {similarMovies.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>
            🍿 More in this Genre
          </h3>
          <div className="movie-grid">
            {similarMovies.map(m => (
              <MovieCard key={m.id} movie={m} onSelectMovie={onSelectMovie} />
            ))}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <ReviewModal
        movie={movie}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        existingReview={userReview}
      />
    </div>
  );
};
