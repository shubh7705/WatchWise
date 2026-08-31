import React, { useState } from 'react';
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

export const Navbar = ({ activeTab, setActiveTab, onOpenAddMovie }) => {
  const { currentUser, users, switchUser, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, searchQuery, setSearchQuery, setIsMoodModalOpen } = useMovies();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
          onClick={() => setActiveTab('movies')}
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
              if (activeTab !== 'movies') setActiveTab('movies');
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
            onClick={() => setActiveTab('movies')}
            className={`btn btn-sm ${activeTab === 'movies' ? 'btn-primary' : 'btn-ghost'}`}
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
            onClick={() => setActiveTab('playlists')}
            className={`btn btn-sm ${activeTab === 'playlists' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <ListPlus size={16} />
            <span>Playlists</span>
          </button>

          <button
            onClick={() => setActiveTab('clubs')}
            className={`btn btn-sm ${activeTab === 'clubs' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Users size={16} />
            <span>Clubs</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <BookmarkCheck size={16} />
              <span>Watchlist</span>
            </button>
          )}

          <button
            onClick={onOpenAddMovie}
            className="btn btn-sm btn-secondary"
            style={{
              borderRadius: 'var(--radius-full)',
              borderColor: 'var(--primary-glow)',
              color: 'var(--primary)'
            }}
            title="Add new movie via TMDb Autofill"
          >
            <PlusCircle size={16} />
            <span style={{ display: 'inline' }}>Add Movie</span>
          </button>
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
                  <ChevronDown size={13} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 10px)',
                      width: '260px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '12px',
                      zIndex: 1000,
                      animation: 'fadeIn 0.15s ease-out'
                    }}
                  >
                    <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Signed in as</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.username}</div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('profile');
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                      {users.map(u => (
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
                          {u.id === currentUser.id && <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>✓</span>}
                        </button>
                      ))}
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
                  onClick={() => setActiveTab('login')}
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
