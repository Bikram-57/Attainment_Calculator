const User = require('../models/forgotPassword');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');

// 1. Send the OTP
async function handleSendOtp (req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, an OTP was sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const message = `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`;

    try {
      await sendEmail({ email: user.email, subject: 'Password Reset OTP', message });
      res.status(200).json({ success: true, message: 'OTP sent to email!' });
    } catch (emailError) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Verify the OTP (Middle Step)
// exports.verifyOtp = async (req, res) => {
async function handleVerifyOtp (req, res) {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpire: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ success: true, message: 'OTP verified, proceed to change password' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Change the Password
// exports.changePassword = async (req, res) => {
async function handleChangePassword (req, res) {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
    handleSendOtp,
    handleVerifyOtp,
    handleChangePassword
}