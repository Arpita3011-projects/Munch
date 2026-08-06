const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
  myReviewQuerySchema,
} = require('../validators/reviewSchemas');

// All /reviews routes require authentication
router.use(authenticate);

// GET /api/v1/reviews/mine?menuItemId= — Get the user's review for an item
// Must be registered before any /:id routes so "mine" isn't parsed as an id.
router.get('/mine', validateQuery(myReviewQuerySchema), reviewController.getMyReview);

// POST /api/v1/reviews — Create a review (protected, ownership + delivered order validated)
router.post('/', validate(createReviewSchema), reviewController.createReview);

// PUT /api/v1/reviews/:id — Edit a review (protected, ownership validated)
router.put('/:id', validate(reviewParamsSchema, 'params'), validate(updateReviewSchema), reviewController.updateReview);

// DELETE /api/v1/reviews/:id — Delete a review (protected, ownership validated)
router.delete('/:id', validate(reviewParamsSchema, 'params'), reviewController.deleteReview);

module.exports = router;

