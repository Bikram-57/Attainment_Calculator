// routes/assignSubjectRoutes.js
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const { 
  getAssignedSubjectCountForCurrentYear,
  getPendingCopoMappingCount,
  getGeneratedReportCount,
 } = require('../controllers/userHomePage');

// The request hits verifyJWT first, which attaches req.facultyId, then hits the controller
router.get('/activity', verifyJWT, getAssignedSubjectCountForCurrentYear);
router.get('/copo', verifyJWT, getPendingCopoMappingCount);
router.get('/generated-count', verifyJWT, getGeneratedReportCount);

module.exports = router;