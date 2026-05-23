const mongoose = require('mongoose');

// 1. Schema for the individual levels
// Mongoose's 'Number' type natively supports decimals (floats) like 34.99
const thresholdSchema = new mongoose.Schema({
  level: { 
    type: Number, 
    required: [true, 'Attainment level is required (e.g., 0, 1, 2, 3)'] 
  },
  minPercent: { 
    type: Number, 
    required: [true, 'Minimum percentage is required'],
    min: [0, 'Percentage cannot be less than 0'],
    max: [100, 'Percentage cannot exceed 100']
  },
  maxPercent: { 
    type: Number, 
    required: [true, 'Maximum percentage is required'],
    min: [0, 'Percentage cannot be less than 0'],
    max: [100, 'Percentage cannot exceed 100']
  }
}, { _id: false });

// 2. Main Rubric Schema
const rubricSchema = new mongoose.Schema({
  course: { 
    type: String, 
    required: [true, 'Course/Program identifier is required'],
    trim: true,
    uppercase: true, // Converts "bca" to "BCA" automatically
    enum: {
      values: ['BCA', 'MCA'],
      message: 'Course must be either BCA or MCA. Received: {VALUE}'
    }
  },
  year: { 
    type: Number, 
    required: [true, 'Academic year is required'] 
  },
  thresholds: {
    type: [thresholdSchema],
    validate: [
      {
        // Validator 1: Ensure all mandatory levels exist
        validator: function(v) {
          if (!v || v.length === 0) return false;
          const providedLevels = v.map(t => t.level);
          const mandatoryLevels = [0, 1, 2, 3]; 
          return mandatoryLevels.every(level => providedLevels.includes(level));
        },
        message: 'You must provide a range for EVERY level: 0, 1, 2, and 3.'
      },
      {
        // Validator 2: Ensure min is never greater than max
        validator: function(v) {
          for (let t of v) {
            if (t.minPercent > t.maxPercent) return false;
          }
          return true;
        },
        message: 'A level\'s minimum percentage cannot be higher than its maximum percentage.'
      },
      {
        // Validator 3: The Overlap Prevention Engine
        validator: function(v) {
          // Clone and sort the ranges from lowest minPercent to highest
          const sorted = [...v].sort((a, b) => a.minPercent - b.minPercent);
          
          // Loop through the sorted ranges and compare each one to the next
          for (let i = 0; i < sorted.length - 1; i++) {
            // If the current level's MAX touches or crosses the next level's MIN, it's an overlap!
            // Example: 34.99 >= 35.00 is FALSE (Safe). 35.00 >= 35.00 is TRUE (Error).
            if (sorted[i].maxPercent >= sorted[i + 1].minPercent) {
              return false; 
            }
          }
          return true;
        },
        message: 'Percentage ranges cannot overlap. Ensure you use decimals properly (e.g., 34.99 and 35.00).'
      }
    ]
  }
}, { timestamps: true });

// 3. Database Indexes
// This index ensures lightning-fast queries and guarantees we never 
// accidentally save two rubrics for the exact same course and year.
rubricSchema.index({ course: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Rubric', rubricSchema);