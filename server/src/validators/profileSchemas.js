const { z } = require('zod');

/**
 * Indian mobile number regex.
 *
 * Accepts either of these canonical formats:
 *   9876543210
 *   +919876543210
 * The number must be exactly 10 digits and begin with a valid Indian
 * mobile prefix (6, 7, 8, or 9). Optionally prefixed with +91.
 */
const INDIAN_MOBILE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;

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
    .regex(INDIAN_MOBILE_REGEX, 'Enter a valid 10-digit Indian mobile number.')
    .transform((val) => (val ? val.replace(/[\s-]/g, '') : val))
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
