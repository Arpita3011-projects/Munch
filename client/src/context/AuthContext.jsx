import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../lib/axios';

export const AuthContext = createContext(null);

/**
 * Authentication provider.
 *
 * ⚠️ MVP TRADEOFFS
 *
 * 1. JWT Storage:
 *    JWT is stored in localStorage for simplicity. This is acceptable for MVP
 *    because it enables easy debugging, tab-synced login state, and persistence
 *    across page refreshes. The production-hardened approach would use httpOnly
 *    cookies + a refresh token rotation scheme to mitigate XSS risk. For MVP,
 *    we document this tradeoff and ensure the token is cleared on logout.
 *
 * 2. Google ID Token Verification:
 *    The backend service (authService.googleAuth) accepts an idToken payload
 *    from the client. For MVP, server-side verification using google-auth-library
 *    is intentionally deferred. The client sends a pre-verified payload as the
 *    idToken field, and the server trusts it.
 *
 *    ⚠️ Production requirement:
 *    Before production launch, the following MUST be implemented:
 *    - Frontend: Use @react-oauth/google to obtain a real Google credential.
 *    - Backend: Install google-auth-library and verify the token server-side
 *      using OAuth2Client.verifyIdToken() in _verifyGoogleToken().
 *
 *    See server/src/services/authService.js for implementation details.
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

  /**
   * Google authentication.
   *
   * MVP note: This sends googleId, email, and name directly to the server.
   * In production, the client should:
   *   1. Use Google Identity Services to get a credential (ID token)
   *   2. Send the credential (not user data) to POST /api/v1/auth/google
   *   3. The server verifies the token server-side using google-auth-library
   * See server/src/services/authService.js for more details.
   */
  const loginWithGoogle = useCallback(async (googleData) => {
    setError(null);
    const res = await api.post('/auth/google', googleData);
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
      loginWithGoogle,
      logout,
      clearError,
    }),
    [user, loading, error, login, register, loginWithGoogle, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
