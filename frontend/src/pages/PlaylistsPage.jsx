import React, { useState } from 'react';
import {
  ListPlus,
  Plus,
  Film,
  Sparkles,
  Trash2,
  Share2,
  ArrowRight,
  User
} from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { MovieCard } from '../components/MovieCard';

export const PlaylistsPage = ({ onSelectMovie }) => {
  const { playlists, movies, deletePlaylist, createPlaylist, showToast } = useMovies();
  const { currentUser } = useAuth();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const activePlaylist = playlists.find(p => p.id === Number(selectedPlaylistId)) || playlists[0];
  const playlistMovies = activePlaylist
    ? activePlaylist.movies?.map(id => movies.find(m => m.id === id)).filter(Boolean)
    : [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newP = createPlaylist({ title, description });
    if (newP) {
      setSelectedPlaylistId(newP.id);
      setTitle('');
      setDescription('');
      setIsCreating(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Playlist link copied to clipboard!');
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '36px',
          margin: '24px 0 36px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(244, 63, 94, 0.15))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '10px' }}>
            <Sparkles size={12} /> Curated Collections
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, marginBottom: '8px' }}>
            Cinema Playlists & Watchlists
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px' }}>
            Explore hand-picked collections crafted by the WatchWise community, or create your own signature movie marathon playlists.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="btn btn-primary btn-lg"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Plus size={18} /> Create Playlist
        </button>
      </div>

      {/* Create Playlist Form Drawer */}
      {isCreating && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--border-focus)', animation: 'fadeIn 0.2s ease-out' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>New Curated Playlist</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Playlist Title (e.g. 90s Nostalgia, Unpredictable Thrillers)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-modern"
                required
              />
              <input
                type="text"
                placeholder="Short Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-modern"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setIsCreating(false)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Publish Playlist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Layout: Left Playlists Sidebar + Right Active Movies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', alignItems: 'start' }}>
        {/* Playlists Directory Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            All Playlists ({playlists.length})
          </h3>

          {playlists.map(pl => {
            const isSelected = activePlaylist?.id === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className="glass-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={pl.cover || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=200&q=80'}
                    alt={pl.title}
                    style={{ width: '54px', height: '54px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {pl.title}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {pl.movies?.length || 0} movies • @{pl.created_by_name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Playlist Movies Viewer */}
        {activePlaylist ? (
          <div>
            <div
              className="glass-panel"
              style={{
                padding: '24px 28px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '4px' }}>
                  {activePlaylist.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', maxWidth: '600px' }}>
                  {activePlaylist.description || 'Curated movie playlist on WatchWise.'}
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Curated by @{activePlaylist.created_by_name} • {playlistMovies.length} titles
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleShare}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <Share2 size={15} /> Share
                </button>

                {currentUser?.id === activePlaylist.created_by && (
                  <button
                    onClick={() => deletePlaylist(activePlaylist.id)}
                    className="btn btn-danger btn-sm"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                )}
              </div>
            </div>

            {/* Movies Grid in this playlist */}
            {playlistMovies.length > 0 ? (
              <div className="movie-grid">
                {playlistMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} onSelectMovie={onSelectMovie} />
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <Film size={40} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '12px' }} />
                <h3>No Movies In This Playlist Yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                  Browse the Explore tab and click "+ Save to Playlist" on any movie card to add titles!
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
