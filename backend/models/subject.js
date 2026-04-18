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
  year: {
    type: Number,
    required: [true, 'Academic Year is required'],
    index: true 
  },
  // status: {
  //   type: String,
  //   required: [true, 'Subject status is mandatory'], // NEW: Makes the field mandatory
  //   enum: ['Pending', 'Done'], 
  //   default: 'Pending',        
  //   index: true                
  // }
}, { timestamps: true });

// COMPOUND INDEX: This ensures a subject ID is unique within a specific year
subjectSchema.index({ subjectId: 1, year: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);

// Force index creation for the new compound rule
Subject.createIndexes(); 

module.exports = Subject;





































































// // const mongoose = require('mongoose');

// // // const subjectSchema = new mongoose.Schema({
// // //   subjectId: { // Changed from subjectCode to subjectId
// // //     type: String,
// // //     required: [true, 'Subject ID is required'],
// // //     unique: true,
// // //     trim: true,
// // //     uppercase: true,
// // //     immutable: true 
// // //   },
// // //   subjectName: {
// // //     type: String,
// // //     required: [true, 'Subject name is required'],
// // //     trim: true
// // //   },
// // //   course: {
// // //     type: String,
// // //     required: [true, 'Course name is required'],
// // //     trim: true
// // //   }
// // // }, { timestamps: true });

// // const subjectSchema = new mongoose.Schema({
// //   subjectId: {
// //     type: String,
// //     required: [true, 'Subject ID is required'],
// //     unique: true, // This is the rule that prevents duplicates
// //     index: true,  // This forces MongoDB to build the index
// //     trim: true,
// //     uppercase: true
// //   },
// //   subjectName: {
// //     type: String,
// //     required: true
// //   },
// //   course: {
// //     type: String,
// //     required: true
// //   }
// // }, { timestamps: true });

// // // This line is a "Power Move": It tells Mongoose to create indexes immediately
// // const Subject = mongoose.model('Subject', subjectSchema);
// // Subject.createIndexes(); 

// // module.exports = Subject;


// const mongoose = require('mongoose');

// const subjectSchema = new mongoose.Schema({
//   subjectId: {
//     type: String,
//     required: [true, 'Subject ID is required'],
//     trim: true,
//     uppercase: true
//     // unique: true removed here to allow same ID in different years
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
//   year: {
//     type: Number,
//     required: [true, 'Academic Year is required'],
//     index: true // Helps with filtering by batch
//   }
// }, { timestamps: true });

// // COMPOUND INDEX: This ensures a subject ID is unique within a specific year
// subjectSchema.index({ subjectId: 1, year: 1 }, { unique: true });

// const Subject = mongoose.model('Subject', subjectSchema);

// // Force index creation for the new compound rule
// Subject.createIndexes(); 

// module.exports = Subject;