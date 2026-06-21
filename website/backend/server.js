require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
const compression = require('compression');

const { logger } = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const { handleCreateOrder, handleVerifyPayment } = paymentRoutes;
const siteContentRoutes = require('./routes/site-content');
const aiRoutes = require('./routes/ai');
const { staticMembershipTiers } = require('./data/staticMembershipTiers');

const app = express();
const server = http.createServer(app);
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://house-of-styles-frontend.onrender.com',
];

const getAllowedOrigins = () => {
  const raw = (process.env.CORS_ORIGIN || '').trim();
  if (!raw) return defaultAllowedOrigins;
  const configuredOrigins = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...configuredOrigins, ...defaultAllowedOrigins])];
};

const allowedOrigins = getAllowedOrigins();

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg) } }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'not-used',
    catalog: 'static',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.post('/api/create-order', handleCreateOrder);
app.post('/api/verify-payment', handleVerifyPayment);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/memberships', (req, res) => {
  res.json({
    success: true,
    source: 'static',
    data: staticMembershipTiers,
  });
});

app.all(['/api/auth/*', '/api/orders/*', '/api/custom-orders/*', '/api/styles/*', '/api/users/*'], (req, res) => {
  res.status(501).json({
    success: false,
    message: 'This endpoint is disabled in the Tomcat/static catalog build. Products are served without MongoDB.',
  });
});

io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info('MongoDB is not used; products are served from the static catalog.');
  });
};

if (require.main === module) {
  startServer();
}

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

module.exports = { app, io, server, startServer };
