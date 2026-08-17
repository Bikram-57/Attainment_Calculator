const mongoose = require('mongoose');

// Sub-schema for individual student records
const studentMarksSchema = new mongoose.Schema({
  regNo: {
    type: String,
    required: true,
    trim: true
  },
  co1: { type: Number, default: 0 },
  co2: { type: Number, default: 0 },
  co3: { type: Number, default: 0 },
  co4: { type: Number, default: 0 },
  co5: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false }); // _id is disabled here to keep the array clean, as regNo is already a unique identifier per batch

// Main schema to store the uploaded batch data
const endSemMarks = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    trim: true,
    index: true // Indexed for faster queries when searching by subject
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    trim: true
  },
  maxMarksPerCO: {
    type: Number,
    default: 20
  },
  students: [studentMarksSchema] // Embeds the array of student marks
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('endSemMarks', endSemMarks);