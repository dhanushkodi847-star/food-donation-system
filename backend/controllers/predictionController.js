const Donation = require('../models/Donation');
const DemandPrediction = require('../models/DemandPrediction');

// @desc    Generate AI predictions based on historical data
// @route   POST /api/predictions/generate
// @access  Private (Admin)
const generatePredictions = async (req, res) => {
  try {
    // Aggregate donation data by area
    const areaStats = await Donation.aggregate([
      {
        $group: {
          _id: '$pickupAddress',
          totalDonations: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgQuantity: { $avg: '$quantity' },
          categories: { $push: '$category' },
          lastDonation: { $max: '$createdAt' },
          firstDonation: { $min: '$createdAt' },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          requestedCount: {
            $sum: { $cond: [{ $in: ['$status', ['requested', 'accepted', 'picked_up', 'delivered']] }, 1, 0] },
          },
        },
      },
      { $match: { totalDonations: { $gte: 1 } } },
      { $sort: { totalDonations: -1 } },
    ]);

    // Category breakdown per area
    const categoryByArea = await Donation.aggregate([
      {
        $group: {
          _id: { area: '$pickupAddress', category: '$category' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Time-based analysis
    const timeAnalysis = await Donation.aggregate([
      {
        $group: {
          _id: {
            area: '$pickupAddress',
            hour: { $hour: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Clear old predictions
    await DemandPrediction.deleteMany({});

    // Generate predictions for each area
    const predictions = [];

    for (const area of areaStats) {
      // Calculate demand score (weighted formula)
      const recency = area.lastDonation
        ? (Date.now() - new Date(area.lastDonation).getTime()) / (1000 * 60 * 60 * 24)
        : 30;
      const recencyFactor = Math.max(0, 1 - recency / 30); // Higher if recent

      const demandRatio = area.totalDonations > 0
        ? area.requestedCount / area.totalDonations
        : 0;

      const demandScore = Math.round(
        (area.totalDonations * 0.3 +
          area.requestedCount * 0.3 +
          demandRatio * 50 * 0.2 +
          recencyFactor * 50 * 0.2) *
          (1 + recencyFactor * 0.5)
      );

      // Calculate confidence based on data points
      const confidence = Math.min(95, Math.round(
        30 + (area.totalDonations * 5) + (recencyFactor * 20)
      ));

      // Determine trend
      const daysSinceFirst = area.firstDonation
        ? (Date.now() - new Date(area.firstDonation).getTime()) / (1000 * 60 * 60 * 24)
        : 1;
      const avgDonationsPerDay = area.totalDonations / Math.max(daysSinceFirst, 1);
      const trend = avgDonationsPerDay > 0.5 ? 'rising' : avgDonationsPerDay > 0.2 ? 'stable' : 'falling';

      // Determine time slot
      const areaTimeData = timeAnalysis.filter(
        (t) => t._id.area === area._id
      );
      let peakHour = 12;
      let maxCount = 0;
      for (const t of areaTimeData) {
        if (t.count > maxCount) {
          maxCount = t.count;
          peakHour = t._id.hour;
        }
      }
      const timeSlot =
        peakHour < 10 ? 'morning' :
        peakHour < 15 ? 'afternoon' :
        peakHour < 19 ? 'evening' : 'night';

      // Category breakdown for this area
      const areaCats = categoryByArea.filter(
        (c) => c._id.area === area._id
      );
      const totalCatCount = areaCats.reduce((sum, c) => sum + c.count, 0);
      const categoryBreakdown = areaCats.map((c) => ({
        category: c._id.category,
        count: c.count,
        percentage: Math.round((c.count / totalCatCount) * 100),
      }));

      const prediction = await DemandPrediction.create({
        area: area._id,
        predictedDemand: demandScore,
        confidence,
        timeSlot,
        trend,
        basedOnDataPoints: area.totalDonations,
        categoryBreakdown,
      });

      predictions.push(prediction);
    }

    res.json({
      message: `Generated ${predictions.length} predictions`,
      predictions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current predictions
// @route   GET /api/predictions
// @access  Private
const getPredictions = async (req, res) => {
  try {
    const predictions = await DemandPrediction.find({})
      .sort({ predictedDemand: -1 });
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get area heatmap data
// @route   GET /api/predictions/heatmap
// @access  Private
const getAreaHeatmap = async (req, res) => {
  try {
    const predictions = await DemandPrediction.find({})
      .sort({ predictedDemand: -1 });

    const heatmapData = predictions.map((p) => ({
      area: p.area,
      intensity: Math.min(100, p.predictedDemand),
      demand: p.predictedDemand,
      trend: p.trend,
      confidence: p.confidence,
    }));

    res.json(heatmapData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { generatePredictions, getPredictions, getAreaHeatmap };
