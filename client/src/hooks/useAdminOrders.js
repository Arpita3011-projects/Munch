import { useState, useCallback, useRef } from 'react';
import api from '../lib/axios';

/**
 * Hook for the admin order management board.
 *
 * Provides:
 *  - loadOrders()        → GET /admin/orders
 *  - updateOrderStatus(orderId, nextStatus) → PATCH /admin/orders/:id/status
 *
 * The server returns the full updated order so the list can be refreshed
 * immediately after a successful transition.
 */
export function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [success, setSuccess] = useState(null);
  const updateInFlight = useRef(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data?.data?.orders || []);
      return { success: true, orders: res.data?.data?.orders || [] };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to load orders. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuccess = useCallback(() => setSuccess(null), []);
  const clearError = useCallback(() => setError(null), []);

  const updateOrderStatus = useCallback(async (orderId, nextStatus) => {
    if (updateInFlight.current) return null;
    updateInFlight.current = true;
    setUpdatingId(orderId);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, {
        status: nextStatus,
      });
      const updatedOrder = res.data?.data?.order;
      // Replace the updated order in place so the UI reflects it immediately.
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder?._id ? updatedOrder : o))
      );
      setSuccess(res.data?.message || 'Order status updated');
      return { success: true, message: res.data?.message, order: updatedOrder };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to update order status. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setUpdatingId(null);
      updateInFlight.current = false;
    }
  }, []);

  return {
    orders,
    loading,
    error,
    updatingId,
    success,
    loadOrders,
    updateOrderStatus,
    clearError,
    clearSuccess,
  };
}

