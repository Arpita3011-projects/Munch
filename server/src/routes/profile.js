const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/profileSchemas');

// All profile routes require authentication
router.use(authenticate);

// GET /api/v1/profile — View the authenticated user's profile
router.get('/', profileController.getProfile);

// PUT /api/v1/profile — Update the authenticated user's profile
router.put('/', validate(updateProfileSchema), profileController.updateProfile);

module.exports = router;
