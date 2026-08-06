const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const reviewController = require('../controllers/reviewController');
const { validateQuery } = require('../middleware/validate');
const { listMenuSchema, menuItemIdSchema } = require('../validators/menuSchemas');
const { validate } = require('../middleware/validate');

// GET /api/v1/menu
router.get('/', validateQuery(listMenuSchema), menuController.listMenu);

// GET /api/v1/menu/categories
router.get('/categories', menuController.getCategories);

// GET /api/v1/menu/:id
router.get('/:id', menuController.getMenuItem);

// GET /api/v1/menu/:id/reviews — Public list of reviews for a menu item
router.get('/:id/reviews', validate(menuItemIdSchema, 'params'), reviewController.getMenuReviews);

module.exports = router;

