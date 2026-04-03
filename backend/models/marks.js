const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
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
        enum: ['BCA', 'MCA'] // Strictly allows only these courses
    },
    facultyId: { 
        type: String, 
        required: true 
    },
    // Using Mixed allows dynamic keys like "Quiz_1_CO1" and "Quiz_1_TOTAL"
    maxMarks: { 
        type: mongoose.Schema.Types.Mixed,
        required: true 
    },
    actualMarks: [
        {
            regNo: { type: String, required: true },
            // Stores the dynamic CO and Total marks for each student
            marks: { type: mongoose.Schema.Types.Mixed }
        }
    ],
    uploadedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true,
    collection: 'marks' 
});

// Compound index prevents duplicate uploads for the same Subject + Year + Course
MarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Mark', MarkSchema);


// const mongoose = require('mongoose');

// const MarkSchema = new mongoose.Schema({
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
//     facultyId: { 
//         type: String, 
//         required: true 
//     },
//     // Using Mixed allows "Quiz_1_CO1" to "Quiz_1_CO5" dynamically
//     maxMarks: { 
//         type: mongoose.Schema.Types.Mixed,
//         required: true 
//     },
//     actualMarks: [
//         {
//             regNo: { type: String, required: true },
//             // Stores the dynamic CO marks for each student
//             marks: { type: mongoose.Schema.Types.Mixed }
//         }
//     ],
//     uploadedAt: { 
//         type: Date, 
//         default: Date.now 
//     }
// }, { 
//     timestamps: true,
//     collection: 'marks' 
// });

// // Compound index to prevent duplicate uploads for the same exam set
// MarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

// module.exports = mongoose.model('Mark', MarkSchema);