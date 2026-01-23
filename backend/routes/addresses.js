const express = require('express');
const { body, validationResult } = require('express-validator');
const Address = require('../models/Address');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/addresses
// @desc    Get user's addresses
// @access  Private
router.get('/', async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      count: addresses.length,
      data: { addresses }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/addresses
// @desc    Create new address
// @access  Private
router.post('/', [
  body('city').trim().notEmpty().withMessage('City is required'),
  body('pincode').trim().notEmpty().withMessage('Pincode is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('fullAddress').trim().notEmpty().withMessage('Full address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { label, village, area, city, pincode, state, landmark, fullAddress, location } = req.body;

    const address = await Address.create({
      user: req.user._id,
      label: label || 'Home',
      village: village || '',
      area: area || '',
      city,
      pincode,
      state,
      landmark: landmark || '',
      fullAddress,
      location: location || undefined,
      isDefault: false
    });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: { address }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/addresses/:id
// @desc    Update address
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const { label, village, area, city, pincode, state, landmark, fullAddress, location, isDefault } = req.body;

    if (label) address.label = label;
    if (village !== undefined) address.village = village;
    if (area !== undefined) address.area = area;
    if (city) address.city = city;
    if (pincode) address.pincode = pincode;
    if (state) address.state = state;
    if (landmark !== undefined) address.landmark = landmark;
    if (fullAddress) address.fullAddress = fullAddress;
    if (location) address.location = location;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.remove();

    res.json({
      success: true,
      message: 'Address deleted successfully'
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
