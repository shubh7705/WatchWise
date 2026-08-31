import React from 'react';
import { Users, Plus, MessageSquare, Heart, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';

export const ClubsPage = ({ onSelectClub, onOpenCreateClub }) => {
  const { clubs, joinClub } = useMovies();
  const { currentUser } = useAuth();

  return (
    <div className="app-container" style={{ paddingBottom: '70px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '36px',
          margin: '24px 0 36px',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(6, 182, 212, 0.15))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '10px' }}>
            <Sparkles size={12} /> Cinephile Communities
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, marginBottom: '8px' }}>
            WatchWise Movie Clubs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px' }}>
            Join dedicated movie clubs, participate in lively film debates, share behind-the-scenes trivia, and discover curated recommendations.
          </p>
        </div>

        <button
          onClick={onOpenCreateClub}
          className="btn btn-primary btn-lg"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Plus size={18} /> Start a New Club
        </button>
      </div>

      {/* Clubs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {clubs.map((club) => {
          const isMember = currentUser ? club.members?.includes(currentUser.id) : false;

          return (
            <div
              key={club.id}
              className="glass-card"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Club Banner */}
                <div
                  style={{
                    height: '140px',
                    backgroundImage: `url(${club.banner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(9,12,21,0.2) 0%, rgba(9,12,21,0.85) 100%)'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '16px',
                      right: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end'
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        background: 'rgba(9,12,21,0.8)',
                        backdropFilter: 'blur(8px)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <Users size={12} /> {club.members_count || club.members?.length || 0} members
                    </span>

                    {isMember && (
                      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} /> Joined
                      </span>
                    )}
                  </div>
                </div>

                {/* Club Content */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {club.name}
                  </h3>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {club.description}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  padding: '14px 20px',
                  background: 'var(--bg-surface-elevated)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <button
                  onClick={() => joinClub(club.id)}
                  className={`btn btn-sm ${isMember ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {isMember ? 'Leave Club' : 'Join Club'}
                </button>

                <button
                  onClick={() => onSelectClub(club.id)}
                  className="btn btn-sm btn-ghost"
                  style={{ color: 'var(--primary)', fontWeight: 600 }}
                >
                  <span>Open Feed ({club.posts?.length || 0})</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
