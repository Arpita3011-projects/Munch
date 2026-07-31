const favoriteService = require('../services/favoriteService');

/**
 * GET /api/v1/favorites
 * Returns the authenticated user's favorited menu items.
 */
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await favoriteService.getFavorites(req.user._id);
    res.json({
      success: true,
      data: { favorites },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/favorites/:menuItemId
 * Adds a menu item to the user's favorites.
 */
const addFavorite = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const favorites = await favoriteService.addFavorite(req.user._id, menuItemId);
    res.status(201).json({
      success: true,
      message: 'Item added to favorites',
      data: { favorites },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/favorites/:menuItemId
 * Removes a menu item from the user's favorites.
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const favorites = await favoriteService.removeFavorite(req.user._id, menuItemId);
    res.json({
      success: true,
      message: 'Item removed from favorites',
      data: { favorites },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};

