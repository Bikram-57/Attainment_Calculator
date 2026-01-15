const express = require('express');
const router = express.Router();
const multer = require('multer');
const {handleExcelData, getData} = require('../controllers/marks');

// Configure Multer
const upload = multer({ dest: 'uploads/' });

// POST: Upload Route
// Matches 'handleExcelData' in your controller
router.post('/upload', upload.single('file'), handleExcelData);

// GET: Fetch Route
// Matches 'getData' in your controller (requires ?collection=Name in URL)
router.get('/data', getData);

module.exports = router;