const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { AppError } = require('./errorHandler');
const User = require('../models/User');

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided. Please log in', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'house_of_styles_secret_key_2024');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.isDemoUser = typeof decoded.id === 'string' && decoded.id.startsWith('demo_');
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
    
    // Demo users should be treated in demo mode even if the database reconnects later
    if (mongoose.connection.readyState !== 1 || req.isDemoUser) {
      req.user = {
        _id: req.userId,
        id: req.userId,
        role: req.userRole || 'user',
        isDemoUser: true,
      };
      return next();
    }

    // Normal mode: fetch from database
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'house_of_styles_secret_key_2024');
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
