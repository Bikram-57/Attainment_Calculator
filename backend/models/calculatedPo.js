const mongoose = require('mongoose');

const poAttainmentSchema = new mongoose.Schema({
  course: { 
    type: String, 
    required: true 
  },
  subjectId: { 
    type: String, 
    required: true 
  },
  academicYear: { 
    type: String, 
    required: true 
  },

  mappingData: {
    type: Object,
    required: true
  },
  
  // Storing the calculated Average CO matrix
  // Defined as Object to allow a mix of numbers (e.g., 2) and empty strings ("")
  averageCo: { 
    type: Object, 
    required: true 
  },
  
 finalSubjectAttainment: { 
    type: Number, 
    required: true 
  },

  // Storing the final PO Attainment matrix
  poAttainment: { 
    type: Object, 
    required: true 
  }
}, { 
  // Automatically adds createdAt and updatedAt timestamps
  timestamps: true 
});

// Create a compound unique index so we don't accidentally get duplicate records
// for the exact same course, subject, and year. The controller's 'upsert' handles this perfectly.
poAttainmentSchema.index({ course: 1, subjectId: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('PoAttainment', poAttainmentSchema);