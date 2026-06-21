const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new AppError('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 503);
  }

  return { keyId, keySecret };
};

const getRazorpayClient = () => {
  const { keyId, keySecret } = getRazorpayCredentials();
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const createRazorpayOrder = async (payload) => {
  try {
    const client = getRazorpayClient();
    return await client.orders.create(payload);
  } catch (error) {
    const statusCode = Number(error?.statusCode || error?.status || 0);
    const message = String(error?.error?.description || error?.description || error?.message || 'Razorpay order creation failed.');

    if (statusCode === 401 || /unauthori[sz]ed|authentication/i.test(message)) {
      throw new AppError(message, 401);
    }

    throw new AppError(message, statusCode >= 400 ? statusCode : 500);
  }
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const { keySecret } = getRazorpayCredentials();
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(signature || '', 'hex');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

const handleCreateOrder = async (req, res) => {
  const amount = Number(req.body.amount);
  const currency = String(req.body.currency || 'INR').toUpperCase();
  const receipt = String(req.body.receipt || `hos_${Date.now()}`).slice(0, 40);
  const notes = req.body.notes && typeof req.body.notes === 'object' ? req.body.notes : {};

  if (!Number.isFinite(amount) || amount < 100) {
    throw new AppError('A valid payment amount is required.', 400);
  }

  if (currency !== 'INR') {
    throw new AppError('Only INR payments are supported for this storefront.', 400);
  }

  const order = await createRazorpayOrder({
    amount: Math.round(amount),
    currency,
    receipt,
    notes,
  });

  res.json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    order,
  });
};

const handleVerifyPayment = async (req, res) => {
  const orderId = String(req.body.razorpay_order_id || '').trim();
  const paymentId = String(req.body.razorpay_payment_id || '').trim();
  const signature = String(req.body.razorpay_signature || '').trim();

  if (!orderId || !paymentId || !signature) {
    throw new AppError('Razorpay payment verification details are missing.', 400);
  }

  if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
    throw new AppError('Razorpay payment signature could not be verified.', 400);
  }

  res.json({
    success: true,
    orderId,
    paymentId,
  });
};

router.post(['/razorpay-order', '/create-order'], handleCreateOrder);
router.post(['/razorpay-verify', '/verify-payment'], handleVerifyPayment);

router.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Only Razorpay order creation and verification are enabled in the static/no-Mongo build.',
  });
});

module.exports = router;
module.exports.handleCreateOrder = handleCreateOrder;
module.exports.handleVerifyPayment = handleVerifyPayment;
