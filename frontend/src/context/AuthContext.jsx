import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers } from '../data/initialData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Load users from storage or initial seed
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('watchwise_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // Current logged in user (defaults to shubh for effortless instant access)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedCurrent = localStorage.getItem('watchwise_current_user');
    if (savedCurrent) {
      try {
        return JSON.parse(savedCurrent);
      } catch (e) {
        console.error(e);
      }
    }
    return initialUsers.find(u => u.username === 'shubh') || initialUsers[0];
  });

  useEffect(() => {
    localStorage.setItem('watchwise_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('watchwise_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('watchwise_current_user');
    }
  }, [currentUser]);

  const login = (usernameOrEmail, password) => {
    const user = users.find(
      u => u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
           u.email?.toLowerCase() === usernameOrEmail.toLowerCase()
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    // If user doesn't exist, create on the fly or reject
    return { success: false, message: 'Invalid credentials. You can select one of the demo accounts below.' };
  };

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const signup = ({ username, email, password, bio }) => {
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return { success: false, message: 'Username is already taken' };
    }

    const newUser = {
      id: Date.now(),
      username: username.trim(),
      email: email?.trim() || `${username.toLowerCase()}@watchwise.com`,
      bio: bio || 'Movie lover and WatchWise explorer.',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
    };

    const updated = [...users, newUser];
    setUsers(updated);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const updateProfile = ({ bio, avatar, username }) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      bio: bio !== undefined ? bio : currentUser.bio,
      avatar: avatar !== undefined ? avatar : currentUser.avatar,
      username: username !== undefined ? username : currentUser.username
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      users,
      currentUser,
      login,
      signup,
      switchUser,
      updateProfile,
      logout,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
