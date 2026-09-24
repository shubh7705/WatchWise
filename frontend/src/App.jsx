import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MovieProvider, useMovies } from './context/MovieContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AddMovieModal } from './components/AddMovieModal';
import { CreateClubModal } from './components/CreateClubModal';
import { TrailerModal } from './components/TrailerModal';
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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function MainLayout() {
  const navigate = useNavigate();
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);


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
          {/* Frontpage: Personalized recommendations & watch stream (Public) */}
          <Route
            path="/"
            element={<HomePage onSelectMovie={handleSelectMovie} />}
          />

          {/* Movie Details (Public) */}
          <Route
            path="/movies/:id"
            element={
              <MovieDetailPage
                onBack={() => navigate('/')}
                onSelectMovie={handleSelectMovie}
              />
            }
          />

          {/* Explore: Full searchable & filterable movie catalog (Protected) */}
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <MoviesPage
                  onSelectMovie={handleSelectMovie}
                  onOpenAddMovie={() => setIsAddMovieModalOpen(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <MoviesPage
                  onSelectMovie={handleSelectMovie}
                  onOpenAddMovie={() => setIsAddMovieModalOpen(true)}
                />
              </ProtectedRoute>
            }
          />

          {/* Playlists (Protected) */}
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <PlaylistsPage onSelectMovie={handleSelectMovie} />
              </ProtectedRoute>
            }
          />

          {/* Clubs (Protected) */}
          <Route
            path="/clubs"
            element={
              <ProtectedRoute>
                <ClubsPage
                  onSelectClub={handleSelectClub}
                  onOpenCreateClub={() => setIsCreateClubModalOpen(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clubs/:id"
            element={
              <ProtectedRoute>
                <ClubDetailPage onBack={() => navigate('/clubs')} />
              </ProtectedRoute>
            }
          />

          {/* Profile & Watchlist (Protected) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage
                  onSelectMovie={handleSelectMovie}
                  onSelectClub={handleSelectClub}
                />
              </ProtectedRoute>
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
