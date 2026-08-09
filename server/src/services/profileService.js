const User = require('../models/User');

/**
 * Normalize a phone number to its canonical stored form.
 * Strips spaces and dashes so both "98765 43210" and "+91 98765-43210"
 * are stored as "9876543210" / "+919876543210".
 */
function normalizePhone(value) {
  if (value === null || value === undefined) return value;
  return String(value).replace(/[\s-]/g, '');
}

/**
 * Business logic for a customer's profile.
 *
 * The profile is backed by the User document. Email is intentionally
 * read-only (immutable) — it is the user's login identifier. Only
 * `name`, `phone`, and `avatar` are editable.
 */
class ProfileService {
  /**
   * Return the authenticated user's profile document.
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return user;
  }

  /**
   * Update the authenticated user's profile.
   *
   * Only the editable fields are applied. Email is never modified here.
   * Avatar may be a URL or a base64 data URL (stored as-is).
   */
  async updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = normalizePhone(data.phone);
    if (data.avatar !== undefined) user.avatar = data.avatar;

    await user.save();
    return user;
  }
}

module.exports = new ProfileService();
