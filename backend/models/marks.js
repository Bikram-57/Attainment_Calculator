const mongoose = require('mongoose');

// const MarkSchema = new mongoose.Schema({
//     subjectId: { type: String, required: true },
//     academicYear: { type: String, required: true },
//     facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
//     maxMarks: { type: Map, of: Number }, 
//     actualMarks: [
//         {
//             regNo: String,
//             marks: mongoose.Schema.Types.Mixed 
//         }
//     ],
//     uploadedAt: { type: Date, default: Date.now }
// }, { collection: 'marks' });

// // This index ensures Subject + Year is a unique identity
// MarkSchema.index({ subjectId: 1, academicYear: 1 }, { unique: true });



const MarkSchema = new mongoose.Schema({
    subjectId: { type: String, required: true },
    academicYear: { type: String, required: true },
    course: { 
        type: String, 
        required: true, 
        enum: ['BCA', 'MCA'] // Strictly allows only these two options
    },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
    maxMarks: { type: Map, of: Number }, 
    actualMarks: [
        {
            regNo: String,
            marks: mongoose.Schema.Types.Mixed 
        }
    ],
    uploadedAt: { type: Date, default: Date.now }
}, { collection: 'marks' });

// Proper Compound Index: Unique identity is now Subject + Year + Course
MarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });



module.exports = mongoose.model('Mark', MarkSchema);
