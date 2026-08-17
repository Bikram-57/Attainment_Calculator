// routes/marksRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import the controller function we just created
const { processAssessmentFiles, downloadMappedMarks } = require('../controllers/tempSubjectMarks');

// Configure multer storage (saves temporary files to an 'uploads' directory)
const upload = multer({ dest: 'uploads/' });

// Define the POST route
// upload.fields() ensures the files match the expected keys from the client
router.post(
  '/upload-attainment-marks', 
  upload.fields([
    { name: 'internalMarks', maxCount: 1 },
    { name: 'externalMarks', maxCount: 1 }
  ]), 
  processAssessmentFiles
);

router.get('/download-marks', downloadMappedMarks);

module.exports = router;