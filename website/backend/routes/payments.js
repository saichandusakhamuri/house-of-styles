const express = require('express');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticate } = require('../middleware/auth');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * POST /api/payments/create-intent
 * Create a Stripe Payment Intent
 */
router.post('/create-intent', authenticate, async (req, res) => {
  const { orderId } = req.body;

  if (mongoose.connection.readyState !== 1 || String(orderId).startsWith('demo_')) {
    return res.json({
      clientSecret: `pi_demo_${Date.now()}_secret_demo`,
    });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId.toString() !== req.userId) {
    throw new AppError('Access denied', 403);
  }

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100), // Stripe expects amount in cents
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId: order._id.toString(),
      userId: req.userId,
    },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
  });
});

/**
 * POST /api/payments/upi-initiate
 * Initiate a UPI payment (Simulated for this demo)
 */
router.post('/upi-initiate', authenticate, async (req, res) => {
  const { orderId, upiId } = req.body;

  if (mongoose.connection.readyState !== 1 || String(orderId).startsWith('demo_')) {
    return res.json({
      success: true,
      message: 'UPI payment initiated in demo mode.',
      vpa: upiId,
      amount: 0,
      transactionReference: `UPI-DEMO-${Date.now()}`
    });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // In a real scenario, you'd integrate with a UPI provider here
  // For this demo, we'll simulate a successful initiation

  res.json({
    success: true,
    message: 'UPI payment initiated. Please complete the payment in your UPI app.',
    vpa: upiId,
    amount: order.totalAmount,
    transactionReference: `UPI-${Date.now()}`
  });
});

/**
 * POST /api/payments/confirm
 * Confirm payment success and update order
 */
router.post('/confirm', authenticate, async (req, res) => {
  const { orderId, paymentMethod, transactionId } = req.body;

  if (mongoose.connection.readyState !== 1 || String(orderId).startsWith('demo_')) {
    return res.json({
      success: true,
      message: 'Payment confirmed in demo mode',
      data: {
        _id: orderId,
        paymentMethod,
        paymentStatus: 'completed',
        transactionId,
        orderStatus: 'confirmed',
      }
    });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.paymentMethod = paymentMethod;
  order.paymentStatus = 'completed';
  order.transactionId = transactionId;
  order.orderStatus = 'confirmed';

  await order.save();

  // Notify via Socket.IO
  const io = req.app.get('io');
  io.to(`user-${order.userId}`).emit('orderConfirmed', {
    orderId: order._id,
    orderNumber: order.orderNumber
  });

  res.json({
    success: true,
    message: 'Payment confirmed and order updated',
    data: order
  });
});

module.exports = router;
