const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'beverages', 'bakery', 'other'],
      required: [true, 'Category is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
    },
    unit: {
      type: String,
      enum: ['kg', 'liters', 'pieces', 'packets', 'plates', 'boxes'],
      required: [true, 'Unit is required'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    pickupTime: {
      type: String,
      required: [true, 'Pickup time is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'requested', 'accepted', 'picked_up', 'reached', 'delivered', 'expired'],
      default: 'available',
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    foodImage: {
      type: String,
      default: '',
    },
    qualityScore: {
      score: { type: Number, default: null },
      label: { type: String, default: '' },
      confidence: { type: Number, default: null },
    },
    deliveryOtp: {
      type: String,
      default: null,
    },
    expiryNotified: {
      type: Boolean,
      default: false,
    },
    liveLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
    receiverCoordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);
