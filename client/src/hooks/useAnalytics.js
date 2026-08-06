import { useState, useCallback } from 'react';
import api from '../lib/axios';

/**
 * Hook for the admin analytics dashboard.
 *
 * Provides:
 *  - loadAnalytics() → GET /admin/analytics
 *    Returns real aggregated metrics computed server-side from MongoDB.
 */
export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data?.data?.analytics || null);
      setLastUpdated(new Date());
      return { success: true, analytics: res.data?.data?.analytics || null };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load analytics. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    analytics,
    loading,
    error,
    lastUpdated,
    loadAnalytics,
    clearError,
  };
}

