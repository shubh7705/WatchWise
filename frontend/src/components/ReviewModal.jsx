import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, Send, Trash2 } from 'lucide-react';
import { useMovies, RATING_LEVELS } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';

export const ReviewModal = ({ movie, isOpen, onClose, existingReview }) => {
  const { addOrUpdateReview, deleteReview } = useMovies();
  const { currentUser } = useAuth();

  const [rating, setRating] = useState(existingReview?.rating || 4);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [containsSpoiler, setContainsSpoiler] = useState(existingReview?.contains_spoiler || false);
  const [hoverRating, setHoverRating] = useState(null);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.review_text || '');
      setContainsSpoiler(existingReview.contains_spoiler || false);
    } else {
      setRating(4);
      setReviewText('');
      setContainsSpoiler(false);
    }
  }, [existingReview, isOpen]);

  if (!isOpen || !movie) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    const success = addOrUpdateReview({
      movieId: movie.id,
      rating,
      reviewText,
      containsSpoiler
    });
    if (success) {
      onClose();
    }
  };

  const handleDelete = () => {
    if (existingReview) {
      deleteReview(existingReview.id);
      onClose();
    }
  };

  const selectedRatingObj = RATING_LEVELS.find(r => r.value === (hoverRating || rating)) || RATING_LEVELS[3];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: '28px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {existingReview ? 'Edit Review & Rating' : 'Rate & Review'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {movie.title} ({movie.release_year})
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 5-Level Rating Selector */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Select Rating Level
            </label>

            {/* Stars Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isLit = lvl <= (hoverRating || rating);
                const lvlInfo = RATING_LEVELS.find(r => r.value === lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onMouseEnter={() => setHoverRating(lvl)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(lvl)}
                    style={{
                      padding: '6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transform: isLit ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <Star
                      size={32}
                      fill={isLit ? lvlInfo.color : 'none'}
                      color={isLit ? lvlInfo.color : 'var(--text-muted)'}
                    />
                  </button>
                );
              })}
            </div>

            {/* Rating Level Badges Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {RATING_LEVELS.map((lvl) => {
                const isSelected = rating === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setRating(lvl.value)}
                    style={{
                      padding: '8px 4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? lvl.color : 'var(--bg-surface-elevated)',
                      color: isSelected ? '#090c15' : 'var(--text-secondary)',
                      border: isSelected ? `1px solid ${lvl.color}` : '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease',
                      textAlign: 'center'
                    }}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.85rem', color: selectedRatingObj.color, fontWeight: 600 }}>
              "{selectedRatingObj.description}"
            </div>
          </div>

          {/* Written Review */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Your Review & Thoughts (Optional)
            </label>
            <textarea
              className="input-modern"
              rows={4}
              placeholder="What did you love or dislike about this movie? Any standout performances or scenes?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Spoiler Protection Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            <input
              type="checkbox"
              id="spoilerCheck"
              checked={containsSpoiler}
              onChange={(e) => setContainsSpoiler(e.target.checked)}
              style={{ accentColor: '#f43f5e', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="spoilerCheck" style={{ fontSize: '0.88rem', fontWeight: 600, color: containsSpoiler ? '#f43f5e' : 'var(--text-secondary)', cursor: 'pointer' }}>
              ⚠️ Contains Spoilers (Will blur text for other users until clicked)
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            {existingReview ? (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger btn-sm"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <Trash2 size={16} /> Delete Review
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <Send size={16} />
                <span>{existingReview ? 'Update' : 'Publish Review'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
