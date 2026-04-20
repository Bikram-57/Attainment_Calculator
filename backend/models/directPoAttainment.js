const mongoose = require('mongoose');

const poAttainmentSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  subjectId: {
    type: String,
    required: true,
    trim: true
  },
  // The Data Object containing CO1, CO2, etc., with their grandTotals and PO mappings
  data: {
    type: Map,
    of: new mongoose.Schema({
      grandTotal: { type: Number, default: 0 },
      PO1: { type: mongoose.Schema.Types.Mixed, default: "" },
      PO2: { type: mongoose.Schema.Types.Mixed, default: "" },
      PO3: { type: mongoose.Schema.Types.Mixed, default: "" },
      PO4: { type: mongoose.Schema.Types.Mixed, default: "" },
      PO5: { type: mongoose.Schema.Types.Mixed, default: "" },
      PO6: { type: mongoose.Schema.Types.Mixed, default: "" },
      PO7: { type: mongoose.Schema.Types.Mixed, default: "" },
      PO8: { type: mongoose.Schema.Types.Mixed, default: "" }
    }, { _id: false })
  },
  // The Final Calculated Direct PO Attainment Row
  directPoAttainment: {
    PO1: { type: mongoose.Schema.Types.Mixed, default: "" },
    PO2: { type: mongoose.Schema.Types.Mixed, default: "" },
    PO3: { type: mongoose.Schema.Types.Mixed, default: "" },
    PO4: { type: mongoose.Schema.Types.Mixed, default: "" },
    PO5: { type: mongoose.Schema.Types.Mixed, default: "" },
    PO6: { type: mongoose.Schema.Types.Mixed, default: "" },
    PO7: { type: mongoose.Schema.Types.Mixed, default: "" },
    PO8: { type: mongoose.Schema.Types.Mixed, default: "" }
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure uniqueness for each course iteration
poAttainmentSchema.index({ course: 1, academicYear: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('DirectPoAttainment', poAttainmentSchema);