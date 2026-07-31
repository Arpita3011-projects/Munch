const orderService = require('../services/orderService');

/**
 * Helper to format an order for API responses.
 * Converts cents to dollars for the client.
 */
function formatOrder(order) {
  const doc = order.toJSON ? order.toJSON() : order;

  return {
    _id: doc._id,
    user: doc.user,
    items: doc.items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: (item.priceCents / 100).toFixed(2),
      quantity: item.quantity,
      size: {
        name: item.size.name,
        priceAdjustment: (item.size.priceAdjustmentCents / 100).toFixed(2),
      },
      addOns: item.addOns.map((ao) => ({
        name: ao.name,
        price: (ao.priceCents / 100).toFixed(2),
      })),
    })),
    subtotal: (doc.subtotalCents / 100).toFixed(2),
    deliveryFee: (doc.deliveryFeeCents / 100).toFixed(2),
    tax: (doc.taxCents / 100).toFixed(2),
    total: (doc.totalCents / 100).toFixed(2),
    status: doc.status,
    statusHistory: doc.statusHistory,
    addressSnapshot: doc.addressSnapshot,
    paymentMethod: doc.paymentMethod,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * POST /api/v1/orders
 * Create a new order with server-side pricing.
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, address, paymentMethod } = req.body;
    const order = await orderService.createOrder(req.user._id, {
      items,
      address,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: formatOrder(order) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders
 * Get all orders for the authenticated user, sorted by newest first.
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user._id);
    const formatted = orders.map(formatOrder);

    res.json({
      success: true,
      data: { orders: formatted },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders/:id
 * Get a single order by ID (ownership validated).
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user._id);

    res.json({
      success: true,
      data: { order: formatOrder(order) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
};
