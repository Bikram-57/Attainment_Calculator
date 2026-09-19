const mongoose = require('mongoose');

// Sub-schema for the attainment report structure
const labReportDataSchema = new mongoose.Schema({
  maxMarks: { type: Number, required: true },
  targetMarks: { type: Number, required: true },
  studentsAboveTarget: { type: Number, required: true },
  attainmentPercent: { type: Number, required: true },
  attainmentLevel: { type: Number, required: true }
}, { _id: false });

const calculatedLabMarkSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, index: true },
  course: { type: String, required: true },
  subjectId: { type: String, required: true, index: true },
  
  // Using Map allows for dynamic keys like "Lab_Exp_1_CO1", "Viva_CO2", etc.
  maxMarks: { type: Map, of: Number },
  
  actualMarks: [{
    regNo: { type: String, required: true },
    marks: { type: Map, of: Number } // Dynamic student marks
  }],
  
  reportData: { type: Map, of: labReportDataSchema },
  
  totalStudents: { type: Number, default: 0 },
  calculatedAt: { type: Date }
}, { 
  timestamps: true,
  strict: false // Acts as a fallback to allow seamless nested upserts
});

module.exports = mongoose.model('CalculatedLabMark', calculatedLabMarkSchema);