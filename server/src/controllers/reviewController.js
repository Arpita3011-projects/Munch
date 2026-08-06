const reviewService = require('../services/reviewService');

/**
 * Helper to shape a review for API responses.
 */
function formatReview(review) {
  const doc = review.toJSON ? review.toJSON() : review;
  return {
    _id: doc._id,
    user: doc.user,
    menuItem: doc.menuItem,
    order: doc.order,
    rating: doc.rating,
    comment: doc.comment || '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * POST /api/v1/reviews
 * Create a review for a delivered order item (protected, ownership validated).
 */
const createReview = async (req, res, next) => {
  try {
    const { menuItemId, orderId, rating, comment } = req.body;
    const review = await reviewService.createReview(req.user._id, {
      menuItemId,
      orderId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review: formatReview(review) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/reviews/:id
 * Update an existing review (protected, ownership validated).
 */
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const review = await reviewService.updateReview(id, req.user._id, {
      rating,
      comment,
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: formatReview(review) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reviews/mine?menuItemId=
 * Get the authenticated user's review for a menu item (protected).
 * Returns 404 if the user has not reviewed the item.
 */
const getMyReview = async (req, res, next) => {
  try {
    const { menuItemId } = req.query;
    const review = await reviewService.getMyReview(req.user._id, menuItemId);

    res.json({
      success: true,
      data: { review: formatReview(review) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/reviews/:id
 * Delete an existing review (protected, ownership validated).
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reviewService.deleteReview(id, req.user._id);

    res.json({
      success: true,
      message: 'Review deleted successfully',
      data: { deleted: true },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/menu/:id/reviews
 * Public: list reviews for a menu item (newest first) with aggregate summary.
 */
const getMenuReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await reviewService.getMenuReviews(id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getMyReview,
  getMenuReviews,
};

