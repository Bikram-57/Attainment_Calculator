// const express = require('express');
// const router = express.Router();
// const multer = require('multer');

// // Import middlewares for Varification And Validation
// const verifyRoles = require('../middleware/verifyRoles');




// // Import all controllers for the pipeline
// const { handleUploadMarks } = require('../controllers/marks');
// const { handleCalculatedMarks } = require('../controllers/calculatedMarks');
// const { handleFinalAttainment } = require('../controllers/finalAttainment');


// const { getRawMarksData } = require('../controllers/marks');
// const { getCalculatedWithStudentMarks } = require('../controllers/calculatedMarks');
// const { getFinalAttainmentData } = require('../controllers/finalAttainment');




// // 1. Multer Configuration (Using Memory Storage to avoid "Path" errors)
// const storage = multer.memoryStorage();
// const upload = multer({ 
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
// });

// /**
//  * @route   POST /api/marks/upload-raw
//  * @desc    Upload Excel, Calculate 4-Row Marks, and Generate Final Direct Attainment
//  * @access  Public (or add your Auth Middleware here)
//  */
// // router.post('/upload-raw', upload.single('excelFile'), handleVerifyToken, handleAuthorizeRoles('admin', 'faculty'), async (req, res) => {
// router.post('/upload-raw', verifyRoles('admin', 'faculty'), upload.single('excelFile'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ success: false, error: "No Excel file provided." });
//         }

//         // STEP 1: Process and Save Raw Marks
//         // We pass 'true' as the 3rd argument (isPipeline) to prevent "Headers Sent" error
//         const isUpdate = await handleUploadMarks(req, res, true);

//         // STEP 2: Generate 4-Row Attainment (Target, Count, %, Level)
//         // UPDATED: Added 'true' to prevent the controller from ending the response
//         await handleCalculatedMarks(req, res, true);

//         // STEP 3: Generate Final Direct Attainment (Internal Avg vs External 50/50)
//         // UPDATED: Added 'true' here as well to pass control back to the main route
//         await handleFinalAttainment(req, res, true);

//         // FINAL RESPONSE: Send only one response after the entire pipeline finishes
//         return res.status(200).json({ 
//             success: true, 
//             message: isUpdate 
//                 ? "Data updated and all attainment reports recalculated." 
//                 : "New data uploaded and attainment reports generated successfully." 
//         });

//     } catch (error) {
//         console.error("Pipeline Failure:", error.message);
        
//         // Ensure we only send an error response if headers haven't been sent yet
//         if (!res.headersSent) {
//             return res.status(500).json({ 
//                 success: false, 
//                 error: error.message || "An internal error occurred during processing." 
//             });
//         }
//     }
// });


// // router.get('/raw-data', handleVerifyToken, handleAuthorizeRoles('admin', 'faculty'), getRawMarksData);
// router.get('/raw-data',verifyRoles('admin', 'faculty'), getRawMarksData);

// // router.get('/get-calculations', handleVerifyToken, handleAuthorizeRoles('admin', 'faculty'), getCalculatedWithStudentMarks);
// router.get('/get-calculations',verifyRoles('admin', 'faculty'), getCalculatedWithStudentMarks);

// // router.get('/get-final-attainment', handleVerifyToken, handleAuthorizeRoles('admin', 'faculty'), getFinalAttainmentData);
// router.get('/get-final-attainment',verifyRoles('admin', 'faculty'), getFinalAttainmentData);

// module.exports = router;
















const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import middlewares for Verification And Validation
const verifyRoles = require('../middleware/verifyRoles');

// Import existing controllers for the pipeline
const { handleUploadMarks, getRawMarksData } = require('../controllers/marks');
const { handleCalculatedMarks, getCalculatedWithStudentMarks } = require('../controllers/calculatedMarks');
const { handleFinalAttainment, getFinalAttainmentData } = require('../controllers/finalAttainment');

// IMPORT ONLY THE POST HANDLER: calculatedPO
const { generateAndSavePoAttainment } = require('../controllers/calculatedPO');

// 1. Multer Configuration WITH File Filter
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Only accept standard Excel files to prevent parsing errors downstream
    if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
        file.mimetype === 'application/vnd.ms-excel' // .xls
    ) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file format. Please upload an Excel file (.xlsx or .xls)."), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: fileFilter 
});

/**
 * @route   POST /api/marks/upload-raw
 * @desc    Upload Excel, Calculate 4-Row Marks, Generate Final Direct Attainment, and Calculate PO
 * @access  Private
 */
router.post('/upload-raw', verifyRoles('admin', 'faculty'), upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No Excel file provided." });
        }

        // STEP 1: Process and Save Raw Marks
        const isUpdate = await handleUploadMarks(req, res, true);

        // STEP 2: Generate 4-Row Attainment (Target, Count, %, Level)
        await handleCalculatedMarks(req, res, true);

        // STEP 3: Generate Final Direct Attainment (Internal Avg vs External 50/50)
        await handleFinalAttainment(req, res, true);

        // STEP 4: Calculate PO (Hits the POST controller only)
        await generateAndSavePoAttainment(req, res, true);

        // FINAL RESPONSE: Send only one response after all 4 steps finish
        return res.status(200).json({ 
            success: true, 
            message: isUpdate 
                ? "Data updated and all attainment & PO reports recalculated." 
                : "New data uploaded and attainment & PO reports generated successfully." 
        });

    } catch (error) {
        console.error("Pipeline Failure:", error.message);
        
        // Ensure we only send an error response if headers haven't been sent yet
        if (!res.headersSent) {
            // If the error came from Multer's fileFilter, it will be passed here
            return res.status(error.message.includes("Invalid file format") ? 400 : 500).json({ 
                success: false, 
                error: error.message || "An internal error occurred during processing." 
            });
        }
    }
});

// --- GET ROUTES ---

router.get('/raw-data', verifyRoles('admin', 'faculty'), getRawMarksData);

router.get('/get-calculations', verifyRoles('admin', 'faculty'), getCalculatedWithStudentMarks);

router.get('/get-final-attainment', verifyRoles('admin', 'faculty'), getFinalAttainmentData);

// Note: The GET route for calculatedPO has been successfully removed.

module.exports = router;