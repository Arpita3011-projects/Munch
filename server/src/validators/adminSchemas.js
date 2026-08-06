const mongoose = require('mongoose');
const { z } = require('zod');

/**
 * Params schema for admin order routes.
 */
const adminOrderParamsSchema = z.object({
  id: z
    .string({ required_error: 'Order ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid order ID format'),
});

/**
 * Body schema for PATCH /admin/orders/:id/status.
 * Accepts both internal statuses and the friendlier spec aliases.
 * Actual transition validation happens in the service layer.
 */
const updateOrderStatusSchema = z.object({
  status: z.enum(
    [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'delivered',
      'cancelled',
      'placed',
      'out_for_delivery',
    ],
    { required_error: 'Status is required' }
  ),
});

/**
 * Params schema for admin menu routes (MenuItem ID).
 */
const adminMenuItemParamsSchema = z.object({
  id: z
    .string({ required_error: 'Menu item ID is required' })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid menu item ID',
    }),
});

/** Allowed menu item categories — mirrors the MenuItem model enum. */
const MENU_CATEGORIES = ['Milkshakes', 'Sundaes', 'Ice Cream', 'Cookie Dough', 'Coffee'];

/** Schema for a single size option. */
const sizeSchema = z
  .object({
    name: z.string().trim().min(1, 'Size name is required'),
    priceAdjustment: z.coerce
      .number()
      .min(0, 'Price adjustment cannot be negative')
      .max(100000, 'Price adjustment is too large'),
  })
  .strict();

/** Schema for a single add-on option. */
const addOnSchema = z
  .object({
    name: z.string().trim().min(1, 'Add-on name is required'),
    price: z.coerce
      .number()
      .min(0, 'Add-on price cannot be negative')
      .max(100000, 'Add-on price is too large'),
  })
  .strict();

/**
 * Create / update body schema for admin menu items.
 * Matches the MenuItem model shape (name, description, price, category, image,
 * isAvailable, sizes, addOns) plus tags.
 */
const adminMenuItemSchema = z
  .object({
    name: z
      .string({ required_error: 'Item name is required' })
      .trim()
      .min(1, 'Item name is required')
      .max(100, 'Name cannot exceed 100 characters'),
    description: z
      .string({ required_error: 'Description is required' })
      .trim()
      .min(1, 'Description is required')
      .max(500, 'Description cannot exceed 500 characters'),
    price: z.coerce
      .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
      .min(0, 'Price cannot be negative')
      .max(100000, 'Price is too large'),
    category: z.enum(MENU_CATEGORIES, {
      required_error: 'Category is required',
      invalid_type_error: 'Invalid category',
      message: '{VALUE} is not a valid category',
    }),
    image: z
      .string({ required_error: 'Image is required' })
      .trim()
      .min(1, 'Image is required')
      .refine(
        (val) =>
          /^(https?:\/\/|data:image\/)/i.test(val) || val.startsWith('blob:'),
        'Image must be a valid URL, data URL, or blob URL'
      ),
    isAvailable: z.boolean().default(true),
    tags: z.array(z.string().trim().min(1)).max(10).default([]),
    sizes: z.array(sizeSchema).max(10).default([]),
    addOns: z.array(addOnSchema).max(20).default([]),
  })
  .strict();

/**
 * Query schema for GET /admin/menu — search, category, availability filter.
 */
const adminMenuQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  availability: z.enum(['all', 'available', 'unavailable']).default('all'),
});

module.exports = {
  adminOrderParamsSchema,
  updateOrderStatusSchema,
  adminMenuItemParamsSchema,
  adminMenuItemSchema,
  adminMenuQuerySchema,
};

