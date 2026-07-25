const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

/**
 * Middleware that verifies the JWT Bearer token
 * and attaches the user document to req.user.
 */
const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authentication required. Please provide a valid token.');
      error.statusCode = 401;
      error.code = 'NO_TOKEN';
      throw error;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const error = new Error('Authentication required. Please provide a valid token.');
      error.statusCode = 401;
      error.code = 'NO_TOKEN';
      throw error;
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.sub);

    if (!user) {
      const error = new Error('User associated with this token no longer exists.');
      error.statusCode = 401;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      err.statusCode = 401;
      err.code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    }
    next(err);
  }
};

/**
 * Middleware that restricts access to specific roles.
 * Must be used after `authenticate`.
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      error.code = 'NO_TOKEN';
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error('You do not have permission to perform this action');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      return next(error);
    }

    next();
  };
};

module.exports = { authenticate, authorize };
