const addressService = require('../services/addressService');

/**
 * GET /api/v1/addresses
 * List all addresses for the authenticated user.
 */
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getAddresses(req.user._id);
    res.json({
      success: true,
      data: { addresses },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/addresses
 * Create a new address for the authenticated user.
 */
const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/addresses/:id
 * Update an address (ownership validated).
 */
const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(
      req.params.id,
      req.user._id,
      req.body
    );
    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/addresses/:id
 * Delete an address (ownership validated).
 */
const deleteAddress = async (req, res, next) => {
  try {
    const address = await addressService.deleteAddress(
      req.params.id,
      req.user._id
    );
    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: { address },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/addresses/:id/default
 * Mark an address as the user's default.
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(
      req.params.id,
      req.user._id
    );
    res.json({
      success: true,
      message: 'Default address updated',
      data: { address },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

