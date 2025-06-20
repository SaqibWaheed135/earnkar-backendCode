const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Ad = require('../models/Ad');
const express = require('express');

exports.AdminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// exports.Ad = async (req, res) => {
//    console.log('REQ FILE:', req.file);
//     console.log('REQ BODY:', req.body);
//   try {
//     const { title, description, adLink, category } = req.body;

//     const displayPhoto = req.file
//       ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
//       : req.body.photoUrl; // fallback to photo URL if provided

//     if (!title || !description || !adLink || !category || !displayPhoto) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields (title, description, adLink, category, displayPhoto) are required."
//       });
//     }

//     const ad = new Ad({
//       title,
//       description,
//       adLink,
//       category,
//       displayPhoto
//     });

//     await ad.save();

//     res.status(201).json({
//       success: true,
//       message: "Ad created successfully",
//       data: ad
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// controller/adminAuthController.js

// exports.Ad = async (req, res) => {
//   try {
//     const { title, description, adLink, category, photoUrl } = req.body;

//     if (!title || !description || !adLink || !category || !photoUrl) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields (title, description, adLink, category, photoUrl) are required."
//       });
//     }

//     const ad = new Ad({
//       title,
//       description,
//       adLink,
//       category,
//       displayPhoto: photoUrl, // map photoUrl directly to displayPhoto field
//     });

//     await ad.save();

//     res.status(201).json({
//       success: true,
//       message: "Ad created successfully",
//       data: ad
//     });
//   } catch (err) {
//     console.error("Ad creation error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// exports.Ad = async (req, res) => {
//   try {
//     const { title, description, adLink, category } = req.body;

//     if (!req.file || !title || !description || !adLink || !category) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields including photo are required."
//       });
//     }

//     const ad = new Ad({
//       title,
//       description,
//       adLink,
//       category,
//       displayPhoto: req.file.buffer,

//     });

//     await ad.save();

//     res.status(201).json({
//       success: true,
//       message: "Ad created successfully",
//       data: ad._id, // just return ID or minimal response
//     });
//   } catch (err) {
//     console.error("Ad creation error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

exports.Ad = async (req, res) => {
  try {
    const { title, description, adLink } = req.body;

    if (!req.file || !title || !description || !adLink ) {
      return res.status(400).json({
        success: false,
        message: "All fields including photo are required."
      });
    }

    const ad = new Ad({
      title,
      description,
      adLink,
      displayPhoto: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await ad.save();

    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      data: ad._id,
    });
  } catch (err) {
    console.error("Ad creation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getAdPhoto = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad || !ad.displayPhoto || !ad.displayPhoto.data) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', ad.displayPhoto.contentType);
    res.send(ad.displayPhoto.data);
  } catch (error) {
    console.error("Image fetch error:", error);
    res.status(500).send('Internal Server Error');
  }
};

// exports.getAd = async (req, res) => {
//   try {
//     const ads = await Ad.find();
//     res.json({ success: true, data: ads });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// }

exports.getAd = async (req, res) => {
  try {
    const ads = await Ad.find();

   const formattedAds = ads.map(ad => {
  const adObj = ad.toObject();

  if (adObj.displayPhoto?.data) {
    const buffer = Buffer.from(adObj.displayPhoto.data.buffer); // <- FIXED
    const base64 = buffer.toString('base64');
    adObj.displayPhoto = `data:${adObj.displayPhoto.contentType};base64,${base64}`;
  } else {
    adObj.displayPhoto = null;
  }

  return adObj;
});


    res.json({ success: true, data: formattedAds });
  } catch (err) {
    console.error('Error in getAd:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};




// Delete an ad
exports.deleteAd = async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ad deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an ad
exports.editAd = async (req, res) => {
  const { title, description, adLink, category, photoUrl } = req.body;
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, {
      title, description, adLink, category, displayPhoto: photoUrl
    }, { new: true });
    res.json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
