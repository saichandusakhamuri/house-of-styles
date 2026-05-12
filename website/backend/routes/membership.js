const express = require('express');
const MembershipTier = require('../models/MembershipTier');
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');
const { getMembershipTiers } = require('../services/pricing');

const router = express.Router();

/**
 * GET /api/memberships
 * Get all active membership tiers
 */
router.get('/', async (req, res) => {
  try {
    const tiers = await getMembershipTiers();

    res.json({
      success: true,
      data: tiers,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/memberships/:id
 * Get a specific membership tier
 */
router.get('/:id', async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const tierName = ['Silver', 'Gold', 'Platinum'].find(
      (name) => name.toLowerCase() === req.params.id.toLowerCase()
    );
    const tier = isObjectId
      ? await MembershipTier.findById(req.params.id)
      : await MembershipTier.findOne({ name: tierName || req.params.id });

    if (!tier) {
      throw new AppError('Membership tier not found', 404);
    }

    res.json({
      success: true,
      data: tier,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/memberships/upgrade
 * Upgrade user membership
 */
router.post('/upgrade', authenticate, async (req, res) => {
  try {
    const { tierName, duration } = req.body; // duration: 'monthly' or 'annual'

    if (!['Silver', 'Gold', 'Platinum'].includes(tierName)) {
      throw new AppError('Invalid membership tier', 400);
    }

    const tier = await MembershipTier.findOne({ name: tierName });

    if (!tier) {
      throw new AppError('Membership tier not found', 404);
    }

    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Determine pricing
    const amount = duration === 'annual' ? tier.annualPrice : tier.monthlyPrice;

    // Set membership upgrade date and expiry date
    user.membershipTier = tier._id;
    user.membershipUpgradeDate = new Date();

    // Calculate expiry date
    const expiryDate = new Date();
    if (duration === 'annual') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    user.membershipExpiryDate = expiryDate;

    await user.save();

    res.json({
      success: true,
      message: `Membership upgraded to ${tierName} (${duration})`,
      data: {
        user,
        amount,
        duration,
        expiryDate,
      },
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/memberships/cancel
 * Cancel user membership
 */
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.membershipTier) {
      throw new AppError('User does not have an active membership', 400);
    }

    user.membershipTier = null;
    user.membershipExpiryDate = null;

    await user.save();

    res.json({
      success: true,
      message: 'Membership cancelled successfully',
      data: user,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/memberships (Admin only)
 * Create a new membership tier
 */
router.post('/', authenticate, isAdmin, handleValidationErrors, async (req, res) => {
  try {
    const { name, description, discountPercentage, annualPrice, monthlyPrice, features } = req.body;

    if (!['Silver', 'Gold', 'Platinum'].includes(name)) {
      throw new AppError('Invalid membership tier name', 400);
    }

    // Check if tier already exists
    const existingTier = await MembershipTier.findOne({ name });

    if (existingTier) {
      throw new AppError(`Membership tier ${name} already exists`, 400);
    }

    const tier = new MembershipTier({
      name,
      description,
      discountPercentage,
      annualPrice,
      monthlyPrice,
      features,
    });

    await tier.save();

    res.status(201).json({
      success: true,
      message: 'Membership tier created successfully',
      data: tier,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * PUT /api/memberships/:id (Admin only)
 * Update a membership tier
 */
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const tier = await MembershipTier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tier) {
      throw new AppError('Membership tier not found', 404);
    }

    res.json({
      success: true,
      message: 'Membership tier updated successfully',
      data: tier,
    });
  } catch (error) {
    throw error;
  }
});

module.exports = router;
