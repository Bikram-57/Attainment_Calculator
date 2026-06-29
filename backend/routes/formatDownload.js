const express = require('express');
const router = express.Router();
const { handleFormatDownload, handleUploadAssignSubjectDownload } = require('../controllers/formatDownload');

// Create a simple GET route that doesn't need any parameters
router.get('/', handleFormatDownload);
router.get('/assign-sub', handleUploadAssignSubjectDownload);

module.exports = router;