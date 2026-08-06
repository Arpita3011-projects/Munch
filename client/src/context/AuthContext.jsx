import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../lib/axios';

export const AuthContext = createContext(null);

/**
 * Authentication provider.
 *
 * JWT is stored in localStorage for simplicity. This is acceptable for MVP
 * because it enables easy debugging, tab-synced login state, and persistence
 * across page refreshes. The production-hardened approach would use httpOnly
 * cookies + a refresh token rotation scheme to mitigate XSS risk. For MVP,
 * we document this tradeoff and ensure the token is cleared on logout.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('munch_token');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.data.user);
        })
        .catch(() => {
          localStorage.removeItem('munch_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for global unauthorized events (from axios interceptor)
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('munch_token');
    };
    window.addEventListener('munch:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('munch:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token } = res.data.data;
    localStorage.setItem('munch_token', token);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    const res = await api.post('/auth/register', { name, email, password });
    const { user: userData, token } = res.data.data;
    localStorage.setItem('munch_token', token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('munch_token');
    setUser(null);
    setError(null);
  }, []);

  // Update the user in state (e.g. after a profile edit) so the header,
  // nav, and any other consumers reflect the latest profile immediately.
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUser,
      clearError,
    }),
    [user, loading, error, login, register, logout, updateUser, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
