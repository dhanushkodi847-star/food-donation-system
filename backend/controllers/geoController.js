const Donation = require('../models/Donation');
const User = require('../models/User');
const { haversineDistance } = require('../utils/geoUtils');


// @desc    Get nearby donations
// @route   GET /api/geo/nearby
// @access  Private
const getNearbyDonations = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Get all available donations with coordinates
    const donations = await Donation.find({
      status: 'available',
      'coordinates.lat': { $ne: null },
      'coordinates.lng': { $ne: null },
    })
      .populate('donor', 'name email phone address')
      .sort({ createdAt: -1 });

    // Calculate distance and filter
    const nearbyDonations = donations
      .map((donation) => {
        const distance = haversineDistance(
          userLat,
          userLng,
          donation.coordinates.lat,
          donation.coordinates.lng
        );
        return {
          ...donation.toObject(),
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        };
      })
      .filter((d) => d.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyDonations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Smart match receiver to closest donations
// @route   GET /api/geo/smart-match
// @access  Private (Receiver)
const getSmartMatch = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.coordinates || !user.coordinates.lat) {
      return res.status(400).json({
        message: 'Please update your location coordinates first',
      });
    }

    // Get available donations with coordinates
    const donations = await Donation.find({
      status: 'available',
      'coordinates.lat': { $ne: null },
    })
      .populate('donor', 'name email phone address')
      .sort({ createdAt: -1 });

    // Score each donation based on distance + expiry urgency
    const scored = donations.map((donation) => {
      const distance = haversineDistance(
        user.coordinates.lat,
        user.coordinates.lng,
        donation.coordinates.lat,
        donation.coordinates.lng
      );

      const hoursToExpiry = donation.expiryDate
        ? (new Date(donation.expiryDate) - Date.now()) / (1000 * 60 * 60)
        : 999;

      // Lower score = better match
      const distanceScore = distance * 2; // 2 points per km
      const expiryScore = hoursToExpiry < 6 ? -20 : hoursToExpiry < 24 ? -10 : 0; // Urgent items get priority

      return {
        ...donation.toObject(),
        distance: Math.round(distance * 10) / 10,
        hoursToExpiry: Math.round(hoursToExpiry * 10) / 10,
        matchScore: Math.round((distanceScore + expiryScore) * 10) / 10,
      };
    });

    // Sort by match score (lower = better)
    scored.sort((a, b) => a.matchScore - b.matchScore);

    res.json(scored.slice(0, 20)); // Top 20 matches
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Geocode an address using Nominatim
// @route   POST /api/geo/geocode
// @access  Private
const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    // Use Nominatim (OpenStreetMap free geocoding)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'FoodDonationSystem/1.0' },
    });

    const data = await response.json();

    if (data.length === 0) {
      return res.status(404).json({ message: 'Could not geocode this address' });
    }

    res.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    });
  } catch (error) {
    res.status(500).json({ message: 'Geocoding error', error: error.message });
  }
};

// @desc    Update user coordinates
// @route   PUT /api/geo/update-location
// @access  Private
const updateUserLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
    });

    res.json({ message: 'Location updated', coordinates: { lat, lng } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getNearbyDonations, getSmartMatch, geocodeAddress, updateUserLocation };
