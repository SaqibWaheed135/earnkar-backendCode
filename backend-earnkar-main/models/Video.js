// models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  uri: String,
  user: String,
  description: String,
  likes: { type: Number, default: 0 },
  comments: [
    {
      user: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  shares: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", videoSchema);
