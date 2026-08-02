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
//   semester: { 
//     type: Number,
//     required: [true, 'Semester is required'],
//     min: 1,
//     max: 8, 
//     index: true
//   },
//   status: {
//     type: String,
//     required: [true, 'Subject status is mandatory'],
//     enum: ['Pending', 'Uploaded'], 
//     default: 'Pending',        
//     index: true                
//   },
//   copoMappingStatus: {
//     type: String,
//     required: [true, 'CO-PO mapping status is mandatory'],
//     enum: ['Pending', 'Uploaded'], 
//     default: 'Pending',
//     index: true 
//   }
// }, { timestamps: true });

// // ==========================================
// // MIDDLEWARE: CASCADE DELETE RELATED DATA
// // ==========================================
// subjectSchema.pre('findOneAndDelete', async function(next) {
//   try {
//     // 1. Get the exact subject document being deleted
//     const subjectToDelete = await this.model.findOne(this.getQuery());
    
//     if (!subjectToDelete) {
//       return next(); 
//     }

//     // 2. Extract the string ID used to link other collections
//     const targetSubjectId = subjectToDelete.subjectId; 

//     // 3. Define exact collection names to clear
//     const collectionsToClear = [
//         'assignsubjects',
//         'calculatedmarks',
//         'copomappings',
//         'directattainments',
//         'finalattainment',
//         'marks',
//         'poattainments',
//         'rubrics'
//     ];

//     // 4. Loop through and delete from each collection directly
//     // Using this.model.db ensures we safely piggyback on the active connection
//     for (const collectionName of collectionsToClear) {
//         try {
//             await this.model.db.collection(collectionName).deleteMany({ subjectId: targetSubjectId });
//         } catch (cleanupError) {
//             console.warn(`Skipped ${collectionName}:`, cleanupError.message);
//         }
//     }

//     console.log(`[CASCADE DELETE] Cleared all related data for Subject: ${targetSubjectId}`);
//     next();
//   } catch (error) {
//     console.error('[CASCADE DELETE ERROR]', error);
//     next(error); 
//   }
// });

// // ==========================================
// // INDEXES AND COMPILATION
// // ==========================================

// // Compound index to ensure uniqueness within a specific year and semester
// subjectSchema.index({ subjectId: 1, academicYear: 1, semester: 1 }, { unique: true });

// const Subject = mongoose.model('Subject', subjectSchema);

// // Force index creation for the new compound rule
// Subject.createIndexes(); 

// module.exports = Subject;






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

