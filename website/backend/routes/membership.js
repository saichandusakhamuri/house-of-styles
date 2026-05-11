const express = require('express');
const mongoose = require('mongoose');
const MembershipTier = require('../models/MembershipTier');
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');
const { getMembershipTiers } = require('../services/pricing');

const DEMO_MEMBERSHIP_TIERS = [
  {
    _id: 'silver',
    name: 'Silver',
    description: 'Entry membership with 10% off and early previews.',
    discountPercentage: 10,
    annualPrice: 999,
    monthlyPrice: 99,
    features: ['10% off products', 'Early access to drops'],
    isActive: true,
    position: 1,
  },
  {
    _id: 'gold',
    name: 'Gold',
    description: 'Higher savings and priority tailoring support.',
    discountPercentage: 20,
    annualPrice: 1799,
    monthlyPrice: 179,
    features: ['20% off products', 'Priority tailoring', 'Early access'],
    isActive: true,
    position: 2,
  },
  {
    _id: 'platinum',
    name: 'Platinum',
    description: 'Top-tier membership with maximum discounts and service.',
    discountPercentage: 30,
    annualPrice: 2499,
    monthlyPrice: 249,
    features: ['30% off products', 'Free shipping', 'One-on-one styling'],
    isActive: true,
    position: 3,
  },
];

const getDemoMembershipTierById = (id) => DEMO_MEMBERSHIP_TIERS.find((tier) => tier._id === id || tier.name.toLowerCase() === id.toLowerCase());

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
    if (mongoose.connection.readyState !== 1) {
      const tier = getDemoMembershipTierById(req.params.id);
      if (!tier) {
        throw new AppError('Membership tier not found', 404);
      }

      return res.json({
        success: true,
        data: tier,
      });
    }

    const tier = await MembershipTier.findById(req.params.id);

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

    if (mongoose.connection.readyState !== 1 || req.user?.isDemoUser) {
      const tier = getDemoMembershipTierById(tierName);
      const expiryDate = new Date();
      if (duration === 'annual') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }

      return res.json({
        success: true,
        message: `Membership upgraded to ${tierName} (${duration}) in demo mode`,
        data: {
          membershipTier: tier,
          amount: duration === 'annual' ? tier.annualPrice : tier.monthlyPrice,
          duration,
          membershipExpiryDate: expiryDate,
          isExpired: false,
        },
      });
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
