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
async function handleUploadrubrics(req, res) {
    try {
        const { course, year, thresholds } = req.body;

        // 1. Basic validation
        if (!course || !year || !thresholds || !Array.isArray(thresholds)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Course, year, and thresholds array are required.' 
            });
        }

        const cleanCourse = course.trim().toUpperCase();
        const cleanYear = parseInt(year, 10);

        // 2. Fetch or Create
        let rubric = await Rubric.findOne({ course: cleanCourse, year: cleanYear });

        if (rubric) {
            rubric.thresholds = thresholds; // Overwrite if exists
        } else {
            rubric = new Rubric({ course: cleanCourse, year: cleanYear, thresholds });
        }

        // 3. Save (Triggers Mongoose validators: overlap checks, mandatory levels, etc.)
        await rubric.save();

        // 4. Log Activity asynchronously
        await logRubricAction(req, 'UPLOADED_RUBRIC', `Attainment Rubric configured for ${cleanCourse} (Year: ${cleanYear})`);

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
        console.error('Error in uploadRubric:', error);
        return res.status(500).json({ success: false, message: 'Server Error while saving rubric.' });
    }
}

// ============================================================================
// 2. Get Smart Rubric (By Course & Year with Fallback)
// ============================================================================
async function handleGetRubrics(req, res) {
    try {
        // Fallback checks both query (standard for GET) and body (legacy support)
        const course = req.query.course || req.body.course;
        const year = req.query.year || req.body.year;

        if (!course || !year) {
            return res.status(400).json({ success: false, message: 'Please provide both course and year to search.' });
        }

        const cleanCourse = course.trim().toUpperCase();
        const targetYear = parseInt(year, 10);

        // Smart Search: Looks for exact year, or falls back to the most recent previous year.
        // .lean() provides a massive speed boost for read-only queries.
        const rubric = await Rubric.findOne({ 
            course: cleanCourse, 
            year: { $lte: targetYear } 
        })
        .sort({ year: -1 })
        .lean(); 

        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: `No rubric found for ${cleanCourse} in or before the year ${targetYear}.`
            });
        }

        return res.status(200).json({
            success: true,
            message: `Rubric found (Active Year: ${rubric.year})`,
            data: rubric
        });

    } catch (error) {
        console.error('Error fetching rubric:', error);
        return res.status(500).json({ success: false, message: 'Server Error while searching for rubric.' });
    }
}

// ============================================================================
// 3. Update Existing Rubric
// ============================================================================
async function handleUpdateRubrics(req, res) {
    try {
        const { course, year, thresholds } = req.body;

        if (!course || !year || !thresholds || !Array.isArray(thresholds)) {
            return res.status(400).json({ success: false, message: 'Course, year, and thresholds array are required.' });
        }

        const cleanCourse = course.trim().toUpperCase();
        const cleanYear = parseInt(year, 10);

        // 1. Strict Find (Must exist to update)
        const rubric = await Rubric.findOne({ course: cleanCourse, year: cleanYear });

        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: `No existing rubric found for ${cleanCourse} in ${cleanYear}. Cannot update.`
            });
        }

        // 2. Modify and Save (Triggers schema validators)
        rubric.thresholds = thresholds;
        await rubric.save();

        // 3. Log Activity
        await logRubricAction(req, 'UPDATED_RUBRIC', `Attainment Rubric updated for ${cleanCourse} (Year: ${cleanYear})`);

        return res.status(200).json({
            success: true,
            message: `Rubric for ${cleanCourse} (${cleanYear}) updated successfully!`,
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

// ============================================================================
// 4. Find All Rubrics
// ============================================================================
async function handleFindAllRubrics(req, res) {
    try {
        // .lean() heavily optimizes fetching large lists of documents
        const rubrics = await Rubric.find().sort({ course: 1, year: -1 }).lean();

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

// ============================================================================
// 5. Delete Rubric By Course & Year
// ============================================================================
const handleDeleteRubricByCourseYear = async (req, res) => {
    try {
        const { course, year } = req.body;

        if (!course || !year) {
            return res.status(400).json({ success: false, message: 'Please provide both the course and the year to delete.' });
        }

        const cleanCourse = course.trim().toUpperCase();
        const cleanYear = parseInt(year, 10);

        const deletedRubric = await Rubric.findOneAndDelete({
            course: cleanCourse, 
            year: cleanYear
        });

        if (!deletedRubric) {
            return res.status(404).json({
                success: false,
                message: `No rubric found for ${cleanCourse} in ${cleanYear}. It may have already been deleted.`
            });
        }

        // Log Activity
        await logRubricAction(req, 'DELETED_RUBRIC', `Attainment Rubric deleted for ${deletedRubric.course} (Year: ${deletedRubric.year})`);

        return res.status(200).json({
            success: true,
            message: `Rubric for ${deletedRubric.course} (${deletedRubric.year}) was successfully deleted!`,
            data: { course: deletedRubric.course, year: deletedRubric.year }
        });

    } catch (error) {
        console.error('Error deleting rubric:', error);
        return res.status(500).json({ success: false, message: 'Server Error while attempting to delete the rubric.' });
    }
};

module.exports = { 
    handleUploadrubrics,
    handleGetRubrics,
    handleUpdateRubrics,
    handleFindAllRubrics,
    handleDeleteRubricByCourseYear
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