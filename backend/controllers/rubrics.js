const xlsx = require('xlsx');
const Rubric = require('../models/rubrics');
const User = require('../models/user'); 
const logActivity = require('../utils/activityLogger');

// ============================================================================
// HELPER: Reusable Activity Logger
// ============================================================================
/**
 * Safely fetches the user's name and logs the activity without crashing the main thread.
 */
const logRubricAction = async (req, actionType, messageContext) => {
    try {
        const userId = req.user?._id || req.user?.id || req.user;
        const currentUser = await User.findById(userId).select('name').lean();
        const actorName = currentUser?.name || "a Faculty Member";

        await logActivity(
            userId,
            actionType, 
            `${messageContext} by ${actorName}`, 
            []
        );
    } catch (logError) {
        console.error("⚠️ Activity Logger Failed:", logError.message);
    }
};

// ============================================================================
// 1. Upload / Create Rubrics
// ============================================================================


// Make sure to import your models and logger
// const Rubric = require('../models/Rubric');
// const User = require('../models/User');
// const { logActivity } = require('../utils/logger'); 

// async function handleUploadrubrics(req, res) {
//   try {
//     const { course, year, thresholds } = req.body;

//     // 1. Basic sanity check before hitting the database
//     if (!course || !year || !thresholds || !Array.isArray(thresholds)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Course, year, and thresholds array are required.' 
//       });
//     }

//     // 2. Sanitize and type-cast the inputs
//     const cleanCourse = course.trim().toUpperCase();
//     const cleanYear = Number(year); // Forces the year to be a Number

//     // Failsafe: Ensure the year provided is actually a valid number
//     if (isNaN(cleanYear)) {
//         return res.status(400).json({
//             success: false,
//             message: 'Year must be a valid number (e.g., 2024).'
//         });
//     }

//     // 3. Look for an existing rubric for this exact course and numeric year
//     let rubric = await Rubric.findOne({ course: cleanCourse, year: cleanYear });
    
//     // Track whether we are creating or updating for the logger & status codes
//     const isNewRubric = !rubric; 

//     if (rubric) {
//       // If it exists, overwrite the old ranges with the new form data
//       rubric.thresholds = thresholds;
//     } else {
//       // If it doesn't exist, create a brand new one
//       rubric = new Rubric({ 
//           course: cleanCourse, 
//           year: cleanYear, 
//           thresholds 
//       });
//     }

//     // 4. Save the document
//     // This triggers all the schema validators: mandatory levels, min < max, and overlap prevention.
//     await rubric.save();

//     // ---> 🔔 THE BELL RINGER (ACTIVITY LOGGER) 🔔 <---
//     // Get the uploader's ID (handles different auth middleware implementations)
//     const userId = req.user._id || req.user.id || req.user;

//     // Get the uploader's name for the notification
//     let actorName = "a Faculty Member";
//     if (userId) {
//         const currentUser = await User.findById(userId).select('name').lean();
//         if (currentUser && currentUser.name) {
//             actorName = currentUser.name;
//         }
//     }

//     // Set dynamic action types based on whether we created or updated
//     const actionType = isNewRubric ? 'UPLOADED_RUBRIC' : 'UPDATED_RUBRIC';
//     const actionMessage = isNewRubric 
//       ? `Attainment Rubric configured for ${cleanCourse} (Year: ${cleanYear}) by ${actorName}`
//       : `Attainment Rubric updated for ${cleanCourse} (Year: ${cleanYear}) by ${actorName}`;

//     await logActivity(
//         userId,
//         actionType, 
//         actionMessage, 
//         []
//     );

//     return res.status(isNewRubric ? 201 : 200).json({
//       success: true,
//       message: `Rubric ranges ${isNewRubric ? 'saved' : 'updated'} successfully!`,
//       data: rubric
//     });

//   } catch (error) {
//     // 5. Handle Mongoose Validation Errors gracefully (from your Overlap Engine, etc.)
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Validation Error', 
//         errors: messages 
//       });
//     }

//     // 6. Handle MongoDB Duplicate Key Error
//     if (error.code === 11000) {
//         console.error("🚨 DUPLICATE KEY ERROR DETECTED:", error.keyValue);
//         return res.status(400).json({
//           success: false,
//           message: `Database conflict: A rubric for ${JSON.stringify(error.keyValue)} already exists.`,
//           errorDetails: error.keyValue
//         });
//     }

//     // Handle generic server errors
//     console.error('Error in handleUploadrubrics:', error);
//     return res.status(500).json({ 
//       success: false, 
//       message: 'Server Error while saving rubric.' 
//     });
//   }
// }


//new updated
async function handleUploadrubrics(req, res) {
    try {
        const { academicYear, semesterType, thresholds } = req.body;

        // 1. Basic validation
        if (!academicYear || !semesterType || !thresholds || !Array.isArray(thresholds)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Academic Year, Semester Type, and thresholds array are required.' 
            });
        }

        const cleanAcademicYear = academicYear.trim();
        const cleanSemesterType = semesterType.trim().toUpperCase();

        if (!['ODD', 'EVEN'].includes(cleanSemesterType)) {
            return res.status(400).json({
                success: false,
                message: 'Semester type must be exactly ODD or EVEN.'
            });
        }

        // 🌟 THE GHOST INDEX FIX: 
        // This tells MongoDB to delete the old 'course' index and build the new one.
        // You can leave this here permanently, or remove it after your first successful upload.
        await Rubric.syncIndexes(); 

        // 2. Fetch or Create
        let rubric = await Rubric.findOne({ 
            academicYear: cleanAcademicYear,
            semesterType: cleanSemesterType
        });

        if (rubric) {
            rubric.thresholds = thresholds; 
        } else {
            rubric = new Rubric({ 
                academicYear: cleanAcademicYear, 
                semesterType: cleanSemesterType,
                thresholds 
            });
        }

        // 3. Save 
        await rubric.save();

        // 4. Log Activity asynchronously
        await logRubricAction(
            req, 
            'UPLOADED_RUBRIC', 
            `Attainment Rubric configured for ${cleanSemesterType} Semester, Year: ${cleanAcademicYear}`
        );

        return res.status(200).json({
            success: true,
            message: 'Rubric ranges saved successfully!',
            data: rubric
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation Error', 
                errors: Object.values(error.errors).map(err => err.message) 
            });
        }
        console.error('Error in handleUploadrubrics:', error);
        return res.status(500).json({ success: false, message: 'Server Error while saving rubric.' });
    }
}
//old
// ============================================================================
// 2. Get Smart Rubric (By Course & Year with Fallback)
// ============================================================================
// async function handleGetRubrics(req, res) {
//     try {
//         // Fallback checks both query (standard for GET) and body (legacy support)
//         const course = req.query.course || req.body.course;
//         const year = req.query.year || req.body.year;

//         if (!course || !year) {
//             return res.status(400).json({ success: false, message: 'Please provide both course and year to search.' });
//         }

//         const cleanCourse = course.trim().toUpperCase();
//         const targetYear = parseInt(year, 10);

//         // Smart Search: Looks for exact year, or falls back to the most recent previous year.
//         // .lean() provides a massive speed boost for read-only queries.
//         const rubric = await Rubric.findOne({ 
//             course: cleanCourse, 
//             year: { $lte: targetYear } 
//         })
//         .sort({ year: -1 })
//         .lean(); 

//         if (!rubric) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No rubric found for ${cleanCourse} in or before the year ${targetYear}.`
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: `Rubric found (Active Year: ${rubric.year})`,
//             data: rubric
//         });

//     } catch (error) {
//         console.error('Error fetching rubric:', error);
//         return res.status(500).json({ success: false, message: 'Server Error while searching for rubric.' });
//     }
// }


//new
async function handleGetRubrics(req, res) {
    try {
        // Fallback checks both query (standard for GET) and body (legacy support)
        const academicYear = req.query.academicYear || req.body.academicYear;
        const semesterType = req.query.semesterType || req.body.semesterType;

        if (!academicYear || !semesterType) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide both academicYear and semesterType to search.' 
            });
        }

        const cleanAcademicYear = academicYear.trim();
        const cleanSemesterType = semesterType.trim().toUpperCase();

        if (!['ODD', 'EVEN'].includes(cleanSemesterType)) {
            return res.status(400).json({
                success: false,
                message: 'Semester type must be exactly ODD or EVEN.'
            });
        }

        // Exact match lookup using lean() for a massive read-only speed boost
        const rubric = await Rubric.findOne({ 
            academicYear: cleanAcademicYear, 
            semesterType: cleanSemesterType 
        }).lean(); 

        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: `No rubric found for the ${cleanSemesterType} semester of academic year ${cleanAcademicYear}.`
            });
        }

        return res.status(200).json({
            success: true,
            message: `Rubric found for ${cleanAcademicYear} (${cleanSemesterType})`,
            data: rubric
        });

    } catch (error) {
        console.error('Error fetching rubric:', error);
        return res.status(500).json({ success: false, message: 'Server Error while searching for rubric.' });
    }
}


//old
// ============================================================================
// 3. Update Existing Rubric
// ============================================================================
// async function handleUpdateRubrics(req, res) {
//     try {
//         const { course, year, thresholds } = req.body;

//         if (!course || !year || !thresholds || !Array.isArray(thresholds)) {
//             return res.status(400).json({ success: false, message: 'Course, year, and thresholds array are required.' });
//         }

//         const cleanCourse = course.trim().toUpperCase();
//         const cleanYear = parseInt(year, 10);

//         // 1. Strict Find (Must exist to update)
//         const rubric = await Rubric.findOne({ course: cleanCourse, year: cleanYear });

//         if (!rubric) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No existing rubric found for ${cleanCourse} in ${cleanYear}. Cannot update.`
//             });
//         }

//         // 2. Modify and Save (Triggers schema validators)
//         rubric.thresholds = thresholds;
//         await rubric.save();

//         // 3. Log Activity
//         await logRubricAction(req, 'UPDATED_RUBRIC', `Attainment Rubric updated for ${cleanCourse} (Year: ${cleanYear})`);

//         return res.status(200).json({
//             success: true,
//             message: `Rubric for ${cleanCourse} (${cleanYear}) updated successfully!`,
//             data: rubric
//         });

//     } catch (error) {
//         if (error.name === 'ValidationError') {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: 'Validation Error', 
//                 errors: Object.values(error.errors).map(err => err.message) 
//             });
//         }
//         console.error('Error updating rubric:', error);
//         return res.status(500).json({ success: false, message: 'Server Error while updating rubric.' });
//     }
// }

//new
async function handleUpdateRubrics(req, res) {
    try {
        const { academicYear, semesterType, thresholds } = req.body;

        if (!academicYear || !semesterType || !thresholds || !Array.isArray(thresholds)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Academic Year, Semester Type, and thresholds array are required.' 
            });
        }

        const cleanAcademicYear = academicYear.trim();
        const cleanSemesterType = semesterType.trim().toUpperCase();

        if (!['ODD', 'EVEN'].includes(cleanSemesterType)) {
            return res.status(400).json({
                success: false,
                message: 'Semester type must be exactly ODD or EVEN.'
            });
        }

        // 1. Strict Find (Must exist to update)
        const rubric = await Rubric.findOne({ 
            academicYear: cleanAcademicYear, 
            semesterType: cleanSemesterType 
        });

        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: `No existing rubric found for the ${cleanSemesterType} semester of ${cleanAcademicYear}. Cannot update.`
            });
        }

        // 2. Modify and Save (Triggers schema validators, including the overlap check)
        rubric.thresholds = thresholds;
        await rubric.save();

        // 3. Log Activity
        await logRubricAction(
            req, 
            'UPDATED_RUBRIC', 
            `Attainment Rubric updated for ${cleanSemesterType} Semester (Year: ${cleanAcademicYear})`
        );

        return res.status(200).json({
            success: true,
            message: `Rubric for ${cleanAcademicYear} (${cleanSemesterType}) updated successfully!`,
            data: rubric
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation Error', 
                errors: Object.values(error.errors).map(err => err.message) 
            });
        }
        console.error('Error updating rubric:', error);
        return res.status(500).json({ success: false, message: 'Server Error while updating rubric.' });
    }
}

//old
// ============================================================================
// 4. Find All Rubrics
// ============================================================================
// async function handleFindAllRubrics(req, res) {
//     try {
//         // .lean() heavily optimizes fetching large lists of documents
//         const rubrics = await Rubric.find().sort({ course: 1, year: -1 }).lean();

//         if (!rubrics?.length) {
//             return res.status(404).json({ success: false, message: 'No rubrics found in the database.' });
//         }

//         return res.status(200).json({
//             success: true,
//             count: rubrics.length,
//             data: rubrics
//         });

//     } catch (error) {
//         console.error('Error fetching all rubrics:', error);
//         return res.status(500).json({ success: false, message: 'Server Error while fetching rubrics.' });
//     }
// }

//new
async function handleFindAllRubrics(req, res) {
    try {
        // .lean() heavily optimizes fetching large lists of documents
        // Updated sorting: Orders by newest Academic Year first, then groups Odd/Even
        const rubrics = await Rubric.find().sort({ academicYear: -1, semesterType: 1 }).lean();

        if (!rubrics?.length) {
            return res.status(404).json({ success: false, message: 'No rubrics found in the database.' });
        }

        return res.status(200).json({
            success: true,
            count: rubrics.length,
            data: rubrics
        });

    } catch (error) {
        console.error('Error fetching all rubrics:', error);
        return res.status(500).json({ success: false, message: 'Server Error while fetching rubrics.' });
    }
}
//old
// // ============================================================================
// // 5. Delete Rubric By Course & Year
// // ============================================================================
// const handleDeleteRubricByCourseYear = async (req, res) => {
//     try {
//         const { course, year } = req.body;

//         if (!course || !year) {
//             return res.status(400).json({ success: false, message: 'Please provide both the course and the year to delete.' });
//         }

//         const cleanCourse = course.trim().toUpperCase();
//         const cleanYear = parseInt(year, 10);

//         const deletedRubric = await Rubric.findOneAndDelete({
//             course: cleanCourse, 
//             year: cleanYear
//         });

//         if (!deletedRubric) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No rubric found for ${cleanCourse} in ${cleanYear}. It may have already been deleted.`
//             });
//         }

//         // Log Activity
//         await logRubricAction(req, 'DELETED_RUBRIC', `Attainment Rubric deleted for ${deletedRubric.course} (Year: ${deletedRubric.year})`);

//         return res.status(200).json({
//             success: true,
//             message: `Rubric for ${deletedRubric.course} (${deletedRubric.year}) was successfully deleted!`,
//             data: { course: deletedRubric.course, year: deletedRubric.year }
//         });

//     } catch (error) {
//         console.error('Error deleting rubric:', error);
//         return res.status(500).json({ success: false, message: 'Server Error while attempting to delete the rubric.' });
//     }
// };


//new
const handleDeleteRubric = async (req, res) => {
    try {
        const { academicYear, semesterType } = req.body;

        if (!academicYear || !semesterType) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide both the academicYear and the semesterType to delete.' 
            });
        }

        const cleanAcademicYear = academicYear.trim();
        const cleanSemesterType = semesterType.trim().toUpperCase();

        if (!['ODD', 'EVEN'].includes(cleanSemesterType)) {
            return res.status(400).json({
                success: false,
                message: 'Semester type must be exactly ODD or EVEN.'
            });
        }

        const deletedRubric = await Rubric.findOneAndDelete({
            academicYear: cleanAcademicYear, 
            semesterType: cleanSemesterType
        });

        if (!deletedRubric) {
            return res.status(404).json({
                success: false,
                message: `No rubric found for the ${cleanSemesterType} semester of ${cleanAcademicYear}. It may have already been deleted.`
            });
        }

        // Log Activity
        await logRubricAction(
            req, 
            'DELETED_RUBRIC', 
            `Attainment Rubric deleted for ${deletedRubric.semesterType} Semester (Year: ${deletedRubric.academicYear})`
        );

        return res.status(200).json({
            success: true,
            message: `Rubric for ${deletedRubric.academicYear} (${deletedRubric.semesterType}) was successfully deleted!`,
            data: { academicYear: deletedRubric.academicYear, semesterType: deletedRubric.semesterType }
        });

    } catch (error) {
        console.error('Error deleting rubric:', error);
        return res.status(500).json({ success: false, message: 'Server Error while attempting to delete the rubric.' });
    }
};


//old
// const handleUploadRubricsThroughExcelSheet = async(req, res) => {
//     try {
//         const { course, academicYear } = req.body;

//         // 1. Validate Request Payload
//         if (!course || !academicYear) {
//         return res.status(400).json({ error: 'Course and academicYear are required in the request body.' });
//         }
        
//         if (!req.file) {
//         return res.status(400).json({ error: 'Excel file is required.' });
//         }

//         // 2. Read the Uploaded Excel File
//         const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0]; 
//         const worksheet = workbook.Sheets[sheetName];
        
//         // Convert to JSON (defval ensures empty cells become empty strings rather than undefined)
//         const rawExcelData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

//         // 3. Strictly Validate and Transform the Format
//         const thresholds = rawExcelData.map((row, index) => {
//         // Ensure strict column names exist
//         if (!('Level' in row) || !('Min %' in row) || !('Max %' in row)) {
//             throw new Error('Invalid file format. Columns must strictly be: "Level", "Min %", "Max %".');
//         }

//         // Format Level (e.g., "Level 0" -> 0)
//         const levelString = String(row['Level']).trim();
//         const levelNum = parseInt(levelString.replace(/\D/g, ''), 10);

//         // Format Percentages (e.g., "49.99%" -> 49.99)
//         const minString = String(row['Min %']).replace('%', '').trim();
//         const maxString = String(row['Max %']).replace('%', '').trim();
        
//         const minPercent = parseFloat(minString);
//         const maxPercent = parseFloat(maxString);

//         // Ensure parsed values are valid numbers before sending to Mongoose
//         if (isNaN(levelNum) || isNaN(minPercent) || isNaN(maxPercent)) {
//             throw new Error(`Row ${index + 2} contains invalid numeric data.`);
//         }

//         return {
//             level: levelNum,
//             minPercent: minPercent,
//             maxPercent: maxPercent
//         };
//         });

//         // 4. Construct the Document
//         const newRubric = new Rubric({
//         course: String(course).trim().toUpperCase(),
//         year: parseInt(academicYear, 10),
//         thresholds: thresholds
//         });

//         // 5. Save to MongoDB (Triggers your Overlap Engine & Validations)
//         await newRubric.save();

//         return res.status(201).json({
//         success: true,
//         message: 'Rubric thresholds successfully uploaded and saved.',
//         data: newRubric
//         });

//     } catch (error) {
//         // Handle specific custom format errors thrown in the map function
//         if (error.message.includes('Invalid file format') || error.message.includes('invalid numeric data')) {
//         return res.status(400).json({ success: false, error: error.message });
//         }

//         // Handle Mongoose Unique Index Duplicate Error
//         if (error.code === 11000) {
//         return res.status(409).json({ 
//             success: false, 
//             error: `A rubric for ${req.body.course} in year ${req.body.academicYear} already exists.` 
//         });
//         }
        
//         // Handle Mongoose Schema Validation Errors (Missing levels, overlaps, min > max)
//         if (error.name === 'ValidationError') {
//         const messages = Object.values(error.errors).map(err => err.message);
//         return res.status(400).json({ 
//             success: false, 
//             error: 'Schema Validation Failed', 
//             details: messages 
//         });
//         }

//         console.error('Server error during Excel upload:', error);
//         return res.status(500).json({ success: false, error: 'Internal server error.' });
//     }
// };

//new

const handleUploadRubricsThroughExcelSheet = async(req, res) => {
    try {
        const { academicYear, semesterType } = req.body;

        // 1. Validate Request Payload (Course replaced with semesterType)
        if (!academicYear || !semesterType) {
            return res.status(400).json({ error: 'academicYear and semesterType are required in the request body.' });
        }

        const cleanAcademicYear = academicYear.trim();
        const cleanSemesterType = semesterType.trim().toUpperCase();

        if (!['ODD', 'EVEN'].includes(cleanSemesterType)) {
            return res.status(400).json({
                success: false,
                error: 'Semester type must be exactly ODD or EVEN.'
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Excel file is required.' });
        }

        // 2. Read the Uploaded Excel File
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; 
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON (defval ensures empty cells become empty strings rather than undefined)
        const rawExcelData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

        // 3. Strictly Validate and Transform the Format
        const thresholds = rawExcelData.map((row, index) => {
            // Ensure strict column names exist
            if (!('Level' in row) || !('Min %' in row) || !('Max %' in row)) {
                throw new Error('Invalid file format. Columns must strictly be: "Level", "Min %", "Max %".');
            }

            // Format Level (e.g., "Level 0" -> 0)
            const levelString = String(row['Level']).trim();
            const levelNum = parseInt(levelString.replace(/\D/g, ''), 10);

            // Format Percentages (e.g., "49.99%" -> 49.99)
            const minString = String(row['Min %']).replace('%', '').trim();
            const maxString = String(row['Max %']).replace('%', '').trim();
            
            const minPercent = parseFloat(minString);
            const maxPercent = parseFloat(maxString);

            // Ensure parsed values are valid numbers before sending to Mongoose
            if (isNaN(levelNum) || isNaN(minPercent) || isNaN(maxPercent)) {
                throw new Error(`Row ${index + 2} contains invalid numeric data.`);
            }

            return {
                level: levelNum,
                minPercent: minPercent,
                maxPercent: maxPercent
            };
        });

        // 4. Construct the Document using the new architecture
        const newRubric = new Rubric({
            academicYear: cleanAcademicYear,
            semesterType: cleanSemesterType,
            thresholds: thresholds
        });

        // 5. Save to MongoDB (Triggers your Overlap Engine & Validations)
        await newRubric.save();

        return res.status(201).json({
            success: true,
            message: `Rubric thresholds for ${cleanSemesterType} semester successfully uploaded and saved.`,
            data: newRubric
        });

    } catch (error) {
        // Handle specific custom format errors thrown in the map function
        if (error.message.includes('Invalid file format') || error.message.includes('invalid numeric data')) {
            return res.status(400).json({ success: false, error: error.message });
        }

        // Handle Mongoose Unique Index Duplicate Error (Updated Message)
        if (error.code === 11000) {
            return res.status(409).json({ 
                success: false, 
                error: `A rubric for the ${req.body.semesterType?.toUpperCase()} semester in ${req.body.academicYear} already exists.` 
            });
        }
        
        // Handle Mongoose Schema Validation Errors (Missing levels, overlaps, min > max)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                error: 'Schema Validation Failed', 
                details: messages 
            });
        }

        console.error('Server error during Excel upload:', error);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
};



module.exports = { 
    handleUploadrubrics,
    handleGetRubrics,
    handleUpdateRubrics,
    handleFindAllRubrics,
    handleDeleteRubric,
    handleUploadRubricsThroughExcelSheet,
};


// const Rubric = require('../models/rubrics');
// const User = require('../models/user'); 
// const logActivity = require('../utils/activityLogger');


// async function handleUploadrubrics (req, res){
//   try {
//     const { course, year, thresholds } = req.body;

//     // 1. Basic sanity check before hitting the database
//     if (!course || !year || !thresholds || !Array.isArray(thresholds)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Course, year, and thresholds array are required.' 
//       });
//     }

//     // 2. Look for an existing rubric for this exact course and year
//     let rubric = await Rubric.findOne({ course, year });

//     if (rubric) {
//       // If it exists, overwrite the old ranges with the new form data
//       rubric.thresholds = thresholds;
//     } else {
//       // If it doesn't exist, create a brand new one
//       rubric = new Rubric({ course, year, thresholds });
//     }

//     // 3. Save the document
//     // This triggers all the schema validators: mandatory levels, min < max, and overlap prevention.
//     await rubric.save();

//     // ---> 🔔 THE BELL RINGER (ACTIVITY LOGGER) 🔔 <---
//     // Get the uploader's name and fire the notification!
//     const currentUser = await User.findById(req.user).select('name').lean();
//     const actorName = currentUser ? currentUser.name : "a Faculty Member";

//     await logActivity(
//         req.user,
//         'UPLOADED_RUBRIC', 
//         `Attainment Rubric configured for ${course.toUpperCase()} (Year: ${year}) by ${actorName}`, 
//         []
//     );

//     return res.status(200).json({
//       success: true,
//       message: 'Rubric ranges saved successfully!',
//       data: rubric
//     });

//   } catch (error) {
//     // 4. Handle Mongoose Validation Errors gracefully
//     if (error.name === 'ValidationError') {
//       // Extract the specific error messages we wrote in the schema
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Validation Error', 
//         errors: messages 
//       });
//     }

//     // Handle generic server errors
//     console.error('Error in uploadRubric:', error);
//     return res.status(500).json({ 
//       success: false, 
//       message: 'Server Error while saving rubric.' 
//     });
//   }
// };

// async function handleGetRubrics(req, res) {
//   try {
//     // For a GET request, we take parameters from the URL query string
//     // const { course, year } = req.query;
//     const { course, year } = req.body;
//     console.log(req.query);
    

//     // 1. Basic validation
//     if (!course || !year) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide both course and year to search.'
//       });
//     }

//     // 2. The Smart Search with Fallback Logic
//     // This looks for a rubric for the requested year OR the most recent previous year
//     const rubric = await Rubric.findOne({ 
//       course: course.toUpperCase(), // Ensure uppercase matching (BCA or MCA)
//       year: { $lte: parseInt(year) } // Less than or equal to the requested year
//     }).sort({ year: -1 }); // Sort descending so we grab the closest year first

//     // 3. Handle if absolutely no rubric exists
//     if (!rubric) {
//       return res.status(404).json({
//         success: false,
//         message: `No rubric found for ${course.toUpperCase()} in or before the year ${year}.`
//       });
//     }

//     // 4. Return the found rubric
//     return res.status(200).json({
//       success: true,
//       message: `Rubric found (Active Year: ${rubric.year})`,
//       data: rubric
//     });

//   } catch (error) {
//     console.error('Error fetching rubric:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server Error while searching for rubric.'
//     });
//   }
// };






// async function handleUpdateRubrics (req, res){
//   try {
//     // Grab everything from the request body
//     const { course, year, thresholds } = req.body;

//     // 1. Basic validation
//     if (!course || !year || !thresholds || !Array.isArray(thresholds)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Course, year, and the new thresholds array are required to update.' 
//       });
//     }

//     // 2. Search for the exact rubric using course and year
//     const rubric = await Rubric.findOne({ 
//         course: course.toUpperCase(), // Ensure uppercase matching
//         year: parseInt(year) 
//     });

//     // 3. If it doesn't exist, reject the request (Strict Update)
//     if (!rubric) {
//       return res.status(404).json({
//         success: false,
//         message: `No existing rubric found for ${course.toUpperCase()} in ${year}. Cannot update.`
//       });
//     }

//     // 4. Update the ranges
//     rubric.thresholds = thresholds;

//     // 5. Save the document (Triggers anti-overlap and level validators)
//     await rubric.save();

//     // ---> 🔔 THE BELL RINGER (Placed BEFORE the return!) <---
//     try {
//         const userId = req.user?._id || req.user?.id || req.user;
//         const currentUser = await User.findById(userId).select('name').lean();
//         const actorName = currentUser ? currentUser.name : "a Faculty Member";

//         await logActivity(
//             userId,
//             'UPDATED_RUBRIC', 
//             `Attainment Rubric updated for ${rubric.course} (Year: ${rubric.year}) by ${actorName}`, 
//             []
//         );
//     } catch (logError) {
//         console.error("⚠️ Activity Logger Failed:", logError.message);
//     }
//     // ---------------------------------------------------------

//     // 6. Success response
//     return res.status(200).json({
//       success: true,
//       message: `Rubric for ${rubric.course} (${rubric.year}) updated successfully!`,
//       data: rubric
//     });

//   } catch (error) {
//     // Handle Mongoose Schema Validation Errors (overlaps, missing levels)
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Validation Error', 
//         errors: messages 
//       });
//     }

//     console.error('Error updating rubric by course/year:', error);
//     return res.status(500).json({ 
//       success: false, 
//       message: 'Server Error while updating rubric.' 
//     });
//   }
// };



// // const getAllRubrics = async (req, res) => {
// async function handleFindAllRubrics (req, res){
//   try {
//     // Fetch all rubrics from the database
//     // Sorting: course: 1 (A-Z), year: -1 (Newest to oldest)
//     const rubrics = await Rubric.find().sort({ course: 1, year: -1 });

//     // Check if the database is completely empty
//     if (!rubrics || rubrics.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No rubrics found in the database.'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       count: rubrics.length, // Helpful metric for your frontend
//       data: rubrics
//     });

//   } catch (error) {
//     console.error('Error fetching all rubrics:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server Error while fetching rubrics.'
//     });
//   }
// };




// const handleDeleteRubricByCourseYear = async (req, res) => {
//   try {
//     // 1. Grab course and year from the request body
//     const { course, year } = req.body;

//     // 2. Basic validation
//     if (!course || !year) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide both the course and the year to delete the rubric.'
//       });
//     }

//     // 3. Find and delete the exact rubric matching that course and year
//     const deletedRubric = await Rubric.findOneAndDelete({
//       course: course.toUpperCase(), 
//       year: parseInt(year)
//     });

//     // 4. If it returns null, it couldn't find a match
//     if (!deletedRubric) {
//       return res.status(404).json({
//         success: false,
//         message: `No rubric found for ${course.toUpperCase()} in ${year}. It may have already been deleted.`
//       });
//     }

//     // ---> 🔔 THE BELL RINGER (Placed BEFORE the return!) <---
//     try {
//         const userId = req.user?._id || req.user?.id || req.user;
//         const currentUser = await User.findById(userId).select('name').lean();
//         const actorName = currentUser ? currentUser.name : "a Faculty Member";

//         await logActivity(
//             userId,
//             'DELETED_RUBRIC', 
//             `Attainment Rubric deleted for ${deletedRubric.course} (Year: ${deletedRubric.year}) by ${actorName}`, 
//             []
//         );
//     } catch (logError) {
//         console.error("⚠️ Activity Logger Failed:", logError.message);
//     }
//     // ---------------------------------------------------------

//     // 5. Success response (The Kill-Switch)
//     return res.status(200).json({
//       success: true,
//       message: `Rubric for ${deletedRubric.course} (${deletedRubric.year}) was successfully deleted!`,
//       data: {
//         course: deletedRubric.course,
//         year: deletedRubric.year
//       }
//     });

//   } catch (error) {
//     console.error('Error deleting rubric by course and year:', error);
//     return res.status(500).json({ 
//       success: false, 
//       message: 'Server Error while attempting to delete the rubric.' 
//     });
//   }
// };





// module.exports = { 
//     handleUploadrubrics,
//     handleGetRubrics,
//     handleUpdateRubrics,
//     handleFindAllRubrics,
//     handleDeleteRubricByCourseYear
//  };