const MenuItem = require('../models/MenuItem');

class MenuService {
  /**
   * List menu items with optional search, filtering, and pagination.
   */
  async list({ search, category, tag, page, limit }) {
    const query = { isAvailable: true };

    // Text search across name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter (case-insensitive)
    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    // Tag filter (array contains)
    if (tag) {
      query.tags = { $in: [new RegExp(`^${tag}$`, 'i')] };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      MenuItem.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      MenuItem.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get all unique categories that have available items.
   */
  async getCategories() {
    const categories = await MenuItem.distinct('category', { isAvailable: true });
    // Sort categories in a logical order
    const order = ['Milkshakes', 'Sundaes', 'Ice Cream', 'Cookie Dough', 'Coffee'];
    return categories.sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }
}

module.exports = new MenuService();

