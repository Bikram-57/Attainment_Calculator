const mongoose = require('mongoose')

const assignSubjectSchema = new mongoose.Schema({
    // Make sure this is an array!
    subjectIds: [{
        type: String,
        required: [true, 'Subject ID is required'],
        trim: true,
        uppercase: true
    }],
    facultyId: {
        type: String,
        required: [true, 'Faculty ID is required'],
        unique: true, // One document per faculty
        trim: true,
        uppercase: true
    },
    year: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('assignSubject', assignSubjectSchema)