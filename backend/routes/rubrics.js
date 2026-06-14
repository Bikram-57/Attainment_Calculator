const express = require('express');
const router = express.Router();

const verifyRoles = require('../middleware/verifyRoles');


const { 
    handleUploadrubrics,
    handleGetRubrics,
    handleUpdateRubrics,
    handleFindAllRubrics,
} = require('../controllers/rubrics');

// POST route to handle form submission
router.post('/upload', verifyRoles('admin'),  handleUploadrubrics);
router.get('/get', verifyRoles('admin'), handleGetRubrics);
router.get('/update', verifyRoles('admin'), handleUpdateRubrics);
router.get('/', verifyRoles('admin'), handleFindAllRubrics);


module.exports = router;