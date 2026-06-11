const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Add these two new fields for your OTP module
  resetPasswordOtp: { type: String },
  resetPasswordOtpExpire: { type: Date }
});

module.exports = mongoose.model('User', userSchema);