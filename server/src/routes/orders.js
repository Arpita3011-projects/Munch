const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createOrderSchema, orderParamsSchema } = require('../validators/orderSchemas');

// POST /api/v1/orders — Create a new order (protected)
router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);

// GET /api/v1/orders — List all orders for the authenticated user (protected)
router.get('/', authenticate, orderController.getOrders);

// GET /api/v1/orders/:id — Get order by ID (protected, ownership validated)
router.get('/:id', authenticate, validate(orderParamsSchema, 'params'), orderController.getOrder);

module.exports = router;
