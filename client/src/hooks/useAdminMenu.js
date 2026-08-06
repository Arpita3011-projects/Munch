import { useState, useCallback, useRef } from 'react';
import api from '../lib/axios';

/**
 * Hook for admin menu management.
 *
 * Provides:
 *  - loadItems()              → GET /admin/menu (with search/category/availability)
 *  - createItem(data)         → POST /admin/menu
 *  - updateItem(id, data)     → PUT /admin/menu/:id
 *  - deleteItem(id)           → DELETE /admin/menu/:id
 *  - loadCategories()         → GET /menu/categories (public endpoint)
 *
 * After each mutation the list is refreshed so the UI stays in sync.
 */
export function useAdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const mutationInFlight = useRef(false);

  const loadItems = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/menu', { params });
      setItems(res.data?.data?.items || []);
      return { success: true, items: res.data?.data?.items || [] };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load menu items. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get('/menu/categories');
      setCategories(res.data?.data?.categories || []);
    } catch (err) {
      // Categories failing silently is acceptable — the menu list still loads.
      console.error('Failed to load categories', err);
    }
  }, []);

  const createItem = useCallback(
    async (data) => {
      if (mutationInFlight.current) return null;
      mutationInFlight.current = true;
      setSaving(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await api.post('/admin/menu', data);
        setSuccess(res.data?.message || 'Menu item created successfully');
        return { success: true, message: res.data?.message, item: res.data?.data?.item };
      } catch (err) {
        const message =
          err.response?.data?.message || 'Failed to create menu item. Please try again.';
        setError(message);
        return { success: false, message };
      } finally {
        setSaving(false);
        mutationInFlight.current = false;
      }
    },
    []
  );

  const updateItem = useCallback(
    async (id, data) => {
      if (mutationInFlight.current) return null;
      mutationInFlight.current = true;
      setSaving(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await api.put(`/admin/menu/${id}`, data);
        setSuccess(res.data?.message || 'Menu item updated successfully');
        return { success: true, message: res.data?.message, item: res.data?.data?.item };
      } catch (err) {
        const message =
          err.response?.data?.message || 'Failed to update menu item. Please try again.';
        setError(message);
        return { success: false, message };
      } finally {
        setSaving(false);
        mutationInFlight.current = false;
      }
    },
    []
  );

  const deleteItem = useCallback(
    async (id) => {
      if (mutationInFlight.current) return null;
      mutationInFlight.current = true;
      setDeletingId(id);
      setError(null);
      setSuccess(null);
      try {
        const res = await api.delete(`/admin/menu/${id}`);
        setSuccess(res.data?.message || 'Menu item deleted successfully');
        // Remove from local list immediately for instant UI feedback.
        setItems((prev) => prev.filter((item) => item._id !== id));
        return { success: true, message: res.data?.message };
      } catch (err) {
        const message =
          err.response?.data?.message || 'Failed to delete menu item. Please try again.';
        setError(message);
        return { success: false, message };
      } finally {
        setDeletingId(null);
        mutationInFlight.current = false;
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  return {
    items,
    categories,
    loading,
    error,
    success,
    saving,
    deletingId,
    loadItems,
    loadCategories,
    createItem,
    updateItem,
    deleteItem,
    clearError,
    clearSuccess,
  };
}

