import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fitforge_token');
    if (token) {
      api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => {
        localStorage.removeItem('fitforge_token');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('fitforge_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('fitforge_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
