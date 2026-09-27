const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import middlewares for Verification And Validation
const verifyRoles = require('../middleware/verifyRoles');

// Import utilities for the unified logger
const User = require('../models/user'); 
const logActivity = require('../utils/activityLogger'); 

// Import existing controllers for the LAB pipeline
const { handleUploadAndCalculateLabMarks, handleGetFetchCalculatedLabMarks } = require('../controllers/calculatedLabMarks');
const { handleFinalLabAttainment, handleGetFinalLabAttainment } = require('../controllers/finalLabAttainment');
const { handleGenerateAndSaveLabPoAttainment, handleGetLabPoAttainmentData } = require('../controllers/calculatedLabPo');

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
 * @route   POST /api/lab/upload-raw
 * @desc    Upload Lab Excel, Calculate Thresholds, Generate Final Lab Attainment, and Calculate Lab PO
 * @access  Private
 */
router.post('/upload-raw', verifyRoles('admin', 'faculty'), (req, res) => {
    
    // 1. Manually invoke Multer so we catch file format errors immediately
    upload.single('excelFile')(req, res, async (multerError) => {
        
        // Handle Multer/File Filter Errors explicitly
        if (multerError) {
            return res.status(400).json({ 
                success: false, 
                error: multerError.message || "File upload failed." 
            });
        }

        // 2. Proceed with the Controller Pipeline
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: "No Excel file provided." });
            }

            // Extract info from req.body directly
            const { subjectId, academicYear, course } = req.body;
            const cleanSubjectId = subjectId?.trim().toUpperCase();
            const cleanCourse = course?.trim().toUpperCase();
            const cleanYear = academicYear?.trim();

            // STEP 1: Process Raw Lab Marks and Calculate 60% Thresholds
            await handleUploadAndCalculateLabMarks(req, res, true);

            // STEP 2: Generate Final Lab Attainment (Averaging the Internal Labs)
            await handleFinalLabAttainment(req, res, true);

            // STEP 3: Cross-reference with mapping and Calculate Lab PO
            await handleGenerateAndSaveLabPoAttainment(req, res, true);

            // 🌟 STEP 4: THE UNIFIED ACTIVITY LOGGER 🌟
            // This runs once, only if all steps above succeed
            try {
                const currentUser = await User.findById(req.user).select('name').lean();
                const actorName = currentUser?.name || "a Faculty Member";

                await logActivity(
                    req.user, 
                    'GENERATED_LAB_ATTAINMENT_PIPELINE', 
                    `Uploaded Excel and generated complete Lab PO Attainment for Subject ${cleanSubjectId} (${cleanCourse}, ${cleanYear}) by ${actorName}`, 
                    [] 
                );
            } catch (logError) {
                console.error("Non-fatal error: Failed to log activity:", logError.message);
                // Do not throw; the upload actually succeeded, so let the user get a success message.
            }

            // FINAL RESPONSE: Send only one response after all steps finish
            return res.status(200).json({ 
                success: true, 
                message: "New lab data uploaded and all attainment & PO reports generated successfully." 
            });

        } catch (error) {
            // Always log the full error to your backend console
            console.error("Lab Pipeline Failure:", error);
            
            // 3. Smart, Environment-Aware Error Handler
            if (!res.headersSent) {
                const isDevelopment = process.env.NODE_ENV === 'development';
                let exactErrorMessage = "An unknown error occurred during processing.";

                // Extract the exact error message safely
                if (error instanceof Error) {
                    exactErrorMessage = error.message;
                } else if (typeof error === 'string') {
                    exactErrorMessage = error;
                } else if (error && typeof error === 'object') {
                    exactErrorMessage = error.message || "Database or Validation Error";
                }

                // Prepare the base payload for the frontend
                const errorPayload = { 
                    success: false, 
                    error: exactErrorMessage 
                };

                // Inject full details only in Development Mode
                if (isDevelopment) {
                    errorPayload.stack = error.stack;
                    errorPayload.details = error;
                } else {
                    // Sanitize raw database errors for Production security
                    const isDatabaseError = exactErrorMessage.includes('Mongo') || exactErrorMessage.includes('Cast to');
                    if (isDatabaseError) {
                        errorPayload.error = "An internal server error occurred while processing the data.";
                    }
                }

                return res.status(500).json(errorPayload);
            }
        }
    });
});

// ==========================================
// --- GET ROUTES (Fetching the Data) ---
// ==========================================

router.get('/get-co-attainment', verifyRoles('admin', 'faculty'), handleGetFetchCalculatedLabMarks);
router.get('/get-final-attainment', verifyRoles('admin', 'faculty'), handleGetFinalLabAttainment);
router.get('/get-po-attainment', verifyRoles('admin', 'faculty'), handleGetLabPoAttainmentData);

module.exports = router;