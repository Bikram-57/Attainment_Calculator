// const express = require('express');
// const router = express.Router();

// // Import the controllers (adjust the path based on your folder structure)
// const { handleDownloadPdfReport } = require('../controllers/PrintReadyPDFDownload'); 


// // Route for PDF Download
// // Example: GET /api/reports/download-pdf?subjectId=CS101&course=BTech&academicYear=2025-2026
// router.get('/download-pdf', handleDownloadPdfReport);

// module.exports = router;


const express = require('express');
const router = express.Router();

// Import all the controllers from your PDF download file
const { 
    handleDownloadPdfReport,
    handleDownloadCalculatedMarksPdf,
    handleDownloadFinalCoAttainmentPdf,
    handleDownloadPoAttainmentPdf
} = require('../controllers/PrintReadyPDFDownload'); 

// Route 1: Download Master PDF Report
// Example: GET /api/reports/download-pdf?subjectId=CS101&course=BTech&academicYear=2025-2026
router.get('/download-pdf', handleDownloadPdfReport);

// Route 2: Download Calculated Marks ONLY (PDF)
// Example: GET /api/reports/download-calculated-marks-pdf?subjectId=CS101&course=BTech&academicYear=2025-2026
router.get('/download-calculated-marks-pdf', handleDownloadCalculatedMarksPdf);

// Route 3: Download Final CO Attainment ONLY (PDF)
// Example: GET /api/reports/download-co-attainment-pdf?subjectId=CS101&course=BTech&academicYear=2025-2026
router.get('/download-co-attainment-pdf', handleDownloadFinalCoAttainmentPdf);

// Route 4: Download PO Attainment ONLY (PDF)
// Example: GET /api/reports/download-po-attainment-pdf?subjectId=CS101&course=BTech&academicYear=2025-2026
router.get('/download-po-attainment-pdf', handleDownloadPoAttainmentPdf);

module.exports = router;