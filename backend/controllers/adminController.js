const User = require('../models/User');
const Donation = require('../models/Donation');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all donations (admin)
// @route   GET /api/admin/donations
// @access  Private (Admin only)
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({})
<<<<<<< HEAD
      .populate('donor', 'name email phone address')
      .populate('receiver', 'name email phone organization address')
=======
      .populate('donor', 'name email phone')
      .populate('receiver', 'name email phone organization')
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalReceivers = await User.countDocuments({ role: 'receiver' });
    const totalDonations = await Donation.countDocuments();
    const availableDonations = await Donation.countDocuments({ status: 'available' });
    const requestedDonations = await Donation.countDocuments({ status: 'requested' });
    const acceptedDonations = await Donation.countDocuments({ status: 'accepted' });
    const deliveredDonations = await Donation.countDocuments({ status: 'delivered' });
<<<<<<< HEAD
    const expiredDonations = await Donation.countDocuments({ status: 'expired' });
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda

    // Category breakdown
    const categoryStats = await Donation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Recent donations
    const recentDonations = await Donation.find({})
      .populate('donor', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalDonors,
      totalReceivers,
      totalDonations,
      availableDonations,
      requestedDonations,
      acceptedDonations,
      deliveredDonations,
<<<<<<< HEAD
      expiredDonations,
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
      categoryStats,
      recentDonations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

<<<<<<< HEAD
// @desc    Get advanced analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalyticsData = async (req, res) => {
  try {
    // 1. Donation Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const trends = await Donation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { 
        $group: { 
          _id: { $month: '$createdAt' }, 
          count: { $sum: 1 },
          month: { $first: { $month: '$createdAt' } },
          year: { $first: { $year: '$createdAt' } }
        } 
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Format trends for frontend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const donationsByMonth = trends.map(t => ({
      month: monthNames[t._id - 1],
      count: t.count
    }));

    // 2. Waste Reduction Stats (Delivered vs Others)
    const statusStats = await Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 3. Heatmap Data (lat, lng of available & requested locations)
    const heatmapDonations = await Donation.find({
      'location.coordinates': { $exists: true, $ne: [] }
    }).select('location status');

    const heatmapData = heatmapDonations.map(d => ({
      lat: d.location.coordinates[1],
      lng: d.location.coordinates[0],
      intensity: d.status === 'available' ? 0.8 : 0.4 // Red/warm for supply vs demand
    })).filter(loc => loc.lat && loc.lng);

    res.json({
      donationsByMonth,
      statusStats,
      heatmapData
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete all expired donations
// @route   DELETE /api/admin/donations/expired
// @access  Private (Admin only)
const deleteExpiredDonations = async (req, res) => {
  try {
    const result = await Donation.deleteMany({ status: 'expired' });
    res.json({ message: `Removed ${result.deletedCount} expired donations` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  getAllUsers, 
  deleteUser, 
  getAllDonations, 
  getDashboardStats, 
  getAnalyticsData,
  deleteExpiredDonations
};
=======
module.exports = { getAllUsers, deleteUser, getAllDonations, getDashboardStats };
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
