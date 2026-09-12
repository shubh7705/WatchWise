import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers } from '../data/initialData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Load users from storage or initial seed
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('watchwise_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure known admin accounts have proper role
        return parsed.map(u => {
          const isKnownAdmin = ['shubh', 'shubham', 'admin'].includes(u.username?.toLowerCase());
          return isKnownAdmin ? { ...u, role: 'admin', is_staff: true } : u;
        });
      } catch (e) {
        console.error(e);
      }
    }
    return initialUsers;
  });

  // Current logged in user (defaults to shubh for effortless instant access)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedCurrent = localStorage.getItem('watchwise_current_user');
    if (savedCurrent) {
      try {
        const parsed = JSON.parse(savedCurrent);
        const isKnownAdmin = ['shubh', 'shubham', 'admin'].includes(parsed.username?.toLowerCase());
        const match = initialUsers.find(u => u.username.toLowerCase() === parsed.username.toLowerCase());
        return {
          ...parsed,
          id: match ? match.id : parsed.id,
          role: isKnownAdmin ? 'admin' : (parsed.role || 'user'),
          is_staff: isKnownAdmin ? true : Boolean(parsed.is_staff)
        };
      } catch (e) {
        console.error(e);
      }
    }
    return initialUsers.find(u => u.username === 'shubh') || initialUsers[0];
  });

  // Sync users from backend API
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/auth/users/')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.users?.length) {
          setUsers(prev => {
            const merged = data.users.map(backendUser => {
              const localMatch = prev.find(u => u.username.toLowerCase() === backendUser.username.toLowerCase());
              return {
                ...backendUser,
                avatar: localMatch?.avatar || backendUser.avatar,
                bio: localMatch?.bio || 'Movie lover and WatchWise explorer.'
              };
            });
            return merged;
          });

          setCurrentUser(prev => {
            if (!prev) return prev;
            const match = data.users.find(u => u.username.toLowerCase() === prev.username.toLowerCase());
            if (match) {
              return { ...prev, id: match.id, role: match.role, is_staff: match.is_staff };
            }
            return prev;
          });
        }
      })
      .catch(err => console.info('Backend users load info:', err.message));
  }, []);

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

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' ||
      currentUser.is_staff ||
      currentUser.is_superuser ||
      currentUser.username?.toLowerCase() === 'shubh' ||
      currentUser.username?.toLowerCase() === 'shubham' ||
      currentUser.username?.toLowerCase() === 'admin'
    )
  );

  const login = (usernameOrEmail, password) => {
    const user = users.find(
      u => u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
           u.email?.toLowerCase() === usernameOrEmail.toLowerCase()
    );
    if (user) {
      // Ensure admin flag on known accounts
      const isKnownAdmin = ['shubh', 'shubham', 'admin'].includes(user.username.toLowerCase());
      const effectiveUser = {
        ...user,
        role: isKnownAdmin ? 'admin' : (user.role || 'user'),
        is_staff: isKnownAdmin ? true : Boolean(user.is_staff)
      };
      setCurrentUser(effectiveUser);
      return { success: true, user: effectiveUser };
    }
    // If user doesn't exist, create on the fly or reject
    return { success: false, message: 'Invalid credentials. You can select one of the demo accounts below.' };
  };

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const isKnownAdmin = ['shubh', 'shubham', 'admin'].includes(user.username.toLowerCase());
      const effectiveUser = {
        ...user,
        role: isKnownAdmin ? 'admin' : (user.role || 'user'),
        is_staff: isKnownAdmin ? true : Boolean(user.is_staff)
      };
      setCurrentUser(effectiveUser);
    }
  };

  const signup = ({ username, email, password, bio }) => {
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return { success: false, message: 'Username is already taken' };
    }

    const isKnownAdmin = ['shubh', 'shubham', 'admin'].includes(username.trim().toLowerCase());
    const newUser = {
      id: Date.now(),
      username: username.trim(),
      email: email?.trim() || `${username.toLowerCase()}@watchwise.com`,
      bio: bio || 'Movie lover and WatchWise explorer.',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      role: isKnownAdmin ? 'admin' : 'user',
      is_staff: isKnownAdmin
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
      isAdmin,
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
