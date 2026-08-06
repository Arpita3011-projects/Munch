const profileService = require('../services/profileService');

/**
 * GET /api/v1/profile
 * Return the authenticated user's profile.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await profileService.getProfile(req.user._id);
    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/profile
 * Update the authenticated user's profile (name, phone, avatar).
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await profileService.updateProfile(req.user._id, req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
