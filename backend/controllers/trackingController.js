const Donation = require('../models/Donation');

// @desc    Update donor's live location during delivery
// @route   PUT /api/tracking/:donationId/update-location
// @access  Private (Donor who owns the donation)
const updateDonorLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const { donationId } = req.params;

    if (lat == null || lng == null) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Only the donor who owns this donation can update location
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only allow tracking for picked_up status
    if (donation.status !== 'picked_up') {
      return res.status(400).json({ message: 'Tracking is only available for picked up donations' });
    }

    donation.liveLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      updatedAt: new Date(),
    };

    await donation.save();

    res.json({
      message: 'Location updated',
      liveLocation: donation.liveLocation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donor's live location for a donation
// @route   GET /api/tracking/:donationId/location
// @access  Private (Receiver who requested it, Admin, or Donor who owns it)
const getDonorLocation = async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId)
      .populate('donor', 'name phone')
      .populate('receiver', 'name phone organization');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Only allow donor, receiver, or admin to view tracking
    const userId = req.user._id.toString();
    const isDonor = donation.donor._id.toString() === userId;
    const isReceiver = donation.receiver && donation.receiver._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isDonor && !isReceiver && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to track this donation' });
    }

    res.json({
      donationId: donation._id,
      foodName: donation.foodName,
      status: donation.status,
      liveLocation: donation.liveLocation,
      pickupCoordinates: donation.coordinates,
      receiverCoordinates: donation.receiverCoordinates,
      pickupAddress: donation.pickupAddress,
      donor: donation.donor,
      receiver: donation.receiver,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all active deliveries (for admin live tracking tab)
// @route   GET /api/tracking/active
// @access  Private (Admin only)
const getActiveDeliveries = async (req, res) => {
  try {
    const deliveries = await Donation.find({
      status: 'picked_up',
      'liveLocation.lat': { $ne: null },
    })
      .populate('donor', 'name phone')
      .populate('receiver', 'name phone organization')
      .sort({ 'liveLocation.updatedAt': -1 });

    res.json(
      deliveries.map((d) => ({
        donationId: d._id,
        foodName: d.foodName,
        status: d.status,
        liveLocation: d.liveLocation,
        pickupCoordinates: d.coordinates,
        receiverCoordinates: d.receiverCoordinates,
        pickupAddress: d.pickupAddress,
        donor: d.donor,
        receiver: d.receiver,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { updateDonorLocation, getDonorLocation, getActiveDeliveries };
