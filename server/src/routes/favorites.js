const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

// All favorite routes require authentication
router.use(authenticate);

// POST /api/v1/favorites/:menuItemId — Add item to favorites
router.post('/:menuItemId', favoriteController.addFavorite);

// DELETE /api/v1/favorites/:menuItemId — Remove item from favorites
router.delete('/:menuItemId', favoriteController.removeFavorite);

// GET /api/v1/favorites — List all favorites
router.get('/', favoriteController.getFavorites);

module.exports = router;
