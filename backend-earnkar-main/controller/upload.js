const multer = require('multer');

const storage = multer.memoryStorage(); // 🔁 In-memory storage instead of disk
const upload = multer({ storage });

module.exports = upload;
