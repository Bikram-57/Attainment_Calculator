const express = require("express");

const router = express.Router();
const {
    handleDownloadReport,
    handleDownloadCalculatedMarks,
    handleDownloadFinalCoAttainment,
    handleDownloadPoAttainment,
} = require("../controllers/downloadReport")

router.get('/download', handleDownloadReport);
router.get('/calMark', handleDownloadCalculatedMarks);
router.get('/FinalCo', handleDownloadFinalCoAttainment);
router.get('/FinalPo', handleDownloadPoAttainment);

module.exports = router;
