const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getExpiringDonations, getExpiryStats } = require('../controllers/expiryController');

router.get('/urgent', protect, getExpiringDonations);
router.get('/stats', protect, getExpiryStats);

module.exports = router;
