const express = require('express');
const router = express.Router();
const { 
    handleUploadrubrics,
    handleGetRubrics,
    handleUpdateRubrics,
    handleFindAllRubrics,
} = require('../controllers/rubrics');

// POST route to handle form submission
router.post('/upload',  handleUploadrubrics);
router.get('/get', handleGetRubrics);
router.get('/update', handleUpdateRubrics);
router.get('/', handleFindAllRubrics);


module.exports = router;