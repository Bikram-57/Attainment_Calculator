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
    // NEW: Semester field added here
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
  }
}, { timestamps: true });

// UPDATED COMPOUND INDEX: Now includes semester. 
// A subject ID is unique within a specific semester of a specific year.
subjectSchema.index({ subjectId: 1, academicYear: 1, semester: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);

// Force index creation for the new compound rule
Subject.createIndexes(); 

module.exports = Subject;









// const mongoose = require('mongoose');

// const subjectSchema = new mongoose.Schema({
//   subjectId: {
//     type: String,
//     required: [true, 'Subject ID is required'],
//     trim: true,
//     uppercase: true
//   },
//   subjectName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   course: {
//     type: String,
//     required: true,
//     uppercase: true,
//     trim: true
//   },
//   academicYear: {
//     type: Number,
//     required: [true, 'Academic Year is required'],
//     index: true 
//   },
//   status: {
//     type: String,
//     required: [true, 'Subject status is mandatory'], // NEW: Makes the field mandatory
//     enum: ['Pending', 'Uploaded'], 
//     default: 'Pending',        
//     index: true                
//   }
// }, { timestamps: true });

// // COMPOUND INDEX: This ensures a subject ID is unique within a specific year
// subjectSchema.index({ subjectId: 1, academicYear: 1 }, { unique: true });

// const Subject = mongoose.model('Subject', subjectSchema);

// // Force index creation for the new compound rule
// Subject.createIndexes(); 

// module.exports = Subject;
