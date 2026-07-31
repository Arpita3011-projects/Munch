const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

/**
 * Business logic for user favorites management.
 */
class FavoriteService {
  /**
   * Get all favorited menu items for the authenticated user.
   * Populates the full menu item documents.
   */
  async getFavorites(userId) {
    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        model: 'MenuItem',
        select: 'name description price category tags image isAvailable',
      })
      .lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return user.favorites || [];
  }

  /**
   * Add a menu item to the user's favorites.
   * Uses $addToSet to prevent duplicates.
   * Validates the menu item exists before adding.
   */
  async addFavorite(userId, menuItemId) {
    // Verify the menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      error.code = 'MENU_ITEM_NOT_FOUND';
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: menuItemId } },
      { new: true }
    )
      .populate({
        path: 'favorites',
        model: 'MenuItem',
        select: 'name description price category tags image isAvailable',
      })
      .lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return user.favorites;
  }

  /**
   * Remove a menu item from the user's favorites.
   */
  async removeFavorite(userId, menuItemId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: menuItemId } },
      { new: true }
    )
      .populate({
        path: 'favorites',
        model: 'MenuItem',
        select: 'name description price category tags image isAvailable',
      })
      .lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return user.favorites;
  }
}

module.exports = new FavoriteService();

