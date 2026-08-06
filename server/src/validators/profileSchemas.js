const { z } = require('zod');

/**
 * Zod schema for updating a user's profile.
 *
 * Email is intentionally read-only — customers cannot change their
 * login email from the profile editor. Only `name`, `phone`, and
 * `avatar` are editable. All fields are optional so a partial update
 * is allowed.
 */
const updateProfileSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{10,15}$/, 'Enter a valid phone number')
    .nullable()
    .optional(),
  avatar: z
    .string()
    .trim()
    .max(2000000, 'Avatar image is too large')
    .optional(),
});

module.exports = {
  updateProfileSchema,
};
