const { z } = require('zod');

const createReviewSchema = z.object({
  menuItemId: z
    .string({ required_error: 'Menu item ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid menu item ID format'),
  orderId: z
    .string({ required_error: 'Order ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid order ID format'),
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .trim()
    .max(500, 'Comment cannot exceed 500 characters')
    .optional()
    .default(''),
});

const updateReviewSchema = z
  .object({
    rating: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5')
      .optional(),
    comment: z
      .string()
      .trim()
      .max(500, 'Comment cannot exceed 500 characters')
      .optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: 'At least one of rating or comment must be provided',
  });

const reviewParamsSchema = z.object({
  id: z
    .string({ required_error: 'Review ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid review ID format'),
});

const myReviewQuerySchema = z.object({
  menuItemId: z
    .string({ required_error: 'Menu item ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid menu item ID format'),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
  myReviewQuerySchema,
};

