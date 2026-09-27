const express = require('express');
const router = express.Router();
const { handleDownloadLabReport, handleDownloadCOAttainment, handleDownloadFinalCOAttainment, handleDownloadPOAttainment } = require('../controllers/downloadLabReport');

// Using GET request with query params: ?subjectId=CS101&course=BTECH&academicYear=2024
router.get('/download', handleDownloadLabReport);
router.get('/download-coAttainment', handleDownloadCOAttainment);
router.get('/download-finalCoAttainment', handleDownloadFinalCOAttainment);
router.get('/download-poAttainment', handleDownloadPOAttainment);

module.exports = router;