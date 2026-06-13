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
  
  // Status lets you instantly disable a user's access
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Array to hold active refresh tokens (allows login from phone & laptop)
  refreshTokens: [{
    type: String
  }]

}, { timestamps: true });

module.exports = mongoose.model('user', userSchema);



// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   facultyId: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     uppercase: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6,
//     select: false
//   },

//   role: {
//     type: String,
//     enum: ['admin', 'faculty'],
//     default: 'faculty'
//   },
//   // UPDATED FIELD:
//   profileImage: {
//     type: String,
//     default: '/images/profilePlaceholder.jpg' // Stored relative to the /public root
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('user', userSchema);