const express = require('express');
const Product = require('../models/Product');
const { authenticate, optionalAuth, isAdmin } = require('../middleware/auth');
const { validateProductCreate, validateId, validatePagination, handleValidationErrors } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');
const { calculateProductPrice } = require('../services/pricing');

const router = express.Router();

/**
 * GET /api/products
 * Get all products with pagination, filtering, and search
 */
router.get('/', validatePagination, handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, audience, search, isFeatured } = req.query;

    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (audience) {
      filter.audience = audience;
    }

    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const query = Product.find(filter);
    const skip = (page - 1) * limit;
    const products = await query.skip(skip).limit(parseInt(limit)).lean();

    // Apply membership-based pricing
    const productsWithPricing = await Promise.all(
      products.map(async (product) => {
        const pricing = await calculateProductPrice(product.basePrice, req.userId);
        return {
          ...product,
          basePrice: pricing.basePrice,
          finalPrice: pricing.finalPrice,
          discountApplied: pricing.discountApplied,
          discountPercentage: pricing.discountPercentage,
        };
      })
    );

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: productsWithPricing,
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

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', validateId, handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'firstName lastName');

    if (!product || !product.isActive) {
      throw new AppError('Product not found', 404);
    }

    // Apply membership-based pricing
    const pricing = await calculateProductPrice(product.basePrice, req.userId);

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        basePrice: pricing.basePrice,
        finalPrice: pricing.finalPrice,
        discountApplied: pricing.discountApplied,
        discountPercentage: pricing.discountPercentage,
      },
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/products
 * Create a new product (Admin only)
 */
router.post('/', authenticate, isAdmin, validateProductCreate, handleValidationErrors, async (req, res) => {
  try {
    const { name, description, category, audience, basePrice, sizes, badge, images, palette, colors, materials } = req.body;

    const product = new Product({
      name,
      description,
      category,
      audience,
      basePrice,
      sizes,
      badge,
      images,
      palette,
      colors,
      materials,
      createdBy: req.userId,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * PUT /api/products/:id
 * Update a product (Admin only)
 */
router.put('/:id', authenticate, isAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * DELETE /api/products/:id
 * Soft delete a product (Admin only)
 */
router.delete('/:id', authenticate, isAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/products/:id/reviews
 * Add a review to a product
 */
router.post('/:id/reviews', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const review = {
      userId: req.userId,
      rating,
      comment,
    };

    product.reviews.push(review);

    // Update average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: product,
    });
  } catch (error) {
    throw error;
  }
});

module.exports = router;
