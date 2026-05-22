const mongoose = require('mongoose');

const rubricSchema = new mongoose.Schema({
    course: {
        type: String,
        required: [true, 'Course name or code is required'],
        trim: true,
        uppercase: true // e.g., 'CS101'
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required'],
        trim: true // e.g., '2025-2026'
    },
    // The dynamic part: stores whatever JSON structure the admin uploads
    criteria: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Rubric criteria cannot be empty']
    }
}, { timestamps: true });

// Ensure we only have one active rubric per course per year
rubricSchema.index({ course: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Rubric', rubricSchema);