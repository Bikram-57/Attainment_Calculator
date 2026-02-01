const mongoose = require('mongoose');

// const MarkSchema = new mongoose.Schema({
//     subjectId: { type: String, required: true },
//     academicYear: { type: String, required: true },
//     regNo: { type: String, required: true },
//     // This field stores all your CO columns as they are in the sheet
//     data: { type: mongoose.Schema.Types.Mixed, default: {} }
// }, { timestamps: true });


const MarkSchema = new mongoose.Schema({
    subjectId: { type: String, required: true },
    academicYear: { type: String, required: true },
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

// This index ensures Subject + Year is a unique identity
MarkSchema.index({ subjectId: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Mark', MarkSchema);
