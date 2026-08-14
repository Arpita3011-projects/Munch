const adminService = require('../services/adminService');
const analyticsService = require('../services/analyticsService');

/**
 * GET /api/v1/admin/menu
 * Admin only — list all menu items (including unavailable) with search/filter.
 */
const listMenuItems = async (req, res, next) => {
  try {
    const { search, category, availability } = req.query;
    const items = await adminService.listMenuItems({ search, category, availability });

    res.json({
      success: true,
      data: { items },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/admin/menu
 * Admin only — create a new menu item.
 */
const createMenuItem = async (req, res, next) => {
  try {
    const item = await adminService.createMenuItem(req.body);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: { item },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/admin/menu/:id
 * Admin only — update an existing menu item.
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await adminService.updateMenuItem(id, req.body);

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: { item },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/menu/:id
 * Admin only — delete a menu item.
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await adminService.deleteMenuItem(id);

    res.json({
      success: true,
      message: `"${deleted.name}" deleted successfully`,
      data: { deleted },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/orders
 * Admin only — list all orders newest first.
 */
const listAllOrders = async (req, res, next) => {
  try {
    const orders = await adminService.listAllOrders();

    res.json({
      success: true,
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/orders/:id/status
 * Admin only — advance an order to the next allowed status.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await adminService.updateOrderStatus(id, status);

    res.json({
      success: true,
      message: `Order marked as ${order.statusLabel}`,
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/analytics
 * Admin only — aggregate real order analytics for the dashboard.
 */
const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getDashboardAnalytics();

    res.json({
      success: true,
      data: { analytics },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  listAllOrders,
  updateOrderStatus,
  getAnalytics,
};

