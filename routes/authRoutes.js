const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, uploadProfileImage, reward, clerkUserHandler, googleSignIn, withdraw, withdrawCompletion, getWithdrawals, getAllUsers, deleteUser, likeVideo, CommentVideo, ShareVideo,getVideos,handler,AddVideo,approveVideo,getApprovedVideos,deleteVideo } = require('../controller/authController');
const protect = require('../middleware/authmiddlerware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/getUsers', getAllUsers);
router.delete('/deleteUser/:id', deleteUser);

router.put('/profile', protect, updateProfile);  // <-- this must exist
router.put('/profile/image', protect, uploadProfileImage);
router.post('/reward', reward);
router.post('/clerk-user', clerkUserHandler);
router.post('/googleSignIn',googleSignIn);
router.post('/withdraw', protect, withdraw);
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
router.delete('/deleteVideo/:videoId', deleteVideo);


// router.get('/withdrawals', (req, res) => {
//   res.json({ message: 'Public access works' });
// });


//router.put('/profile', protect, updateProfile);


module.exports = router;
