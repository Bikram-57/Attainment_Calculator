const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    required: [true, 'Subject ID is required'],
    trim: true,
    uppercase: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  academicYear: {
    type: Number,
    required: [true, 'Academic Year is required'],
    index: true 
  },
  semester: { 
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8, // Adjust this max value if your courses go beyond 8 semesters
    index: true
  },
  status: {
    type: String,
    required: [true, 'Subject status is mandatory'],
    enum: ['Pending', 'Uploaded'], 
    default: 'Pending',        
    index: true                
  },
  copoMappingStatus: {
    // NEW: CO-PO Mapping Status field added here
    type: String,
    required: [true, 'CO-PO mapping status is mandatory'],
    enum: ['Pending', 'Uploaded'], // You can add 'In Progress' or other states if needed
    default: 'Pending',
    index: true // Added an index to optimize queries for subjects missing mappings
  }
}, { timestamps: true });

// UPDATED COMPOUND INDEX: Now includes semester. 
// A subject ID is unique within a specific semester of a specific year.
subjectSchema.index({ subjectId: 1, academicYear: 1, semester: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);

// Force index creation for the new compound rule
Subject.createIndexes(); 

module.exports = Subject;

