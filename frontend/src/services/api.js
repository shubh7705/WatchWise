const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Helper to make JSON requests with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`API [${options.method || 'GET'} ${endpoint}] error:`, errText);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn(`API [${options.method || 'GET'} ${endpoint}] offline or unavailable:`, error.message);
    return null;
  }
}

export const api = {
  // Movies & Genres
  getMovies: () => request('/movies/'),
  createMovie: (data) => request('/movies/', { method: 'POST', body: JSON.stringify(data) }),
  getGenres: () => request('/genres/'),

  // Reviews
  getReviews: (movieId) => request(`/reviews/${movieId ? `?movie_id=${movieId}` : ''}`),
  saveReview: (data) => request('/reviews/', { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (reviewId) => request(`/reviews/${reviewId}/`, { method: 'DELETE' }),

  // Playlists
  getPlaylists: () => request('/playlists/'),
  createPlaylist: (data) => request('/playlists/', { method: 'POST', body: JSON.stringify(data) }),
  togglePlaylistMovie: (playlistId, movieId) =>
    request(`/playlists/${playlistId}/toggle-movie/`, { method: 'POST', body: JSON.stringify({ movie_id: movieId }) }),
  deletePlaylist: (playlistId) => request(`/playlists/${playlistId}/`, { method: 'DELETE' }),

  // Watchlist
  getWatchlist: (userId) => request(`/watchlist/${userId ? `?user_id=${userId}` : ''}`),
  toggleWatchlist: (movieId, userId) =>
    request('/watchlist/', { method: 'POST', body: JSON.stringify({ movie_id: movieId, user_id: userId }) }),

  // Clubs
  getClubs: () => request('/clubs/'),
  createClub: (data) => request('/clubs/', { method: 'POST', body: JSON.stringify(data) }),
  toggleJoinClub: (clubId, userId) =>
    request(`/clubs/${clubId}/join/`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
  createClubPost: (clubId, data) =>
    request(`/clubs/${clubId}/posts/`, { method: 'POST', body: JSON.stringify(data) }),

  // Users
  getUsers: () => request('/auth/users/'),
};
