const express = require('express');
const {
  createDonation,
  getDonations,
  getMyDonations,
  getAvailableDonations,
  getMyRequests,
  requestDonation,
  updateDonationStatus,
  deleteDonation,
  getDonationById,
  getExpiredDonations,
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/expired', protect, authorize('admin'), getExpiredDonations);
router.post('/', protect, authorize('donor'), createDonation);
router.get('/', protect, getDonations);
router.get('/my-donations', protect, authorize('donor'), getMyDonations);
router.get('/available', protect, authorize('receiver'), getAvailableDonations);
router.get('/my-requests', protect, authorize('receiver'), getMyRequests);
router.get('/:id', protect, getDonationById);
router.put('/:id/request', protect, authorize('receiver'), requestDonation);
router.put('/:id/status', protect, authorize('donor', 'admin'), updateDonationStatus);
router.delete('/:id', protect, authorize('donor', 'admin'), deleteDonation);

module.exports = router;
