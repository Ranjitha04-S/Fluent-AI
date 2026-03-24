import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fluentai_token');
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('fluentai_token')).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('fluentai_token', r.data.token);
    setUser(r.data.user);
    return r.data;
  };

  const register = async (name, email, password) => {
    const r = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('fluentai_token', r.data.token);
    setUser(r.data.user);
    return r.data;
  };

  const logout = () => {
    localStorage.removeItem('fluentai_token');
    setUser(null);
  };

  const updateUser = (updates) => setUser(u => ({ ...u, ...updates }));

  const updateStat = async (type) => {
    try {
      const r = await api.patch('/user/stats', { type });
      setUser(u => ({ ...u, stats: r.data.stats }));
    } catch {}
  };

  const updateGoals = async (goals) => {
    try {
      await api.patch('/user/goals', { goals });
      setUser(u => ({ ...u, goals }));
    } catch {}
  };

  const saveApiKey = async (groqApiKey) => {
    await api.patch('/user/apikey', { groqApiKey });
    setUser(u => ({ ...u, groqApiKey }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, updateStat, updateGoals, saveApiKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
