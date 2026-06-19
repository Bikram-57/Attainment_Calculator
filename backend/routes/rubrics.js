const express = require('express');
const router = express.Router();

const verifyRoles = require('../middleware/verifyRoles');


const { 
    handleUploadrubrics,
    handleGetRubrics,
    handleUpdateRubrics,
    handleFindAllRubrics,
    handleDeleteRubricByCourseYear,
} = require('../controllers/rubrics');

// POST route to handle form submission
router.post('/upload', verifyRoles('admin'),  handleUploadrubrics);
router.get('/get', verifyRoles('admin'), handleGetRubrics);
router.put('/update', verifyRoles('admin'), handleUpdateRubrics);
router.get('/', verifyRoles('admin'), handleFindAllRubrics);
router.delete('/delete', verifyRoles('admin'), handleDeleteRubricByCourseYear);


module.exports = router;