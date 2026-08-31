import React, { useState } from 'react';
import {
  User,
  Film,
  Star,
  Users,
  BookmarkCheck,
  Edit3,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMovies, RATING_LEVELS } from '../context/MovieContext';
import { EditProfileModal } from '../components/EditProfileModal';
import { MovieCard } from '../components/MovieCard';

export const ProfilePage = ({ onSelectMovie, onSelectClub }) => {
  const { currentUser } = useAuth();
  const { movies, reviews, watchHistory, clubs } = useMovies();
  const [activeSubTab, setActiveSubTab] = useState('history'); // 'history', 'reviews', 'clubs'
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="app-container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Please log in to view your profile and watch history</h2>
      </div>
    );
  }

  // Filter user's activity
  const userHistory = watchHistory
    .filter(w => w.user_id === currentUser.id)
    .map(w => {
      const movie = movies.find(m => m.id === w.movie_id);
      return { ...w, movie };
    })
    .filter(w => !!w.movie);

  const userReviews = reviews
    .filter(r => r.user_id === currentUser.id)
    .map(r => {
      const movie = movies.find(m => m.id === r.movie_id);
      return { ...r, movie };
    })
    .filter(r => !!r.movie);

  const userClubs = clubs.filter(c => c.members?.includes(currentUser.id));

  const avgGivenRating = userReviews.length
    ? (userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length).toFixed(1)
    : null;

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      {/* Profile Header Glass Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '36px',
          margin: '24px 0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--primary)',
              boxShadow: '0 4px 20px var(--primary-glow)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{currentUser.username}</h1>
              <span className="badge badge-gold">Cinephile</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '550px' }}>
              {currentUser.bio || 'Exploring cinema on WatchWise.'}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentUser.email}</span>
          </div>
        </div>

        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Edit3 size={15} /> Edit Profile
        </button>
      </div>

      {/* Stats Counter Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '36px'
        }}
      >
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <BookmarkCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{userHistory.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Movies Watched</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
            <Star size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{userReviews.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Reviews Written</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{userClubs.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Clubs Joined</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{avgGivenRating ? `${avgGivenRating} / 5` : '—'}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Avg Given Score</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`btn btn-sm ${activeSubTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <BookmarkCheck size={16} />
          <span>Watched History ({userHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reviews')}
          className={`btn btn-sm ${activeSubTab === 'reviews' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Star size={16} />
          <span>My Reviews ({userReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('clubs')}
          className={`btn btn-sm ${activeSubTab === 'clubs' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Users size={16} />
          <span>My Clubs ({userClubs.length})</span>
        </button>
      </div>

      {/* Tab 1: Watched History */}
      {activeSubTab === 'history' && (
        <div>
          {userHistory.length > 0 ? (
            <div className="movie-grid">
              {userHistory.map(entry => (
                <MovieCard key={entry.movie_id} movie={entry.movie} onSelectMovie={onSelectMovie} />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center' }}>
              <Film size={40} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '12px' }} />
              <h3>Your Watchlist is Empty</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                Browse the catalog and click the bookmark icon on any movie to track your watched titles.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Reviews */}
      {activeSubTab === 'reviews' && (
        <div>
          {userReviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {userReviews.map((rev) => {
                const ratObj = RATING_LEVELS.find(r => r.value === rev.rating) || RATING_LEVELS[2];
                return (
                  <div
                    key={rev.id}
                    className="glass-card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelectMovie(rev.movie.id)}
                  >
                    <img
                      src={rev.movie.poster}
                      alt={rev.movie.title}
                      style={{ width: '60px', height: '90px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{rev.movie.title}</h4>
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
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {rev.review_text || <em>No written text</em>}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center' }}>
              <Star size={40} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '12px' }} />
              <h3>No Reviews Written Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                Rate movies and share your opinions with the WatchWise community.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Clubs */}
      {activeSubTab === 'clubs' && (
        <div>
          {userClubs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {userClubs.map(c => (
                <div
                  key={c.id}
                  className="glass-card"
                  style={{ padding: '20px', cursor: 'pointer' }}
                  onClick={() => onSelectClub(c.id)}
                >
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{c.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <span>{c.posts?.length || 0} Discussions</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>View Club <ArrowRight size={14} /></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center' }}>
              <Users size={40} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '12px' }} />
              <h3>No Clubs Joined</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                Explore the clubs directory to join active cinephile discussions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};
