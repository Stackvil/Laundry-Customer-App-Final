const express = require('express');
const Cart = require('../models/Cart');
const Item = require('../models/Item');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.item', 'name icon basePrice unit')
      .populate('items.services', 'name priceMultiplier');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', async (req, res) => {
  try {
    const { itemId, serviceIds, quantity, serviceName } = req.body;

    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required'
      });
    }

    // Get item details
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Calculate price based on services
    let pricePerItem = item.basePrice;
    if (serviceIds && serviceIds.length > 0) {
      const services = await Service.find({ _id: { $in: serviceIds } });
      services.forEach(service => {
        pricePerItem += item.basePrice * service.priceMultiplier;
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if item with same services already exists in cart
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.item.toString() === itemId && 
      cartItem.serviceName === (serviceName || 'Wash & Fold')
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        item: itemId,
        itemName: item.name,
        itemIcon: item.icon,
        services: serviceIds || [],
        serviceName: serviceName || 'Wash & Fold',
        quantity,
        price: pricePerItem,
        unit: item.unit
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.item', 'name icon basePrice unit')
      .populate('items.services', 'name priceMultiplier');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cart: updatedCart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/cart/update/:itemIndex
// @desc    Update cart item quantity
// @access  Private
router.put('/update/:itemIndex', async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemIndex = parseInt(req.params.itemIndex);

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.item', 'name icon basePrice unit')
      .populate('items.services', 'name priceMultiplier');

    res.json({
      success: true,
      message: 'Cart updated',
      data: { cart: updatedCart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/cart/remove/:itemIndex
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:itemIndex', async (req, res) => {
  try {
    const itemIndex = parseInt(req.params.itemIndex);

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.item', 'name icon basePrice unit')
      .populate('items.services', 'name priceMultiplier');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { cart: updatedCart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: { cart }
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
