import React, { useState } from 'react';
import { X, Plus, ListPlus, Check, Sparkles } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';

export const AddToPlaylistModal = () => {
  const {
    playlists,
    isPlaylistModalOpen,
    setIsPlaylistModalOpen,
    playlistTargetMovie,
    addMovieToPlaylist,
    createPlaylist
  } = useMovies();
  const { currentUser } = useAuth();

  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  if (!isPlaylistModalOpen || !playlistTargetMovie) return null;

  const userPlaylists = playlists.filter(p => p.created_by === currentUser?.id);

  const handleCreateAndAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createPlaylist({
      title: newTitle,
      description: newDesc,
      cover: playlistTargetMovie.poster
    });

    if (created) {
      addMovieToPlaylist(created.id, playlistTargetMovie.id);
      setShowCreateInput(false);
      setNewTitle('');
      setNewDesc('');
      setIsPlaylistModalOpen(false);
    }
  };

  const handleToggle = (playlistId) => {
    addMovieToPlaylist(playlistId, playlistTargetMovie.id);
    setIsPlaylistModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsPlaylistModalOpen(false)} style={{ zIndex: 1900 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListPlus size={20} color="var(--primary)" /> Save to Playlist
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Adding "{playlistTargetMovie.title}"
            </p>
          </div>

          <button
            onClick={() => setIsPlaylistModalOpen(false)}
            className="btn btn-secondary"
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Existing Playlists list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', maxHeight: '220px', overflowY: 'auto' }}>
          {playlists.map(pl => {
            const alreadyIn = pl.movies?.includes(playlistTargetMovie.id);
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => handleToggle(pl.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: alreadyIn ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: alreadyIn ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{pl.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {pl.movies?.length || 0} movies • by @{pl.created_by_name}
                  </div>
                </div>

                {alreadyIn ? (
                  <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} /> Added
                  </span>
                ) : (
                  <span className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', padding: 0 }}>
                    <Plus size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Create New Playlist Option */}
        {!showCreateInput ? (
          <button
            type="button"
            onClick={() => setShowCreateInput(true)}
            className="btn btn-secondary"
            style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
          >
            <Plus size={16} /> Create New Playlist
          </button>
        ) : (
          <form onSubmit={handleCreateAndAdd} style={{ padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Playlist Title (e.g. My Favorite Action Gems)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="input-modern"
                required
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Description (Optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="input-modern"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowCreateInput(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
              >
                Create & Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
