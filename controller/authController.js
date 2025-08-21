const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Video = require('../models/Video'); // Path may vary
const multer = require('multer');
const path = require('path');
const Withdrawal = require('../models/Withdraw');
const AWS = require('aws-sdk');
const Report = require('../models/Report');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// exports.signup = async (req, res) => {
//   const { firstName, lastName, email, password } = req.body;

//   try {
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'User already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ firstName, lastName, email, password: hashedPassword });

//     const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     res.status(201).json({ user, token });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };


//updated one
// exports.signup = async (req, res) => {
//   const { firstName, lastName, email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });

//     if (user) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 👇 Create new user with default points and default avatar
//     user = await User.create({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       points: 5, // default points
//       avatar: ''
//     });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '7d',
//     });

//     res.status(201).json({
//       token,
//       user: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         points: user.points,
//         avatar: user.avatar,
//       },
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// Configure nodemailer (you can use Gmail, SendGrid, or any SMTP service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Check if user signed up with Google/Facebook
    if (user.provider !== 'local') {
      return res.status(400).json({
        message: `This account uses ${user.provider} Sign-In. Password reset is not available for social accounts.`,
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Create reset URL (adjust the URL according to your app's deep linking setup)
    const resetUrl = `rewardapp://reset-password?token=${resetToken}`;
    // For web testing, you might use: `http://localhost:3000/reset-password?token=${resetToken}`

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request - EarnKar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.firstName},</p>
          <p>You requested a password reset for your EarnKar account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(45deg, #A4508B, #5F0A87); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0;">Reset Password</a>
          <p>If the button doesn't work, copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p><strong>This link will expire in 10 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">EarnKar Team</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Password reset link sent to your email',
      // For development/testing, you might want to include the token
      // Remove this in production
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};

// 2. VERIFY RESET TOKEN
exports.verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset token is invalid or has expired' 
      });
    }

    res.status(200).json({
      message: 'Reset token is valid',
      email: user.email, // Return email for display purposes
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset token is invalid or has expired' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new JWT token for automatic login
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Password reset successful',
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        points: user.points,
        avatar: user.avatar,
        provider: user.provider,
      },
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // From auth middleware

  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user signed up with Google/Facebook
    if (user.provider !== 'local') {
      return res.status(400).json({
        message: `This account uses ${user.provider} Sign-In. Password change is not available for social accounts.`,
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      points: 5,
      avatar: 'data:image/jpeg;base64,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',
      provider: 'local', // explicitly setting provider
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        points: user.points,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

//updated one
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     if (!user.password) {
//       return res.status(400).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     res.status(200).json({ user, token });
//   } catch (err) {
//     console.error('Login error:', err); // Debug for development
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.provider !== 'local') {
      return res.status(400).json({
        message: `This account uses ${user.provider} Sign-In. Please sign in with ${user.provider}.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        points: user.points,
        avatar: user.avatar,
        provider: user.provider,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user); // ✅ return full user object
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.reward = async (req, res) => {
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

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware (decoded token)
    const { firstName, lastName, email, avatar } = req.body;

    // Find user by id and update fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, avatar },
      { new: true, runValidators: true }
    ).select('-password'); // exclude password in response

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};



// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // this should match your uploads folder in root
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

exports.uploadProfileImage = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      const imagePath = `/uploads/${req.file.filename}`;

      // Assuming you have a user object from auth middleware
      const userId = req.user.id; // or however you identify the user

      // Update user in DB (replace with your DB logic)
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: imagePath },
        { new: true }
      );

      res.status(200).json({ message: 'Image uploaded successfully', user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Image upload failed' });
    }
  },
];

exports.clerkUserHandler = async (req, res) => {
  const { clerkUserId, email, name } = req.body;
  try {
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    // Try find user by clerkUserId or email
    let user = await User.findOne({ clerkUserId });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      // Create new user
      user = new User({
        clerkUserId,
        email,
        name,
        points: 5, // default points on signup
      });
      await user.save();
    } else {
      // Update user info if needed
      user.name = name || user.name;
      user.clerkUserId = clerkUserId || user.clerkUserId;
      await user.save();
    }

    // Respond with user data (customize as needed)
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      points: user.points,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// exports.googleSignIn = async (req, res) => {

// const { clerkUserId, firstName, lastName, email, avatar } = req.body;

//   try {
//     // Check if user already exists
//     let user = await User.findOne({ email });

//     if (!user) {
//       // If not, create new user
//       user = new User({
//         clerkUserId,
//         firstName,
//         lastName,
//         email,
//         password: 'oauth_google', // You can use a placeholder here
//         avatar,
//       });

//       await user.save();
//     }

//     return res.status(200).json({ success: true, user });
//   } catch (err) {
//     console.error('Error saving user:', err);
//     return res.status(500).json({ success: false, error: 'Server error' });
//   }
// }

const SECRET = process.env.JWT_SECRET || 'your_secret';

//updated one
// exports.googleSignIn = async (req, res) => {
//   try {
//     const { clerkUserId, firstName, lastName, email, avatar } = req.body;

//     let user = await User.findOne({ clerkUserId });

//     if (!user) {
//       user = await User.create({
//         clerkUserId,
//         firstName,
//         lastName,
//         email,
//         avatar,
//         points: 5,
//       });
//     }

//     // Generate token
//     const token = jwt.sign({ id: user._id }, SECRET, {
//       expiresIn: '30d',
//     });

//     res.status(200).json({
//       message: 'Google sign-in successful',
//       token,
//       user,
//     });
//   } catch (error) {
//     console.error('Google sign-in error:', error);
//     res.status(500).json({ message: 'Server error during Google sign-in' });
//   }
// };



exports.googleSignIn = async (req, res) => {
  try {
    const { clerkUserId, firstName, lastName, email, avatar } = req.body;

    let user = await User.findOne({ clerkUserId });

    // Optional fallback: find by email if clerkUserId is missing
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      user = await User.create({
        clerkUserId,
        firstName,
        lastName,
        email,
        avatar,
        points: 5,
        provider: 'google',
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      message: 'Google sign-in successful',
      token,
      user: {
        id: user._id,
        clerkUserId: user.clerkUserId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        points: user.points,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Server error during Google sign-in' });
  }
};

// exports.withdraw = async (req, res) => {
// const { walletAddress, walletType } = req.body;
//   const user = await User.findById(req.user.id);

//   if (user.points < 5) {
//     return res.status(400).json({ message: 'Minimum 1000 points required for withdrawal.' });
//   }

//   const amountUSD = user.points / 100; // 100 points = 1 USD

//   const withdrawal = new Withdrawal({
//     userId: user._id,
//     points: user.points,
//     amountUSD,
//     walletAddress,
//     walletType,
//   });

//   await withdrawal.save();

//   // Reset user points
//   user.points = 0;
//   await user.save();

//   res.status(200).json({ message: 'Withdrawal request submitted.', withdrawal });

// }


// exports.withdraw = async (req, res) => {
//   try {
//     // Add detailed logging to see what we're receiving
//     console.log('Withdrawal request received:');
//     console.log('Request body:', JSON.stringify(req.body, null, 2));
//     console.log('User ID:', req.user?.id);
    
//     const { 
//       points, 
//       method, 
//       // Crypto fields
//       walletAddress, 
//       walletType,
//       // Bank fields
//       accountHolderName,
//       accountNumber,
//       ifscCode,
//       bankName,
//       branchName
//     } = req.body;

//     // Validate points
//     console.log('Points received:', points, 'Type:', typeof points);
//     const numericPoints = parseInt(points);
//     console.log('Numeric points:', numericPoints);
    
//     if (!numericPoints || isNaN(numericPoints) || numericPoints < 100) {
//       return res.status(400).json({ message: 'Minimum 100 points required for withdrawal.' });
//     }

//     // Validate withdrawal method
//     if (!method || !['CRYPTO', 'BANK'].includes(method)) {
//       return res.status(400).json({ message: 'Invalid withdrawal method.' });
//     }

//     // Validate crypto fields if method is CRYPTO
//     if (method === 'CRYPTO') {
//       if (!walletAddress || !walletType) {
//         return res.status(400).json({ message: 'Wallet address and type are required for crypto withdrawal.' });
//       }
//     }

//     // Validate bank fields if method is BANK
//     if (method === 'BANK') {
//       if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
//         return res.status(400).json({ message: 'All bank details are required for bank withdrawal.' });
//       }
//     }

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     if (user.points < points) {
//       return res.status(400).json({ message: 'Insufficient points for withdrawal.' });
//     }

//     // Calculate amounts
//     const amountUSD = points / 100; // 100 points = 1 USD
//     const amountINR = (points / 100) * 85.42; // 100 points = 85.42 INR

//     // Create withdrawal object based on method
//     let withdrawalData = {
//       userId: user._id,
//       points: numericPoints,
//       method: method,
//       status: 'pending', // Use lowercase to match your schema
//       createdAt: new Date()
//     };

//     if (method === 'CRYPTO') {
//       withdrawalData = {
//         ...withdrawalData,
//         amountUSD,
//         walletAddress,
//         walletType
//       };
//     } else if (method === 'BANK') {
//       withdrawalData = {
//         ...withdrawalData,
//         amountINR,
//         accountHolderName,
//         accountNumber,
//         ifscCode,
//         bankName,
//         branchName
//       };
//     }

//     const withdrawal = new Withdrawal(withdrawalData);
//     await withdrawal.save();

//     // Deduct points from user
//     user.points -= points;
//     await user.save();

//     // Return success response with appropriate message
//     const successMessage = method === 'CRYPTO' 
//       ? `Withdrawal request of ${amountUSD} USDT submitted successfully.`
//       : `Withdrawal request of ₹${amountINR.toFixed(2)} submitted successfully.`;

//     // res.status(200).json({ 
//     //   message: successMessage,
//     //   data: {
//     //     message: successMessage // Your frontend expects res?.data?.message
//     //   },
//     //   withdrawal: {
//     //     id: withdrawal._id,
//     //     points: withdrawal.points,
//     //     method: withdrawal.method,
//     //     status: withdrawal.status,
//     //     ...(method === 'CRYPTO' && { amountUSD: withdrawal.amountUSD }),
//     //     ...(method === 'BANK' && { amountINR: withdrawal.amountINR })
//     //   }
//     // });

//     res.status(200).json({
//   message: successMessage,
//   withdrawal: {
//     id: withdrawal._id,
//     points: withdrawal.points,
//     method: withdrawal.method,
//     status: withdrawal.status,
//     ...(method === 'CRYPTO' && { amountUSD: withdrawal.amountUSD }),
//     ...(method === 'BANK' && { amountINR: withdrawal.amountINR })
//   }
// });


//   } catch (error) {
//     console.error('Withdrawal error:', error);
//      return res.status(500).json({ message: error.message || 'Internal server error during withdrawal process.' });

//   }
// };


// exports.withdraw = async (req, res) => {
//   try {
//     const { userId, method, points } = req.body;

//     if (!userId || !method || !points) {
//       return res.status(400).json({ message: "userId, method and points are required" });
//     }

//     if (points < 100) {
//       return res.status(400).json({ message: "Minimum 100 points required." });
//     }

//     // find user
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.points < points) {
//       return res.status(400).json({ message: "Insufficient points" });
//     }

//     // prepare withdrawal data
//     let withdrawalData = { user: userId, method, points };

//     if (method === "CRYPTO") {
//       const { walletAddress, walletType } = req.body;
//       if (!walletAddress || !walletType) {
//         return res.status(400).json({ message: "Wallet details required" });
//       }
//       withdrawalData.walletAddress = walletAddress;
//       withdrawalData.walletType = walletType;
//     } else if (method === "BANK") {
//       const { accountHolderName, accountNumber, ifscCode, bankName, branchName } = req.body;
//       if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
//         return res.status(400).json({ message: "Bank details required" });
//       }
//       withdrawalData.accountHolderName = accountHolderName;
//       withdrawalData.accountNumber = accountNumber;
//       withdrawalData.ifscCode = ifscCode;
//       withdrawalData.bankName = bankName;
//       withdrawalData.branchName = branchName || "";
//     } else {
//       return res.status(400).json({ message: "Invalid withdrawal method" });
//     }

//     // deduct points
//     user.points -= points;
//     await user.save();

//     // create withdrawal record
//     const withdrawal = new Withdraw(withdrawalData);
//     await withdrawal.save();

//     res.json({ message: "Withdrawal request submitted successfully", withdrawal });
//   } catch (err) {
//     console.error("Withdrawal error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.withdraw = async (req, res) => {
    try {
        console.log('Withdrawal request received:', req.body);
        console.log('Request headers:', req.headers);
        
        const { userId, points, method } = req.body;
        
        // Validate required fields
        if (!userId || !points || !method) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: userId, points, and method are required' 
            });
        }

        // Validate points
        const numericPoints = parseInt(points);
        if (!numericPoints || isNaN(numericPoints) || numericPoints < 100) {
            return res.status(400).json({ 
                success: false,
                message: 'Points must be a valid number and at least 100' 
            });
        }

        // Validate method
        if (!['CRYPTO', 'BANK'].includes(method)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid withdrawal method. Must be CRYPTO or BANK' 
            });
        }

        // Find user and verify they exist
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Check if user has enough points
        if (user.points < numericPoints) {
            return res.status(400).json({ 
                success: false,
                message: 'Insufficient points for withdrawal' 
            });
        }

        // Validate method-specific fields
        let withdrawalData = {
            userId,
            points: numericPoints,
            method
        };

        if (method === 'CRYPTO') {
            const { walletAddress, walletType } = req.body;
            
            if (!walletAddress || !walletType) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Wallet address and wallet type are required for crypto withdrawals' 
                });
            }

            if (!['TRC20', 'ERC20', 'BEP20'].includes(walletType)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid wallet type. Must be TRC20, ERC20, or BEP20' 
                });
            }

            withdrawalData.walletAddress = walletAddress.trim();
            withdrawalData.walletType = walletType;
            
        } else if (method === 'BANK') {
            const { accountHolderName, accountNumber, ifscCode, bankName, branchName } = req.body;
            
            if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Account holder name, account number, IFSC code, and bank name are required for bank withdrawals' 
                });
            }

            withdrawalData.accountHolderName = accountHolderName.trim();
            withdrawalData.accountNumber = accountNumber.trim();
            withdrawalData.ifscCode = ifscCode.trim().toUpperCase();
            withdrawalData.bankName = bankName.trim();
            withdrawalData.branchName = branchName ? branchName.trim() : '';
        }

        // Check for pending withdrawals (optional: prevent multiple pending requests)
        const pendingWithdrawal = await Withdrawal.findOne({ 
            userId, 
            status: 'PENDING' 
        });

        if (pendingWithdrawal) {
            return res.status(400).json({ 
                success: false,
                message: 'You already have a pending withdrawal request. Please wait for it to be processed.' 
            });
        }

        // Create withdrawal record
        const withdrawal = new Withdrawal(withdrawalData);
        
        // Calculate amounts manually before saving
        if (method === 'CRYPTO') {
            withdrawal.usdtAmount = numericPoints / 100;
            withdrawal.inrAmount = 0;
        } else if (method === 'BANK') {
            withdrawal.inrAmount = (numericPoints / 100) * 85.42;
            withdrawal.usdtAmount = 0;
        }
        
        await withdrawal.save();

        // Deduct points from user account
        user.points -= numericPoints;
        user.updatedAt = new Date();
        await user.save();

        console.log(`Withdrawal created: ${withdrawal._id} for user: ${userId}`);

        // Prepare response message
        let responseMessage = 'Withdrawal request submitted successfully.';
        if (method === 'CRYPTO') {
            responseMessage += ` You will receive ${withdrawal.usdtAmount} USDT to your ${withdrawal.walletType} wallet.`;
        } else {
            responseMessage += ` You will receive ₹${withdrawal.inrAmount.toFixed(2)} to your bank account.`;
        }

        res.status(201).json({
            success: true,
            message: responseMessage,
            data: {
                withdrawalId: withdrawal._id,
                points: numericPoints,
                method,
                status: withdrawal.status,
                usdtAmount: withdrawal.usdtAmount,
                inrAmount: withdrawal.inrAmount,
                remainingPoints: user.points,
                createdAt: withdrawal.createdAt
            }
        });

    } catch (error) {
        console.error('Withdrawal error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            success: false,
            message: 'Internal server error. Please try again later.',
            error: error.message, // Always show error message for debugging
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// exports.withdrawCompletion = async (req, res) => {
//   try {
//     console.log('Withdrawal completion request received for ID:', req.params.id);
    
//     // Validate the ID parameter
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).json({ message: 'Withdrawal ID is required.' });
//     }

//     // Check if ID is valid MongoDB ObjectId (if using MongoDB)
//     const mongoose = require('mongoose');
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid withdrawal ID format.' });
//     }

//     console.log('Looking for withdrawal with ID:', id);
    
//     // Find the withdrawal by ID
//     const withdrawal = await Withdrawal.findById(id);
//     console.log('Found withdrawal:', withdrawal);

//     if (!withdrawal) {
//       return res.status(404).json({ message: 'Withdrawal not found.' });
//     }

//     // Check if already completed
//     if (withdrawal.status === 'completed') {
//       return res.status(400).json({ message: 'Withdrawal is already completed.' });
//     }

//     console.log('Updating withdrawal status to completed...');
    
//     // Update the withdrawal status
//     withdrawal.status = 'completed';
//     withdrawal.completedAt = new Date();
    
//     // Save the updated withdrawal
//     const updatedWithdrawal = await withdrawal.save();
//     console.log('Updated withdrawal:', updatedWithdrawal);

//     res.status(200).json({
//       message: 'Withdrawal marked as completed successfully.',
//       withdrawal: updatedWithdrawal,
//     });

//   } catch (error) {
//     // Log the complete error for debugging
//     console.error('Error in withdrawCompletion:');
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
    
//     // Send appropriate error response
//     if (error.name === 'CastError') {
//       return res.status(400).json({ message: 'Invalid withdrawal ID format.' });
//     }
    
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ message: 'Validation error: ' + error.message });
//     }
    
//     res.status(500).json({ 
//       message: 'Internal server error while marking withdrawal as complete.',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

exports.withdrawCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid withdrawal ID' });
    }

    // Only update status if it's still pending
    const result = await Withdrawal.updateOne(
      { _id: id, status: 'pending' }, // only pending withdrawals
      {
        $set: {
          status: 'completed',
          completedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Withdrawal not found or already completed.' });
    }

    res.status(200).json({
      message: '✅ Withdrawal marked as completed successfully.'
    });

  } catch (error) {
    console.error('❌ Error in withdrawCompletion:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Internal server error while completing withdrawal.' });
  }
};

// exports.getWithdrawals = async (req, res) => {
//   try {
//     const withdrawals = await Withdrawal.find(req.params.id)
//       .sort({ createdAt: -1 }) // latest first
//       .populate('userId', 'email firstName lastName') // include user info
//       .lean();

//     res.status(200).json({ data: withdrawals });
//   } catch (err) {
//     console.error('Error fetching withdrawals:', err);
//     res.status(500).json({ message: 'Failed to fetch withdrawals' });
//   }
// };

exports.getWithdrawals = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || null;
        const skip = (page - 1) * limit;

        let filter = {};
        if (status && ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
            filter.status = status;
        }

        const withdrawals = await Withdrawal.find(filter)
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Withdrawal.countDocuments(filter);

        res.json({
            success: true,
            data: withdrawals,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error('Get all withdrawals error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching withdrawals',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

//Videos
// exports.LikeVideo = async (req, res) => {
//   const { id } = req.params;
//   await Video.findByIdAndUpdate(id, { $inc: { likes: 1 } });
//   res.json({ success: true });
// };


exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.likeVideo = async (req, res) => {
  const { videoId, userId } = req.body;

  if (!videoId || !userId) {
    return res.status(400).json({ error: 'videoId and userId are required' });
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const alreadyLiked = video.likedBy.includes(userId);

    if (alreadyLiked) {
      // Dislike
      video.likedBy.pull(userId);
      video.likes = Math.max(0, video.likes - 1);
    } else {
      // Like
      video.likedBy.push(userId);
      video.likes += 1;
    }

    await video.save();

    res.status(200).json({
      success: true,
      video,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.CommentVideo = async (req, res) => {
  const { id } = req.params;
  const { user, text } = req.body;
  await Video.findByIdAndUpdate(id, {
    $push: { comments: { user, text } },
  });
  res.json({ success: true });
};

exports.ShareVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndUpdate(id, { $inc: { shares: 1 } });
  res.json({ success: true });
};
const s3 = new AWS.S3({
  accessKeyId: '9W9WEKL0GQDEABGCHTE9',
  secretAccessKey: 'QeLssFsizJ38tzBADsewT0R5qgJfSSukGF9bd4Cz',
  endpoint: 'https://s3.ap-southeast-1.wasabisys.com', // Wasabi endpoint
  region: 'ap-southeast-1',
  signatureVersion: 'v4',
});

// exports.handler = async (req, res) => {
//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

//   const { fileName, fileType } = req.body;

//   const key = `uploads/${Date.now()}_${fileName}`;

//   const params = {
//     Bucket: 'earnkar',
//     Key: key,
//     Expires: 60,
//     ContentType: fileType,
//     ACL: 'public-read',
//   };

//   try {
//     const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
//     const fileUrl = `https://s3.ap-southeast-1.wasabisys.com/earnkar/${key}`;

//     return res.status(200).json({ uploadUrl, fileUrl });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.AddVideo = async (req, res) => {
//   const { uri, user, description } = req.body;
//   if (!uri || !user || !description) {
//     return res.status(400).json({ error: 'Missing fields' });
//   }

//   try {
//     const result = await Video.create({
//       uri,
//       user,
//       description,
//       likes: 0,
//       comments: [],
//       shares: 0,
//     });

//     res.status(200).json({ success: true, video: result });
//   } catch (err) {
//     console.error('Failed to save video:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


exports.handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileName, fileType } = req.body;

  const key = `uploads/${Date.now()}_${fileName}`;

  const uploadParams = {
    Bucket: 'earnkar',
    Key: key,
    Expires: 60,
    ContentType: fileType,
    // ACL: 'public-read', ❌ REMOVE THIS
  };

  try {
    // Step 1: Generate signed PUT URL for uploading
    const uploadUrl = await s3.getSignedUrlPromise('putObject', uploadParams);

    // Step 2: Prepare signed GET URL to access uploaded file privately
    const getUrlParams = {
      Bucket: 'earnkar',
      Key: key,
      Expires: 60 * 60 * 24 * 7,
    };
    const fileUrl = await s3.getSignedUrlPromise('getObject', getUrlParams);

    return res.status(200).json({ uploadUrl, fileUrl, key });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// exports.handler = async (req, res) => {
//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

//   const { fileName, fileType } = req.body;
//   const key = `uploads/${Date.now()}_${fileName}`;

//   const uploadParams = {
//     Bucket: 'earnkar',
//     Key: key,
//     Expires: 60, // 1 minute to upload
//     ContentType: fileType,
//     ACL: 'public-read', // ✅ allows permanent public access
//   };

//   try {
//     // Step 1: Get upload URL
//     const uploadUrl = await s3.getSignedUrlPromise('putObject', uploadParams);

//     // Step 2: Build permanent public file URL
//     const fileUrl = `https://s3.ap-southeast-1.wasabisys.com/earnkar/${key}`;

//     return res.status(200).json({ uploadUrl, fileUrl, key });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };


exports.AddVideo = async (req, res) => {
  const { uri, user, username ,avatar, description,isAdmin  } = req.body;

  if (!uri || !user || !username || !description || !avatar) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await Video.create({
      uri,
      user,
      username,
      avatar, // ✅ store avatar
      description,
      likes: 0,
      comments: [],
      shares: 0,
      isApproved: isAdmin ? true : false,
    });

    res.status(200).json({ success: true, video: result });
  } catch (err) {
    console.error('Failed to save video:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.approveVideo = async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { isApproved: true },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.status(200).json({ success: true, video });
  } catch (error) {
    console.error('Error approving video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getApprovedVideos = async (req, res) => {
  console.log('getApprovedVideos called');
  try {
    console.log('Attempting to fetch approved videos...');
    const videos = await Video.find({ isApproved: true }).sort({ createdAt: -1 });
    console.log('Videos found:', videos.length);
    res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error('Error in getApprovedVideos:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};


exports.deleteVideo = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Missing video ID' });
  }

  try {
    const deleted = await Video.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Video not found' });
    }

    return res.status(200).json({ success: true, message: 'Video deleted successfully' });
  } catch (err) {
    console.error('Error deleting video:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserVideos = async (req, res) => {
  const { username } = req.params;

  try {
    const videos = await Video.find({ user: username }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      videos,
      message: videos.length === 0 ? "No videos found" : undefined
    });

  } catch (error) {
    console.error("Error in getUserVideos:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getUserVideosById = async (req, res) => {
  const { userId } = req.params;

  try {
    const videos = await Video.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      videos,
      message: videos.length === 0 ? "No videos found" : undefined
    });

  } catch (error) {
    console.error("Error in getUserVideosById:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


// POST /api/report
exports.reportVideo = async (req, res) => {
  try {
    const { videoId, reporterId, reason, description } = req.body;

    if (!videoId || !reporterId || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Optional: Prevent duplicate reports by same user on same video
    const existing = await Report.findOne({ videoId, reporterId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reported this video' });
    }

    const report = new Report({
      videoId,
      reporterId,
      reason,
      description
    });

    await report.save();

    res.json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    console.error('❌ Report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/reports
exports.getReportVideo = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('videoId', 'description uri') // Make sure these fields exist in Video model
      .populate('reporterId', 'username email firstName lastName') // Add more fields if needed
      .sort({ createdAt: -1 });
    
    console.log('Reports with populated data:', reports); // Debug log
    res.json({ success: true, reports });
  } catch (error) {
    console.error('❌ Fetch reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

