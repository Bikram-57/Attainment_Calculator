// const mongoose = require('mongoose')

// const assignSubjectSchema = new mongoose.Schema({
//     subjectId: {
//         type: String,
//         required: [true, 'Subject ID is required'],
//         unique: true,
//         trim: true,
//         uppercase: true
//     },

//     facultyId: {
//         type: String,
//         required: [true, 'Faculty ID is required'],
//         unique: true,
//         trim: true,
//         uppercase: true
//     },
//     year: {
//         type: Number,
//         required: true
//     }
// }, {
//     timestamps: true
// })

// module.exports = mongoose.model('assignSubject', assignSubjectSchema)



const mongoose = require('mongoose')

const assignSubjectSchema = new mongoose.Schema({
    // Changed to an array to hold multiple subjects
    subjectIds: [{
        type: String,
        required: [true, 'Subject ID is required'],
        trim: true,
        uppercase: true
    }],
    facultyId: {
        type: String,
        required: [true, 'Faculty ID is required'],
        unique: true, // Keeps it to one document per faculty
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