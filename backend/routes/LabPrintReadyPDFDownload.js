const express = require('express');
const router = express.Router();
const {
   handleDownloadPdfReport,
    handleDownloadCalculatedMarksPdf,
    handleDownloadFinalCoAttainmentPdf,
    handleDownloadPoAttainmentPdf
} = require('../controllers/LabPrintReadyPDFDownload');

// ... your excel routes ...
router.get('/lab/download-master-report', handleDownloadPdfReport);
router.get('/lab/download-co-attainment', handleDownloadCalculatedMarksPdf);
router.get('/lab/download-final-co-attainment', handleDownloadFinalCoAttainmentPdf);
router.get('/lab/download-po-attainment ', handleDownloadPoAttainmentPdf);

module.exports = router;