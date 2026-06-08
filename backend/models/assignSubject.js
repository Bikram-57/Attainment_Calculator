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














const mongoose = require('mongoose');

// Define what each subject object looks like
const assignedSubjectDetailSchema = new mongoose.Schema({
    subjectId: { type: String, required: true, trim: true },
    subjectName: { type: String, required: true, trim: true }
}, { _id: false }); // _id: false stops Mongoose from creating random IDs for every subject

const assignSubjectSchema = new mongoose.Schema({
    facultyId: { 
        type: String, 
        required: [true, 'Faculty ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    // The Map now holds an Array of Objects instead of an Array of Strings
    assignments: {
        type: Map,
        of: [assignedSubjectDetailSchema], 
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('assignSubject', assignSubjectSchema);