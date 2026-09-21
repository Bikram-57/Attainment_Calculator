const mongoose = require('mongoose');

const labPoAttainmentSchema = new mongoose.Schema({
  course: { 
    type: String, 
    required: true,
    uppercase: true // Auto-formats to uppercase
  },
  subjectId: { 
    type: String, 
    required: true,
    uppercase: true 
  },
  academicYear: { 
    type: String, 
    required: true 
  },

  mappingData: {
    type: Object,
    required: true
  },
  
  // Storing the calculated Average CO matrix for the Lab
  averageCo: { 
    type: Object, 
    required: true 
  },
  
  // This stores the final score pulled from FinalLabAttainment
  finalSubjectAttainment: { 
    type: Number, 
    required: true 
  },

  // Storing the final PO Attainment matrix for the Lab
  poAttainment: { 
    type: Object, 
    required: true 
  }
}, { 
  // Explicitly name the collection so it doesn't mix with theory subjects
  collection: 'labpoattainment',
  timestamps: true 
});

// Compound unique index to prevent duplicate records for the same lab batch
labPoAttainmentSchema.index({ course: 1, subjectId: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('LabPoAttainment', labPoAttainmentSchema);