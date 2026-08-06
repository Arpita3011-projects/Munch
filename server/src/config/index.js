require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/munch',
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Fail fast: JWT_SECRET is required for authentication.
if (!config.jwtSecret) {
  console.error('[FATAL] JWT_SECRET environment variable is not set.');
  console.error('  Generate a secure secret:  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

module.exports = config;
