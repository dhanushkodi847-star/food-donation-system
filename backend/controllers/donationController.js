const Donation = require('../models/Donation');

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Donor only)
const createDonation = async (req, res) => {
  try {
    const {
      foodName,
      category,
      quantity,
      unit,
      expiryDate,
      pickupAddress,
      pickupTime,
      description,
    } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      foodName,
      category,
      quantity,
      unit,
      expiryDate,
      pickupAddress: pickupAddress || req.user.address,
      pickupTime,
      description,
    });

    const populatedDonation = await donation.populate('donor', 'name email phone address');
    res.status(201).json(populatedDonation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all donations (with optional filters)
// @route   GET /api/donations
// @access  Private
const getDonations = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const donations = await Donation.find(filter)
      .populate('donor', 'name email phone address')
      .populate('receiver', 'name email phone organization')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donations created by the logged-in donor
// @route   GET /api/donations/my-donations
// @access  Private (Donor only)
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('receiver', 'name email phone organization')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get available donations for receivers
// @route   GET /api/donations/available
// @access  Private (Receiver only)
const getAvailableDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'available' })
      .populate('donor', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donations requested/received by the logged-in receiver
// @route   GET /api/donations/my-requests
// @access  Private (Receiver only)
const getMyRequests = async (req, res) => {
  try {
    const donations = await Donation.find({ receiver: req.user._id })
      .populate('donor', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Request a donation (receiver claims it)
// @route   PUT /api/donations/:id/request
// @access  Private (Receiver only)
const requestDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'This donation is no longer available' });
    }

    donation.status = 'requested';
    donation.receiver = req.user._id;
    await donation.save();

    const updated = await donation.populate([
      { path: 'donor', select: 'name email phone address' },
      { path: 'receiver', select: 'name email phone organization' },
    ]);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update donation status (lifecycle transitions)
// @route   PUT /api/donations/:id/status
// @access  Private (Donor/Admin)
const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Verify the donor owns this donation (or user is admin)
    if (
      donation.donor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    // Valid status transitions
    const validTransitions = {
      requested: ['accepted', 'available'], // accept or reject
      accepted: ['picked_up'],
      picked_up: ['delivered'],
    };

    if (
      !validTransitions[donation.status] ||
      !validTransitions[donation.status].includes(status)
    ) {
      return res.status(400).json({
        message: `Invalid status transition from '${donation.status}' to '${status}'`,
      });
    }

    // If rejecting (going back to available), clear receiver
    if (status === 'available') {
      donation.receiver = null;
    }

    donation.status = status;
    await donation.save();

    const updated = await donation.populate([
      { path: 'donor', select: 'name email phone address' },
      { path: 'receiver', select: 'name email phone organization' },
    ]);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a donation
// @route   DELETE /api/donations/:id
// @access  Private (Donor who owns it / Admin)
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (
      donation.donor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this donation' });
    }

    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donation removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Private
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone address')
      .populate('receiver', 'name email phone organization');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getMyDonations,
  getAvailableDonations,
  getMyRequests,
  requestDonation,
  updateDonationStatus,
  deleteDonation,
  getDonationById,
};
