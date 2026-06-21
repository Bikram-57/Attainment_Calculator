const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
    {
        subjectId: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        tableData: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        }
    },
    {
        _id: false
    }
);

const DirectPoAttainmentSchema = new mongoose.Schema(
    {
        course: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        academicYear: {
            type: String,
            required: true,
            trim: true
        },

        subjects: {
            type: [SubjectSchema],
            default: []
        },

        calculatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false,
        minimize: false
    }
);

// One document per course + academic year
DirectPoAttainmentSchema.index(
    {
        course: 1,
        academicYear: 1
    },
    {
        unique: true
    }
);

module.exports =
    mongoose.models.DirectAttainment ||
    mongoose.model(
        'DirectAttainment',
        DirectPoAttainmentSchema
    );