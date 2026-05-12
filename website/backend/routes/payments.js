const express = require('express');
const Stripe = require('stripe');
const { authenticate } = require('../middleware/auth');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();
let stripeClient = null;

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new AppError('Stripe is not configured. Set STRIPE_SECRET_KEY before taking card payments.', 503);
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
};

/**
 * POST /api/payments/create-intent
 * Create a Stripe Payment Intent
 */
router.post('/create-intent', authenticate, async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId.toString() !== req.userId) {
    throw new AppError('Access denied', 403);
  }

  // Create a PaymentIntent with the order amount and currency
  const stripe = getStripeClient();
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
 * Initiate a UPI payment
 */
router.post('/upi-initiate', authenticate, async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId.toString() !== req.userId) {
    throw new AppError('Access denied', 403);
  }

  throw new AppError('UPI payment provider is not configured yet.', 503);
});

/**
 * POST /api/payments/confirm
 * Confirm payment success and update order
 */
router.post('/confirm', authenticate, async (req, res) => {
  const { orderId, paymentMethod, transactionId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId.toString() !== req.userId) {
    throw new AppError('Access denied', 403);
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
