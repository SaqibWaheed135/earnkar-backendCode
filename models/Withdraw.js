const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  points: { 
    type: Number, 
    required: true,
    min: 5
  },
  method: {
    type: String,
    enum: ['CRYPTO', 'BANK'],
    required: true
  },
  
  // Crypto withdrawal fields
  amountUSD: { 
    type: Number, 
    required: function() { return this.method === 'CRYPTO'; }
  },
  walletAddress: { 
    type: String, 
    required: function() { return this.method === 'CRYPTO'; }
  },
  walletType: { 
    type: String, 
    enum: ['TRC20', 'ERC20', 'BEP20'],
    required: function() { return this.method === 'CRYPTO'; }
  },
  
  // Bank withdrawal fields
  amountINR: {
    type: Number,
    required: function() { return this.method === 'BANK'; }
  },
  accountHolderName: {
    type: String,
    required: function() { return this.method === 'BANK'; }
  },
  accountNumber: {
    type: String,
    required: function() { return this.method === 'BANK'; }
  },
  ifscCode: {
    type: String,
    required: function() { return this.method === 'BANK'; }
  },
  bankName: {
    type: String,
    required: function() { return this.method === 'BANK'; }
  },
  branchName: {
    type: String
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date 
  },
  rejectionReason: {
    type: String
  }
});

// Index for better query performance
WithdrawalSchema.index({ userId: 1, createdAt: -1 });
WithdrawalSchema.index({ status: 1 });

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
