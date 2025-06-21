// models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  uri: String,
  user: String,
  avatar: String, 
  description: String,
  likes: { type: Number, default: 0 },
  likedBy: [String], // ✅ store user IDs that liked the video
  comments: [
    {
      user: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  shares: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false }, // ✅ new field

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", videoSchema);
