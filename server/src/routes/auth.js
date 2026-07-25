const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  googleAuthSchema,
} = require('../validators/authSchemas');

// POST /api/v1/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/google
router.post('/google', validate(googleAuthSchema), authController.googleAuth);

// GET /api/v1/auth/me (protected)
router.get('/me', authenticate, authController.getMe);

module.exports = router;
