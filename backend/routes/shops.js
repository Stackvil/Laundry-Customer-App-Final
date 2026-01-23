const express = require('express');
const Shop = require('../models/Shop');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/shops
// @desc    Get all shops (with optional location filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    let query = { isActive: true };

    // If location provided, find nearby shops
    if (latitude && longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      };
    }

    const shops = await Shop.find(query)
      .populate('services', 'name icon priceMultiplier')
      .select('-owner')
      .sort({ rating: -1 });

    // Calculate distance if location provided
    let shopsWithDistance = shops;
    if (latitude && longitude) {
      shopsWithDistance = shops.map(shop => {
        const shopObj = shop.toObject();
        if (shop.location && shop.location.coordinates) {
          // Calculate distance (simplified - in production use proper distance calculation)
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            shop.location.coordinates[1],
            shop.location.coordinates[0]
          );
          shopObj.distance = `${(distance / 1000).toFixed(1)} km`;
        }
        return shopObj;
      });
    }

    res.json({
      success: true,
      count: shopsWithDistance.length,
      data: { shops: shopsWithDistance }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/shops/:id
// @desc    Get single shop by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('services', 'name icon priceMultiplier description')
      .select('-owner');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      data: { shop }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Helper function to calculate distance (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = router;
