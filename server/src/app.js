const express = require('express');
const cors = require('cors');
const config = require('./config');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const menuRouter = require('./routes/menu');
const favoritesRouter = require('./routes/favorites');
const ordersRouter = require('./routes/orders');
const addressesRouter = require('./routes/addresses');
const profileRouter = require('./routes/profile');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / non-browser requests (curl, server-to-server).
      if (!origin) {
        return callback(null, true);
      }
      // Allow explicitly allowlisted origins (localhost dev, CLIENT_URL).
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow any HTTPS origin (deployed Vercel frontend, preview/custom domains).
      if (origin.startsWith('https://')) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '6mb' }));

// Root Route (Optional)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Munch API',
    health: '/api/v1/health',
  });
});

// API Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/favorites', favoritesRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/addresses', addressesRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/admin', adminRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;