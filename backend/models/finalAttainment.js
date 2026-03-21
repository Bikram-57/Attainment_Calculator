// const mongoose = require('mongoose');

// const FinalAttainmentSchema = new mongoose.Schema({
//     subjectId: { type: String, required: true, uppercase: true, trim: true },
//     academicYear: { type: String, required: true },
//     course: { type: String, required: true, uppercase: true },
    
//     // This Map stores the row-wise results for CO1, CO2, etc.
//     attainmentTable: {
//         type: Map,
//         of: new mongoose.Schema({
//             internalAvg: Number,       // Column H: Avg of Quiz/Mid/Assign levels
//             externalLevel: Number,     // Column G: E-Exam level
//             grandTotal: Number         // Column I: (InternalAvg * 0.5) + (External * 0.5)
//         }, { _id: false })
//     },
    
//     // The final average of all CO Grand Totals (Cell I8 in your image)
//     finalSubjectAttainment: { type: Number }, 
    
//     calculatedAt: { type: Date, default: Date.now }
// }, { 
//     collection: 'finalattainment',
//     timestamps: true 
// });

// FinalAttainmentSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

// module.exports = mongoose.model('FinalAttainment', FinalAttainmentSchema);

const mongoose = require('mongoose');

const FinalAttainmentSchema = new mongoose.Schema({
    subjectId: { type: String, required: true, uppercase: true },
    academicYear: { type: String, required: true },
    course: { type: String, required: true, uppercase: true },
    
    // This will now store: { "CO1": { "Quiz_1": 2, "Mid_Term": 3, "Internal_Avg": 2.5, "E_Exam": 3, "Grand_Total": 2.75 } }
    attainmentTable: {
        type: Map,
        of: mongoose.Schema.Types.Mixed 
    },
    
    finalSubjectAttainment: { type: Number }, 
    calculatedAt: { type: Date, default: Date.now }
}, { 
    collection: 'finalattainment',
    timestamps: true 
});

FinalAttainmentSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('FinalAttainment', FinalAttainmentSchema);