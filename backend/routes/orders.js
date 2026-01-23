const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Shop = require('../models/Shop');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { shopId, address, mobileNumber, paymentMethod, notes } = req.body;

    if (!shopId || !address || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Shop ID, address, and mobile number are required'
      });
    }

    // Get shop
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.item')
      .populate('items.services');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = cart.items.map(cartItem => {
      const itemTotal = cartItem.price * cartItem.quantity;
      subtotal += itemTotal;

      return {
        item: cartItem.item._id,
        itemName: cartItem.itemName,
        services: cartItem.services.map(s => s._id),
        serviceNames: cartItem.services.map(s => s.name),
        quantity: cartItem.quantity,
        pricePerItem: cartItem.price,
        totalPrice: itemTotal,
        images: cartItem.images || []
      };
    });

    const serviceFee = 2.0;
    const deliveryFee = 0;
    const total = subtotal + serviceFee + deliveryFee;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      shop: shopId,
      items: orderItems,
      address,
      mobileNumber,
      subtotal,
      serviceFee,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'pending' : 'pending',
      notes: notes || ''
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      order: order._id,
      title: 'Order Placed',
      message: `Your order ${order.orderNumber} has been placed successfully!`,
      type: 'order'
    });

    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user._id}`).emit('new-order', {
        order: order,
        message: 'Your order has been placed successfully!'
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('shop', 'name address phone')
      .populate('items.item', 'name icon')
      .populate('items.services', 'name');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('shop', 'name address phone image')
      .populate('items.item', 'name icon')
      .populate('items.services', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('shop', 'name address phone image')
      .populate('items.item', 'name icon basePrice')
      .populate('items.services', 'name priceMultiplier');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (for admin/shop owner)
// @access  Private
router.put('/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is order owner or admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'shop_owner') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.status = status;
    if (note) {
      order.statusHistory.push({
        status,
        note,
        timestamp: new Date()
      });
    }

    await order.save();

    // Create notification
    await Notification.create({
      user: order.user,
      order: order._id,
      title: 'Order Status Updated',
      message: `Your order ${order.orderNumber} status has been updated to ${status}`,
      type: 'order'
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${order.user}`).emit('order-status-update', {
        orderId: order._id,
        status: status,
        message: `Order status updated to ${status}`
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    order.status = 'Cancelled';
    await order.save();

    // Create notification
    await Notification.create({
      user: req.user._id,
      order: order._id,
      title: 'Order Cancelled',
      message: `Your order ${order.orderNumber} has been cancelled`,
      type: 'order'
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
