// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtp, resetPassword } = require('../controllers/forgotPassword');

// All public routes because the user is logged out during forgot password
router.post('/forgot-password/request', requestOtp);
router.post('/forgot-password/verify', verifyOtp);
router.post('/forgot-password/reset', resetPassword);

module.exports = router;