const express = require("express");

const router = express.Router();

const verifyRoles = require('../middleware/verifyRoles');


const {
    handleDownloadReport,
    handleDownloadCalculatedMarks,
    handleDownloadFinalCoAttainment,
    handleDownloadPoAttainment,
} = require("../controllers/downloadReport")

router.get('/download', verifyRoles('admin', 'faculty'), handleDownloadReport);
router.get('/calMark', verifyRoles('admin', 'faculty'), handleDownloadCalculatedMarks);
router.get('/FinalCo', verifyRoles('admin', 'faculty'), handleDownloadFinalCoAttainment);
router.get('/FinalPo', verifyRoles('admin', 'faculty'), handleDownloadPoAttainment);

module.exports = router;
