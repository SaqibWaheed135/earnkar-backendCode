const router = require('express').Router();
const { reward }  = require('../controller/rewardController');

router.post('/reward', reward);


module.exports = router;
