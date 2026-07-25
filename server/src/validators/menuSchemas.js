const { z } = require('zod');

const listMenuSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive('Page must be a positive integer')),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50')),
});

module.exports = {
  listMenuSchema,
};

