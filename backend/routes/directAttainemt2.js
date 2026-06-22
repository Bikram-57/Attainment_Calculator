const express = require('express');
const { 
    extractAttainmentLevels,
    handleGetDirectAttainment,
    handleGetAllReports,
    handleGetReportByYear
 } = require('../controllers/directAttainment2');

const router = express.Router();

router.post('/', extractAttainmentLevels);
router.get('/', handleGetDirectAttainment);
router.get('/report', handleGetAllReports);
router.get('/year', handleGetReportByYear);

module.exports = router;