const mongoose = require('mongoose');

const styleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Style name is required'],
      trim: true,
    },
    description: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required'],
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        size: String,
        color: String,
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    category: {
      type: String,
      enum: ['Wedding', 'Party', 'Everyday', 'Festive', 'Custom'],
      default: 'Custom',
    },
    coverImage: String,
    isPublic: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    saves: {
      type: Number,
      default: 0,
    },
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalValue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
styleSchema.index({ userId: 1, createdAt: -1 });
styleSchema.index({ isPublic: 1, isFeatured: 1 });
styleSchema.index({ category: 1 });

module.exports = mongoose.model('Style', styleSchema);
