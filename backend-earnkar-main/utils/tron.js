const axios = require('axios');

const USDT_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"; // USDT on TRON

exports.checkTRC20Transaction = async ({ toAddress, amount }) => {
  try {
    const response = await axios.get(`https://api.trongrid.io/v1/accounts/${toAddress}/transactions/trc20?limit=50`);
    const transfers = response.data.data;

    const matchedTx = transfers.find(tx =>
      tx.token_info?.address === USDT_CONTRACT &&
      tx.to.toLowerCase() === toAddress.toLowerCase() &&
      parseFloat(tx.value) === parseFloat(amount)
    );

    return matchedTx || null;
  } catch (error) {
    console.error('TRON API error:', error.message);
    return null;
  }
};
