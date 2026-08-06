const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

/** Delivery fee in cents — fixed at $3.99 */
const DELIVERY_FEE_CENTS = 399;

/** Tax rate as a fraction — 8.5% */
const TAX_RATE = 0.085;

/**
 * Convert a dollars price (from MenuItem) to integer cents.
 */
function toCents(dollars) {
  return Math.round(dollars * 100);
}

/**
 * Convert integer cents to a dollars string (e.g. 1299 → "12.99").
 */
function centsToDollars(cents) {
  return (cents / 100).toFixed(2);
}

class OrderService {
  /**
   * Create an order using server-side pricing.
   *
   * The client sends only menuItemId, size name/adjustment, addOn names/prices,
   * and quantity. The backend looks up current MenuItem prices and recalculates
   * every total. Client-submitted prices are IGNORED.
   */
  async createOrder(userId, { items, address, paymentMethod }) {
    if (!items || items.length === 0) {
      const error = new Error('Order must contain at least one item');
      error.statusCode = 400;
      error.code = 'EMPTY_ORDER';
      throw error;
    }

    // Fetch all menu items in one query
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    if (menuItems.length !== new Set(menuItemIds).size) {
      const error = new Error('One or more menu items not found');
      error.statusCode = 404;
      error.code = 'MENU_ITEM_NOT_FOUND';
      throw error;
    }

    const menuItemMap = {};
    for (const mi of menuItems) {
      menuItemMap[mi._id.toString()] = mi;
    }

    // Build order item snapshots with server-calculated prices
    const orderItems = [];
    let subtotalCents = 0;

    for (const item of items) {
      const menuItem = menuItemMap[item.menuItemId];
      if (!menuItem) {
        const error = new Error(`Menu item not found: ${item.menuItemId}`);
        error.statusCode = 404;
        error.code = 'MENU_ITEM_NOT_FOUND';
        throw error;
      }

      const baseCents = toCents(menuItem.price);
      const sizeAdjustmentCents = item.size
        ? toCents(item.size.priceAdjustment || 0)
        : 0;
      const addOnsCents = (item.addOns || []).reduce(
        (sum, ao) => sum + toCents(ao.price || 0),
        0
      );
      const itemCents = (baseCents + sizeAdjustmentCents + addOnsCents) * item.quantity;

      subtotalCents += itemCents;

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        priceCents: baseCents + sizeAdjustmentCents + addOnsCents,
        quantity: item.quantity,
        size: {
          name: item.size?.name || 'Regular',
          priceAdjustmentCents: sizeAdjustmentCents,
        },
        addOns: (item.addOns || []).map((ao) => ({
          name: ao.name,
          priceCents: toCents(ao.price || 0),
        })),
      });
    }

    const deliveryFeeCents = DELIVERY_FEE_CENTS;
    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + deliveryFeeCents + taxCents;

    const order = await Order.create({
      user: userId,
      items: orderItems,
      subtotalCents,
      deliveryFeeCents,
      taxCents,
      totalCents,
      status: 'pending',
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
      addressSnapshot: {
        fullName: address?.fullName || '',
        phone: address?.phone || '',
        line1: address?.line1 || '',
        line2: address?.line2 || '',
        landmark: address?.landmark || '',
        city: address?.city || '',
        state: address?.state || '',
        zip: address?.zip || '',
        type: address?.type || 'home',
      },
      paymentMethod: paymentMethod || 'Cash on Delivery',
    });

    return order;
  }

  /**
   * Get all orders for a given user, sorted by newest first.
   */
  async getOrdersByUser(userId) {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return orders;
  }

  /**
   * Get an order by ID, with ownership validation.
   */
  async getOrderById(orderId, userId) {
    const order = await Order.findById(orderId);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    // Ownership validation — a user can only see their own orders
    if (order.user.toString() !== userId.toString()) {
      const error = new Error('You do not have permission to view this order');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return order;
  }

  /**
   * Cancel an order if its current status allows it.
   *
   * Only orders in 'pending' (Placed) or 'confirmed' status can be cancelled.
   * Appends a 'cancelled' entry to statusHistory.
   */
  async cancelOrder(orderId, userId) {
    const order = await Order.findById(orderId);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    // Ownership validation — a user can only cancel their own orders
    if (order.user.toString() !== userId.toString()) {
      const error = new Error('You do not have permission to cancel this order');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Status validation — cancellation only allowed while order is placed/confirmed
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      const error = new Error('This order can no longer be cancelled');
      error.statusCode = 409;
      error.code = 'ORDER_NOT_CANCELLABLE';
      throw error;
    }

    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date() });
    await order.save();

    return order;
  }
}

module.exports = new OrderService();
module.exports.centsToDollars = centsToDollars;
