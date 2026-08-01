const express = require('express');
const router = express.Router();
const { 
    handleFormatDownload,
    handleUploadAssignSubjectDownload,
    handleCoPoMappingFormatDownload,
    handleUploadAllSubjectFormatDownload,
    handleUploadRubricsFormatDownload,
} = require('../controllers/formatDownload');

// Create a simple GET route that doesn't need any parameters
router.get('/', handleFormatDownload);
router.get('/assign-sub', handleUploadAssignSubjectDownload);
router.get('/copo-mapping', handleCoPoMappingFormatDownload);
router.get('/subject', handleUploadAllSubjectFormatDownload);
router.get('/rubrics', handleUploadRubricsFormatDownload);

module.exports = router;