const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const config = require('./src/config');

const start = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`[Munch Server] Running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`[Munch Server] Health check: http://localhost:${config.port}/api/v1/health`);
    });
  } catch (err) {
    console.error('[Munch Server] Failed to start:', err.message);
    process.exit(1);
  }
};

start();
