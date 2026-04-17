// const mongoose = require('mongoose');

// const poAttainmentResultSchema = new mongoose.Schema({
//     subjectId: {
//         type: String,
//         required: true
//     },
//     academicYear: {
//         type: String,
//         required: true
//     },
//     course: {
//         type: String,
//         required: true
//     },
//     finalCoAttainment: {
//         type: Number,
//         required: true
//     },
//     poAttainments: {
//         po1: { type: Number, default: null },
//         po2: { type: Number, default: null },
//         po3: { type: Number, default: null },
//         po4: { type: Number, default: null },
//         po5: { type: Number, default: null },
//         po6: { type: Number, default: null },
//         po7: { type: Number, default: null },
//         po8: { type: Number, default: null }
//     }
// }, { timestamps: true });

// // Ensure we only have one PO calculation record per subject per academic year
// poAttainmentResultSchema.index({ subjectId: 1, academicYear: 1 }, { unique: true });

// module.exports = mongoose.model('calculatedPo', poAttainmentResultSchema);


const mongoose = require('mongoose');

const calculatedPoSchema = new mongoose.Schema({
    subjectId: { type: String, required: true },
    academicYear: { type: String, required: true },
    course: { type: String, required: true },
    finalCoAttainment: { type: Number },
    poAttainments: {
        po1: Number, po2: Number, po3: Number, po4: Number,
        po5: Number, po6: Number, po7: Number, po8: Number
    },
    status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model('CalculatedPo', calculatedPoSchema);