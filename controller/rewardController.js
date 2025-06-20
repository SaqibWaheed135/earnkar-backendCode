
const User = require('../models/User');

// POST /api/reward
// exports.signup = async (req, res) => {

exports.reward= async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.points += 5;
    await user.save();

    res.json({ points: user.points });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = router;
