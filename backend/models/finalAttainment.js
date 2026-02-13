const mongoose = require('mongoose');

const finalAttainmentSchema = new mongoose.Schema({
    subjectId: { type: String, required: true },
    batch: { type: String, required: true },
    // The raw level we pull from CalculatedMarks
    calculatedLevel: { type: Number, required: true },
    // The final result after your specific logic
    finalAttainmentValue: { type: Number, required: true },
    calculationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FinalAttainment', finalAttainmentSchema);