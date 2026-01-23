const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('mobileNumber').optional().trim().notEmpty().withMessage('Mobile number cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, mobileNumber, address, profileImage } = req.body;

    // Check if email or mobile number already exists (if being changed)
    if (email || mobileNumber) {
      const existingUser = await User.findOne({
        $or: [
          email ? { email, _id: { $ne: req.user._id } } : {},
          mobileNumber ? { mobileNumber, _id: { $ne: req.user._id } } : {}
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email or mobile number already exists'
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (address !== undefined) updateData.address = address;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { language, notifications, privacy } = req.body;

    const updateData = {};
    if (language) updateData['preferences.language'] = language;
    if (notifications) {
      if (notifications.push !== undefined) updateData['preferences.notifications.push'] = notifications.push;
      if (notifications.email !== undefined) updateData['preferences.notifications.email'] = notifications.email;
      if (notifications.marketing !== undefined) updateData['preferences.notifications.marketing'] = notifications.marketing;
    }
    if (privacy) {
      if (privacy.dataSharing !== undefined) updateData['preferences.privacy.dataSharing'] = privacy.dataSharing;
      if (privacy.analytics !== undefined) updateData['preferences.privacy.analytics'] = privacy.analytics;
      if (privacy.locationTracking !== undefined) updateData['preferences.privacy.locationTracking'] = privacy.locationTracking;
      if (privacy.profileVisibility !== undefined) updateData['preferences.privacy.profileVisibility'] = privacy.profileVisibility;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { user }
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
