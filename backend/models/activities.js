const mongoose = require('mongoose');

// The shape of a single activity inside the array
const activityItemSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  action: { type: String, required: true },
  target: { type: String },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// The master document for the user
const userActivityStoreSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true, 
    unique: true // Guarantees only ONE master document per user
  },
  activities: [activityItemSchema] // The capped array
});

module.exports = mongoose.model('ActivityStore', userActivityStoreSchema);