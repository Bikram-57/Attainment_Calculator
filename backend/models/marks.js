// const mongoose = require('mongoose');

// // const MarkSchema = new mongoose.Schema({
// //     subjectId: { type: String, required: true },
// //     academicYear: { type: String, required: true },
// //     facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
// //     maxMarks: { type: Map, of: Number }, 
// //     actualMarks: [
// //         {
// //             regNo: String,
// //             marks: mongoose.Schema.Types.Mixed 
// //         }
// //     ],
// //     uploadedAt: { type: Date, default: Date.now }
// // }, { collection: 'marks' });

// // // This index ensures Subject + Year is a unique identity
// // MarkSchema.index({ subjectId: 1, academicYear: 1 }, { unique: true });



// const MarkSchema = new mongoose.Schema({
//     subjectId: { type: String, required: true },
//     academicYear: { type: String, required: true },
//     course: { 
//         type: String, 
//         required: true, 
//         enum: ['BCA', 'MCA'] // Strictly allows only these two options
//     },
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

// // Proper Compound Index: Unique identity is now Subject + Year + Course
// MarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });



// module.exports = mongoose.model('Mark', MarkSchema);


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
        enum: ['BCA', 'MCA']
    },
    facultyId: { 
        type: String, 
        required: true 
    },
    // Using Mixed allows "Quiz_1_CO1" to "Quiz_1_CO5" dynamically
    maxMarks: { 
        type: mongoose.Schema.Types.Mixed,
        required: true 
    },
    actualMarks: [
        {
            regNo: { type: String, required: true },
            // Stores the dynamic CO marks for each student
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

// Compound index to prevent duplicate uploads for the same exam set
MarkSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Mark', MarkSchema);