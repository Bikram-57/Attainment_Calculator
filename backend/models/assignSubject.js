// const mongoose = require('mongoose')

// // 1. Define the structure for a single year's assignments
// const yearlyAssignmentSchema = new mongoose.Schema({
//     subjectIds: [{
//         type: String,
//         required: [true, 'Subject ID is required'],
//         trim: true,
//         uppercase: true
//     }]
// }, { _id: false }); // _id: false prevents MongoDB from creating unnecessary ObjectIds for every year

// // 2. Define the main Faculty schema
// const assignSubjectSchema = new mongoose.Schema({
//     facultyId: {
//         type: String,
//         required: [true, 'Faculty ID is required'],
//         unique: true, // One document per faculty member!
//         trim: true,
//         uppercase: true
//     },
//     // Array of the yearly assignments
//     assignments: [yearlyAssignmentSchema] 
// }, {
//     timestamps: true
// })

// module.exports = mongoose.model('assignSubject', assignSubjectSchema)



/// models/assignSubject.js
const mongoose = require('mongoose');

const assignSubjectSchema = new mongoose.Schema({
    facultyId: { 
        type: String, 
        required: true,
        unique: true
    },
    // The Map allows dynamic keys (like "2026") holding arrays of Strings
    assignments: {
        type: Map,
        of: [String], 
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('assignSubject', assignSubjectSchema);