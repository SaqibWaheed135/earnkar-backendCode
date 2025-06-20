const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true },
  amountUSD: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  walletType: { type: String, required: true }, // e.g., TRC20, ERC20
  status: { type: String, default: 'pending' }, // 'pending' | 'completed'
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
