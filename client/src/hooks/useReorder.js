import { useState, useCallback, useRef } from 'react';
import api from '../lib/axios';

/**
 * Hook for re-ordering items from a past order.
 *
 * Fetches each unique menuItemId from the API only once, builds a lookup map,
 * then maps each order item into the format expected by CartContext.addToCart().
 *
 * Skips items whose menuItemId no longer exists in the database and reports
 * how many were added vs. skipped so the caller can show a friendly message.
 *
 * @param {function} addToCart - The addToCart function from CartContext.
 * @returns {{ reorder: function, reorderLoading: boolean, reorderError: string|null }}
 */
export function useReorder(addToCart) {
  const [reorderLoading, setReorderLoading] = useState(false);
  const [reorderError, setReorderError] = useState(null);
  const inFlight = useRef(false);

  const reorder = useCallback(
    async (order) => {
      if (inFlight.current) return;
      inFlight.current = true;

      setReorderLoading(true);
      setReorderError(null);

      try {
        const uniqueIds = [...new Set(order.items.map((oi) => oi.menuItemId))];

        const menuItemMap = {};
        const fetchPromises = uniqueIds.map(async (id) => {
          try {
            const res = await api.get('/menu/' + id);
            menuItemMap[id] = res.data.data.item;
          } catch {
          }
        });

        await Promise.all(fetchPromises);

        let added = 0;
        let skipped = 0;

        for (const orderItem of order.items) {
          const currentItem = menuItemMap[orderItem.menuItemId];

          if (!currentItem) {
            skipped++;
            continue;
          }

          addToCart({
            menuItemId: orderItem.menuItemId,
            name: currentItem.name,
            basePrice: Number(currentItem.price),
            image: currentItem.image || '',
            size: orderItem.size
              ? { name: orderItem.size.name, priceAdjustment: Number(orderItem.size.priceAdjustment) || 0 }
              : { name: 'Regular', priceAdjustment: 0 },
            addOns: (orderItem.addOns || []).map((ao) => ({
              name: ao.name,
              price: Number(ao.price) || 0,
            })),
            quantity: orderItem.quantity,
          });

          added++;
        }

        let message = '';
        if (added > 0) {
          message = added + ' item' + (added > 1 ? 's' : '') + ' added to cart';
          if (skipped > 0) {
            message += '. ' + skipped + ' item' + (skipped > 1 ? 's' : '') + ' ' + (skipped === 1 ? 'is' : 'are') + ' no longer available';
          }
        } else {
          message = 'None of the order items are available to re-order';
        }

        return { success: added > 0, message, added, skipped };
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to re-order. Please try again.';
        setReorderError(message);
        return { success: false, message, added: 0, skipped: 0 };
      } finally {
        setReorderLoading(false);
        inFlight.current = false;
      }
    },
    [addToCart]
  );

  return { reorder, reorderLoading, reorderError };
}
