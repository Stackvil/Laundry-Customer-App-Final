const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Webhook route should be public (before protect middleware)
// @route   POST /api/payments/webhook
// @desc    Razorpay webhook handler
// @access  Public (Razorpay calls this)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    // Verify webhook signature
    const text = req.body.toString();
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = JSON.parse(req.body);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Payment successful
        const payment = event.payload.payment.entity;
        const order = await Order.findOne({ razorpayPaymentId: payment.id });
        if (order) {
          order.paymentStatus = 'completed';
          await order.save();

          // Emit real-time update
          const io = req.app.get('io');
          if (io) {
            io.to(`user-${order.user}`).emit('payment-success', {
              orderId: order._id,
              message: 'Payment successful!'
            });
          }
        }
        break;

      case 'payment.failed':
        // Payment failed
        const failedPayment = event.payload.payment.entity;
        const failedOrder = await Order.findOne({ razorpayPaymentId: failedPayment.id });
        if (failedOrder) {
          failedOrder.paymentStatus = 'failed';
          await failedOrder.save();
        }
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// All other routes require authentication
router.use(protect);

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        orderId: orderId || '',
        userId: req.user._id.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // If orderId provided, update the order with Razorpay order ID
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        razorpayOrderId: razorpayOrder.id
      });
    }

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', async (req, res) => {
  try {
    const { orderId, paymentId, signature, razorpayOrderId } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, and Signature are required'
      });
    }

    // Verify signature
    const text = `${razorpayOrderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update order with payment details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update order payment status
    order.paymentStatus = 'completed';
    order.paymentId = paymentId;
    order.razorpayPaymentId = paymentId;
    order.razorpaySignature = signature;
    order.paymentMethod = 'Razorpay';
    await order.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user._id}`).emit('payment-success', {
        orderId: order._id,
        message: 'Payment successful!'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});


module.exports = router;
