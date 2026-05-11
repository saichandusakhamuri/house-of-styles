const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validateOrderCreate, validateId, validatePagination, handleValidationErrors } = require('../middleware/validation');
const { AppError } = require('../middleware/errorHandler');
const { calculateOrderTotal, applyCoupon } = require('../services/pricing');

const router = express.Router();

const DEMO_PRODUCT_PRICES = {
  1: 4500,
  2: 12500,
  3: 8900,
  4: 2200,
  mock1: 4500,
  mock2: 12500,
  mock3: 8900,
  mock4: 2200,
};

const DEMO_ORDERS = [];

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', authenticate, validateOrderCreate, handleValidationErrors, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, couponCode } = req.body;

    if (mongoose.connection.readyState !== 1 || req.user?.isDemoUser) {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        priceAtPurchase: DEMO_PRODUCT_PRICES[item.productId] || 1000,
      }));
      const pricing = await calculateOrderTotal(orderItems, req.userId, 100, 5);
      const order = {
        _id: `demo_order_${Date.now()}`,
        orderNumber: `DEMO-${Date.now()}`,
        userId: req.userId,
        items: orderItems,
        subtotal: pricing.subtotal,
        discountApplied: pricing.discountApplied,
        discountReason: pricing.discountReason,
        tax: pricing.tax,
        shippingCost: pricing.shippingCost,
        totalAmount: pricing.totalAmount,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        orderStatus: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      DEMO_ORDERS.unshift(order);
      return res.status(201).json({
        success: true,
        message: 'Order created successfully (demo mode)',
        data: order,
      });
    }

    // Validate products exist and get prices
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        priceAtPurchase: product.basePrice,
      });
    }

    // Calculate order total with pricing
    const pricing = await calculateOrderTotal(orderItems, req.userId, 100, 5); // 100 is shipping, 5% tax

    let finalTotal = pricing.totalAmount;
    let discountDetails = {
      reason: pricing.discountReason,
      amount: pricing.discountApplied,
    };

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = applyCoupon(pricing.subtotal, couponCode);
      if (couponResult.isValid) {
        finalTotal = couponResult.finalTotal;
        discountDetails.couponDiscount = couponResult.discountAmount;
      }
    }

    // Create order
    const order = new Order({
      userId: req.userId,
      items: orderItems,
      subtotal: pricing.subtotal,
      discountApplied: discountDetails.amount,
      discountReason: discountDetails.reason,
      tax: pricing.tax,
      shippingCost: pricing.shippingCost,
      totalAmount: finalTotal,
      shippingAddress: {
        firstName: shippingAddress.firstName || '',
        lastName: shippingAddress.lastName || '',
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
      },
      billingAddress: billingAddress || shippingAddress,
    });

    await order.save();

    // Populate product details
    await order.populate('items.productId');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/orders
 * Get all orders for authenticated user
 */
router.get('/', authenticate, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    if (mongoose.connection.readyState !== 1 || req.user?.isDemoUser) {
      let orders = DEMO_ORDERS.filter((order) => order.userId === req.userId);
      if (status) {
        orders = orders.filter((order) => order.orderStatus === status);
      }

      const start = (parseInt(page) - 1) * parseInt(limit);
      return res.json({
        success: true,
        data: orders.slice(start, start + parseInt(limit)),
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
      filter.orderStatus = status;
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .populate('items.productId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
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
 * GET /api/orders/:id
 * Get a specific order by ID
 */
router.get('/:id', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1 || req.user?.isDemoUser) {
      const order = DEMO_ORDERS.find((order) => order._id === req.params.id);
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      if (order.userId !== req.userId && req.userRole !== 'admin') {
        throw new AppError('Access denied', 403);
      }
      return res.json({
        success: true,
        data: order,
      });
    }

    const order = await Order.findById(req.params.id).populate('items.productId');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.userId && req.userRole !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * PUT /api/orders/:id
 * Update order status (Admin only)
 */
router.put('/:id', authenticate, isAdmin, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { orderStatus, trackingNumber, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, trackingNumber, notes },
      { new: true, runValidators: true }
    ).populate('items.productId');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // TODO: Emit Socket.IO event for real-time notification
    const io = require('../server').io;
    io.to(`user-${order.userId}`).emit('orderStatusUpdated', {
      orderId: order._id,
      status: order.orderStatus,
      trackingNumber: order.trackingNumber,
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/orders/:id/cancel
 * Cancel an order
 */
router.post('/:id/cancel', authenticate, validateId, handleValidationErrors, async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.userId) {
      throw new AppError('Access denied', 403);
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      throw new AppError(`Cannot cancel order in ${order.orderStatus} status`, 400);
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = cancelReason;
    order.cancelledDate = new Date();
    order.paymentStatus = 'refunded';

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    throw error;
  }
});

module.exports = router;
