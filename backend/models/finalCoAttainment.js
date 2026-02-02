const mongoose = require('mongoose');

const FinalCOAttainmentSchema = new mongoose.Schema({
    subjectId: { type: String, required: true },
    academicYear: { type: String, required: true },
    course: { type: String, required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    
    // Matches the columns in your image
    coData: [{
        coName: String,         // CO1, CO2, etc.
        quiz1: Number,
        sessional1: Number,
        quiz2: Number,
        sessional2: Number,
        assignment: Number,
        endSem: Number,         // The 'End Term' column
        totalAvgInt: Number,    // Average of Quizzes/Sessionals/Assignments
        grandTotal: Number      // (50% Int + 50% End Term)
    }],
    
    finalCourseAttainment: Number, // The value at the very bottom (e.g., 1.2)
    generatedAt: { type: Date, default: Date.now }
}, { collection: 'final_co_attainments' });

FinalCOAttainmentSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('FinalCOAttainment', FinalCOAttainmentSchema);