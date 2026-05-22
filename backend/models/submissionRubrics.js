const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Student ID is required']
    },
    course: {
        type: String,
        required: true,
        uppercase: true
    },
    academicYear: {
        type: String,
        required: true
    },
    // Reference to the exact rubric used for this submission
    rubricId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rubric',
        required: true
    },
    // Dynamic scores based on the rubric criteria
    scores: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Scores cannot be empty']
    },
    totalScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);