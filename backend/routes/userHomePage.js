// routes/assignSubjectRoutes.js
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const { 
  HangleGetAssignedSubjectCountForCurrentYear,
  HandleGetPendingCopoMappingCount,
  handleGetGeneratedReportCount,
  HandleGetMyBCAProgress,
  handleGetMyMCAProgress,
  handleGetMyBCACopoProgress,
  handleGetMyMCACopoProgress,
 } = require('../controllers/userHomePage');

// The request hits verifyJWT first, which attaches req.facultyId, then hits the controller
router.get('/activeSubject', verifyJWT, HangleGetAssignedSubjectCountForCurrentYear);
router.get('/copo', verifyJWT, HandleGetPendingCopoMappingCount);
router.get('/generated-count', verifyJWT, handleGetGeneratedReportCount);
router.get('/my-progress/bca', verifyJWT, HandleGetMyBCAProgress); 
router.get('/my-progress/mca', verifyJWT, handleGetMyMCAProgress); 
router.get('/my-copo-progress/bca', verifyJWT, handleGetMyBCACopoProgress);
router.get('/my-copo-progress/mca', verifyJWT, handleGetMyMCACopoProgress);

module.exports = router;