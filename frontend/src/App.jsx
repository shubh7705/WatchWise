import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider, useMovies } from './context/MovieContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AddMovieModal } from './components/AddMovieModal';
import { CreateClubModal } from './components/CreateClubModal';
import { TrailerModal } from './components/TrailerModal';
import { MoodRouletteModal } from './components/MoodRouletteModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { ClubsPage } from './pages/ClubsPage';
import { ClubDetailPage } from './pages/ClubDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

function MainLayout() {
  const navigate = useNavigate();
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);
  const { isMoodModalOpen } = useMovies();

  const handleSelectMovie = (movieId) => {
    navigate(`/movies/${movieId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectClub = (clubId) => {
    navigate(`/clubs/${clubId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Glass Navbar with separate Home and Explore tabs */}
      <Navbar onOpenAddMovie={() => setIsAddMovieModalOpen(true)} />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Frontpage: Personalized recommendations & watch stream */}
          <Route
            path="/"
            element={<HomePage onSelectMovie={handleSelectMovie} />}
          />

          {/* Explore: Full searchable & filterable movie catalog */}
          <Route
            path="/explore"
            element={
              <MoviesPage
                onSelectMovie={handleSelectMovie}
                onOpenAddMovie={() => setIsAddMovieModalOpen(true)}
              />
            }
          />
          <Route
            path="/movies"
            element={
              <MoviesPage
                onSelectMovie={handleSelectMovie}
                onOpenAddMovie={() => setIsAddMovieModalOpen(true)}
              />
            }
          />

          {/* Movie Details */}
          <Route
            path="/movies/:id"
            element={
              <MovieDetailPage
                onBack={() => navigate('/explore')}
                onSelectMovie={handleSelectMovie}
              />
            }
          />

          {/* Playlists */}
          <Route
            path="/playlists"
            element={<PlaylistsPage onSelectMovie={handleSelectMovie} />}
          />

          {/* Clubs */}
          <Route
            path="/clubs"
            element={
              <ClubsPage
                onSelectClub={handleSelectClub}
                onOpenCreateClub={() => setIsCreateClubModalOpen(true)}
              />
            }
          />
          <Route
            path="/clubs/:id"
            element={<ClubDetailPage onBack={() => navigate('/clubs')} />}
          />

          {/* Profile & Watchlist */}
          <Route
            path="/profile"
            element={
              <ProfilePage
                onSelectMovie={handleSelectMovie}
                onSelectClub={handleSelectClub}
              />
            }
          />

          {/* Auth */}
          <Route
            path="/login"
            element={
              <LoginPage
                onNavigateToSignup={() => navigate('/signup')}
                onSuccess={() => navigate('/')}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <SignupPage
                onNavigateToLogin={() => navigate('/login')}
                onSuccess={() => navigate('/')}
              />
            }
          />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Modals */}
      <AddMovieModal
        isOpen={isAddMovieModalOpen}
        onClose={() => setIsAddMovieModalOpen(false)}
        onMovieAdded={(newId) => handleSelectMovie(newId)}
      />

      <CreateClubModal
        isOpen={isCreateClubModalOpen}
        onClose={() => setIsCreateClubModalOpen(false)}
        onClubCreated={(newId) => handleSelectClub(newId)}
      />

      <TrailerModal />

      <MoodRouletteModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSelectMovie={handleSelectMovie}
      />

      <AddToPlaylistModal />

      {/* Floating Toast notification */}
      <Toast />

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '36px 0',
          background: 'var(--bg-surface)',
          marginTop: 'auto'
        }}
      >
        <div
          className="app-container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            color: 'var(--text-muted)',
            fontSize: '0.88rem'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Watch<span style={{ color: 'var(--primary)' }}>Wise</span>
            </span>{' '}
            — Cinematic discovery, AI recommendations & community platform.
          </div>
          <div>
            Powered by TMDb & React. Built with precision.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MovieProvider>
          <MainLayout />
        </MovieProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
