
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema(
//   {
//     clerkUserId: { type: String, unique: true, sparse: true },

//     firstName: { type: String, required: true },
//     // lastName: { type: String, required: true },
//     lastName: {
//       type: String,
//       required: false,
//       default: ''
//     },

//     email: { type: String, required: true, unique: true },

//     // Removed password because OAuth users won't have one
//     // password: { type: String, required: true },

//     points: { type: Number, default: 5 },
//     avatar: { type: String, default: './assets/images/logo.png' },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: String,
  avatar: String,
  points: { type: Number, default: 5 },
  provider: { type: String, default: 'local' }, // 'local', 'google', etc.
  // ADD THESE NEW FIELDS FOR PASSWORD RESET
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
