import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stockpilot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('stockpilot_mode') || 'storefront'; // 'storefront' or 'admin'
  });

  const [loading, setLoading] = useState(false);

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('stockpilot_mode', mode);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('stockpilot_token', data.token);
      localStorage.setItem('stockpilot_user', JSON.stringify(data.user));
      setUser(data.user);
      setViewMode('admin');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('stockpilot_token');
    localStorage.removeItem('stockpilot_user');
    setUser(null);
    setViewMode('storefront');
  };

  const switchUserContext = (newUser, token) => {
    if (token) {
      localStorage.setItem('stockpilot_token', token);
    }
    localStorage.setItem('stockpilot_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      switchUserContext,
      viewMode,
      toggleViewMode,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
