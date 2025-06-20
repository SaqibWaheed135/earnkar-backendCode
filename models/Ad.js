// const mongoose = require('mongoose');

// const adSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   displayPhoto: { type: String, required: true }, // Either image URL or uploaded filename
//   adLink: { type: String, required: true },
//   category: { type: String, required: true },
// }, {
//   timestamps: true,
// });

// module.exports = mongoose.model('Ad', adSchema);


const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  adLink: { type: String, required: true },
  //category: { type: String, required: true },
  displayPhoto: {
    data: Buffer,
    contentType: String
  },
});



module.exports = mongoose.model('Ad', adSchema);
