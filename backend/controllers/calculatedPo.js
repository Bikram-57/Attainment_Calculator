const mongoose = require('mongoose');
const CopoMapping = require('../models/coPoMapping');
const CoAttainment = require('../models/finalAttainment');
const PoAttainment = require('../models/calculatedPo');

async function generateAndSavePoAttainment(req, res) {

try {
    // 1. Extract parameters from the request BODY
    let { course, academicYear, subjectId } = req.body;

    if (!course || !academicYear || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Course, academicYear, and subjectId are required in the request body'
      });
    }

    // --- INPUT SANITIZATION & FORMATTING ---
    course = course.trim();
    subjectId = subjectId.trim();
    academicYear = academicYear.trim();

    if (academicYear.includes('-')) {
      academicYear = academicYear.split('-')[1].trim();
    }

    // 2. Fetch BOTH documents simultaneously 
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
    const poAttainment = {};

    for (let i = 1; i <= 8; i++) {
      const poKey = `PO${i}`;
      let sum = 0;
      let count = 0;

      for (let j = 1; j <= 5; j++) {
        const coKey = `CO${j}`;
        
        if (mappingData[coKey] && mappingData[coKey][poKey] !== undefined) {
          const val = parseFloat(mappingData[coKey][poKey]);
          if (!isNaN(val) && val > 0) {
            sum += val;
            count++;
          }
        }
      }

      if (count > 0) {
        const avg = sum / count;
        averageCo[poKey] = Number.isInteger(avg) ? avg : parseFloat(avg.toFixed(2));
        
        const poScore = (avg * finalScore) / 3;
        poAttainment[poKey] = parseFloat(poScore.toFixed(2));
      } else {
        averageCo[poKey] = "";
        poAttainment[poKey] = "";
      }
    }

    // 6. SAVE TO DATABASE (UPSERT)
    const savedData = await PoAttainment.findOneAndUpdate(
      { 
        course: course, 
        subjectId: subjectId, 
        academicYear: academicYear 
      },
      { 
        $set: {
          course: course,
          subjectId: subjectId,
          academicYear: academicYear,
          mappingData: mappingData,          // <--- NEW: Saves the raw CO-PO mappings!
          averageCo: averageCo,
          finalSubjectAttainment: finalScore,
          poAttainment: poAttainment
        } 
      },
      { 
        new: true,    
        upsert: true  
      }
    );

    // 7. Return success response
    return res.status(201).json({
      success: true,
      message: 'PO Attainment calculated and saved successfully!',
      data: savedData
    });

  } catch (error) {
    console.error('Error saving PO Attainment data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during database save',
      errorDetails: error.message
    });
  }
};



const getPoAttainmentData = async (req, res) => {
  try {
    // 1. Extract parameters from the request query (URL parameters)
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

    // Handle standard "2025-2026" format if passed from frontend
    if (academicYear.includes('-')) {
      academicYear = academicYear.split('-')[1].trim();
    }

    // 2. Fetch the saved data from the database
    // Using .lean() to get a clean JavaScript object back
    const attainmentRecord = await PoAttainment.findOne({ 
      course: course, 
      subjectId: subjectId, 
      academicYear: academicYear 
    }).lean();

    // 3. Validation Check
    if (!attainmentRecord) {
      return res.status(404).json({
        success: false,
        message: `No PO Attainment record found for Course: ${course}, Subject: ${subjectId}, Year: ${academicYear}`
      });
    }

    // 4. Return the beautifully formatted document straight to the frontend
    return res.status(200).json({
      success: true,
      data: attainmentRecord
    });

  } catch (error) {
    console.error('Error retrieving PO Attainment data:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during data retrieval',
      errorDetails: error.message
    });
  }
};

module.exports = { 
  generateAndSavePoAttainment,
  getPoAttainmentData
 };