const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { authenticate, optionalAuth, isAdmin } = require('../middleware/auth');
const { validateProductCreate, validateId, validatePagination, handleValidationErrors } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');
const { calculateProductPrice } = require('../services/pricing');

const DEMO_PRODUCTS = [
  {
    _id: 'demo1',
    name: 'Classic Navy Blazer',
    description: 'Tailored fit navy blue blazer for professional settings.',
    category: 'Formal Wear',
    audience: 'Everyday',
    basePrice: 4500,
    isActive: true,
    isFeatured: true,
    badge: 'Bestseller',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy Blue'],
    palette: 'linear-gradient(135deg, #2c3e50, #000000)',
  },
  {
    _id: 'demo2',
    name: 'Regal Wedding Sherwani',
    description: 'Gold embroidered sherwani for premium wedding styling.',
    category: 'Wedding Wear',
    audience: 'Wedding',
    basePrice: 12500,
    isActive: true,
    isFeatured: true,
    badge: 'Premium',
    sizes: ['M', 'L', 'XL'],
    colors: ['Gold', 'Cream'],
    palette: 'linear-gradient(135deg, #d4af37, #8b4513)',
  },
  {
    _id: 'demo3',
    name: 'Elegant Evening Gown',
    description: 'Flowing silk dress designed for evening movement.',
    category: 'Party Wear',
    audience: 'Party',
    basePrice: 8900,
    isActive: true,
    isFeatured: true,
    badge: 'New',
    sizes: ['XS', 'S', 'M'],
    colors: ['Emerald Green', 'Midnight Black'],
    palette: 'linear-gradient(135deg, #004d40, #000000)',
  },
  {
    _id: 'demo4',
    name: 'Casual Linen Shirt',
    description: 'Breathable linen shirt for relaxed everyday comfort.',
    category: 'Casual Wear',
    audience: 'Everyday',
    basePrice: 2200,
    isActive: true,
    isFeatured: false,
    badge: 'Essentials',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Beige'],
    palette: 'linear-gradient(135deg, #f5f5f5, #bdbdbd)',
  },
  {
    _id: 'demo5',
    name: 'Festive Silk Kurta Set',
    description: 'A polished silk kurta set with festive detailing and all-day comfort.',
    category: 'Formal Wear',
    audience: 'Festive',
    basePrice: 6800,
    isActive: true,
    isFeatured: true,
    badge: 'Festive',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Maroon', 'Ivory'],
    palette: 'linear-gradient(135deg, #7f1d1d, #f5d0a9)',
  },
  {
    _id: 'demo6',
    name: 'Tailored Tuxedo Edit',
    description: 'Made-to-measure evening tuxedo styling for receptions and black-tie events.',
    category: 'Tailored',
    audience: 'Party',
    basePrice: 18500,
    isActive: true,
    isFeatured: true,
    badge: 'Custom',
    sizes: ['Made to Measure'],
    colors: ['Black', 'Ivory'],
    palette: 'linear-gradient(135deg, #111827, #9ca3af)',
  },
  {
    _id: 'demo7',
    name: 'Everyday Co-ord Set',
    description: 'Relaxed matching separates with a clean silhouette for daily wear.',
    category: 'Casual Wear',
    audience: 'Everyday',
    basePrice: 3200,
    isActive: true,
    isFeatured: false,
    badge: 'Easy Wear',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Sage', 'Cream'],
    palette: 'linear-gradient(135deg, #8ea58c, #f7efe5)',
  },
  {
    _id: 'demo8',
    name: 'Embroidered Reception Lehenga',
    description: 'Detailed lehenga with contemporary sparkle for wedding receptions.',
    category: 'Wedding Wear',
    audience: 'Wedding',
    basePrice: 24500,
    isActive: true,
    isFeatured: true,
    badge: 'Signature',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Rose Gold', 'Champagne'],
    palette: 'linear-gradient(135deg, #b76e79, #f8e4c9)',
  },
];

const getDemoProducts = ({ category, audience, search, isFeatured, page, limit }) => {
  let filtered = DEMO_PRODUCTS.filter((product) => product.isActive);

  if (category) filtered = filtered.filter((product) => product.category === category);
  if (audience) filtered = filtered.filter((product) => product.audience === audience);
  if (isFeatured === 'true') filtered = filtered.filter((product) => product.isFeatured === true);
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.audience.toLowerCase().includes(term)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const products = filtered.slice(start, start + limit);

  return { products, total };
};

const router = express.Router();

/**
 * GET /api/products
 * Get all products with pagination, filtering, and search
 */
router.get('/', validatePagination, handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, audience, search, isFeatured } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const { products, total } = getDemoProducts({ category, audience, search, isFeatured, page: parseInt(page), limit: parseInt(limit) });
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

      return res.json({
        success: true,
        data: productsWithPricing,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    }

    const activeTotal = await Product.countDocuments({ isActive: true });

    if (activeTotal === 0) {
      const { products, total } = getDemoProducts({ category, audience, search, isFeatured, page: parseInt(page), limit: parseInt(limit) });
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

      return res.json({
        success: true,
        data: productsWithPricing,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    }

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

    let query = Product.find(filter);

    if (search) {
      query = query.find({ $text: { $search: search } });
    }

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
    if (mongoose.connection.readyState !== 1) {
      const product = DEMO_PRODUCTS.find((item) => item._id === req.params.id);

      if (!product || !product.isActive) {
        throw new AppError('Product not found', 404);
      }

      const pricing = await calculateProductPrice(product.basePrice, req.userId);

      return res.json({
        success: true,
        data: {
          ...product,
          basePrice: pricing.basePrice,
          finalPrice: pricing.finalPrice,
          discountApplied: pricing.discountApplied,
          discountPercentage: pricing.discountPercentage,
        },
      });
    }

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
