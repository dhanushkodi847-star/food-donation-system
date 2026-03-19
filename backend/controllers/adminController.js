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
      .populate('donor', 'name email phone')
      .populate('receiver', 'name email phone organization')
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
      categoryStats,
      recentDonations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, getAllDonations, getDashboardStats };
