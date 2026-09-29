
const express = require('express');
const router = express.Router();
const {
     handleDownloadTheoryPdfReport,
    handleDownloadTheoryCalculatedMarksPdf,
    handleDownloadTheoryFinalCoAttainmentPdf,
    handleDownloadTheoryPoAttainmentPdf
} = require('../controllers/PrintReadyPDFDownload');

router.get('/theory/download-master-report', handleDownloadTheoryPdfReport);

// Download Calculated Marks ONLY
router.get('/theory/download-calculated-marks', handleDownloadTheoryCalculatedMarksPdf);

// Download Final CO Attainment ONLY
router.get('/theory/download-final-co', handleDownloadTheoryFinalCoAttainmentPdf);

// Download PO Attainment ONLY
router.get('/theory/download-po-attainment', handleDownloadTheoryPoAttainmentPdf);

module.exports = router;