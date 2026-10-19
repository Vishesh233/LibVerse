import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getCurrentUser();
      if (res?.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      // ignore silently; caller can handle
    }
  }, []);

  // On app load, replace the stored user with the server's current data (e.g. a role changed since login).
  // Route guards wait for this, so a stale role never triggers a wrong redirect.
  const [isRefreshingUser, setIsRefreshingUser] = useState(() => !!localStorage.getItem('token'));
  const didRefresh = useRef(false);

  useEffect(() => {
    if (didRefresh.current) return; // StrictMode runs effects twice in development
    didRefresh.current = true;
    if (!localStorage.getItem('token')) return;
    refreshUser().finally(() => setIsRefreshingUser(false));
  }, [refreshUser]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const isAuthenticated = !!token && !!user;
  const isLibrarian = user?.role === 'librarian';
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setLoading,
        isRefreshingUser,
        login,
        refreshUser,
        updateUser,
        logout,
        isAuthenticated,
        isAdmin,
        isLibrarian,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
