import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function verifyAuth() {
      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const res = await apiFetch('/auth/verify');
        if (active) setUser(res.user);
      } catch {
        localStorage.removeItem('admin_token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    verifyAuth();
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    const expireSession = () => {
      localStorage.removeItem('admin_token');
      setToken(null);
      setUser(null);
    };
    window.addEventListener('admin:session-expired', expireSession);
    return () => window.removeEventListener('admin:session-expired', expireSession);
  }, []);

  const login = async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('admin_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
