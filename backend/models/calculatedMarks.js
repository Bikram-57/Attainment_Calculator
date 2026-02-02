const mongoose = require('mongoose');

const CalculatedMarkSchema = new mongoose.Schema({
    subjectId: { type: String, required: true },
    academicYear: { type: String, required: true },
    course: { type: String, required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    maxMarks: { type: Map, of: Number }, 
    actualMarks: [
        {
            regNo: String,
            marks: mongoose.Schema.Types.Mixed 
        }
    ],
    // The calculation fields
    attainmentResults: { type: mongoose.Schema.Types.Mixed }, 
    finalCOAverages: { type: mongoose.Schema.Types.Mixed },
    uploadedAt: { type: Date, default: Date.now }
}, { collection: 'calculated_marks' });

CalculatedMarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CalculatedMark', CalculatedMarkSchema);