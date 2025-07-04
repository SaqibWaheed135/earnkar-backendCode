const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, uploadProfileImage, reward, clerkUserHandler, googleSignIn, withdraw, withdrawCompletion, getWithdrawals, getAllUsers, deleteUser, likeVideo, CommentVideo, ShareVideo,getVideos,handler,AddVideo,approveVideo,getApprovedVideos,deleteVideo,getUserVideos,getUserVideosById, reportVideo, getReportVideo,forgotPassword,verifyResetToken,resetPassword,changePassword} = require('../controller/authController');
const protect = require('../middleware/authmiddlerware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token',verifyResetToken);
router.post('/reset-password', resetPassword);

// Protected route for changing password when logged in
router.post('/change-password', changePassword);

router.get('/profile', protect, getProfile);
router.get('/getUsers', getAllUsers);
router.delete('/deleteUser/:id', deleteUser);

router.put('/profile', protect, updateProfile);  // <-- this must exist
router.put('/profile/image', protect, uploadProfileImage);
router.post('/reward', reward);
router.post('/clerk-user', clerkUserHandler);
router.post('/googleSignIn',googleSignIn);
router.post('/withdraw',withdraw);
// router.post('/withdrawals/:id/complete', withdrawCompletion);
router.post('/withdrawals/:id/complete', withdrawCompletion);
router.get('/withdrawals', getWithdrawals);
router.post('/likeVideo', likeVideo); // 🔥 add this route
router.post('/videos/:id/comment', CommentVideo);
router.post('/videos/:id/share', ShareVideo);
router.get('/getVideos', getVideos);
router.post('/uploadVideo', handler);
router.post('/addVideo', AddVideo);
router.post('/approveVideo', approveVideo);
router.get('/getApprovedVideos', getApprovedVideos);
router.delete('/deleteVideo/:id', deleteVideo);
router.get("/videos/user/:username", getUserVideos);
router.get("/videos/user/id/:userId", getUserVideosById);
router.post("/reportVideo", reportVideo);
router.get("/getreportVideo", getReportVideo);


// router.get('/withdrawals', (req, res) => {
//   res.json({ message: 'Public access works' });
// });


//router.put('/profile', protect, updateProfile);


module.exports = router;
