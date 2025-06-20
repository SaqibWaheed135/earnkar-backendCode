const router = require('express').Router();
const controller = require('../controllers/paymentController');

router.post('/order', controller.createOrder);
router.post('/check', controller.checkPaymentStatus);

module.exports = router;
