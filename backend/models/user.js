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
  // UPDATED FIELD:
  profileImage: {
    type: String,
    default: '/images/profilePlaceholder.jpg' // Stored relative to the /public root
  }
}, { timestamps: true });

module.exports = mongoose.model('user', userSchema);