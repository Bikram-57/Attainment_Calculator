const mongoose = require('mongoose');

const directPoAttainmentSchema = new mongoose.Schema({
    course: { type: String, required: true },
    academicYear: { type: String, required: true },
    
    // Renamed to "data" to perfectly match your calculated response variable
    data: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    
    calculatedAt: { type: Date, default: Date.now }
}, { 
    timestamps: true,
    
    // 🛑 BULLETPROOF FIX: Disables Mongoose's silent stripping. 
    // It will force the DB to accept your exact JSON structure without deleting fields.
    strict: false 
});

module.exports = mongoose.model('DirectPoAttainment', directPoAttainmentSchema);