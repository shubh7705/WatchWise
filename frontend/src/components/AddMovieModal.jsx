import React, { useState } from 'react';
import { X, Sparkles, Film, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { useMovies } from '../context/MovieContext';

export const AddMovieModal = ({ isOpen, onClose, onMovieAdded }) => {
  const { genres, addMovie, fetchTmdbMovie } = useMovies();

  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [overview, setOverview] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [durationMinutes, setDurationMinutes] = useState(135);
  const [poster, setPoster] = useState('');
  const [backdrop, setBackdrop] = useState('');
  const [tagline, setTagline] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([1, 17]);
  const [isFetchingTmdb, setIsFetchingTmdb] = useState(false);

  if (!isOpen) return null;

  const handleTmdbAutofill = async () => {
    if (!title.trim()) return;
    setIsFetchingTmdb(true);
    try {
      const data = await fetchTmdbMovie(title, releaseYear);
      if (data) {
        setTitle(data.title || title);
        if (data.release_year) setReleaseYear(data.release_year);
        if (data.overview) setOverview(data.overview);
        if (data.language) setLanguage(data.language);
        if (data.duration_minutes) setDurationMinutes(data.duration_minutes);
        if (data.poster) setPoster(data.poster);
        if (data.backdrop) setBackdrop(data.backdrop);
        if (data.tagline) setTagline(data.tagline);
        if (data.genres && data.genres.length > 0) setSelectedGenres(data.genres);
      }
    } finally {
      setIsFetchingTmdb(false);
    }
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalPoster = poster;
    let finalBackdrop = backdrop;
    let finalOverview = overview;
    let finalYear = releaseYear;
    let finalLanguage = language;
    let finalDuration = durationMinutes;
    let finalTagline = tagline;
    let finalGenres = selectedGenres;
    let tmdbId = null;

    // If user didn't manually auto-fetch, fetch TMDb poster & details automatically
    if (!finalPoster) {
      setIsFetchingTmdb(true);
      try {
        const data = await fetchTmdbMovie(title, releaseYear);
        if (data) {
          if (data.poster) finalPoster = data.poster;
          if (data.backdrop) finalBackdrop = data.backdrop;
          if (!finalOverview && data.overview) finalOverview = data.overview;
          if (!finalYear && data.release_year) finalYear = data.release_year;
          if (data.tagline) finalTagline = data.tagline;
          if (data.tmdb_id) tmdbId = data.tmdb_id;
          if (data.genres?.length) finalGenres = data.genres;
        }
      } catch (err) {
        console.warn('TMDb submit fetch error', err);
      } finally {
        setIsFetchingTmdb(false);
      }
    }

    const newMovie = await addMovie({
      title,
      release_year: finalYear || new Date().getFullYear(),
      overview: finalOverview,
      language: finalLanguage,
      duration_minutes: finalDuration,
      poster: finalPoster,
      backdrop: finalBackdrop,
      tagline: finalTagline,
      genres: finalGenres,
      tmdb_id: tmdbId
    });

    if (newMovie) {
      onMovieAdded(newMovie.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '28px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Film size={22} color="var(--primary)" /> Add Movie to WatchWise
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Auto-fetch official TMDb posters and metadata or input details manually.
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
          {/* TMDb Search Box Banner */}
          <div
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(6, 182, 212, 0.1))',
              border: '1px solid var(--border-focus)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: '180px' }}>
                <input
                  type="text"
                  placeholder="Enter movie title (e.g. Inception, KGF, Dunki)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-modern"
                  required
                />
              </div>
              <div style={{ flex: 1, minWidth: '100px' }}>
                <input
                  type="number"
                  placeholder="Year (Opt)"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  className="input-modern"
                />
              </div>
              <button
                type="button"
                onClick={handleTmdbAutofill}
                disabled={!title.trim() || isFetchingTmdb}
                className="btn btn-primary"
                style={{ flexShrink: 0 }}
              >
                {isFetchingTmdb ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>Auto-Fetch</span>
              </button>
            </div>
          </div>

          {/* Grid Layout for details & poster preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '20px', marginBottom: '18px' }}>
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Tagline (Catchphrase)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Two lethal agents. One brutal showdown."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input-modern"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Kannada">Kannada</option>
                    <option value="English">English</option>
                    <option value="Korean">Korean</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Runtime (Minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="input-modern"
                  />
                </div>
              </div>
            </div>

            {/* Poster Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '2/3',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}
              >
                {poster ? (
                  <img src={poster} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.75rem', padding: '8px' }}>
                    <ImageIcon size={28} style={{ opacity: 0.3, marginBottom: '4px' }} />
                    <div>Poster Preview</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Overview */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Synopsis / Overview
            </label>
            <textarea
              className="input-modern"
              rows={3}
              placeholder="Plot summary..."
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
            />
          </div>

          {/* Poster & Backdrop URLs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Poster URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={poster}
                onChange={(e) => setPoster(e.target.value)}
                className="input-modern"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Backdrop URL (Banner)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={backdrop}
                onChange={(e) => setBackdrop(e.target.value)}
                className="input-modern"
              />
            </div>
          </div>

          {/* Genres Multi-select Chips */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Select Genres
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {genres.map(g => {
                const isSelected = selectedGenres.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: isSelected ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                      color: isSelected ? '#090c15' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Film size={16} /> Save Movie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
