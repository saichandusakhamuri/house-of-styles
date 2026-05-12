const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const {
  sendWelcomeNotifications,
  sendPasswordResetNotification,
} = require('../services/customerMessaging');

const router = express.Router();

const generateResetCode = () => String(Math.floor(100000 + Math.random() * 900000));

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    await user.save();
    const notifications = await sendWelcomeNotifications(user);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      notifications,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('User account is inactive', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/auth/forgot-password
 * Queue password reset instructions for email and SMS
 */
router.post(
  '/forgot-password',
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors,
  async (req, res) => {
    const { email } = req.body;
    const resetCode = generateResetCode();
    let notifications = null;

    const user = await User.findOne({ email }).select('+passwordResetCode +passwordResetExpires');

    if (user) {
      user.passwordResetCode = resetCode;
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      notifications = await sendPasswordResetNotification(user, resetCode);
    }

    res.json({
      success: true,
      message: 'If an account exists for that email, reset instructions have been sent.',
      notifications,
    });
  }
);


/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Generate new JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/auth/logout
 * User logout (client-side token deletion)
 */
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please delete the token from client storage.',
  });
});

module.exports = router;
