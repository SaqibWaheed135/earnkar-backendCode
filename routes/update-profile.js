// In routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authmiddleware'); // You need to create this

// ✅ Profile Update Route
router.put('/update-profile', authMiddleware, async (req, res) => {
  const { name, profilePic } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, profilePic },
      { new: true }
    );

    res.json({
      msg: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        points: user.points,
      },
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
