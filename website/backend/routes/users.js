const express = require('express');
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /api/users/profile
 * Get authenticated user's profile
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('membershipTier');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, profileImage, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        phone,
        profileImage,
        preferences,
      },
      { new: true, runValidators: true }
    ).populate('membershipTier');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * PUT /api/users/change-password
 * Change user password
 */
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    const user = await User.findById(req.userId).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/users/membership
 * Get user's membership information
 */
router.get('/membership', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('membershipTier');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        membershipTier: user.membershipTier,
        membershipUpgradeDate: user.membershipUpgradeDate,
        membershipExpiryDate: user.membershipExpiryDate,
        isExpired: user.membershipExpiryDate ? new Date() > user.membershipExpiryDate : false,
      },
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/users/add-shipping-address
 * Add a new shipping address
 */
router.post('/add-shipping-address', authenticate, async (req, res) => {
  try {
    const { label, street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // If this is the first address or marked as default, set it as default
    const shouldBeDefault = isDefault || user.shippingAddresses.length === 0;

    if (shouldBeDefault) {
      user.shippingAddresses.forEach(addr => addr.isDefault = false);
    }

    user.shippingAddresses.push({
      label,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: shouldBeDefault,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Shipping address added successfully',
      data: user,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * PUT /api/users/shipping-address/:addressId
 * Update a shipping address
 */
router.put('/shipping-address/:addressId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const address = user.shippingAddresses.id(req.params.addressId);

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    Object.assign(address, req.body);

    // If setting as default, unset others
    if (req.body.isDefault) {
      user.shippingAddresses.forEach(addr => {
        if (addr._id.toString() !== req.params.addressId) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Shipping address updated successfully',
      data: user,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * DELETE /api/users/shipping-address/:addressId
 * Delete a shipping address
 */
router.delete('/shipping-address/:addressId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.shippingAddresses.id(req.params.addressId).deleteOne();

    await user.save();

    res.json({
      success: true,
      message: 'Shipping address deleted successfully',
      data: user,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/users (Admin only)
 * Get all users with pagination
 */
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .populate('membershipTier')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    throw error;
  }
});

module.exports = router;
