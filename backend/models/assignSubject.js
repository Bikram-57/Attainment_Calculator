// const mongoose = require('mongoose');

// const assignSubjectSchema = new mongoose.Schema({
//     facultyId: { 
//         type: String, 
//         required: true,
//         unique: true
//     },
//     // The Map allows dynamic keys (like "2026") holding arrays of Strings
//     assignments: {
//         type: Map,
//         of: [String], 
//         default: {}
//     }
// }, { timestamps: true });

// module.exports = mongoose.model('assignSubject', assignSubjectSchema);














// const mongoose = require('mongoose');

// // Define what each subject object looks like
// const assignedSubjectDetailSchema = new mongoose.Schema({
//     subjectId: { type: String, required: true, trim: true },
//     subjectName: { type: String, required: true, trim: true }
// }, { _id: false }); // _id: false stops Mongoose from creating random IDs for every subject

// const assignSubjectSchema = new mongoose.Schema({
//     facultyId: { 
//         type: String, 
//         required: [true, 'Faculty ID is required'],
//         unique: true,
//         trim: true,
//         uppercase: true
//     },
//     // The Map now holds an Array of Objects instead of an Array of Strings
//     assignments: {
//         type: Map,
//         of: [assignedSubjectDetailSchema], 
//         default: {}
//     }
// }, { timestamps: true });

// module.exports = mongoose.model('assignSubject', assignSubjectSchema);











// const mongoose = require('mongoose');

// const assignedSubjectDetailSchema = new mongoose.Schema({
//     subjectId: { type: String, required: true, trim: true },
//     subjectName: { type: String, required: true, trim: true }
// }, { _id: false });

// const assignSubjectSchema = new mongoose.Schema({
//     facultyId: { 
//         type: String, 
//         required: [true, 'Faculty ID is required'],
//         unique: true,
//         trim: true,
//         uppercase: true
//     },
//     // NEW: Save the name directly in this document
//     facultyName: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     // NEW: Keep a running count of the years
//     totalYearsRecorded: {
//         type: Number,
//         default: 1
//     },
//     assignments: {
//         type: Map,
//         of: [assignedSubjectDetailSchema], 
//         default: {}
//     }
// }, { timestamps: true });

// module.exports = mongoose.model('assignSubject', assignSubjectSchema);





const mongoose = require('mongoose');

// 1. The innermost structure: The Subject Object
// Note: _id: false prevents Mongoose from adding an ObjectId to every single subject
const assignedSubjectDetailSchema = new mongoose.Schema({
    subjectId: { 
        type: String, 
        required: true, 
        trim: true 
    },
    subjectName: { 
        type: String, 
        required: true, 
        trim: true 
    }
}, { _id: false });

// 2. The main Document Schema
const assignSubjectSchema = new mongoose.Schema({
    facultyId: { 
        type: String, 
        required: [true, 'Faculty ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    facultyName: {
        type: String,
        required: true,
        trim: true
    },
    totalYearsRecorded: {
        type: Number,
        default: 1
    },
    // 3. The Nested Map for dynamic Years and Courses
    assignments: {
        type: Map,
        of: {
            type: Map,
            of: [assignedSubjectDetailSchema] // Array of subjects
        },
        default: {}
    }
}, { timestamps: true }); // Automatically handles createdAt and updatedAt

module.exports = mongoose.model('assignSubject', assignSubjectSchema);