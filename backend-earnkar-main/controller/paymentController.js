const Order = require('../models/Order');
const { checkTRC20Transaction } = require('../utils/tron');

exports.createOrder = async (req, res) => {
  const { amount } = req.body;
  const generatedWallet = 'YOUR_USER_WALLET_ADDRESS'; // From HD wallet logic or predefined

  const order = new Order({
    out_trade_id: `ORD-${Date.now()}`,
    account_address: generatedWallet,
    amount,
    status: 0,
    expiration_time: new Date(Date.now() + 5 * 60000)
  });

  await order.save();

  res.json({
    orderId: order.out_trade_id,
    wallet: generatedWallet,
    amount: order.amount,
    expiration: order.expiration_time,
  });
};

exports.checkPaymentStatus = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findOne({ out_trade_id: orderId });
  if (!order) return res.status(404).json({ paid: false, msg: 'Order not found' });
  if (order.status === 1) return res.json({ paid: true });

  const tx = await checkTRC20Transaction({ toAddress: order.account_address, amount: order.amount });
  if (tx) {
    order.status = 1;
    await order.save();
    return res.json({ paid: true, txid: tx.transaction_id });
  }

  res.json({ paid: false });
};
