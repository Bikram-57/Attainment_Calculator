// const mongoose = require('mongoose');

// const LabMarkSchema = new mongoose.Schema({
//     subjectId: { 
//         type: String, 
//         required: true, 
//         uppercase: true,
//         trim: true 
//     },
//     academicYear: { 
//         type: String, 
//         required: true,
//         trim: true 
//     },
//     course: { 
//         type: String, 
//         required: true, 
//         uppercase: true,
//         enum: ['BCA', 'MCA'] 
//     },
//     maxMarks: { 
//         type: mongoose.Schema.Types.Mixed,
//         required: true 
//     },
//     targetMarks: { 
//         type: mongoose.Schema.Types.Mixed,
//         required: true 
//     },
//     actualMarks: [
//         {
//             regNo: { type: String, required: true },
//             marks: { type: mongoose.Schema.Types.Mixed }
//         }
//     ],
//     uploadedAt: { 
//         type: Date, 
//         default: Date.now 
//     }
// }, { 
//     timestamps: true,
//     collection: 'lab_marks' 
// });

// LabMarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

// module.exports = mongoose.model('LabMark', LabMarkSchema);



const mongoose = require('mongoose');

const LabMarkSchema = new mongoose.Schema({
    subjectId: { 
        type: String, 
        required: true, 
        uppercase: true,
        trim: true 
    },
    academicYear: { 
        type: String, 
        required: true,
        trim: true 
    },
    course: { 
        type: String, 
        required: true, 
        uppercase: true,
        enum: ['BCA', 'MCA'] 
    },
    maxMarks: { 
        type: mongoose.Schema.Types.Mixed,
        required: true 
    },
    targetMarks: { 
        type: mongoose.Schema.Types.Mixed,
        required: true 
    },
    actualMarks: [
        // Define it as a proper sub-schema block to pass the _id: false option
        new mongoose.Schema({
            regNo: { type: String, required: true },
            marks: { type: mongoose.Schema.Types.Mixed }
        }, { _id: false }) // This prevents Mongoose from adding the _id field
    ],
    uploadedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true,
    collection: 'lab_marks' 
});

LabMarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('LabMark', LabMarkSchema);