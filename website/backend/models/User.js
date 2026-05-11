const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Don't include by default
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: String,
    membershipTier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipTier',
      default: null, // null = free user
    },
    membershipUpgradeDate: Date,
    membershipExpiryDate: Date,
    shippingAddresses: [
      {
        label: String, // Home, Office, etc.
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        isDefault: Boolean,
      },
    ],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      orderUpdates: {
        type: Boolean,
        default: true,
      },
      promotions: {
        type: Boolean,
        default: false,
      },
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    passwordResetCode: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Populate membership tier on query
userSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'membershipTier',
    model: 'MembershipTier',
    select: 'name discountPercentage',
  });
  next();
});

module.exports = mongoose.model('User', userSchema);
