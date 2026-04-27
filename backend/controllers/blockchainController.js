const BlockchainRecord = require('../models/BlockchainRecord');

// @desc    Add a block to donation chain
const addBlock = async (donationId, action, actorId, data = {}) => {
  try {
    // Get previous block
    const previousBlock = await BlockchainRecord.findOne({ donationId })
      .sort({ blockIndex: -1 });

    const blockIndex = previousBlock ? previousBlock.blockIndex + 1 : 0;
    const previousHash = previousBlock ? previousBlock.hash : '0';
    const createdAt = new Date();
    const timestamp = createdAt.toISOString();

    const hash = BlockchainRecord.computeHash(
      previousHash,
      timestamp,
      { ...data, action, donationId: donationId.toString() },
      blockIndex
    );

    const block = await BlockchainRecord.create({
      donationId,
      action,
      actor: actorId,
      data,
      previousHash,
      hash,
      blockIndex,
      createdAt,
    });

    return block;
  } catch (error) {
    console.error('Blockchain addBlock error:', error.message);
    return null;
  }
};

// @desc    Get chain for a donation
// @route   GET /api/blockchain/:donationId
// @access  Private
const getChain = async (req, res) => {
  try {
    const chain = await BlockchainRecord.find({
      donationId: req.params.donationId,
    })
      .populate('actor', 'name email role')
      .sort({ blockIndex: 1 });

    res.json(chain);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify chain integrity
// @route   GET /api/blockchain/:donationId/verify
// @access  Private
const verifyChain = async (req, res) => {
  try {
    const chain = await BlockchainRecord.find({
      donationId: req.params.donationId,
    }).sort({ blockIndex: 1 });

    if (chain.length === 0) {
      return res.json({ valid: false, message: 'No records found' });
    }

    let isValid = true;
    const details = [];

    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];

      // Verify hash
      // When mongoose returns Mixed types, it might be a BSON object or Mongoose Map.
      // Convert to plain JS object first.
      const plainData = block.data ? JSON.parse(JSON.stringify(block.data)) : {};
      
      const expectedHash = BlockchainRecord.computeHash(
        block.previousHash,
        block.createdAt.toISOString(),
        { ...plainData, action: block.action, donationId: block.donationId.toString() },
        block.blockIndex
      );

      const hashValid = block.hash === expectedHash;

      // Verify chain link
      let linkValid = true;
      if (i > 0) {
        linkValid = block.previousHash === chain[i - 1].hash;
      } else {
        linkValid = block.previousHash === '0';
      }

      if (!hashValid || !linkValid) isValid = false;

      details.push({
        blockIndex: block.blockIndex,
        action: block.action,
        hashValid,
        linkValid,
        hash: block.hash.substring(0, 16) + '...',
      });
    }

    res.json({
      valid: isValid,
      totalBlocks: chain.length,
      message: isValid
        ? '✅ Chain integrity verified — no tampering detected'
        : '❌ Chain integrity compromised — possible tampering',
      details,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addBlock, getChain, verifyChain };
