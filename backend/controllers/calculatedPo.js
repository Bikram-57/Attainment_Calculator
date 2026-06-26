const mongoose = require('mongoose');
const CopoMapping = require('../models/coPoMapping');
const CoAttainment = require('../models/finalAttainment');
const PoAttainment = require('../models/calculatedPo');
const User = require('../models/user');
const logActivity = require('../utils/activityLogger');
const Subject = require('../models/subject'); // Adjust the path if your file is named differently!

// async function generateAndSavePoAttainment(req, res) {

// try {
//     // 1. Extract parameters from the request BODY
//     let { course, academicYear, subjectId } = req.body;

//     if (!course || !academicYear || !subjectId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Course, academicYear, and subjectId are required in the request body'
//       });
//     }

//     // --- INPUT SANITIZATION & FORMATTING ---
//     course = course.trim();
//     subjectId = subjectId.trim();
//     academicYear = academicYear.trim();

//     if (academicYear.includes('-')) {
//       academicYear = academicYear.split('-')[1].trim();
//     }

//     // 2. Fetch BOTH documents simultaneously 
//     const [mappingRecord, finalAttainmentRecord] = await Promise.all([
//       CopoMapping.findOne({ course, subjectId, academicYear }).lean(),
//       CoAttainment.findOne({ course, subjectId, academicYear }).lean()
//     ]);

//     // 3. Validation Checks
//     if (!mappingRecord || !mappingRecord.mappingData) {
//       return res.status(404).json({
//         success: false,
//         message: `No CO-PO mappings found for Course: ${course}, Subject: ${subjectId}, Year: ${academicYear}`
//       });
//     }

//     if (!finalAttainmentRecord) {
//       return res.status(404).json({
//         success: false,
//         message: `No Final Attainment found for Course: ${course}, Subject: ${subjectId}, Year: ${academicYear}`
//       });
//     }

//     // 4. Extract data
//     const finalScore = finalAttainmentRecord.finalSubjectAttainment;
//     const mappingData = mappingRecord.mappingData; 

//     // 5. CALCULATE THE AVERAGE CO & PO ATTAINMENT MATRIX
//     const averageCo = {};
//     const poAttainment = {};

//     for (let i = 1; i <= 8; i++) {
//       const poKey = `PO${i}`;
//       let sum = 0;
//       let count = 0;

//       for (let j = 1; j <= 5; j++) {
//         const coKey = `CO${j}`;

//         if (mappingData[coKey] && mappingData[coKey][poKey] !== undefined) {
//           const val = parseFloat(mappingData[coKey][poKey]);
//           if (!isNaN(val) && val > 0) {
//             sum += val;
//             count++;
//           }
//         }
//       }

//       if (count > 0) {
//         const avg = sum / count;
//         averageCo[poKey] = Number.isInteger(avg) ? avg : parseFloat(avg.toFixed(2));

//         const poScore = (avg * finalScore) / 3;
//         poAttainment[poKey] = parseFloat(poScore.toFixed(2));
//       } else {
//         averageCo[poKey] = "";
//         poAttainment[poKey] = "";
//       }
//     }

//     // 6. SAVE TO DATABASE (UPSERT)
//     const savedData = await PoAttainment.findOneAndUpdate(
//       { 
//         course: course, 
//         subjectId: subjectId, 
//         academicYear: academicYear 
//       },
//       { 
//         $set: {
//           course: course,
//           subjectId: subjectId,
//           academicYear: academicYear,
//           mappingData: mappingData,          // <--- NEW: Saves the raw CO-PO mappings!
//           averageCo: averageCo,
//           finalSubjectAttainment: finalScore,
//           poAttainment: poAttainment
//         } 
//       },
//       { 
//         new: true,    
//         upsert: true  
//       }
//     );

//     // 7. Return success response
//     return res.status(201).json({
//       success: true,
//       message: 'PO Attainment calculated and saved successfully!',
//       data: savedData
//     });

//   } catch (error) {
//     console.error('Error saving PO Attainment data:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error during database save',
//       errorDetails: error.message
//     });
//   }
// };




async function generateAndSavePoAttainment(req, res, isPipelineArg = false) {
  // 🛡️ THE PIPELINE SHIELD
  // Protects the Express response objects, but we STILL let the logger fire!
  const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

  try {
    // 1. Extract parameters from the request BODY
    // let { course, academicYear, subjectId } = req.body;
    let { course, academicYear, subjectId, subjectName } = req.body;

    if (!course || !academicYear || !subjectId) {
      const errMsg = 'Course, academicYear, and subjectId are required in the request body';
      if (isPipeline) throw new Error(errMsg);

      if (!res.headersSent) {
        return res.status(400).json({ success: false, message: errMsg });
      }
      return;
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
      const errMsg = `No CO-PO mappings found for Course: ${course}, Subject: ${subjectId}, Year: ${academicYear}`;
      if (isPipeline) throw new Error(errMsg);

      if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
      return;
    }

    if (!finalAttainmentRecord) {
      const errMsg = `No Final Attainment found for Course: ${course}, Subject: ${subjectId}, Year: ${academicYear}`;
      if (isPipeline) throw new Error(errMsg);

      if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
      return;
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
          mappingData: mappingData,
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

    // ---> 🔔 THE BELL RINGER (ACTIVITY LOGGER) 🔔 <---
    // Because this is the 4th and final step, it fires no matter what!
    // const currentUser = await User.findById(req.user).select('name').lean();
    // const actorName = currentUser ? currentUser.name : "a Faculty Member";

    // await logActivity(
    //     req.user, 
    //     'REPORT_GENERATED', 
    //     `Complete PO Attainment generated for ${subjectId.toUpperCase()} (${academicYear}) by ${actorName}`, 
    //     [] 
    // );
    // ---> 🔔 THE BELL RINGER (ACTIVITY LOGGER) 🔔 <---
    // ---> 🔔 THE BELL RINGER (ACTIVITY LOGGER) 🔔 <---
        const currentUser = await User.findById(req.user).select('name').lean();
        const actorName = currentUser ? currentUser.name : "a Faculty Member";
        
        // Let the backend find the subject name!
        const subjectRecord = await Subject.findOne({ 
            subjectId: subjectId.toUpperCase(),
            academicYear: academicYear 
        }).lean();
        
        // If it finds the record and it has a 'name' or 'subjectName' property, it uses it. Otherwise, it defaults to "Subject".
        const realSubjectName = subjectRecord ? (subjectRecord.subjectName || subjectRecord.name || "Subject") : "Subject";

        await logActivity(
            req.user, 
            'GENERATED_ATTAINMENT_REPORT', 
            `Complete Attainment report generated for ${subjectId.toUpperCase()} - ${realSubjectName} (${course.toUpperCase()}, ${academicYear}) by ${actorName}`, 
            [] 
        );
    // --- PIPELINE EXIT ---
    // 7. Return success response safely
    if (isPipeline) {
      return true;
    }

    if (!res.headersSent) {
      return res.status(201).json({
        success: true,
        message: 'PO Attainment calculated and saved successfully!',
        data: savedData
      });
    }

  } catch (error) {
    console.error('Error saving PO Attainment data:', error.message);

    // Throw to the router if in the pipeline
    if (isPipeline) {
      throw error;
    }

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error during database save',
        errorDetails: error.message
      });
    }
  }
}




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