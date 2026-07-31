const menuService = require('../services/menuService');

/**
 * GET /api/v1/menu
 */
const listMenu = async (req, res, next) => {
  try {
    const { search, category, tag, page, limit } = req.query;
    const result = await menuService.list({ search, category, tag, page, limit });
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/menu/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await menuService.getCategories();
    res.json({
      success: true,
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/menu/:id
 */
const getMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await menuService.getMenuItemById(id);
    res.json({
      success: true,
      data: { item },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listMenu,
  getCategories,
  getMenuItem,
};
