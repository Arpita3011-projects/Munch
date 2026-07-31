const { z } = require('zod');

const menuItemIdSchema = z.object({
  menuItemId: z
    .string({ required_error: 'Menu item ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid menu item ID format'),
});

module.exports = {
  menuItemIdSchema,
};

