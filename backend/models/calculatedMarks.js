// const mongoose = require('mongoose');

// const CalculatedMarkSchema = new mongoose.Schema({
//     subjectId: { type: String, required: true },
//     academicYear: { type: String, required: true },
//     course: { type: String, required: true },
//     facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
//     maxMarks: { type: Map, of: Number }, 
//     actualMarks: [
//         {
//             regNo: String,
//             marks: mongoose.Schema.Types.Mixed 
//         }
//     ],
//     // The calculation fields
//     attainmentResults: { type: mongoose.Schema.Types.Mixed }, 
//     finalCOAverages: { type: mongoose.Schema.Types.Mixed },
//     uploadedAt: { type: Date, default: Date.now }
// }, { collection: 'calculated_marks' });

// CalculatedMarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

// module.exports = mongoose.model('CalculatedMark', CalculatedMarkSchema);





// const mongoose = require('mongoose');

// const CalculatedMarkSchema = new mongoose.Schema({
//     subjectId: { type: String, required: true, uppercase: true, trim: true },
//     academicYear: { type: String, required: true },
//     course: { type: String, required: true, uppercase: true },
//     totalStudents: { type: Number, default: 0 },
    
//     // reportData Map stores the 4-Row logic for each dynamic CO
//     reportData: {
//         type: Map,
//         of: new mongoose.Schema({
//             targetMarks: { type: Number },           // Row 1: 60% of Max
//             studentsAboveTarget: { type: Number },   // Row 2: Count
//             attainmentPercent: { type: Number },     // Row 3: % of Class
//             attainmentLevel: { type: Number }        // Row 4: 0-3 Scale
//         }, { _id: false })
//     },
//     calculatedAt: { type: Date, default: Date.now }
// }, { 
//     collection: 'calculatedmarks',
//     timestamps: true 
// });

// // Ensure only one calculation document exists per subject/year/course
// CalculatedMarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

// module.exports = mongoose.model('CalculatedMark', CalculatedMarkSchema);


const mongoose = require('mongoose');

const CalculatedMarkSchema = new mongoose.Schema({
    subjectId: { type: String, required: true, uppercase: true, trim: true },
    academicYear: { type: String, required: true },
    course: { type: String, required: true, uppercase: true },
    totalStudents: { type: Number, default: 0 },
    
    // NEW: Stores the Raw Marks for reference in the same document
    allStudentMarks: [
        {
            regNo: String,
            marks: { type: mongoose.Schema.Types.Mixed }
        }
    ],

    // Stores the 4-Row Attainment Logic for each CO
    reportData: {
        type: Map,
        of: new mongoose.Schema({
            targetMarks: { type: Number },           // Row 1
            studentsAboveTarget: { type: Number },   // Row 2
            attainmentPercent: { type: Number },     // Row 3
            attainmentLevel: { type: Number }        // Row 4
        }, { _id: false })
    },
    calculatedAt: { type: Date, default: Date.now }
}, { 
    collection: 'calculatedmarks',
    timestamps: true 
});

CalculatedMarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CalculatedMark', CalculatedMarkSchema);