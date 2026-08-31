import React from 'react';
import { X, Film, ExternalLink } from 'lucide-react';
import { useMovies } from '../context/MovieContext';

export const TrailerModal = () => {
  const { activeTrailer, closeTrailer } = useMovies();

  if (!activeTrailer) return null;

  // Extract YouTube ID
  const getEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;

    if (url.includes('youtube.com/watch?v=' || url.includes('youtube.com/watch?v='))) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
  };

  const embedUrl = getEmbedUrl(activeTrailer.url);

  return (
    <div className="modal-overlay" onClick={closeTrailer} style={{ zIndex: 2000 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '860px',
          width: '95%',
          padding: '20px',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-glass)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {activeTrailer.title} — Official Trailer
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={activeTrailer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              title="Open in YouTube"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={closeTrailer}
              className="btn btn-secondary"
              style={{ width: '34px', height: '34px', padding: 0, borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div
          style={{
            position: 'relative',
            paddingTop: '56.25%', // 16:9 Aspect Ratio
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: '#000000',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${activeTrailer.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
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
                gap: '12px',
                color: 'var(--text-secondary)'
              }}
            >
              <Film size={40} color="var(--text-muted)" />
              <p>Direct video player unavailable. Watch on YouTube below:</p>
              <a
                href={activeTrailer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                Open YouTube Video <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
