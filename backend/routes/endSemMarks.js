const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import your controller (adjust the path to match your actual file name)
const { processEndSemMarks, downloadAttainmentData } = require('../controllers/endSemMarks');

// Configure Multer for temporary file storage
// Ensure you have an 'uploads' folder in the root of your project
const upload = multer({ dest: 'uploads/' }); 

// Define the POST route
// The string 'file' inside upload.single() is the exact key name you must use in your frontend form-data
router.post('/process-marks', upload.single('file'), processEndSemMarks);

router.get('/download/:subjectCode', downloadAttainmentData);

module.exports = router;