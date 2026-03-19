const express = require('express');
const {
  getAllUsers,
  deleteUser,
  getAllDonations,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes are protected and require admin role
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/donations', getAllDonations);
router.get('/stats', getDashboardStats);

module.exports = router;
