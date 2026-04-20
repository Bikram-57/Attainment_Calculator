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

    if (academicYear.includes('-')) {
      academicYear = academicYear.split('-')[1].trim();
    }

    // 2. Fetch BOTH documents simultaneously (Using .lean() for clean JS objects)
    const [mappingRecord, finalAttainmentRecord] = await Promise.all([
      CopoMapping.findOne({ course, subjectId, academicYear }).lean(),
      CoAttainment.findOne({ course, subjectId, academicYear }).lean()
    ]);

    // 3. Validation Checks
    if (!mappingRecord || !mappingRecord.mappingData) {
      return res.status(404).json({
        success: false,
        message: `No CO-PO mappings found for Course: ${course}, Subject: ${subjectId}, Year: ${academicYear}`
      });
    }

    if (!finalAttainmentRecord) {
      return res.status(404).json({
        success: false,
        message: `No Final Attainment found for Course: ${course}, Subject: ${subjectId}, Year: ${academicYear}`
      });
    }

    // 4. Extract data
    const finalScore = finalAttainmentRecord.finalSubjectAttainment;
    const mappingData = mappingRecord.mappingData; 

    // 5. CALCULATE THE AVERAGE CO & PO ATTAINMENT MATRIX
    const averageCo = {};
    const poAttainments = {};

    for (let i = 1; i <= 8; i++) {
      const poKey = `PO${i}`;
      let sum = 0;
      let count = 0;

      // Check CO1 through CO5 dynamically
      for (let j = 1; j <= 5; j++) {
        const coKey = `CO${j}`;
        
        // Ensure the CO row exists before checking its PO column
        if (mappingData[coKey] && mappingData[coKey][poKey] !== undefined) {
          // Parse the value (This safely handles string "2", number 2, and ignores "")
          const val = parseFloat(mappingData[coKey][poKey]);
          
          if (!isNaN(val) && val > 0) {
            sum += val;
            count++;
          }
        }
      }

      if (count > 0) {
        // Compute Average CO
        const avg = sum / count;
        averageCo[poKey] = Number.isInteger(avg) ? avg : parseFloat(avg.toFixed(2));
        
        // Compute Final PO Attainment: (Average CO * Final Subject Score) / 3
        const poScore = (avg * finalScore) / 3;
        poAttainments[poKey] = parseFloat(poScore.toFixed(2));
      } else {
        // Output empty strings to match your exact JSON format
        averageCo[poKey] = "";
        poAttainments[poKey] = "";
      }
    }

    // 6. Return the perfectly formatted payload
    return res.status(200).json({
      success: true,
      finalSubjectAttainment: finalScore,
      mappingData: {
        ...mappingData,        // Spreads CO1, CO2, CO3, CO4, CO5 into the object
        averageCo: averageCo   // Injects your formatted averageCo row right below them
      },
      finalPoAttainment: poAttainments // The finalized (Avg * Final / 3) math
    });

  } catch (error) {
    console.error('Error retrieving combined data:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error during processing',
      errorDetails: error.message
    });
  }
};
module.exports = { generateAndSavePoAttainment };