const mongoose = require('mongoose');

const membershipTierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Membership tier name is required'],
      unique: true,
      enum: ['Silver', 'Gold', 'Platinum', 'Diamond'],
    },
    description: String,
    discountPercentage: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: 0,
      max: 100,
    },
    features: [
      {
        type: String,
      },
    ],
    annualPrice: {
      type: Number,
      required: [true, 'Annual price is required'],
      min: 0,
    },
    monthlyPrice: {
      type: Number,
      required: [true, 'Monthly price is required'],
      min: 0,
    },
    customOrderDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    prioritySupport: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    earlyAccess: {
      type: Boolean,
      default: false,
    },
    maxCustomOrders: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MembershipTier', membershipTierSchema);
