const express = require('express');
const router = express.Router();
const { handleDownloadPrintReadyReportForLab, handleDownloadCOAttainmentPDF, handleDownloadFinalCOAttainmentPDF, handleDownloadPOAttainmentPDF } = require('../controllers/LabPrintReadyPDFDownload'); 

// ... your excel routes ...
router.get('/download-pdf', handleDownloadPrintReadyReportForLab);
router.get('/download-co-attainment-pdf', handleDownloadCOAttainmentPDF);
router.get('/download-final-co-attainment-pdf', handleDownloadFinalCOAttainmentPDF);
router.get('/download-po-attainment-pdf', handleDownloadPOAttainmentPDF);

module.exports = router;