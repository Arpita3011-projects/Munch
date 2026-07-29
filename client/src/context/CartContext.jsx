import { createContext, useState, useCallback, useMemo, useEffect } from 'react';

export const CartContext = createContext(null);

const STORAGE_KEY = 'munch_cart';

/**
 * Load cart from localStorage.
 */
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupted data — start fresh
  }
  return [];
}

/**
 * Save cart to localStorage.
 */
function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/**
 * Generate a stable cart item key for matching identical configurations.
 */
function itemKey(item) {
  const addOnNames = (item.addOns || [])
    .map((a) => a.name)
    .sort()
    .join(',');
  return `${item.menuItemId}::${item.size?.name || 'Regular'}::${addOnNames}`;
}

/**
 * Cart context provider with localStorage persistence.
 *
 * Each cart item stores:
 * - uniqueId (for React keys and quantity updates)
 * - menuItemId (MongoDB ObjectId reference)
 * - name (item display name)
 * - basePrice (item base price in dollars)
 * - image (item image URL)
 * - size: { name, priceAdjustment }
 * - addOns: [{ name, price }]
 * - quantity (number)
 *
 * Prices are client-side display only.
 * Backend is the source of truth for all pricing.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // Persist to localStorage whenever items change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  /**
   * Add an item to the cart.
   * If an identical configuration exists, increment quantity instead.
   */
  const addToCart = useCallback(
    ({ menuItemId, name, basePrice, image, size, addOns, quantity = 1 }) => {
      setItems((prev) => {
        const newItem = {
          uniqueId: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          menuItemId,
          name: name || 'Item',
          basePrice: basePrice || 0,
          image: image || '',
          size: size || { name: 'Regular', priceAdjustment: 0 },
          addOns: addOns || [],
          quantity: Math.max(1, Math.min(99, quantity)),
        };

        const key = itemKey(newItem);
        const existingIndex = prev.findIndex((item) => itemKey(item) === key);

        if (existingIndex >= 0) {
          const updated = [...prev];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(99, newQty),
          };
          return updated;
        }

        return [...prev, newItem];
      });
    },
    []
  );

  /**
   * Update quantity for a specific item (identified by uniqueId).
   * If quantity drops below 1, remove the item.
   */
  const updateQuantity = useCallback((uniqueId, newQuantity) => {
    if (newQuantity < 1) {
      setItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId
          ? { ...item, quantity: Math.min(99, newQuantity) }
          : item
      )
    );
  }, []);

  /**
   * Remove an item from the cart by uniqueId.
   */
  const removeItem = useCallback((uniqueId) => {
    setItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  }, []);

  /**
   * Clear all items from the cart.
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Total number of items (sum of quantities).
   */
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  /**
   * Subtotal in dollars (client-side display only).
   */
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const base = item.basePrice || 0;
      const sizeAdj = item.size?.priceAdjustment || 0;
      const addOnsTotal = (item.addOns || []).reduce(
        (a, ao) => a + (ao.price || 0),
        0
      );
      return sum + (base + sizeAdj + addOnsTotal) * item.quantity;
    }, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      totalItems,
      subtotal,
    }),
    [items, addToCart, updateQuantity, removeItem, clearCart, totalItems, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
