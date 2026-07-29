import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/axios';
import { useAuth } from './useAuth';

/**
 * Hook that manages favorites as a single source of truth.
 *
 * Exposes:
 * - favorites        : MenuItem[] — list of favorited items (populated)
 * - isFavorite(id)   : boolean
 * - toggleFavorite(id): void — optimistic toggle with rollback on failure
 * - loading           : boolean
 * - error             : string | null
 * - refreshFavorites  : () => void
 */
export function useFavorites() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const favoritesMapRef = useRef(new Map());

  // Update local map whenever favorites change
  useEffect(() => {
    const map = new Map();
    favorites.forEach((item) => map.set(item._id, true));
    favoritesMapRef.current = map;
  }, [favorites]);

  // Sync favorites from server on mount / auth change
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/favorites');
      setFavorites(res.data.data.favorites);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback((itemId) => {
    return favoritesMapRef.current.has(itemId);
  }, []);

  const toggleFavorite = useCallback(
    async (itemId) => {
      const wasFav = favoritesMapRef.current.has(itemId);

      // Optimistic UI update
      setFavorites((prev) => {
        if (wasFav) {
          return prev.filter((item) => item._id !== itemId);
        }
        // We don't have the full item yet, so we'll refetch after add
        return prev;
      });

      try {
        if (wasFav) {
          await api.delete(`/favorites/${itemId}`);
        } else {
          await api.post(`/favorites/${itemId}`);
          // Refetch to get the populated item data
          const res = await api.get('/favorites');
          setFavorites(res.data.data.favorites);
        }
      } catch (err) {
        // Rollback optimistic update on failure
        setError(err.response?.data?.message || 'Failed to update favorite');
        refreshFavorites();
        throw err;
      }
    },
    [refreshFavorites]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    loading,
    error,
    refreshFavorites,
  };
}

