const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Wedding Wear', 'Party Wear', 'Casual Wear', 'Formal Wear', 'Festival Wear', 'Tailored'],
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      enum: ['Wedding', 'Party', 'Everyday', 'Festive'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    badge: String, // Best Seller, New Drop, Easy Wear, Festival Edit, etc.
    sizes: [
      {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Made to Measure'],
      },
    ],
    images: [
      {
        url: String,
        altText: String,
      },
    ],
    palette: String, // CSS gradient for UI representation
    stock: {
      type: Number,
      default: null, // null = unlimited
    },
    colors: [String],
    materials: [String],
    careInstructions: [String],
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for frequent queries
productSchema.index({ category: 1, audience: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
