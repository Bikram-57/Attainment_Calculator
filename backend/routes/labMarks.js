const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import middlewares for Verification And Validation
const verifyRoles = require('../middleware/verifyRoles'); // Adjust path if needed

// Import existing controllers for the LAB pipeline
const { uploadAndCalculateLabMarks } = require('../controllers/labUploadController');
const { handleFinalLabAttainment, handleGetFinalLabAttainment } = require('../controllers/labFinalAttainmentController');
const { generateAndSaveLabPoAttainment, getLabPoAttainmentData } = require('../controllers/labPoAttainmentController');

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

            // STEP 1: Process Raw Lab Marks and Calculate 60% Thresholds
            // (Note: For labs, your upload controller handles both extraction & initial calc)
            await uploadAndCalculateLabMarks(req, res, true);

            // STEP 2: Generate Final Lab Attainment (Averaging the Internal Labs)
            await handleFinalLabAttainment(req, res, true);

            // STEP 3: Cross-reference with mapping and Calculate Lab PO
            await generateAndSaveLabPoAttainment(req, res, true);

            // FINAL RESPONSE: Send only one response after all 3 steps finish
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

// Fetch Step 2 Data (Final Averaged Attainment Table)
router.get('/get-final-attainment', verifyRoles('admin', 'faculty'), handleGetFinalLabAttainment);

// Fetch Step 3 Data (Final Calculated PO)
router.get('/get-po-attainment', verifyRoles('admin', 'faculty'), getLabPoAttainmentData);

module.exports = router;