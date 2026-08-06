import { useState, useCallback, useRef } from 'react';
import api from '../lib/axios';

/**
 * Hook for cancelling an order.
 *
 * Calls POST /orders/:id/cancel which validates ownership and enforces the
 * server-side business rules (only 'pending' and 'confirmed' orders can be
 * cancelled). Returns the updated order so callers can refresh local state
 * immediately without a refetch.
 *
 * @returns {{ cancelOrder: function, cancelLoading: boolean, cancelError: string|null, setCancelError: function }}
 */
export function useCancelOrder() {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const inFlight = useRef(false);

  const cancelOrder = useCallback(async (orderId) => {
    if (inFlight.current) return null;
    inFlight.current = true;

    setCancelLoading(true);
    setCancelError(null);

    try {
      const res = await api.post(`/orders/${orderId}/cancel`);
      return {
        success: true,
        message: res.data?.message || 'Order cancelled successfully',
        order: res.data?.data?.order || null,
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to cancel the order. Please try again.';
      setCancelError(message);
      return { success: false, message, order: null };
    } finally {
      setCancelLoading(false);
      inFlight.current = false;
    }
  }, []);

  return { cancelOrder, cancelLoading, cancelError, setCancelError };
}

