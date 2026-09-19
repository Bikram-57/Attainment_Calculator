// models/FinalLabAttainment.js
const mongoose = require('mongoose');

const finalLabAttainmentSchema = new mongoose.Schema({
    academicYear: { type: String, required: true, index: true },
    course: { type: String, required: true },
    subjectId: { type: String, required: true, index: true },
    
    // Flexible map to hold dynamically generated CO tables
    attainmentTable: { type: Map, of: mongoose.Schema.Types.Mixed }, 
    
    finalSubjectAttainment: { type: Number, default: 0 },
    calculatedAt: { type: Date }
}, { 
    timestamps: true,
    strict: false 
});

module.exports = mongoose.model('FinalLabAttainment', finalLabAttainmentSchema);