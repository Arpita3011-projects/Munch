const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { validateQuery } = require('../middleware/validate');
const { listMenuSchema } = require('../validators/menuSchemas');

// GET /api/v1/menu
router.get('/', validateQuery(listMenuSchema), menuController.listMenu);

// GET /api/v1/menu/categories
router.get('/categories', menuController.getCategories);

// GET /api/v1/menu/:id
router.get('/:id', menuController.getMenuItem);

module.exports = router;

