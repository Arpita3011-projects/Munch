import { useState, useCallback, useRef } from 'react';
import api from '../lib/axios';

/**
 * Hook for Ratings & Reviews.
 *
 * Provides:
 *  - getMenuReviews(menuItemId)     → fetch review list + summary for a menu item (public)
 *  - getMyReview(menuItemId)        → fetch the authenticated user's review for a menu item
 *  - submitReview({menuItemId, orderId, rating, comment}) → POST /reviews
 *  - updateReview({id, rating, comment})                 → PUT /reviews/:id
 *  - deleteReview(id)                                    → DELETE /reviews/:id
 *
 * Loading/error state is tracked per action. Each mutation returns a normalized
 * { success, message, review } object so callers can update local state instantly.
 */
export function useReviews() {
  const [menuLoading, setMenuLoading] = useState(false);
  const [myReviewLoading, setMyReviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitInFlight = useRef(false);
  const updateInFlight = useRef(false);
  const deleteInFlight = useRef(false);

  const getMenuReviews = useCallback(async (menuItemId) => {
    setMenuLoading(true);
    setError(null);
    try {
      const res = await api.get(`/menu/${menuItemId}/reviews`);
      return {
        success: true,
        data: res.data?.data || { average: 0, count: 0, reviews: [] },
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load reviews. Please try again.';
      setError(message);
      return { success: false, message, data: null };
    } finally {
      setMenuLoading(false);
    }
  }, []);

  const getMyReview = useCallback(async (menuItemId) => {
    setMyReviewLoading(true);
    setError(null);
    try {
      const res = await api.get(`/reviews/mine?menuItemId=${encodeURIComponent(menuItemId)}`);
      return {
        success: true,
        review: res.data?.data?.review || null,
      };
    } catch (err) {
      // 404 = no review yet — not an error worth surfacing.
      if (err.response?.status === 404) {
        return { success: true, review: null };
      }
      const message = err.response?.data?.message || 'Failed to load your review.';
      setError(message);
      return { success: false, message, review: null };
    } finally {
      setMyReviewLoading(false);
    }
  }, []);

  const submitReview = useCallback(async ({ menuItemId, orderId, rating, comment }) => {
    if (submitInFlight.current) return null;
    submitInFlight.current = true;
    setSubmitLoading(true);
    setError(null);
    try {
      const res = await api.post('/reviews', { menuItemId, orderId, rating, comment });
      return {
        success: true,
        message: res.data?.message || 'Review submitted successfully',
        review: res.data?.data?.review || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit review. Please try again.';
      setError(message);
      return { success: false, message, review: null };
    } finally {
      setSubmitLoading(false);
      submitInFlight.current = false;
    }
  }, []);

  const updateReview = useCallback(async ({ id, rating, comment }) => {
    if (updateInFlight.current) return null;
    updateInFlight.current = true;
    setUpdateLoading(true);
    setError(null);
    try {
      const res = await api.put(`/reviews/${id}`, { rating, comment });
      return {
        success: true,
        message: res.data?.message || 'Review updated successfully',
        review: res.data?.data?.review || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update review. Please try again.';
      setError(message);
      return { success: false, message, review: null };
    } finally {
      setUpdateLoading(false);
      updateInFlight.current = false;
    }
  }, []);

  const deleteReview = useCallback(async (id) => {
    if (deleteInFlight.current) return null;
    deleteInFlight.current = true;
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/reviews/${id}`);
      return {
        success: true,
        message: res.data?.message || 'Review deleted successfully',
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete review. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setDeleteLoading(false);
      deleteInFlight.current = false;
    }
  }, []);

  return {
    menuLoading,
    myReviewLoading,
    submitLoading,
    updateLoading,
    deleteLoading,
    error,
    setError,
    getMenuReviews,
    getMyReview,
    submitReview,
    updateReview,
    deleteReview,
  };
}

