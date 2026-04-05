// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   facultyId: {
//     type: String,
//     required: [true, 'Faculty ID is required'],
//     unique: true, // Prevents duplicate IDs
//     trim: true,
//     uppercase: true
//   },
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true, // Prevents duplicate Emails
//     lowercase: true,
//     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: 6,
//     select: false 
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'faculty'],
//     default: 'faculty'
//   }
// }, { 
//   timestamps: true 
// });

// module.exports = mongoose.model('user', userSchema);


































/// models/user.js
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