const express = require('express');
const router = express.Router();
const { LikeVideo, CommentVideo, ShareVideo } = require('../controller/authController');

router.post('/videos/:id/like', LikeVideo);
router.post('/videos/:id/comment', CommentVideo);
router.post('/videos/:id/share', ShareVideo);



// router.get('/withdrawals', (req, res) => {
//   res.json({ message: 'Public access works' });
// });


//router.put('/profile', protect, updateProfile);


module.exports = router;
