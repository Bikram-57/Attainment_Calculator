const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'faculty'],
    default: 'faculty'
  },
  profileImage: {
    type: String,
    default: '/images/profilePlaceholder.jpg' 
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  refreshTokens: [{
    type: String
  }],
  
  // --- Password Reset Fields ---
  resetOtp: { 
    type: String, 
    default: null 
  },
  resetOtpExpires: { 
    type: Date, 
    default: null 
  }

}, { timestamps: true });

module.exports = mongoose.model('user', userSchema);