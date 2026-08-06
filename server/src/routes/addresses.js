const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createAddressSchema,
  updateAddressSchema,
  addressParamsSchema,
} = require('../validators/addressSchemas');

// All address routes require authentication
router.use(authenticate);

// GET /api/v1/addresses — List the user's addresses (protected)
router.get('/', addressController.getAddresses);

// POST /api/v1/addresses — Create a new address (protected)
router.post('/', validate(createAddressSchema), addressController.createAddress);

// PUT /api/v1/addresses/:id — Update an address (protected, ownership validated)
router.put(
  '/:id',
  validate(addressParamsSchema, 'params'),
  validate(updateAddressSchema),
  addressController.updateAddress
);

// DELETE /api/v1/addresses/:id — Delete an address (protected, ownership validated)
router.delete(
  '/:id',
  validate(addressParamsSchema, 'params'),
  addressController.deleteAddress
);

// PUT /api/v1/addresses/:id/default — Set an address as default (protected, ownership validated)
router.put(
  '/:id/default',
  validate(addressParamsSchema, 'params'),
  addressController.setDefaultAddress
);

// PATCH /api/v1/addresses/:id/default — Alias for setting an address as default
router.patch(
  '/:id/default',
  validate(addressParamsSchema, 'params'),
  addressController.setDefaultAddress
);

module.exports = router;

