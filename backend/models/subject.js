const mongoose = require('mongoose');

// const subjectSchema = new mongoose.Schema({
//   subjectId: { // Changed from subjectCode to subjectId
//     type: String,
//     required: [true, 'Subject ID is required'],
//     unique: true,
//     trim: true,
//     uppercase: true,
//     immutable: true 
//   },
//   subjectName: {
//     type: String,
//     required: [true, 'Subject name is required'],
//     trim: true
//   },
//   course: {
//     type: String,
//     required: [true, 'Course name is required'],
//     trim: true
//   }
// }, { timestamps: true });

const subjectSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    required: [true, 'Subject ID is required'],
    unique: true, // This is the rule that prevents duplicates
    index: true,  // This forces MongoDB to build the index
    trim: true,
    uppercase: true
  },
  subjectName: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  }
}, { timestamps: true });

// This line is a "Power Move": It tells Mongoose to create indexes immediately
const Subject = mongoose.model('Subject', subjectSchema);
Subject.createIndexes(); 

module.exports = Subject;
