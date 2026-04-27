const mongoose = require('mongoose');

const demandPredictionSchema = new mongoose.Schema(
  {
    area: {
      type: String,
      required: true,
      trim: true,
    },
    predictedDemand: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'beverages', 'bakery', 'other', 'all'],
      default: 'all',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'afternoon',
    },
    trend: {
      type: String,
      enum: ['rising', 'falling', 'stable'],
      default: 'stable',
    },
    basedOnDataPoints: {
      type: Number,
      default: 0,
    },
    categoryBreakdown: [
      {
        category: String,
        count: Number,
        percentage: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DemandPrediction', demandPredictionSchema);
