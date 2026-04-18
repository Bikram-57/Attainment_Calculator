const mongoose = require('mongoose');
const CopoMapping = require('../models/coPoMapping');
const CoAttainment = require('../models/finalAttainment');
const PoAttainment = require('../models/calculatedPo');

// const generateAndSavePoAttainment = async (req, res) => {
async function generateAndSavePoAttainment(req, res) {

  try {
    // 1. Extract parameters from the request query
    let { course, academicYear, subjectId } = req.query;

    if (!course || !academicYear || !subjectId) {
      return res.status(400).json({ 
        success: false,
        message: 'Course, academicYear, and subjectId are required query parameters' 
      });
    }

    // --- INPUT SANITIZATION & FORMATTING ---
    course = course.trim();
    subjectId = subjectId.trim();
    academicYear = academicYear.trim();

    // If the year comes in as "2025-2026", split it and grab "2026"
    if (academicYear.includes('-')) {
      academicYear = academicYear.split('-')[1].trim(); 
    }

    // Validate ObjectIds to prevent Mongoose casting failures
    if (!mongoose.Types.ObjectId.isValid(course) || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid format for Course ID or Subject ID' 
      });
    }

    // 2. Fetch the CO-PO mappings (Now searching with just "2026")
    const mappings = await CopoMapping.find({ 
      subject: subjectId, 
      academicYear: academicYear
    });

    if (!mappings || mappings.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: `No CO-PO mappings found for Subject ID: ${subjectId} in year: ${academicYear}` 
      });
    }

    // 3. Fetch the pre-calculated CO Attainment
    const coAttainmentRecord = await CoAttainment.findOne({
      subject: subjectId,
      academicYear: academicYear
    });

    if (!coAttainmentRecord) {
      return res.status(404).json({ 
        success: false,
        message: `CO Attainment record not found for Subject ID: ${subjectId} in year: ${academicYear}` 
      });
    }

    // Assuming the value is stored under 'coAttainmentValue' in your schema
    const overallCoAttainment = coAttainmentRecord.coAttainmentValue; 

    // 4. Calculate the PO Matrix (Strictly limited to 8 POs)
    const averageCO = {};
    const poAttainments = {};

    for (let i = 1; i <= 8; i++) {
      const poKey = `PO${i}`;
      let sum = 0;
      let count = 0;

      // Loop through all CO rows for this specific PO column
      mappings.forEach(mappingRow => {
        if (mappingRow[poKey] && mappingRow[poKey] > 0) {
          sum += mappingRow[poKey];
          count++;
        }
      });

      if (count > 0) {
        // Calculate Average CO for this column
        const avg = sum / count;
        averageCO[poKey] = Number.isInteger(avg) ? avg : parseFloat(avg.toFixed(2));
        
        // PO Attainment Formula: (Average CO * Overall CO Attainment) / 3
        const poScore = (avg * overallCoAttainment) / 3;
        poAttainments[poKey] = parseFloat(poScore.toFixed(2));
      } else {
        // Leave null if no mappings exist for this PO
        averageCO[poKey] = null;
        poAttainments[poKey] = null;
      }
    }

    // 5. Save the calculated data into the NEW database collection
    const newPoAttainmentReport = new PoAttainment({
      course: course,
      subject: subjectId,
      academicYear: academicYear, // This will save as "2026" to keep your DB consistent
      overallCoAttainment: overallCoAttainment,
      averageCO: averageCO,
      poAttainments: poAttainments
    });

    const savedReport = await newPoAttainmentReport.save();

    // 6. Return success response
    return res.status(201).json({
      success: true,
      message: 'PO Attainment calculated and saved successfully',
      data: savedReport
    });

  } catch (error) {
    // This logs the full stack trace to your terminal
    console.error('Error generating and saving PO Attainment:', error);
    
    // This sends the exact error message straight to your API response
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error during processing',
      errorDetails: error.message
    });
  }
};
module.exports = { generateAndSavePoAttainment };