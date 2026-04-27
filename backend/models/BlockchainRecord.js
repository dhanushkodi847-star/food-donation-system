const mongoose = require('mongoose');
const crypto = require('crypto');

const blockchainRecordSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['created', 'requested', 'accepted', 'rejected', 'picked_up', 'delivered', 'deleted'],
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    previousHash: {
      type: String,
      default: '0',
    },
    hash: {
      type: String,
      required: true,
    },
    blockIndex: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to compute hash
blockchainRecordSchema.statics.computeHash = function (previousHash, timestamp, data, blockIndex) {
  // Ensure deterministic JSON stringification by sorting keys
  const sortedData = {};
  if (data) {
    Object.keys(data).sort().forEach(key => {
      sortedData[key] = data[key];
    });
  }
  const payload = `${previousHash}${timestamp}${JSON.stringify(sortedData)}${blockIndex}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

module.exports = mongoose.model('BlockchainRecord', blockchainRecordSchema);
