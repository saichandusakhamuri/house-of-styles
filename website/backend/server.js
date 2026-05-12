require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
const compression = require('compression');
const jwt = require('jsonwebtoken');

// Config imports
const { connectDB } = require('./config/db');
const { logger } = require('./config/logger');
const { seedDefaultData } = require('./seed');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const {
  isDatabaseConnected,
  requireDatabaseConnection,
} = require('./middleware/database');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customOrderRoutes = require('./routes/customOrders');
const styleRoutes = require('./routes/styles');
const userRoutes = require('./routes/users');
const membershipRoutes = require('./routes/membership');
const paymentRoutes = require('./routes/payments');

const app = express();
const server = http.createServer(app);
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://house-of-styles-frontend.onrender.com',
];

const getAllowedOrigins = () => {
  const raw = (process.env.CORS_ORIGIN || '').trim();
  if (!raw) return defaultAllowedOrigins;
  const configuredOrigins = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([
    ...configuredOrigins,
    ...defaultAllowedOrigins,
  ])];
};

const allowedOrigins = getAllowedOrigins();

const validateStartupConfig = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required for real user mode.');
  }
};

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded?.id) {
      socket.userId = decoded.id;
      socket.join(`user-${decoded.id}`);
      logger.info(`Socket joined user room: user-${decoded.id}`);
    }

    next();
  } catch (error) {
    logger.warn(`Socket auth failed: ${error.message}`);
    next();
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
app.use(morgan('combined', { stream: { write: msg => logger.info(msg) } }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Real user mode requires a live database for every API route except health.
app.use('/api', requireDatabaseConnection);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/payments', paymentRoutes);

// Socket.IO setup for real-time notifications
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Store io instance for route access
app.set('io', io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    validateStartupConfig();
  } catch (error) {
    logger.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }

  try {
    await connectDB();
    const seedSummary = await seedDefaultData();
    logger.info(
      `Seed checked: ${seedSummary.createdProducts} products, ${seedSummary.createdTiers} tiers, admin created: ${seedSummary.createdAdmin}`
    );
  } catch (error) {
    logger.error(`Database unavailable. API routes will return 503 until MongoDB is configured: ${error.message}`);
  }

  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
};

if (require.main === module) {
  startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

module.exports = { app, io, server, startServer };
