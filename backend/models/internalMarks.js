const mongoose = require('mongoose');

// Sub-schema for the marks structure
const MarksSchema = new mongoose.Schema({
  // Quiz 1
  Quiz_1_CO1: { type: Number, default: null },
  Quiz_1_CO2: { type: Number, default: null },
  Quiz_1_CO3: { type: Number, default: null },
  Quiz_1_TOTAL: { type: Number, default: 0 },

  // Mid Term
  Mid_Term_CO1: { type: Number, default: null },
  Mid_Term_CO2: { type: Number, default: null },
  Mid_Term_CO3: { type: Number, default: null },
  Mid_Term_TOTAL: { type: Number, default: 0 },

  // Quiz 2
  Quiz_2_CO1: { type: Number, default: null },
  Quiz_2_CO2: { type: Number, default: null },
  Quiz_2_CO3: { type: Number, default: null },
  Quiz_2_TOTAL: { type: Number, default: 0 },

  // Surprise Quiz
  Surprise_Quiz_CO1: { type: Number, default: null },
  Surprise_Quiz_CO2: { type: Number, default: null },
  Surprise_Quiz_CO3: { type: Number, default: null },
  Surprise_Quiz_TOTAL: { type: Number, default: 0 },

  // Assignment
  Assignment_CO1: { type: Number, default: null },
  Assignment_CO2: { type: Number, default: null },
  Assignment_CO3: { type: Number, default: null },
  Assignment_CO4: { type: Number, default: null },
  Assignment_CO5: { type: Number, default: null },
  Assignment_TOTAL: { type: Number, default: 0 }
}, { _id: false });

// Sub-schema for individual students in the array
const StudentMarksSchema = new mongoose.Schema({
  regNo: { type: String, required: true },
  marks: { type: MarksSchema, default: () => ({}) }
});

// Main Document Schema
const InternalMarks = new mongoose.Schema({
  academicYear: { type: String, required: true },
  course: { type: String, default: '' },
  subjectId: { type: String, required: true },
  maxMarks: { type: MarksSchema, default: () => ({}) },
  actualMarks: [StudentMarksSchema],
  uploadedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('InternalMarks', InternalMarks);