// const mongoose = require('mongoose');

// const WithdrawalSchema = new mongoose.Schema({
//   userId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
//   points: { 
//     type: Number, 
//     required: true,
//     min: 100
//   },
//   method: {
//     type: String,
//     enum: ['CRYPTO', 'BANK'],
//     required: true
//   },
  
//   // Crypto withdrawal fields (optional in schema, validated in API)
//   amountUSD: { 
//     type: Number
//   },
//   walletAddress: { 
//     type: String
//   },
//   walletType: { 
//     type: String, 
//     enum: ['TRC20', 'ERC20', 'BEP20']
//   },
  
//   // Bank withdrawal fields (optional in schema, validated in API)
//   amountINR: {
//     type: Number
//   },
//   accountHolderName: {
//     type: String
//   },
//   accountNumber: {
//     type: String
//   },
//   ifscCode: {
//     type: String
//   },
//   bankName: {
//     type: String
//   },
//   branchName: {
//     type: String
//   },
  
//   status: { 
//     type: String, 
//     enum: ['pending', 'completed', 'rejected'],
//     default: 'pending' 
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   },
//   completedAt: { 
//     type: Date 
//   },
//   rejectionReason: {
//     type: String
//   }
// });

// // Index for better query performance
// WithdrawalSchema.index({ userId: 1, createdAt: -1 });
// WithdrawalSchema.index({ status: 1 });

// module.exports = mongoose.model('Withdrawal', WithdrawalSchema);

const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    method: { type: String, enum: ["CRYPTO", "BANK"], required: true },
    points: { type: Number, required: true },

    // Crypto
    walletAddress: String,
    walletType: String,

    // Bank
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branchName: String,

    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdraw", withdrawSchema);
