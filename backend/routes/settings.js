const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/settings
// @desc    Get user settings/preferences
// @access  Private
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');

    res.json({
      success: true,
      data: { preferences: user.preferences }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/settings/language
// @desc    Update language preference
// @access  Private
router.put('/language', async (req, res) => {
  try {
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language is required'
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      'preferences.language': language
    });

    res.json({
      success: true,
      message: 'Language preference updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/settings/notifications
// @desc    Update notification preferences
// @access  Private
router.put('/notifications', async (req, res) => {
  try {
    const { push, email, marketing } = req.body;

    const updateData = {};
    if (push !== undefined) updateData['preferences.notifications.push'] = push;
    if (email !== undefined) updateData['preferences.notifications.email'] = email;
    if (marketing !== undefined) updateData['preferences.notifications.marketing'] = marketing;

    await User.findByIdAndUpdate(req.user._id, { $set: updateData });

    res.json({
      success: true,
      message: 'Notification preferences updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/settings/privacy
// @desc    Update privacy settings
// @access  Private
router.put('/privacy', async (req, res) => {
  try {
    const { dataSharing, analytics, locationTracking, profileVisibility } = req.body;

    const updateData = {};
    if (dataSharing !== undefined) updateData['preferences.privacy.dataSharing'] = dataSharing;
    if (analytics !== undefined) updateData['preferences.privacy.analytics'] = analytics;
    if (locationTracking !== undefined) updateData['preferences.privacy.locationTracking'] = locationTracking;
    if (profileVisibility !== undefined) updateData['preferences.privacy.profileVisibility'] = profileVisibility;

    await User.findByIdAndUpdate(req.user._id, { $set: updateData });

    res.json({
      success: true,
      message: 'Privacy settings updated'
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
