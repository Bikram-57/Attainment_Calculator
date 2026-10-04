const mongoose = require('mongoose');

const CoPsoMappingSchema = new mongoose.Schema({
  courseId: {
    // type: mongoose.Schema.Types.ObjectId,
    type: String,
    ref: 'Course', // Assumes you have a Course model
    required: true
  },
  batch: {
    type: String, // e.g., '2024-2027'
    required: true
  },
  
  // The actual articulation matrix
  matrix: [{
    coCode: {
      type: String, 
      required: true // e.g., 'CO1', 'CO2'
    },
    
    // Using a Map (Dictionary) for PSOs
    // This allows dynamic keys like "PSO1": 3, "PSO2": 1
    psoValues: {
      type: Map,
      of: {
        type: Number,
        min: 1,
        max: 3 // Standard OBE correlation scale
      },
      required: true
    }
  }]
}, { 
  timestamps: true 
});

// Compound index to ensure one course/batch combination doesn't have duplicate mapping matrices
CoPsoMappingSchema.index({ courseId: 1, batch: 1 }, { unique: true });

module.exports = mongoose.model('CoPsoMapping', CoPsoMappingSchema);