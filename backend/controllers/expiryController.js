const Donation = require('../models/Donation');

// @desc    Get urgently expiring donations
// @route   GET /api/expiry/urgent
// @access  Private
const getExpiringDonations = async (req, res) => {
  try {
    const now = new Date();

    const donations = await Donation.find({
      status: 'available',
      expiryDate: { $gte: now },
    })
      .populate('donor', 'name email phone address')
      .sort({ expiryDate: 1 }); // Soonest first

    const withUrgency = donations.map((d) => {
      const msLeft = new Date(d.expiryDate) - now;
      const hoursLeft = msLeft / (1000 * 60 * 60);

      let urgency;
      if (hoursLeft <= 2) urgency = 'critical';
      else if (hoursLeft <= 6) urgency = 'warning';
      else if (hoursLeft <= 24) urgency = 'moderate';
      else urgency = 'safe';

      return {
        ...d.toObject(),
        hoursLeft: Math.round(hoursLeft * 10) / 10,
        urgency,
        msLeft,
      };
    });

    res.json(withUrgency);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get expiry statistics
// @route   GET /api/expiry/stats
// @access  Private
const getExpiryStats = async (req, res) => {
  try {
    const now = new Date();
    const twoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const sixHours = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const twentyFourHours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [critical, warning, moderate, safe, expired] = await Promise.all([
      Donation.countDocuments({
        status: 'available',
        expiryDate: { $gte: now, $lte: twoHours },
      }),
      Donation.countDocuments({
        status: 'available',
        expiryDate: { $gt: twoHours, $lte: sixHours },
      }),
      Donation.countDocuments({
        status: 'available',
        expiryDate: { $gt: sixHours, $lte: twentyFourHours },
      }),
      Donation.countDocuments({
        status: 'available',
        expiryDate: { $gt: twentyFourHours },
      }),
      Donation.countDocuments({
        status: 'available',
        expiryDate: { $lt: now },
      }),
    ]);

    res.json({ critical, warning, moderate, safe, expired });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getExpiringDonations, getExpiryStats };
