const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import all controllers for the pipeline
const { handleUploadMarks } = require('../controllers/marks');
const { handleCalculatedMarks } = require('../controllers/calculatedMarks');
const { handleFinalAttainment } = require('../controllers/finalAttainment');

const { getRawMarks } = require('../controllers/marks');

// Usage: GET /api/marks/get-raw-marks?subjectId=CA2313&academicYear=2025-26&course=BCA
router.get('/get-raw-marks', getRawMarks);


// 1. Multer Configuration (Using Memory Storage to avoid "Path" errors)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

/**
 * @route   POST /api/marks/upload-raw
 * @desc    Upload Excel, Calculate 4-Row Marks, and Generate Final Direct Attainment
 * @access  Public (or add your Auth Middleware here)
 */
router.post('/upload-raw', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No Excel file provided." });
        }

        // STEP 1: Process and Save Raw Marks
        // We pass 'true' as the 3rd argument (isPipeline) to prevent "Headers Sent" error
        const isUpdate = await handleUploadMarks(req, res, true);

        // STEP 2: Generate 4-Row Attainment (Target, Count, %, Level)
        await handleCalculatedMarks(req, res);

        // STEP 3: Generate Final Direct Attainment (Internal Avg vs External 50/50)
        // This matches the format of the image you provided
        await handleFinalAttainment(req, res);

        // FINAL RESPONSE: Send only one response after the entire pipeline finishes
        return res.status(200).json({ 
            success: true, 
            message: isUpdate 
                ? "Data updated and all attainment reports recalculated." 
                : "New data uploaded and attainment reports generated successfully." 
        });

    } catch (error) {
        console.error("Pipeline Failure:", error.message);
        
        // Ensure we only send an error response if headers haven't been sent yet
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false, 
                error: error.message || "An internal error occurred during processing." 
            });
        }
    }
});



// Route to get original uploaded marks (Non-calculated)
router.get('/get-raw-marks', getRawUploadedData);

module.exports = router;