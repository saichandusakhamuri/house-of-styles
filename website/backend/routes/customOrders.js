const express = require('express');
const mongoose = require('mongoose');
const CustomOrder = require('../models/CustomOrder');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validateCustomOrderCreate, validateId, validatePagination, handleValidationErrors } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');
const { calculateCustomOrderPrice } = require('../services/pricing');

const DEMO_CUSTOM_ORDERS = [];
const router = express.Router();

/**
 * POST /api/custom-orders
 * Create a new custom order inquiry
 */
router.post('/', authenticate, validateCustomOrderCreate, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, desiredDate, estimatedBudget, referenceImages, fabricPreference, colorPreferences, measurements } = req.body;

    if (mongoose.connection.readyState !== 1 || req.user?.isDemoUser) {
      const demoOrder = {
        _id: `demo_custom_${Date.now()}`,
        title,
        description,
        desiredDate,
        estimatedBudget,
        referenceImages: referenceImages || [],
        fabricPreference: fabricPreference || [],
        colorPreferences: colorPreferences || [],
        measurements: measurements || {},
        userId: req.userId,
        status: 'inquiry',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      DEMO_CUSTOM_ORDERS.unshift(demoOrder);

      return res.status(201).json({
        success: true,
        message: 'Custom order inquiry created successfully (demo mode)',
        data: demoOrder,
      });
    }

    const customOrder = new CustomOrder({
      userId: req.userId,
      title,
      description,
      desiredDate,
      estimatedBudget,
      referenceImages,
      fabricPreference,
      colorPreferences,
      measurements,
      status: 'inquiry',
    });

    await customOrder.save();

    res.status(201).json({
      success: true,
      message: 'Custom order inquiry created successfully',
      data: customOrder,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/custom-orders
 * Get all custom orders for authenticated user
 */
router.get('/', authenticate, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    if (mongoose.connection.readyState !== 1 || req.user?.isDemoUser) {
      let orders = DEMO_CUSTOM_ORDERS.filter((order) => order.userId === req.userId);
      if (status) {
        orders = orders.filter((order) => order.status === status);
      }

      const start = (parseInt(page) - 1) * parseInt(limit);
      const paginatedOrders = orders.slice(start, start + parseInt(limit));

      return res.json({
        success: true,
        data: paginatedOrders,
        pagination: {
          total: orders.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(orders.length / parseInt(limit)),
        },
      });
    }

    const filter = { userId: req.userId };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const customOrders = await CustomOrder.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('assignedDesigner', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await CustomOrder.countDocuments(filter);

    res.json({
      success: true,
      data: customOrders,
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
 * GET /api/custom-orders/:id
 * Get a specific custom order
 */
router.get('/:id', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1 || req.user?.isDemoUser) {
      const customOrder = DEMO_CUSTOM_ORDERS.find((order) => order._id === req.params.id);
      if (!customOrder) {
        throw new AppError('Custom order not found', 404);
      }

      if (customOrder.userId !== req.userId && req.userRole !== 'admin') {
        throw new AppError('Access denied', 403);
      }

      return res.json({
        success: true,
        data: customOrder,
      });
    }

    const customOrder = await CustomOrder.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('assignedDesigner', 'firstName lastName email')
      .populate('quotedBy', 'firstName lastName');

    if (!customOrder) {
      throw new AppError('Custom order not found', 404);
    }

    // Check if user owns this custom order or is admin
    if (customOrder.userId.toString() !== req.userId && req.userRole !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: customOrder,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/custom-orders/:id/quote
 * Generate a quote for custom order (Admin/Designer)
 */
router.post('/:id/quote', authenticate, isAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { baseCost, complexity } = req.body;

    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      throw new AppError('Custom order not found', 404);
    }

    // Calculate pricing
    const complexityMultiplier = {
      simple: 1,
      moderate: 1.5,
      complex: 2,
    }[complexity] || 1.5;

    const pricing = await calculateCustomOrderPrice(baseCost, complexityMultiplier, customOrder.userId);

    // Update custom order with quote
    customOrder.quotedPrice = pricing.finalPrice;
    customOrder.quotedDate = new Date();
    customOrder.quotedBy = req.userId;
    customOrder.complexity = complexity;
    customOrder.status = 'quoted';
    customOrder.advanceAmount = pricing.advanceAmount;
    customOrder.remainingAmount = pricing.remainingAmount;

    await customOrder.save();

    // TODO: Emit Socket.IO event
    const io = require('../server').io;
    io.to(`user-${customOrder.userId}`).emit('customOrderQuoted', {
      customOrderId: customOrder._id,
      quotedPrice: pricing.finalPrice,
    });

    res.json({
      success: true,
      message: 'Quote generated successfully',
      data: customOrder,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/custom-orders/:id/accept
 * Accept a quoted custom order
 */
router.post('/:id/accept', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      throw new AppError('Custom order not found', 404);
    }

    if (customOrder.userId.toString() !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    if (customOrder.status !== 'quoted') {
      throw new AppError('Custom order is not in quoted status', 400);
    }

    customOrder.status = 'accepted';
    await customOrder.save();

    res.json({
      success: true,
      message: 'Custom order accepted successfully',
      data: customOrder,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/custom-orders/:id/reject
 * Reject a quoted custom order
 */
router.post('/:id/reject', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      throw new AppError('Custom order not found', 404);
    }

    if (customOrder.userId.toString() !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    customOrder.status = 'rejected';
    customOrder.rejectionReason = rejectionReason;
    await customOrder.save();

    res.json({
      success: true,
      message: 'Custom order rejected',
      data: customOrder,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/custom-orders/:id/communicate
 * Add communication message
 */
router.post('/:id/communicate', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { message, attachments } = req.body;

    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      throw new AppError('Custom order not found', 404);
    }

    // Determine sender role
    let senderRole = 'user';
    if (req.userRole === 'admin') {
      senderRole = customOrder.assignedDesigner ? 'designer' : 'admin';
    }

    customOrder.communication.push({
      senderRole,
      message,
      attachments,
    });

    await customOrder.save();

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: customOrder,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * PUT /api/custom-orders/:id/status
 * Update custom order status (Admin only)
 */
router.put('/:id/status', authenticate, isAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { status, assignedDesigner } = req.body;

    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      throw new AppError('Custom order not found', 404);
    }

    customOrder.status = status;
    if (assignedDesigner) {
      customOrder.assignedDesigner = assignedDesigner;
    }

    await customOrder.save();

    res.json({
      success: true,
      message: 'Custom order status updated',
      data: customOrder,
    });
  } catch (error) {
    throw error;
  }
});

module.exports = router;
