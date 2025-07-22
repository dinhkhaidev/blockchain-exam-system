const mongoose = require('mongoose');

const pendingMintSchema = new mongoose.Schema({
  studentWallet: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  studentId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  examSession: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  examDate: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'failed'],
    default: 'pending'
  },
  blockchainTxHash: {
    type: String,
    default: null
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
pendingMintSchema.index({ studentWallet: 1 });
pendingMintSchema.index({ status: 1 });
pendingMintSchema.index({ addedAt: -1 });

module.exports = mongoose.model('PendingMint', pendingMintSchema); 