import { useState, useCallback } from 'react';
import api from '../lib/axios';
import { useAuth } from './useAuth';

/**
 * Hook for fetching and updating the authenticated user's profile.
 *
 * Exposes:
 * - profile      : object | null — the current profile (falls back to auth user)
 * - loading      : boolean
 * - error        : string | null
 * - refreshProfile : () => Promise<void>
 * - updateProfile  : (data) => Promise<object> — updates backend + syncs auth context
 */
export function useProfile() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/profile');
      setProfile(res.data.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      // Fall back to the auth user so the UI still renders.
      setProfile(user || null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const updateProfile = useCallback(
    async (data) => {
      const res = await api.put('/profile', data);
      const updated = res.data.data.user;
      setProfile(updated);
      // Keep the auth context (header, nav) in sync with the new profile.
      if (updateUser) updateUser(updated);
      return updated;
    },
    [updateUser]
  );

  return {
    profile: profile || user,
    loading,
    error,
    refreshProfile,
    updateProfile,
  };
}
