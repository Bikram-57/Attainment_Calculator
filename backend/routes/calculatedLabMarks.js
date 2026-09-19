// backend/routes/calculatedLabMarks.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Setup multer
const upload = multer({ storage: multer.memoryStorage() });

// 🚨 CRITICAL IMPORT 🚨
// Make sure the path '../controllers/labUploadController' exactly matches your controller file's name and location!
// If your controller is named something else (like 'labController.js'), change the path below to match it.
const { uploadAndCalculateLabMarks, handleGetFetchCalculatedLabMarks } = require('../controllers/calculatedLabMarks'); 

// If the import failed, let's catch it before it crashes the server so we know exactly why
if (!uploadAndCalculateLabMarks) {
    console.error("❌ ERROR: uploadAndCalculateLabMarks is undefined! Check your controller export and file path.");
}

// The Route (Line 14)
router.post(
    '/upload-lab-file', 
    upload.single('excelFile'), 
    uploadAndCalculateLabMarks // This is what was undefined causing the crash
);

router.get('/fetch-lab-attainment', handleGetFetchCalculatedLabMarks);

module.exports = router;