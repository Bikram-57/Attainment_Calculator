// routes/mappingRoutes.js
const express = require('express');
const router = express.Router();

// Import the controller we just built
const { handleSaveCoPsoMapping } = require('../controllers/coPsoMapping');

// @route   POST /api/mappings/co-pso
// @desc    Create or update a CO-PSO articulation matrix
// @access  Private (Admins or Teachers only)
router.post('/co-pso', handleSaveCoPsoMapping);

// You can easily add the standard CO-PO routes here later, for example:
// router.post('/co-po', protect, saveCoPoMapping);

module.exports = router;