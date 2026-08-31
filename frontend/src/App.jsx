import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider, useMovies } from './context/MovieContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AddMovieModal } from './components/AddMovieModal';
import { CreateClubModal } from './components/CreateClubModal';
import { TrailerModal } from './components/TrailerModal';
import { MoodRouletteModal } from './components/MoodRouletteModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';

import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { ClubsPage } from './pages/ClubsPage';
import { ClubDetailPage } from './pages/ClubDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

function MainApp() {
  const [activeTab, setActiveTab] = useState('movies'); // 'movies', 'movie-detail', 'clubs', 'club-detail', 'profile', 'playlists', 'login', 'signup'
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);

  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);

  const { isMoodModalOpen, setIsMoodModalOpen } = useMovies();

  const handleSelectMovie = (movieId) => {
    setSelectedMovieId(movieId);
    setActiveTab('movie-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectClub = (clubId) => {
    setSelectedClubId(clubId);
    setActiveTab('club-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAddMovie={() => setIsAddMovieModalOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'movies' && (
          <MoviesPage
            onSelectMovie={handleSelectMovie}
            onOpenAddMovie={() => setIsAddMovieModalOpen(true)}
          />
        )}

        {activeTab === 'movie-detail' && (
          <MovieDetailPage
            movieId={selectedMovieId}
            onBack={() => setActiveTab('movies')}
            onSelectMovie={handleSelectMovie}
          />
        )}

        {activeTab === 'playlists' && (
          <PlaylistsPage
            onSelectMovie={handleSelectMovie}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubsPage
            onSelectClub={handleSelectClub}
            onOpenCreateClub={() => setIsCreateClubModalOpen(true)}
          />
        )}

        {activeTab === 'club-detail' && (
          <ClubDetailPage
            clubId={selectedClubId}
            onBack={() => setActiveTab('clubs')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            onSelectMovie={handleSelectMovie}
            onSelectClub={handleSelectClub}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage
            onNavigateToSignup={() => setActiveTab('signup')}
            onSuccess={() => setActiveTab('movies')}
          />
        )}

        {activeTab === 'signup' && (
          <SignupPage
            onNavigateToLogin={() => setActiveTab('login')}
            onSuccess={() => setActiveTab('movies')}
          />
        )}
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
    <AuthProvider>
      <MovieProvider>
        <MainApp />
      </MovieProvider>
    </AuthProvider>
  );
}
