const Donation = require('../models/Donation');
<<<<<<< HEAD
const User = require('../models/User');
const Notification = require('../models/Notification');
const { haversineDistance } = require('../utils/geoUtils');
const { addBlock } = require('./blockchainController');
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda

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
<<<<<<< HEAD
      coordinates,
      foodImage,
      qualityScore,
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD
      coordinates: coordinates || {},
      foodImage: foodImage || '',
      qualityScore: qualityScore || {},
    });

    // 🧾 Blockchain: Record creation
    await addBlock(donation._id, 'created', req.user._id, {
      foodName,
      category,
      quantity,
      unit,
      pickupAddress: donation.pickupAddress,
    });

    const populatedDonation = await donation.populate('donor', 'name email phone address');

    // Notification: New food donation available nearby
    if (populatedDonation.coordinates && populatedDonation.coordinates.lat) {
      // Find all receivers with coordinates
      const receivers = await User.find({
        role: 'receiver',
        'coordinates.lat': { $ne: null },
      });

      const notifyReceivers = [];
      for (const receiver of receivers) {
        const distance = haversineDistance(
          populatedDonation.coordinates.lat,
          populatedDonation.coordinates.lng,
          receiver.coordinates.lat,
          receiver.coordinates.lng
        );

        if (distance <= 10) { // Notify receivers within 10km
          notifyReceivers.push({
            user: receiver._id,
            title: 'New Donation Nearby',
            message: `A new donation "${populatedDonation.foodName}" is available ${Math.round(distance)}km away.`,
            type: 'info',
            relatedDonation: populatedDonation._id,
          });
        }
      }

      if (notifyReceivers.length > 0) {
        await Notification.insertMany(notifyReceivers);
      }
    }

=======
    });

    const populatedDonation = await donation.populate('donor', 'name email phone address');
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD
    const donations = await Donation.find({ status: 'available', expiryDate: { $gt: new Date() } })
=======
    const donations = await Donation.find({ status: 'available' })
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD
      return res.status(400).json({ 
        message: donation.status === 'expired' ? 'This donation has expired' : 'This donation is no longer available' 
      });
=======
      return res.status(400).json({ message: 'This donation is no longer available' });
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
    }

    donation.status = 'requested';
    donation.receiver = req.user._id;
    await donation.save();

<<<<<<< HEAD
    // 🧾 Blockchain: Record request
    await addBlock(donation._id, 'requested', req.user._id, {
      receiverId: req.user._id.toString(),
      receiverName: req.user.name,
    });

    // Notification: Notify donor that their donation was requested
    await Notification.create({
      user: donation.donor,
      title: 'Donation Requested',
      message: `${req.user.name} has requested your donation "${donation.foodName}".`,
      type: 'info',
      relatedDonation: donation._id,
    });

=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD
    const { status, otp } = req.body;
=======
    const { status } = req.body;
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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

<<<<<<< HEAD
    if (donation.status === 'expired') {
      return res.status(400).json({ message: 'Cannot update status of an expired donation' });
    }

=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
    // Valid status transitions
    const validTransitions = {
      requested: ['accepted', 'available'], // accept or reject
      accepted: ['picked_up'],
<<<<<<< HEAD
      picked_up: ['reached', 'delivered'],
      reached: ['delivered'],
=======
      picked_up: ['delivered'],
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD
      donation.deliveryOtp = null;
    }

    // Generate OTP when picked up
    if (status === 'picked_up') {
      donation.deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Verify OTP when delivered
    if (status === 'delivered') {
      if (!otp) {
        return res.status(400).json({ message: 'Delivery OTP is required to mark as delivered' });
      }
      if (otp !== donation.deliveryOtp) {
        return res.status(400).json({ message: 'Invalid Delivery OTP' });
      }
    }

    const previousStatus = donation.status;
    donation.status = status;
    await donation.save();

    // 🧾 Blockchain: Record status change
    const blockAction = status === 'available' ? 'rejected' : status;
    await addBlock(donation._id, blockAction, req.user._id, {
      from: previousStatus,
      to: status,
    });

    // Notifications
    if (status === 'accepted' && donation.receiver) {
      // Save receiver coordinates for delivery tracking/routing
      const receiver = await User.findById(donation.receiver);
      if (receiver && receiver.coordinates && receiver.coordinates.lat) {
        donation.receiverCoordinates = {
          lat: receiver.coordinates.lat,
          lng: receiver.coordinates.lng,
        };
        await donation.save();
      }

      await Notification.create({
        user: donation.receiver,
        title: 'Request Accepted',
        message: `Your request for "${donation.foodName}" has been accepted. Please arrange for pickup.`,
        type: 'success',
        relatedDonation: donation._id,
      });
    } else if (status === 'reached' && donation.receiver) {
      await Notification.create({
        user: donation.receiver,
        title: 'Donor Arrived',
        message: `The donor for "${donation.foodName}" has arrived! Please meet them and provide the delivery OTP.`,
        type: 'info',
        relatedDonation: donation._id,
      });
    } else if (status === 'delivered') {
      await Notification.create({
        user: donation.donor,
        title: 'Donation Collected',
        message: `Your donation "${donation.foodName}" was successfully collected. Thank you!`,
        type: 'success',
        relatedDonation: donation._id,
      });
    }

=======
    }

    donation.status = status;
    await donation.save();

>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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

<<<<<<< HEAD
    // 🧾 Blockchain: Record deletion
    await addBlock(donation._id, 'deleted', req.user._id, {
      foodName: donation.foodName,
      reason: 'User deleted',
    });

=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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

<<<<<<< HEAD
// @desc    Get expired donations for admin
// @route   GET /api/donations/expired
// @access  Private (Admin only)
const getExpiredDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'expired' })
      .populate('donor', 'name email phone address')
      .sort({ expiryDate: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD
  getExpiredDonations,
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
};
