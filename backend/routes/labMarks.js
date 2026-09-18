const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    handleRawMarksUpload
} = require('../controllers/labMarks');

// Configure multer to hold the file in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-lab-marks', upload.single('labFile'), handleRawMarksUpload);

module.exports = router;