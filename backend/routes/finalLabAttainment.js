const express = require('express');
const router = express.Router();
const { handleFinalLabAttainment, handleGetFinalLabAttainment } = require('../controllers/finalLabAttainment');

// Define the POST route
router.post('/calculate-final-lab', handleFinalLabAttainment);
router.get('/fetch-final-lab', handleGetFinalLabAttainment);

module.exports = router;