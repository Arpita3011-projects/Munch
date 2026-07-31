const MenuItem = require('../models/MenuItem');

/**
 * Business logic for menu-related operations.
 */
class MenuService {
  /**
   * List menu items with search, category, tag filtering and pagination.
   */
  async list({ search, category, tag, page, limit }) {
    const filter = { isAvailable: true };

    // Search by text index (falls back to regex for partial matches)
    if (search && search.trim()) {
      // Try text search first; if it fails or returns nothing, fall back to regex
      const textMatch = await MenuItem.find(
        { $text: { $search: search } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(1);

      if (textMatch.length > 0) {
        filter.$text = { $search: search };
      } else {
        // Fallback: case-insensitive regex on name and description
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ name: regex }, { description: regex }];
      }
    }

    if (category) {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MenuItem.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get distinct categories from available menu items.
   */
  async getCategories() {
    const categories = await MenuItem.distinct('category', { isAvailable: true });
    return categories.sort();
  }

  /**
   * Get a single menu item by ID.
   */
  async getMenuItemById(id) {
    const item = await MenuItem.findById(id).lean();
    if (!item) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      error.code = 'MENU_ITEM_NOT_FOUND';
      throw error;
    }
    return item;
  }
}

module.exports = new MenuService();

