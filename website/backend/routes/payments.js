const express = require('express');
const crypto = require('crypto');
const https = require('https');
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

const createRazorpayOrder = (payload) =>
  new Promise((resolve, reject) => {
    let credentials;
    try {
      credentials = getRazorpayCredentials();
    } catch (error) {
      reject(error);
      return;
    }

    const { keyId, keySecret } = credentials;
    const body = JSON.stringify(payload);
    const request = https.request(
      {
        hostname: 'api.razorpay.com',
        path: '/v1/orders',
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          let parsedBody;
          try {
            parsedBody = JSON.parse(responseBody);
          } catch {
            parsedBody = { message: responseBody };
          }

          if (response.statusCode >= 400) {
            reject(new AppError(parsedBody?.error?.description || 'Razorpay order creation failed.', response.statusCode));
            return;
          }

          resolve(parsedBody);
        });
      }
    );

    request.on('error', (error) => {
      reject(new AppError(error.message || 'Razorpay order request failed.', 502));
    });

    request.write(body);
    request.end();
  });

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

router.post('/razorpay-order', async (req, res) => {
  const amount = Number(req.body.amount);
  const currency = String(req.body.currency || 'INR').toUpperCase();
  const receipt = String(req.body.receipt || `hos_${Date.now()}`).slice(0, 40);
  const notes = req.body.notes && typeof req.body.notes === 'object' ? req.body.notes : {};

  if (!Number.isFinite(amount) || amount <= 0) {
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
    order,
  });
});

router.post('/razorpay-verify', async (req, res) => {
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
});

router.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Only Razorpay order creation and verification are enabled in the static/no-Mongo build.',
  });
});

module.exports = router;
