const express = require("express");
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const cors = require('cors');
const path=require('path');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('../routes/authRoutes'));

app.use('/api/admin/auth', require('../routes/adminRoutes'));
//app.use('/api/reward', require('./routes/rewardRoutes'));
// app.use('/uploads', express.static('uploads'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;