const express = require('express');
const router = express.Router();
const {AdminLogin,Ad,getAd,editAd, deleteAd,getAdPhoto}=require('../controller/adminAuthController')
const upload=require('../controller/upload');

router.post('/admin-login', AdminLogin );
router.post('/ad', upload.single('photo'), Ad); // 'photo' matches frontend field
router.get('/getAd', getAd );
router.delete('/getAd/:id', deleteAd);
router.put('/getAd/:id',editAd);
router.get('/ad/photo/:id', getAdPhoto); // New route to serve image binary



module.exports = router;
