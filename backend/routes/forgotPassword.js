const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { handleSendOtp, handleVerifyOtp, handleChangePassword } = require('../controllers/forgotPassword');

// Rate limiting to stop brute force bot attacks
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: 'Too many attempts, please try again later.'
});

router.post('/send-otp', otpLimiter, handleSendOtp);
router.post('/verify-otp', handleVerifyOtp);
router.post('/change-password', handleChangePassword);

module.exports = router;