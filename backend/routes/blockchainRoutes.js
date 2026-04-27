const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getChain, verifyChain } = require('../controllers/blockchainController');

router.get('/:donationId', protect, getChain);
router.get('/:donationId/verify', protect, verifyChain);

module.exports = router;
