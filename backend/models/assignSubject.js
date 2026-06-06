const mongoose = require('mongoose');

const assignSubjectSchema = new mongoose.Schema({
    facultyId: { 
        type: String, 
        required: true,
        unique: true
    },
    // The Map allows dynamic keys (like "2026") holding arrays of Strings
    assignments: {
        type: Map,
        of: [String], 
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('assignSubject', assignSubjectSchema);