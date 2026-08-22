const express = require('express');
const verifyRoles = require('../middleware/verifyRoles');
const { 
    extractAttainmentLevels,
    handleGetDirectAttainment,
    handleGetAllReports,
    handleGetReportByYear
 } = require('../controllers/directAttainment');

const router = express.Router();

router.post('/',  verifyRoles('admin'), extractAttainmentLevels);
router.get('/', verifyRoles('admin'), handleGetDirectAttainment);
router.get('/report', verifyRoles('admin'), handleGetAllReports);
router.get('/year', verifyRoles('admin'), handleGetReportByYear);

module.exports = router;


// must add route security through jwt
