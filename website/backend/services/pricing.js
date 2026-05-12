const mongoose = require('mongoose');
const User = require('../models/User');
const MembershipTier = require('../models/MembershipTier');

const calculateProductPrice = async (basePrice, userId = null) => {
  try {
    let discountPercentage = 0;
    let discountReason = null;

    if (userId && mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).populate('membershipTier');

      if (user && user.membershipTier) {
        discountPercentage = user.membershipTier.discountPercentage;
        discountReason = 'membership';
      }
    }

    const discountApplied = (basePrice * discountPercentage) / 100;
    const finalPrice = basePrice - discountApplied;

    return {
      basePrice,
      finalPrice,
      discountApplied,
      discountPercentage,
      discountReason,
    };
  } catch (error) {
    return {
      basePrice,
      finalPrice: basePrice,
      discountApplied: 0,
      discountPercentage: 0,
      discountReason: null,
    };
  }
};

/**
 * Calculate order total with tax, shipping, and membership discounts
 * @param {Array} items - Order items with productId, quantity, priceAtPurchase
 * @param {String} userId - The user ID
 * @param {Number} shippingCost - Shipping cost
 * @param {Number} taxRate - Tax percentage (default 5%)
 * @returns {Object} - Order pricing breakdown
 */
const calculateOrderTotal = async (items, userId = null, shippingCost = 0, taxRate = 5) => {
  try {
    let user = null;
    let membershipDiscount = 0;
    let freeShipping = false;

    if (userId && mongoose.connection.readyState === 1) {
      user = await User.findById(userId).populate('membershipTier');
      if (user && user.membershipTier) {
        membershipDiscount = user.membershipTier.discountPercentage;
        freeShipping = user.membershipTier.freeShipping;
      }
    }

    // Calculate subtotal
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.priceAtPurchase * item.quantity;
    });

    // Apply membership discount
    const discountApplied = (subtotal * membershipDiscount) / 100;
    const subtotalAfterDiscount = subtotal - discountApplied;

    // Calculate tax
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;

    // Apply free shipping if applicable
    const finalShippingCost = freeShipping ? 0 : shippingCost;

    // Calculate total
    const totalAmount = subtotalAfterDiscount + taxAmount + finalShippingCost;

    return {
      subtotal,
      discountApplied,
      discountPercentage: membershipDiscount,
      discountReason: membershipDiscount > 0 ? 'membership' : null,
      tax: taxAmount,
      taxRate,
      shippingCost: finalShippingCost,
      freeShipping,
      totalAmount,
      breakdown: {
        subtotal,
        discount: `-${discountApplied.toFixed(2)}`,
        subtotalAfterDiscount: subtotalAfterDiscount.toFixed(2),
        tax: taxAmount.toFixed(2),
        shipping: finalShippingCost.toFixed(2),
        total: totalAmount.toFixed(2),
      },
    };
  } catch (error) {
    return {
      subtotal: 0,
      discountApplied: 0,
      discountPercentage: 0,
      discountReason: null,
      tax: 0,
      taxRate,
      shippingCost,
      freeShipping: false,
      totalAmount: 0,
      breakdown: {
        subtotal: 0,
        discount: '-0.00',
        subtotalAfterDiscount: '0.00',
        tax: '0.00',
        shipping: shippingCost.toFixed(2),
        total: '0.00',
      },
    };
  }
};

/**
 * Calculate custom order pricing based on base cost, customization markup, and membership discount
 * @param {Number} baseCost - Base customization cost
 * @param {Number} complexityMultiplier - Complexity factor (1 = simple, 1.5 = moderate, 2 = complex)
 * @param {String} userId - The user ID
 * @returns {Object} - Pricing breakdown for custom order
 */
const calculateCustomOrderPrice = async (baseCost, complexityMultiplier = 1, userId = null) => {
  try {
    let customOrderDiscount = 0;
    let discountReason = null;

    if (userId && mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).populate('membershipTier');
      if (user && user.membershipTier) {
        customOrderDiscount = user.membershipTier.customOrderDiscount;
        discountReason = 'membership';
      }
    }

    // Calculate base customization cost
    const customizationCost = baseCost * complexityMultiplier;

    // Apply custom order discount
    const discountApplied = (customizationCost * customOrderDiscount) / 100;
    const finalPrice = customizationCost - discountApplied;

    return {
      baseCost,
      complexityMultiplier,
      customizationCost,
      discountApplied,
      discountPercentage: customOrderDiscount,
      discountReason,
      finalPrice,
      advancePercentage: 50, // 50% advance required
      advanceAmount: finalPrice * 0.5,
      remainingAmount: finalPrice * 0.5,
    };
  } catch (error) {
    throw new Error(`Error calculating custom order price: ${error.message}`);
  }
};

/**
 * Get all membership tiers with their pricing
 * @returns {Array} - List of membership tiers
 */
const getMembershipTiers = async () => {
  const tiers = await MembershipTier.find({ isActive: true }).sort({ position: 1 });
  return tiers;
};

/**
 * Apply a coupon discount to order total
 * @param {Number} orderTotal - Current order total
 * @param {String} couponCode - Coupon code
 * @returns {Object} - { isValid, discountAmount, finalTotal, message }
 */
const applyCoupon = (orderTotal, couponCode) => {
  // This is a placeholder - in production, validate against coupon database
  const coupons = {
    'WELCOME10': { discount: 10, minAmount: 1000 },
    'FESTIVAL20': { discount: 20, minAmount: 5000 },
    'VIP30': { discount: 30, minAmount: 10000 },
  };

  const coupon = coupons[couponCode];

  if (!coupon) {
    return {
      isValid: false,
      message: 'Invalid coupon code',
      discountAmount: 0,
      finalTotal: orderTotal,
    };
  }

  if (orderTotal < coupon.minAmount) {
    return {
      isValid: false,
      message: `Minimum order amount ${coupon.minAmount} required for this coupon`,
      discountAmount: 0,
      finalTotal: orderTotal,
    };
  }

  const discountAmount = (orderTotal * coupon.discount) / 100;
  const finalTotal = orderTotal - discountAmount;

  return {
    isValid: true,
    discountPercentage: coupon.discount,
    discountAmount,
    finalTotal,
    message: `Coupon applied successfully!`,
  };
};

module.exports = {
  calculateProductPrice,
  calculateOrderTotal,
  calculateCustomOrderPrice,
  getMembershipTiers,
  applyCoupon,
};
