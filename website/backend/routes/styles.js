const express = require('express');
const Style = require('../models/Style');
const Product = require('../models/Product');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateId, validatePagination, handleValidationErrors } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * POST /api/styles
 * Create a new style
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, items, category, coverImage, isPublic } = req.body;

    const style = new Style({
      userId: req.userId,
      name,
      description,
      items,
      category,
      coverImage,
      isPublic,
    });

    // Calculate total value
    let totalValue = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        totalValue += product.basePrice * (item.quantity || 1);
      }
    }
    style.totalValue = totalValue;

    await style.save();
    await style.populate('items.productId');

    res.status(201).json({
      success: true,
      message: 'Style created successfully',
      data: style,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/styles
 * Get all public styles or user's private styles with pagination
 */
router.get('/', validatePagination, handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isFeatured } = req.query;

    const filter = {};

    // If user is authenticated, show their private styles too
    if (req.userId) {
      filter.$or = [
        { isPublic: true },
        { userId: req.userId },
      ];
    } else {
      filter.isPublic = true;
    }

    if (category) {
      filter.category = category;
    }

    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }

    const skip = (page - 1) * limit;
    const styles = await Style.find(filter)
      .populate('userId', 'firstName lastName profileImage')
      .populate('items.productId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Style.countDocuments(filter);

    res.json({
      success: true,
      data: styles,
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
 * GET /api/styles/:id
 * Get a specific style
 */
router.get('/:id', validateId, handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const style = await Style.findById(req.params.id)
      .populate('userId', 'firstName lastName profileImage')
      .populate('items.productId')
      .populate('likedBy', 'firstName lastName')
      .populate('savedBy', 'firstName lastName')
      .populate('comments.userId', 'firstName lastName profileImage');

    if (!style) {
      throw new AppError('Style not found', 404);
    }

    // Check access permissions
    if (!style.isPublic && (!req.userId || style.userId.toString() !== req.userId)) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: style,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * PUT /api/styles/:id
 * Update a style
 */
router.put('/:id', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const style = await Style.findById(req.params.id);

    if (!style) {
      throw new AppError('Style not found', 404);
    }

    if (style.userId.toString() !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    const { name, description, items, category, coverImage, isPublic } = req.body;

    if (name) style.name = name;
    if (description) style.description = description;
    if (items) style.items = items;
    if (category) style.category = category;
    if (coverImage) style.coverImage = coverImage;
    if (isPublic !== undefined) style.isPublic = isPublic;

    // Recalculate total value if items changed
    if (items) {
      let totalValue = 0;
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product) {
          totalValue += product.basePrice * (item.quantity || 1);
        }
      }
      style.totalValue = totalValue;
    }

    await style.save();
    await style.populate('items.productId');

    res.json({
      success: true,
      message: 'Style updated successfully',
      data: style,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * DELETE /api/styles/:id
 * Delete a style
 */
router.delete('/:id', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const style = await Style.findById(req.params.id);

    if (!style) {
      throw new AppError('Style not found', 404);
    }

    if (style.userId.toString() !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    await Style.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Style deleted successfully',
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/styles/:id/like
 * Like a style
 */
router.post('/:id/like', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const style = await Style.findById(req.params.id);

    if (!style) {
      throw new AppError('Style not found', 404);
    }

    // Check if already liked
    if (style.likedBy.includes(req.userId)) {
      throw new AppError('You already liked this style', 400);
    }

    style.likedBy.push(req.userId);
    style.likes = style.likedBy.length;

    await style.save();

    res.json({
      success: true,
      message: 'Style liked successfully',
      data: style,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/styles/:id/unlike
 * Unlike a style
 */
router.post('/:id/unlike', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const style = await Style.findById(req.params.id);

    if (!style) {
      throw new AppError('Style not found', 404);
    }

    if (!style.likedBy.includes(req.userId)) {
      throw new AppError('You have not liked this style', 400);
    }

    style.likedBy = style.likedBy.filter(id => id.toString() !== req.userId);
    style.likes = style.likedBy.length;

    await style.save();

    res.json({
      success: true,
      message: 'Style unliked successfully',
      data: style,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/styles/:id/save
 * Save a style
 */
router.post('/:id/save', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const style = await Style.findById(req.params.id);

    if (!style) {
      throw new AppError('Style not found', 404);
    }

    if (style.savedBy.includes(req.userId)) {
      throw new AppError('You already saved this style', 400);
    }

    style.savedBy.push(req.userId);
    style.saves = style.savedBy.length;

    await style.save();

    res.json({
      success: true,
      message: 'Style saved successfully',
      data: style,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/styles/:id/unsave
 * Unsave a style
 */
router.post('/:id/unsave', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const style = await Style.findById(req.params.id);

    if (!style) {
      throw new AppError('Style not found', 404);
    }

    if (!style.savedBy.includes(req.userId)) {
      throw new AppError('You have not saved this style', 400);
    }

    style.savedBy = style.savedBy.filter(id => id.toString() !== req.userId);
    style.saves = style.savedBy.length;

    await style.save();

    res.json({
      success: true,
      message: 'Style unsaved successfully',
      data: style,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/styles/:id/comment
 * Add a comment to a style
 */
router.post('/:id/comment', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      throw new AppError('Comment text is required', 400);
    }

    const style = await Style.findById(req.params.id);

    if (!style) {
      throw new AppError('Style not found', 404);
    }

    style.comments.push({
      userId: req.userId,
      text,
    });

    await style.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: style,
    });
  } catch (error) {
    throw error;
  }
});

module.exports = router;
