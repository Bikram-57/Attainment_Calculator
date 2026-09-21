// routes/labRoutes.js
const express = require('express');
const router = express.Router();

// 2. Import the NEW Lab PO controllers
const { generateAndSaveLabPoAttainment, getLabPoAttainmentData } = require('../controllers/calculatedLabPo');

// 3. Import your Auth Middleware (adjust path/name to match your project)


// ==========================================
// Existing Lab Routes
// ==========================================
// router.post('/upload-lab', verifyToken, uploadAndCalculateLabMarks);
// router.post('/calculate-final-lab', verifyToken, handleFinalLabAttainment);
// router.get('/fetch-final-lab', verifyToken, getFinalLabAttainment);

// ==========================================
// NEW: Lab PO Attainment Routes
// ==========================================
// POST: Calculate and Save
router.post('/calculate-lab-po', generateAndSaveLabPoAttainment);

// GET: Fetch the saved data
router.get('/fetch-lab-po', getLabPoAttainmentData);

module.exports = router;