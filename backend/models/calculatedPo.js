const mongoose = require('mongoose');

const poAttainmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  overallCoAttainment: {
    type: Number,
    required: true
  },

  // Storing the calculated averages and final PO scores
  averageCO: {
    type: Object,
    required: true
  },
  poAttainments: {
    type: Object,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PoAttainment', poAttainmentSchema);