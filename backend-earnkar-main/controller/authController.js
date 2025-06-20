const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Video = require('../models/Video'); // Path may vary
const multer = require('multer');
const path = require('path');
const Withdrawal = require('../models/Withdraw');

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
      avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAlQMBEQACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EAEMQAAEDAwEEBQgHBAsBAAAAAAEAAgMEBREhBhIxQRMiUWGBFDJScZGh0eEHIyRCYrHBM0NykjQ1VHOCorLC0vDxFf/EABsBAQACAwEBAAAAAAAAAAAAAAAEBQEDBgIH/8QANBEAAgICAQMDAgUBBwUAAAAAAAECAwQRIQUSMSJBURMyYXGRscFSFBWBodHh8QYjJDNC/9oADAMBAAIRAxEAPwDuKAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIDBIAyVhtLyDXkraWM4fUwtPYXhaZZNMfukv1NiqsfiLPn/wClRf2uH+cLx/bcb+tfqev7Pd/S/wBD2jnil/ZysePwuBW6NsJfbJGtxkvKPVbDyEAQBAEAQBAEAQBAEAQAnCA1a2vp6NuZn4dyYNXHwUbIy6sdbmzbVTO16iiBqr9USkinaImdp1d8FR39YtlxWtIsqsCK+97IyaaaY5mmkkP4iqyd1lj9cmyZGuEftR5jA5YWpL4NoQDGqwuOTGtm1T19XT/s6h+PRcd4e9S6s3Iq+2X68mieLVPyiXotoGEhtXHuH026jxHJW+P1mMuLlr8fYgW9PlHmD2TccrJWh0bg5p4FpyFdRnGa3F7RXtOL0z7XowEAQBAEAQBAEBhAQl2vXQudT0uHSfefyb81TZ3U1X/26vPz8E/Gw3P1T8Fee50jy+Rxc53Ek5K52c5TfdJ7ZbxjGK0kRV+vdPZaQSzAvlfpHE06uPaewd63Y2PK+XHg8znrwREe0zaC3tqrpL0tbVDpGUkGgjYfN48M8cnJUuWH3z7ILUV7+7ZqU/cgqvbW6zv+oMNNHyDGbx9rvgFJhg0xXPJhzkz0t98u0zhJV36npYzriRrXvI7mNGfbhLMalLiG2Y738llp9qrOxjWS3J0zxxkMDm59gUCeFc3uMdf4m2NiS5JGju9urn7lJXU8j/QDwHew6rRPHth90T2pxZu81pPZs0VbPRSb0LuqT1mE6OUnGy7MeW4vj4I9+PC1c+S1W+virot+PRw85h4hdVi5UMiHdEpbqZVS0zcUo0hAEAQBAEAJwgIO/XMxfZqd2JHDrOH3R8VTdTzvpr6Vfn3/AAJ+Hjd775eCuAYXN+S40aldXx0lRQwyOANXP0QJ5dUn3ndHit1VLsjJr2R4nLtZzDaG4Pud3qZ3nqB5ZEM8GA4Hx8VeU1qutRRHb29keSScuJJ7StxgwgCAID6Y3fe1u81uvFx0HwQF62YkvkTGhs9JcqQaFrasPkYO536E+xVuVHHbfd6X+R7jJlvBy0HGM8lUtEleD1pqiWlmbLCcOHLke4rdRfOianBmu2qNke2RcLfWR1lO2WPnoW+iexdhjZEb6++JQW1Sql2yNpbzWEAQBAEBqXKrbR0j5TxGjR2nko2XkKipzZtpqds1FFNe50j3Pe7ec45J71xkpynJyl5Z0MYqKSRheT0VD6R2O8joZWk4bM5unIluR/pKtOmtblE0XeUUWWN8Zb0jSC9oe3PMHgrVo072elFR1VfL0VDTy1DxxbEwux68cPFNGG0vJLR7GbTSDLbPIB+OeFvuL8rG4/J5+pH5Emxm0sYy6zy4/DPC73B+VncfkfUj8kVXUNZbz9vpZ6YE4BljLQT3E6FD0pJ+DXQyfcEslPK2aCR8UjT1XsOCEfPDB1HZesr6+0RVFyY0PeT0bwMGRnJxHL9ePNUWXCuuzUP+CRW21yTCiG03rNWmjrBvH6qTR3d2FWHTsn6F2n9rIeZR9SG15Rbwc811iKMysgIAgCAq+0dSZatsAPViGv8AEfkuZ6xf3WqteF+5b9Pq1FzfuRKpyxCAqW3tTURUQgkpo5aOfAbLvEOikGo9emezmrTp8IN9yemvb5RHs3vTMbD2K3bQ2mKa5ROkdb55IWtDsCRp3ZAHY1wC52neVaSnpIiTbjLj3OiU8MVNCyCniZFEzzWMbuhvgFo235NWj0WDIQGHDea5pwWuGHAjIPgs70YK1eNh7LcsvjhNFOf3lNoPFnmn3HvXtWP3PSlJeDlt1onWW81FFM6OodSvaHO3Oq/LQ7zfHGFtRIi9rZ1G0eXG3xOugibVOGXsjbuhnYOJ1wudyPp97VfglVp6N1aDYYWQW6xVJqaBhccvj6jj3j5Lr+nX/Wx035XBz+VV9O1peCRU4jhAEBgnAWG9cgos8vTzyTHjI4n4Lh7p/UslP5Z0lUeyCj8HwtRsCA1bnb23S31FG5pIkYQHAZ3Xcj4HBW/HnKFilFGuzWuSN+iqJ8VnuIkaWubXFjh2OaxmfzV9Z7FfZ5LqtR4CAIAgCA5s61Gt+ky6OexzoqR7JnDGckxs3ffr/hTJm4U+nyyTTppbLeqAnIysAICZ2XmLaiaEnR7d4esf+q86Lbqcq/krOow4UiyDguiKoygCA1695jo53ji2NxHsWnIl21Sl+DPda3NIpA0GFw50plAFkG3bngSPZzIyFOwp6biRMqL0mfFooW0FTdWswG1NYasAct9jQf8AMxx8Vaze0iFvZIrWZCAIAgHFZBHW2iZDcrtcDjerJ2a44MjjawD+YPPivc5JJfgYW3weD3bz3OxjJJXPWS7pNltBaikYXg9BAb9icW3SLH3g5p9nyVj0p6yl+OyHnLdLLcOC60ozKAIDVuf9Aqf7p35KNlrePP8AJm2h6tj+ZS1xZ0YWAEAa4tcHNOCOC9Rk4vaMNJrTJCmqhMd1zd14HHkVaY+T9R9rXJAtpcOV4NpSjQYQBAEAJAGTwRvS2FyyOqKsyt3GN3Wnj2lVl+U5rtj4J1VHbyzXUMkhYAQG7ZP60g9Z/Iqf0xf+VH/H9iLm/wDoZcBwXXlCZQBAeczOkiew8HNIXiyPdFoynp7KIARodCOK4XTXDOmT3yjKwZCAID6jeY3te3iCvdc3CSaPM49y0SzXte0Pacgq8jJSW0Vbi09MysmAgCA1q+Xci3Aes/3BRcu1Rh2+7JGPDulv4I5VJPMoAgCAk9nGb9x3uTGE+3RWvSIbyN/CIHUJaq0WsLqSmCAIAgKZdoPJ7hM37rjvt9R+eVx3UKfpZEl88l9iT76l+BqKESggCyDXqq6kpCwVVTDCZD1BI8N3vatkKbLFuC2a5Wwj9zJGgmc04GHRlu9ka+IUrDlNTcGR8hRce5Eg3UZGoViRAgPmaQRNydTyHaj8cBeSDra6GmaZ62ojha4+dI4NHhlUyjbfLaTZY91dUUmz6jkZLG2SN7XscMtc05B8VqlFxemuTZGSlyj7WD0FgBZBYtl4MU8s7v3jsD1D5rpOjVaqlY/f+Cm6hPc1D4JxXJACAIAgITaSj6SnbUMGXRedj0T8FT9Xx3ZWrV5j+xOwLeyfa/DK4uZLlBDJD7S3ltnt7pGBr6h53ImHk451PcPfwVhg4MsiW2vSvL/gh5OVGtdqfqOX1MstXLJLVSOmkk897+JXUwioRUY8JFNL1PbLT9D8EsN+r2NdJ5Kyjy1m8dzeMjdccM4BUbL1271ybKfu0dQlY+LL4fNPFuFAJJ5+UyHhuj1BZ0Dzb1pW75Jy4ZOVkwcDZBL5XLPWOfJUhzmb8ri5wwSDqdVcLSWlwiC+XyT+zt9mstUHbznUbz9dF3ekOwj3qHmYkcmD/q9mSKL5VP8AA6iyRsjWujcHNPBw4LlLKp1S7bE0/wAS7rsjNbi9o+14Nh9QxOnlZFGMuecBe663bNQXueLJqEXJl2pIW08DImeaxoC7aqtVQUF7HOTm5ycn7nsth5CAIAgPl7Q5paRkHQhYaTWmPHKKddKF1BUboB6J2rD+i5DOxHjWcfa/Be4uQrY8+UVe6XWTfdBSu3Q04dIOJPMBdd0H/puEoRycpb3yo/y/9Dn+qdYn3uqh615ZCSsbM1zZW74f5wdrlds6K5V/TcePg5xWSjLu3yVy5WuSkJki68HHPNvr+K5rN6dOh90eY/sXeLmRt9MuGZsN4qbHcWVlIc46skZOBIzm0/HkVU2QU46ZOT7Xs7TarjTXWhiraN+9FIOHNp5h3YQqucHCWmS4yUkez4I3EndIPcvKZ6KntvtFFZIDRW9wNxmb52c9A30v4jy9vrlUU9/qfg02T1wjljWukfusDnPdoBxJVjGLk1GK5IspKK2ywWu1CAieoAMw1a3kz5ro8Dpir1Zby/j4KfKzXP0w8ExTzy0z9+nkMZPHHP19qmZmBj5kHC6O/wB/1IuPk248u6uWiyWyvbWwkkbsrPPby9a+Xda6RPpt2t7g/D/hnbdN6gsyvniS8ouGz1vMTfKpm9d46gPIdqldKw/pr6s1y/BqzcjufZHwTiuiAEAQBAEAQGvW0sdZA6GUaHgRxae0LVbTC2PbNbR6jOUHuL0cjvdnqrLVGGpBcwk9HMB1Xj49y7PDyq76048Nexzd9Eqpeoj1MNARrfAIqvszJSX0uI3nXcxhp+CpczpMZ+qnh/HsWWPnuPps5R8bPXut2XuOXRvNPIQJ4DoHj0m/iHL2Fc3k4sl6JrTLem+LXdB7L3tDtvQUVqiltcsdTVVLMwt4iMcN545YIOnMjsVfXjNy9XhEudq1wc2ho626VD6mVziZXF0k8v3z296vcXAtv12rS+Stvy66vPLJ2ioYKNuI25fze7iV0uLg1Y69PL+SlvyZ3P1ePg2VMI4JwOXijBddiNnJnSC417THEW4jhcMF+vEjkNNFzPWrKMlKnW+17Lnp1dtTdnja0X4DCqywMoAgCAIAgCAIDWr6Knr6d1PVQslidxa4e/uK912Srl3QemeZwjOPbJcHPr7sVV0bnS20mqgGvRn9o0f7v+6K+xeqwn6beH/kVF+BKPNfKKs4Fjix7S1zThzXDBB7xyVwpJraZAa09MwsmD4mijmYWSxte08nDK12012x7ZrZ7hZKt7i9GrBaqOCQyNi3iTnrnIHq+ahVdLx65dyW/wAyRPNunHTf6G6rFJJaRF8hDBs0FBV3GboqGnfM7ODujRvrPALRdkV0rc3o2V1TseoovuzuxkNEWVNyLKioGoYNY2d/efX7FQZfU52+mviP+ZbY+DGHqnyy2gYVWTzKAIAgCAIAgCAIAgMEZQGhcrNb7mPttLHI7GA/GHDxGq3VZFtL9EtGqymuz7kVus+j+lcSaKtli/DI0PH6FWNfWLVxOOyHPp0G/S9EVLsFdGn6qppJB3lzT+RUuPWan5i0R306z2aPMbDXj06MDt6U/wDFe/74x/h/p/uef7vu+UbVPsBVk/aa+Bg7ImFx9+Fpn1qP/wAwZsj02XvIm6DYa1U+HVJlqndkjsN9g/XKg2dUvn9r1+RKhgVLzyWOCmhpomxU8TIo28GsaAB7FXybk9yeyZGKitJHqsGQgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgP/9k=',
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


exports.withdraw = async (req, res) => {
  const { walletAddress, walletType, withdrawPoints } = req.body;

  if (!withdrawPoints || withdrawPoints < 5) {
    return res.status(400).json({ message: 'Minimum 5 points required for withdrawal.' });
  }

  const user = await User.findById(req.user.id);

  if (user.points < withdrawPoints) {
    return res.status(400).json({ message: 'Insufficient points for withdrawal.' });
  }

  const amountUSD = withdrawPoints / 100; // 100 points = 1 USD

  const withdrawal = new Withdrawal({
    userId: user._id,
    points: withdrawPoints,
    amountUSD,
    walletAddress,
    walletType,
  });

  await withdrawal.save();

  // Deduct only the requested points
  user.points -= withdrawPoints;
  await user.save();

  res.status(200).json({ message: 'Withdrawal request submitted.', withdrawal });
};

exports.withdrawCompletion = async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id);

  if (!withdrawal) {
    return res.status(404).json({ message: 'Withdrawal not found.' });
  }

  withdrawal.status = 'completed';
  withdrawal.completedAt = new Date();
  await withdrawal.save();

  res.status(200).json({ message: 'Withdrawal marked as completed.' });
}

exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find(req.params.id)
      .sort({ createdAt: -1 }) // latest first
      .populate('userId', 'email firstName lastName') // include user info
      .lean();

    res.status(200).json({ data: withdrawals });
  } catch (err) {
    console.error('Error fetching withdrawals:', err);
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
};

//Videos
// exports.LikeVideo = async (req, res) => {
//   const { id } = req.params;
//   await Video.findByIdAndUpdate(id, { $inc: { likes: 1 } });
//   res.json({ success: true });
// };

exports.LikeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;

    // Check if ID is valid
    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }

    const video = await Video.findByIdAndUpdate(videoId, { $inc: { likes: 1 } }, { new: true });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json({ success: true, likes: video.likes });
  } catch (error) {
    console.error('Error in LikeVideo controller:', error); // 👈 See error in your terminal
    res.status(500).json({ success: false, message: 'Server error' });
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

