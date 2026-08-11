import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { useDebounce } from './useDebounce';
import { retryWithWakeup } from '../lib/retryWithWakeup';

/**
 * Hook for fetching and managing menu state.
 *
 * Handles:
 * - Fetching menu items with search/filter/pagination
 * - Fetching categories
 * - Debounced search
 * - Loading / error / empty states
 */
export function useMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch categories on mount
  useEffect(() => {
    let cancelled = false;
    api
      .get('/menu/categories')
      .then((res) => {
        if (!cancelled) {
          setCategories(res.data.data.categories);
        }
      })
      .catch(() => {
        // Categories failing silently is acceptable — the menu still loads
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch menu items when filters change
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsWakingUp(false);

    try {
      const params = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category = selectedCategory;

      const fetchWithRetry = async () => {
        return api.get('/menu', { params });
      };

      let res;
      if (isInitialLoad) {
        // First menu load: retry on cold-start errors
        res = await retryWithWakeup(fetchWithRetry, {
          maxAttempts: 4,
          onRetry: (attempt) => {
            // Show "waking up" state during retries
            setIsWakingUp(true);
          },
        });
        setIsInitialLoad(false);
      } else {
        // Subsequent loads: no retries, normal error handling
        res = await fetchWithRetry();
      }

      setItems(res.data.data.items);
      setPagination(res.data.data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load menu';
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
      setIsWakingUp(false);
    }
  }, [debouncedSearch, selectedCategory, page, isInitialLoad]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  const changeSearch = useCallback((value) => {
    setSearch(value);
  }, []);

  const changeCategory = useCallback((category) => {
    setSelectedCategory((prev) => (prev === category ? '' : category));
  }, []);

  const changePage = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    items,
    categories,
    pagination,
    loading,
    error,
    isWakingUp,
    search,
    selectedCategory,
    page,
    changeSearch,
    changeCategory,
    changePage,
    refetch: fetchMenu,
  };
}

