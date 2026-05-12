const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { isDatabaseConnected } = require('./database');
const User = require('../models/User');

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided. Please log in', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    if (typeof decoded.id === 'string' && decoded.id.startsWith('demo_')) {
      throw new AppError('Temporary sessions are no longer supported. Please create a real account.', 401);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Invalid or expired token', 401);
  }
};

// Verify token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    verifyToken(req, res, () => {});
    
    if (!isDatabaseConnected()) {
      throw new AppError('Database connection is required. Please try again shortly.', 503);
    }

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    req.user = user;
    next();
  } catch (error) {
    throw error;
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    throw new AppError('Access denied. Admin role required', 403);
  }
  next();
};

// Optional auth - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (typeof decoded.id === 'string' && decoded.id.startsWith('demo_')) {
        return next();
      }
      req.userId = decoded.id;
      req.userRole = decoded.role;
    }
  } catch (error) {
    // Silently fail, user is optional
  }
  next();
};

module.exports = {
  authenticate,
  verifyToken,
  isAdmin,
  optionalAuth,
};
