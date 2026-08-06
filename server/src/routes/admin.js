const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const {
  adminOrderParamsSchema,
  updateOrderStatusSchema,
  adminMenuItemParamsSchema,
  adminMenuItemSchema,
  adminMenuQuerySchema,
} = require('../validators/adminSchemas');

// Every admin route requires an authenticated user with the admin role.
router.use(authenticate);
router.use(authorize('admin'));

// ─── Admin Menu Management ──────────────────────────────────────────
// GET /api/v1/admin/menu — List all items (available + unavailable).
router.get('/menu', validateQuery(adminMenuQuerySchema), adminController.listMenuItems);

// POST /api/v1/admin/menu — Create a new menu item.
router.post('/menu', validate(adminMenuItemSchema), adminController.createMenuItem);

// PUT /api/v1/admin/menu/:id — Update an existing menu item.
router.put(
  '/menu/:id',
  validate(adminMenuItemParamsSchema, 'params'),
  validate(adminMenuItemSchema),
  adminController.updateMenuItem
);

// DELETE /api/v1/admin/menu/:id — Delete a menu item.
router.delete(
  '/menu/:id',
  validate(adminMenuItemParamsSchema, 'params'),
  adminController.deleteMenuItem
);

// ─── Admin Analytics ────────────────────────────────────────────────
// GET /api/v1/admin/analytics — Real dashboard analytics from MongoDB.
router.get('/analytics', adminController.getAnalytics);

// ─── Admin Orders ───────────────────────────────────────────────────
// GET /api/v1/admin/orders — All orders, newest first.
router.get('/orders', adminController.listAllOrders);

// PATCH /api/v1/admin/orders/:id/status — Advance an order's status.
router.patch(
  '/orders/:id/status',
  validate(adminOrderParamsSchema, 'params'),
  validate(updateOrderStatusSchema),
  adminController.updateOrderStatus
);

module.exports = router;

