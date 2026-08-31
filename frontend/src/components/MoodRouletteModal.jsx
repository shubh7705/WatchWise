import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Dices,
  Film,
  Star,
  Play,
  RotateCw,
  Clock,
  Calendar,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMovies, MOODS } from '../context/MovieContext';

export const MoodRouletteModal = ({ isOpen, onClose, onSelectMovie }) => {
  const { movies, genres, isWatched, openTrailer, getMovieRatingStats } = useMovies();
  const [activeTab, setActiveTab] = useState('mood'); // 'mood' or 'roulette'

  // Mood state
  const [selectedMood, setSelectedMood] = useState('adrenaline');

  // Roulette state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteWinner, setRouletteWinner] = useState(null);
  const [onlyUnwatched, setOnlyUnwatched] = useState(false);

  if (!isOpen) return null;

  // Filter movies for selected mood
  const moodMovies = movies.filter(m => m.mood_tags?.includes(selectedMood));
  const currentMoodObj = MOODS.find(m => m.id === selectedMood) || MOODS[0];

  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setRouletteWinner(null);

    let candidates = [...movies];
    if (onlyUnwatched) {
      candidates = candidates.filter(m => !isWatched(m.id));
    }
    if (!candidates.length) candidates = [...movies];

    let counter = 0;
    const totalFlips = 24;
    const interval = setInterval(() => {
      counter++;
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      setRouletteWinner(randomCandidate);

      if (counter >= totalFlips) {
        clearInterval(interval);
        setIsSpinning(false);
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 80);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1800 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', padding: '28px' }}
      >
        {/* Header with Switcher Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('mood')}
              className={`btn btn-sm ${activeTab === 'mood' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <Sparkles size={15} /> Mood Matcher
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roulette')}
              className={`btn btn-sm ${activeTab === 'roulette' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <Dices size={15} /> Watch Roulette
            </button>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* TAB 1: Mood Matcher */}
        {activeTab === 'mood' && (
          <div>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '4px' }}>
                What are you in the mood for?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Pick an emotional vibe and our AI will curate the top cinema matches.
              </p>
            </div>

            {/* Mood Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '24px' }}>
              {MOODS.map(m => {
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? m.color : 'var(--bg-surface-elevated)',
                      color: isSelected ? '#090c15' : 'var(--text-primary)',
                      border: isSelected ? `1px solid ${m.color}` : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '2px' }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.6 }}>
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Matched Movies Results */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Curated for {currentMoodObj.label} ({moodMovies.length} Picks)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
                {moodMovies.map(movie => {
                  const ratingStats = getMovieRatingStats(movie.id);
                  return (
                    <div
                      key={movie.id}
                      className="glass-card"
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        background: 'var(--bg-surface-elevated)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          style={{ width: '45px', height: '65px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{movie.title}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            <span>{movie.release_year}</span>
                            <span>•</span>
                            <span>{movie.duration_minutes}m</span>
                            {ratingStats.average && (
                              <span style={{ color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                                <Star size={11} fill="#fbbf24" /> {ratingStats.average}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => openTrailer(movie)}
                          className="btn btn-secondary btn-sm"
                          style={{ borderRadius: 'var(--radius-full)' }}
                        >
                          <Play size={13} fill="currentColor" /> Trailer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectMovie(movie.id);
                            onClose();
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: 'var(--radius-full)' }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Watch Roulette */}
        {activeTab === 'roulette' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '6px' }}>
              Can't Decide What to Watch?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Spin the WatchWise Roulette wheel and let serendipity pick your movie tonight!
            </p>

            {/* Filter Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'var(--bg-surface-elevated)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                id="onlyUnwatchedCheck"
                checked={onlyUnwatched}
                onChange={(e) => setOnlyUnwatched(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="onlyUnwatchedCheck" style={{ cursor: 'pointer' }}>
                Only pick from unwatched movies
              </label>
            </div>

            {/* Winner Card / Spinner Frame */}
            <div
              style={{
                minHeight: '180px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(168, 85, 247, 0.1))',
                border: '2px dashed var(--border-focus)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px'
              }}
            >
              {rouletteWinner ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'left', animation: 'fadeIn 0.2s ease-out' }}>
                  <img
                    src={rouletteWinner.poster}
                    alt={rouletteWinner.title}
                    style={{
                      width: '70px',
                      height: '105px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <div>
                    <span className="badge badge-gold" style={{ marginBottom: '6px' }}>
                      🎰 Roulette Pick
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{rouletteWinner.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 10px', maxWidth: '350px' }}>
                      {rouletteWinner.overview?.slice(0, 100)}...
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          onSelectMovie(rouletteWinner.id);
                          onClose();
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: 'var(--radius-full)' }}
                      >
                        Watch & Review
                      </button>
                      <button
                        onClick={() => openTrailer(rouletteWinner)}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: 'var(--radius-full)' }}
                      >
                        <Play size={12} fill="currentColor" /> Trailer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <Dices size={44} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                  <p>Click "Spin Roulette" below to pick your movie!</p>
                </div>
              )}
            </div>

            {/* Spin Action */}
            <button
              type="button"
              onClick={handleSpinRoulette}
              disabled={isSpinning}
              className="btn btn-primary btn-lg"
              style={{ borderRadius: 'var(--radius-full)', padding: '14px 36px', fontSize: '1.1rem' }}
            >
              <RotateCw size={20} className={isSpinning ? 'animate-spin' : ''} />
              <span>{isSpinning ? 'Spinning...' : 'Spin the Roulette!'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
