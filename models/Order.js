const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  out_trade_id: { type: String, required: true, unique: true },
  account_address: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: Number, default: 0 }, // 0: pending, 1: paid
  created_at: { type: Date, default: Date.now },
  expiration_time: { type: Date, required: true },
});

module.exports = mongoose.model('Order', orderSchema);
