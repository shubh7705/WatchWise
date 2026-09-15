import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Film,
  Users,
  BookmarkCheck,
  PlusCircle,
  Sun,
  Moon,
  Search,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Dices,
  ListPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MovieContext';

export const Navbar = ({ onOpenAddMovie }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, users, switchUser, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme, searchQuery, setSearchQuery, setIsMoodModalOpen } = useMovies();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentTab = (() => {
    const p = location.pathname;
    if (p.startsWith('/clubs')) return 'clubs';
    if (p.startsWith('/playlists')) return 'playlists';
    if (p.startsWith('/profile')) return 'profile';
    if (p === '/login') return 'login';
    if (p === '/signup') return 'signup';
    return 'movies';
  })();

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'all var(--transition-normal)'
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
          gap: '16px'
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => handleNavigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0
          }}
        >

          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 18px var(--primary-glow)'
            }}
          >
            <Film size={22} color="#090c15" />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.45rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 30%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: theme === 'dark' ? 'transparent' : 'var(--text-primary)'
              }}
            >
              Watch<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>Wise</span>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div
          style={{
            flex: 1,
            maxWidth: '320px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
          className="navbar-search"
        >
          <Search
            size={18}
            color="var(--text-muted)"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search movies, genres, languages..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (location.pathname !== '/' && location.pathname !== '/movies') {
                handleNavigate('/movies');
              }
            }}
            className="input-modern"
            style={{
              paddingLeft: '42px',
              paddingRight: '14px',
              height: '40px',
              fontSize: '0.88rem',
              borderRadius: 'var(--radius-full)'
            }}
          />
        </div>

        {/* Main Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'nowrap'
          }}
        >
          <button
            onClick={() => handleNavigate('/movies')}
            className={`btn btn-sm ${currentTab === 'movies' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Film size={16} />
            <span>Explore</span>
          </button>

          <button
            onClick={() => setIsMoodModalOpen(true)}
            className="btn btn-sm btn-secondary"
            style={{
              borderRadius: 'var(--radius-full)',
              borderColor: 'rgba(168, 85, 247, 0.4)',
              color: '#c084fc',
              background: 'rgba(168, 85, 247, 0.1)'
            }}
            title="AI Mood Recommender & Watch Roulette Wheel"
          >
            <Dices size={16} />
            <span>Vibe & Roulette</span>
          </button>

          <button
            onClick={() => handleNavigate('/playlists')}
            className={`btn btn-sm ${currentTab === 'playlists' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <ListPlus size={16} />
            <span>Playlists</span>
          </button>

          <button
            onClick={() => handleNavigate('/clubs')}
            className={`btn btn-sm ${currentTab === 'clubs' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Users size={16} />
            <span>Clubs</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => handleNavigate('/profile')}
              className={`btn btn-sm ${currentTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <BookmarkCheck size={16} />
              <span>Watchlist</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onOpenAddMovie}
              className="btn btn-sm btn-secondary"
              style={{
                borderRadius: 'var(--radius-full)',
                borderColor: 'var(--primary-glow)',
                color: 'var(--primary)'
              }}
              title="Add new movie via TMDb Autofill (Admin Only)"
            >
              <PlusCircle size={16} />
              <span style={{ display: 'inline' }}>Add Movie</span>
            </button>
          )}
        </nav>

        {/* Right Controls: Theme + User / Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{
              width: '38px',
              height: '38px',
              padding: 0,
              borderRadius: '50%'
            }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
          </button>

          {/* User Profile / Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            {isAuthenticated ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px 4px 5px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.username}
                  </span>
                  {isAdmin ? (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08))',
                        color: 'var(--primary)',
                        border: '1px solid var(--border-focus)'
                      }}
                    >
                      ADMIN
                    </span>
                  ) : null}
                  <ChevronDown size={13} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 10px)',
                      width: '270px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '12px',
                      zIndex: 1000,
                      animation: 'fadeIn 0.15s ease-out'
                    }}
                  >
                    <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Signed in as</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.username}</div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
                          color: isAdmin ? 'var(--primary)' : 'var(--text-muted)',
                          border: `1px solid ${isAdmin ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}
                      >
                        {isAdmin ? '👑 Admin' : '👤 Member'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        handleNavigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}
                    >
                      <User size={16} />
                      <span>My Profile & History</span>
                    </button>

                    {/* Switch Demo User Section */}
                    <div style={{ margin: '10px 0 6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> Quick Switch User
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                      {users.map(u => {
                        const isUserAdmin = u.role === 'admin' || u.is_staff || ['shubh', 'shubham', 'admin'].includes(u.username.toLowerCase());
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setShowUserMenu(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 10px',
                              background: u.id === currentUser.id ? 'var(--bg-surface)' : 'transparent',
                              borderRadius: 'var(--radius-sm)',
                              border: u.id === currentUser.id ? '1px solid var(--border-focus)' : 'none',
                              color: u.id === currentUser.id ? 'var(--primary)' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 500
                            }}
                          >
                            <img src={u.avatar} alt={u.username} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                            <span>{u.username}</span>
                            <span
                              style={{
                                marginLeft: 'auto',
                                fontSize: '0.68rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: isUserAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: isUserAdmin ? 'var(--primary)' : 'var(--text-muted)'
                              }}
                            >
                              {isUserAdmin ? 'Admin' : 'User'}
                            </span>
                            {u.id === currentUser.id && <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="btn btn-danger"
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleNavigate('/login')}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
