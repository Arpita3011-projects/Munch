const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

class AuthService {
  /**
   * Register a new user with email & password.
   */
  async register({ name, email, password }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
      authProvider: 'local',
    });

    const token = this._generateToken(user);
    return { user, token };
  }

  /**
   * Authenticate with email & password.
   */
  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const token = this._generateToken(user);
    return { user, token };
  }

  /**
   * Get the currently authenticated user by ID.
   */
  async getMe(userId) {
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
   * Generate a signed JWT for the given user.
   */
  _generateToken(user) {
    return jwt.sign(
      {
        sub: user._id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }
}

module.exports = new AuthService();
