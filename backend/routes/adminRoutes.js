const express = require('express');
const {
  getAllUsers,
  deleteUser,
  getAllDonations,
  getDashboardStats,
<<<<<<< HEAD
  getAnalyticsData,
  deleteExpiredDonations,
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes are protected and require admin role
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/donations', getAllDonations);
<<<<<<< HEAD
router.delete('/donations/expired', deleteExpiredDonations);
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalyticsData);
=======
router.get('/stats', getDashboardStats);
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda

module.exports = router;
