const Review = require('../models/Review');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

/**
 * Business logic for ratings & reviews.
 *
 * Business rules:
 *  - Only users who actually ordered an item can review it.
 *  - The order must be owned by the user AND be in "delivered" status.
 *  - One review per (user, menuItem) — enforced by unique index + pre-check.
 *  - Users may edit their own review later.
 */
class ReviewService {
  /**
   * Create a review for a delivered order item.
   * Verifies the menu item exists, the order is owned by the user, the order
   * is delivered, the order contains the item, and the user has not already
   * reviewed this menu item.
   */
  async createReview(userId, { menuItemId, orderId, rating, comment }) {
    // Menu item must exist
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      error.code = 'MENU_ITEM_NOT_FOUND';
      throw error;
    }

    // Order must exist and be owned by the user
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.user.toString() !== userId.toString()) {
      const error = new Error('You do not have permission to review this order');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Only delivered orders can be reviewed
    if (order.status !== 'delivered') {
      const error = new Error('You can only review items from delivered orders');
      error.statusCode = 409;
      error.code = 'ORDER_NOT_DELIVERED';
      throw error;
    }

    // The order must actually contain this menu item
    const containsItem = order.items.some(
      (oi) => oi.menuItemId.toString() === menuItemId.toString()
    );
    if (!containsItem) {
      const error = new Error('This item was not part of the order');
      error.statusCode = 400;
      error.code = 'ITEM_NOT_IN_ORDER';
      throw error;
    }

    // Prevent duplicate review for the same user + menu item
    const existing = await Review.findOne({ user: userId, menuItem: menuItemId });
    if (existing) {
      const error = new Error('You have already reviewed this item');
      error.statusCode = 409;
      error.code = 'REVIEW_ALREADY_EXISTS';
      throw error;
    }

    const review = await Review.create({
      user: userId,
      menuItem: menuItemId,
      order: orderId,
      rating,
      comment: comment || '',
    });

    return review;
  }

  /**
   * Update a review. Only the owner may edit it.
   */
  async updateReview(reviewId, userId, updates) {
    const review = await Review.findById(reviewId);
    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      error.code = 'REVIEW_NOT_FOUND';
      throw error;
    }

    if (review.user.toString() !== userId.toString()) {
      const error = new Error('You do not have permission to edit this review');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (updates.rating !== undefined) review.rating = updates.rating;
    if (updates.comment !== undefined) review.comment = updates.comment;

    await review.save();
    return review;
  }

  /**
   * Delete a review. Only the owner may delete it.
   */
  async deleteReview(reviewId, userId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      error.code = 'REVIEW_NOT_FOUND';
      throw error;
    }

    if (review.user.toString() !== userId.toString()) {
      const error = new Error('You do not have permission to delete this review');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await review.deleteOne();
    return { deleted: true };
  }

  /**
   * Get the authenticated user's review for a given menu item.
   * Returns null if the user has not reviewed the item.
   */
  async getMyReview(userId, menuItemId) {
    const review = await Review.findOne({ user: userId, menuItem: menuItemId }).lean();
    if (!review) {
      const error = new Error('No review found for this item');
      error.statusCode = 404;
      error.code = 'REVIEW_NOT_FOUND';
      throw error;
    }
    return review;
  }

  /**
   * List reviews for a menu item (newest first) with the reviewer's name,
   * plus aggregate rating summary (average + count).
   */
  async getMenuReviews(menuItemId) {
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      error.code = 'MENU_ITEM_NOT_FOUND';
      throw error;
    }

    const [reviews, aggregate] = await Promise.all([
      Review.find({ menuItem: menuItemId })
        .sort({ createdAt: -1 })
        .populate({
          path: 'user',
          model: 'User',
          select: 'name',
        })
        .lean(),
      Review.aggregate([
        { $match: { menuItem: menuItemId } },
        {
          $group: {
            _id: null,
            average: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const summary = aggregate[0] || { average: 0, count: 0 };

    return {
      average: Number(summary.average.toFixed(1)) || 0,
      count: summary.count,
      reviews,
    };
  }
}

module.exports = new ReviewService();

