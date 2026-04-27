const express = require('express');
const {
  requestReceipt,
  getReceiptRequests,
  updateReceiptRequest,
  downloadReceipt,
  exportAllDonations,
  getMyReceiptRequests,
  downloadUserReport
} = require('../controllers/receiptController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/request', requestReceipt);
router.get('/my-requests', getMyReceiptRequests);
router.get('/download-all', downloadUserReport);
router.get('/download/:donationId', downloadReceipt);

// Admin only routes
router.get('/requests', authorize('admin'), getReceiptRequests);
router.put('/requests/:id', authorize('admin'), updateReceiptRequest);
router.get('/export/all', authorize('admin'), exportAllDonations);

module.exports = router;
