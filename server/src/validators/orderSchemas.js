const { z } = require('zod');

const orderItemSchema = z.object({
  menuItemId: z
    .string({ required_error: 'Menu item ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid menu item ID format'),
  size: z
    .object({
      name: z.string().trim().min(1),
      priceAdjustment: z.number().min(0).default(0),
    })
    .optional()
    .default({ name: 'Regular', priceAdjustment: 0 }),
  addOns: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        price: z.number().min(0),
      })
    )
    .optional()
    .default([]),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity cannot exceed 99')
    .default(1),
});

const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema, { required_error: 'Items are required' })
    .min(1, 'Order must contain at least one item')
    .max(50, 'Order cannot exceed 50 items'),
  address: z
    .object({
      line1: z.string().trim().optional().default(''),
      line2: z.string().trim().optional().default(''),
      city: z.string().trim().optional().default(''),
      state: z.string().trim().optional().default(''),
      zip: z.string().trim().optional().default(''),
    })
    .optional()
    .default({}),
  paymentMethod: z
    .enum(['card', 'cash', 'mock'])
    .optional()
    .default('mock'),
});

const orderParamsSchema = z.object({
  id: z
    .string({ required_error: 'Order ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid order ID format'),
});

module.exports = {
  createOrderSchema,
  orderParamsSchema,
};
