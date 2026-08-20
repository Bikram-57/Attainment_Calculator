const mongoose = require("mongoose");

// Schema for individual student marks
const studentMarkSchema = new mongoose.Schema({
  regNo: { type: String, required: true },
  marks: { type: mongoose.Schema.Types.Mixed, default: {} },
});

// Main Schema
const tempSubjectMarksSchema = new mongoose.Schema(
  {
    academicYear: { type: String, required: true },
    course: { type: String, required: true },
    subjectId: { type: String, required: true }, // You can remove this if subjectCode replaces it entirely
    subjectName: { type: String, required: true }, // Added Subject Name
    actualMarks: [studentMarkSchema], // Array of student objects
    maxMarks: { type: mongoose.Schema.Types.Mixed, default: {} },
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // This automatically injects the precise createdAt and updatedAt ISODates
  },
);

module.exports = mongoose.model("TempSubjectMarks", tempSubjectMarksSchema);
