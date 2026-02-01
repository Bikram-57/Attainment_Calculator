const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
    subjectId: { type: String, required: true },
    academicYear: { type: String, required: true },
    regNo: { type: String, required: true },
    // This field stores all your CO columns as they are in the sheet
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Mark', MarkSchema);