const express = require('express');
const multer = require('multer');

// Import your controllers (adjust the paths based on your actual folder structure)
const { handleProcessInternalMarks, handleDownloadFormattedSheet } = require('../controllers/internalMarks');

// const { processEndSemMarks } = require('../controllers/endSemMarksController');

const router = express.Router();

// Configure Multer to temporarily store uploaded files in an 'uploads' directory
// Ensure that the 'uploads' folder exists in the root of your project
const upload = multer({ dest: 'uploads/' });

// POST route for uploading and mapping Internal Marks Excel files
// Expects form-data with a key named 'file' containing the Excel sheet
router.post('/upload-internal', upload.single('upload-internal'), handleProcessInternalMarks);

// POST route for uploading and mapping End Semester Excel files
// Expects form-data with a key named 'file' containing the Excel sheet
// router.post(
//   '/upload-endsem', 
//   upload.single('file'), 
//   processEndSemMarks
// );


router.get('/download-formatted-Data', handleDownloadFormattedSheet);


module.exports = router;


// In your routes/attainmentRoutes.js (or similar)
