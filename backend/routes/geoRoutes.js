const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNearbyDonations,
  getSmartMatch,
  geocodeAddress,
  updateUserLocation,
} = require('../controllers/geoController');

router.get('/nearby', protect, getNearbyDonations);
router.get('/smart-match', protect, getSmartMatch);
router.post('/geocode', protect, geocodeAddress);
router.put('/update-location', protect, updateUserLocation);

module.exports = router;
