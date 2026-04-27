const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  updateDonorLocation,
  getDonorLocation,
  getActiveDeliveries,
} = require('../controllers/trackingController');

// Donor updates their live position
router.put('/:donationId/update-location', protect, authorize('donor'), updateDonorLocation);

// Get live location for a specific donation (donor, receiver, or admin)
router.get('/:donationId/location', protect, getDonorLocation);

// Admin: get all active deliveries with live locations
router.get('/active/all', protect, authorize('admin'), getActiveDeliveries);

module.exports = router;
