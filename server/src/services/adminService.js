const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

/**
 * Admin order management.
 *
 * The Order model stores canonical statuses:
 *   pending, confirmed, preparing, ready, delivered, cancelled
 *
 * For a friendlier admin experience we accept the spec aliases
 *   "placed"           → "pending"
 *   "out_for_delivery" → "ready"
 * at the API boundary and expose human labels via formatAdminOrder.
 */

/** Alias normalization from spec vocabulary → internal DB status. */
const STATUS_ALIASES = {
  placed: 'pending',
  out_for_delivery: 'ready',
};

/** The only allowed forward transition from each status. */
const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

/** Terminal statuses that can never change again. */
const TERMINAL_STATUSES = ['cancelled', 'delivered'];

/** Human-friendly labels for each internal status. */
const STATUS_LABELS = {
  pending: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
  'placed',
  'out_for_delivery',
];

function normalizeStatus(status) {
  return STATUS_ALIASES[status] || status;
}

function throwError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  throw error;
}

function canAdvance(status) {
  return !TERMINAL_STATUSES.includes(status) && Boolean(NEXT_STATUS[status]);
}

class AdminService {
  /**
   * List every order, newest first, with basic customer info attached.
   */
  async listAllOrders() {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'user', model: 'User', select: 'name email' })
      .lean();

    return orders.map((order) => this.formatAdminOrder(order));
  }

  /**
   * Advance an order to the next allowed status.
   * Every transition is validated server-side:
   *  - The order must exist.
   *  - Cancelled and delivered orders are terminal (cannot change).
   *  - The requested status must be exactly the next valid step.
   */
  async updateOrderStatus(orderId, requestedStatus) {
    const target = normalizeStatus(requestedStatus);

    if (!VALID_STATUSES.includes(requestedStatus)) {
      throwError('Invalid order status', 400, 'INVALID_STATUS');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throwError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const current = order.status;

    if (current === 'cancelled') {
      throwError('A cancelled order cannot change status', 409, 'ORDER_CANCELLED');
    }

    if (current === 'delivered') {
      throwError('A delivered order cannot change status', 409, 'ORDER_DELIVERED');
    }

    const next = NEXT_STATUS[current];
    if (!next) {
      throwError(`Order status "${current}" cannot be advanced`, 409, 'INVALID_TRANSITION');
    }

    if (target !== next) {
      throwError(
        `Order can only move from "${STATUS_LABELS[current] || current}" to "${STATUS_LABELS[next] || next}"`,
        409,
        'INVALID_TRANSITION'
      );
    }

    order.status = next;
    order.statusHistory.push({ status: next, timestamp: new Date() });
    await order.save();

    const populated = await Order.findById(order._id)
      .populate({ path: 'user', model: 'User', select: 'name email' })
      .lean();

    return this.formatAdminOrder(populated);
  }

  /**
   * Shape an order (lean or mongoose doc) into the admin API response.
   */
  formatAdminOrder(order) {
    const doc = order && order.toJSON ? order.toJSON() : order;

    return {
      _id: doc._id,
      customer: doc.user
        ? {
            _id: doc.user._id,
            name: doc.user.name,
            email: doc.user.email,
          }
        : null,
      items: (doc.items || []).map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: ((item.priceCents || 0) / 100).toFixed(2),
        quantity: item.quantity,
        size: {
          name: item.size?.name || 'Regular',
        },
        addOns: (item.addOns || []).map((ao) => ({
          name: ao.name,
          price: ((ao.priceCents || 0) / 100).toFixed(2),
        })),
      })),
      subtotal: ((doc.subtotalCents || 0) / 100).toFixed(2),
      deliveryFee: ((doc.deliveryFeeCents || 0) / 100).toFixed(2),
      tax: ((doc.taxCents || 0) / 100).toFixed(2),
      total: ((doc.totalCents || 0) / 100).toFixed(2),
      status: doc.status,
      statusLabel: STATUS_LABELS[doc.status] || doc.status,
      nextStatus: canAdvance(doc.status) ? NEXT_STATUS[doc.status] : null,
      canAdvance: canAdvance(doc.status),
      statusHistory: doc.statusHistory || [],
      addressSnapshot: doc.addressSnapshot || {},
      paymentMethod: doc.paymentMethod || 'Cash on Delivery',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // Admin Menu Management
  // ────────────────────────────────────────────────────────────────

  /**
   * List all menu items (including unavailable ones) with optional
   * search by name/category and availability filtering.
   */
  async listMenuItems({ search, category, availability }) {
    const filter = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { category: regex }];
    }

    if (category && category.trim()) {
      filter.category = category;
    }

    if (availability === 'available') {
      filter.isAvailable = true;
    } else if (availability === 'unavailable') {
      filter.isAvailable = false;
    }

    const items = await MenuItem.find(filter).sort({ name: 1 }).lean();
    return items.map((item) => this.formatAdminMenuItem(item));
  }

  /**
   * Create a new menu item.
   */
  async createMenuItem(data) {
    const item = await MenuItem.create(data);

    return this.formatAdminMenuItem(item);
  }

  /**
   * Update an existing menu item by ID.
   */
  async updateMenuItem(id, data) {
    const item = await MenuItem.findById(id);
    if (!item) {
      throwError('Menu item not found', 404, 'MENU_ITEM_NOT_FOUND');
    }

    item.set(data);

    await item.save();

    return this.formatAdminMenuItem(item);
  }

  /**
   * Delete a menu item. Hard delete is used because the MenuItem model
   * does not currently include a soft-delete flag. Menu items referenced
   * by past orders are already snapshotted into the order items, so
   * deleting the menu item does not corrupt historical order data.
   */
  async deleteMenuItem(id) {
    const item = await MenuItem.findById(id);
    if (!item) {
      throwError('Menu item not found', 404, 'MENU_ITEM_NOT_FOUND');
    }

    await MenuItem.findByIdAndDelete(id);
    return { _id: item._id, name: item.name };
  }

  /**
   * Shape a menu item (lean or mongoose doc) into the admin API response.
   */
  formatAdminMenuItem(item) {
    const doc = item && item.toJSON ? item.toJSON() : item;

    return {
      _id: doc._id,
      name: doc.name,
      description: doc.description,
      price: Number(doc.price),
      category: doc.category,
      image: doc.image,
      isAvailable: Boolean(doc.isAvailable),
      tags: doc.tags || [],
      sizes: (doc.sizes || []).map((s) => ({
        name: s.name,
        priceAdjustment: Number(s.priceAdjustment || 0),
      })),
      addOns: (doc.addOns || []).map((ao) => ({
        name: ao.name,
        price: Number(ao.price || 0),
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

module.exports = new AdminService();

