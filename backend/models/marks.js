const mongoose = require('mongoose');

const ExcelSchema = new mongoose.Schema({
    data: []  // <--- This tells Mongo: "I am storing a big array here"
}, { strict: false });

module.exports = mongoose.model('marks', ExcelSchema);