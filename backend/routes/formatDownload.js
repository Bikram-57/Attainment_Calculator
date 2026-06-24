const express = require('express');
const router = express.Router();
const { handleFormatDownload } = require('../controllers/formatDownload');

// Create a simple GET route that doesn't need any parameters
router.get('/', handleFormatDownload);

module.exports = router;