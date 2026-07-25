const express = require('express');
const cors = require('cors');
const config = require('./config');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
