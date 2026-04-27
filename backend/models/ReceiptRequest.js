const mongoose = require('mongoose');

const receiptRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: function() { return this.type === 'single'; }
  },
  type: {
    type: String,
    enum: ['single', 'all'],
    default: 'single'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminMessage: {
    type: String
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('ReceiptRequest', receiptRequestSchema);
