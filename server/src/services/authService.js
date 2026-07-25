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

    if (user.authProvider === 'google' && !user.passwordHash) {
      const error = new Error('This account uses Google login. Please sign in with Google.');
      error.statusCode = 400;
      error.code = 'GOOGLE_ACCOUNT';
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
   * Login or register with Google.
   *
   * Accepts an idToken from the client. For MVP, server-side verification
   * using google-auth-library is intentionally deferred. Instead, the client
   * sends the decoded payload fields (idToken, email, name) and the server
   * trusts them. This keeps the auth flow testable without additional
   * dependencies.
   *
   * ⚠️ PRODUCTION REQUIREMENT:
   * Before production launch, server-side Google ID token verification MUST
   * be implemented. The typical flow:
   *   1. Frontend uses Google Identity Services (@react-oauth/google) to
   *      obtain an ID token credential.
   *   2. Frontend sends the raw credential to POST /api/v1/auth/google.
   *   3. Server uses google-auth-library to verify the token:
   *        const { OAuth2Client } = require('google-auth-library');
   *        const client = new OAuth2Client(config.googleClientId);
   *        const ticket = await client.verifyIdToken({
   *          idToken: req.body.idToken,
   *          audience: config.googleClientId,
   *        });
   *        const payload = ticket.getPayload();
   *   4. The verified payload supplies sub (googleId), email, and name.
   *
   * The implementation below is structured so that this verification step
   * can be added inside _verifyGoogleToken() without changing the API or
   * controller — simply replace the body of that method with real verification.
   */
  async googleAuth({ idToken, email, name }) {
    // Deferred server-side verification.
    // Replace _verifyGoogleToken with real verification before production.
    const payload = await this._verifyGoogleToken(idToken);

    const googleId = payload.sub;
    if (!googleId || !email) {
      const error = new Error('Invalid Google authentication data');
      error.statusCode = 400;
      error.code = 'INVALID_GOOGLE_DATA';
      throw error;
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      // Link googleId if user exists via email but without googleId
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        authProvider: 'google',
      });
    }

    const token = this._generateToken(user);
    return { user, token };
  }

  /**
   * Verify a Google ID token.
   *
   * MVP implementation: Forwards the idToken as a trusted payload for sub/email/name.
   * This avoids requiring google-auth-library during development.
   *
   * To add real verification (required for production):
   *   1. Install: npm install google-auth-library
   *   2. Set GOOGLE_CLIENT_ID in .env (from Google Cloud Console)
   *   3. Replace the body of this method with:
   *        const { OAuth2Client } = require('google-auth-library');
   *        const client = new OAuth2Client(config.googleClientId);
   *        const ticket = await client.verifyIdToken({
   *          idToken,
   *          audience: config.googleClientId,
   *        });
   *        return ticket.getPayload();
   *
   * @param {string} idToken - The Google ID token or a mock payload string.
   * @returns {Promise<{sub: string, email: string, name: string}>}
   */
  async _verifyGoogleToken(idToken) {
    // MVP: Accept the idToken as a JSON-encoded payload.
    // This allows testing without a real Google token.
    // In production, replace the implementation (not the API) using
    // the google-auth-library verification shown above.
    try {
      if (typeof idToken === 'string' && idToken.startsWith('{')) {
        return JSON.parse(idToken);
      }
      // If idToken is already an object (e.g., from validation transform), use it directly.
      if (typeof idToken === 'object' && idToken !== null) {
        return idToken;
      }
    } catch {
      // Fall through to error below
    }

    // If we reach here, verification is not implemented yet.
    // This is expected during MVP development.
    const error = new Error(
      'Server-side Google ID token verification is not yet implemented. ' +
      'See _verifyGoogleToken() in server/src/services/authService.js for instructions.'
    );
    error.statusCode = 501;
    error.code = 'GOOGLE_VERIFICATION_NOT_IMPLEMENTED';
    throw error;
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
