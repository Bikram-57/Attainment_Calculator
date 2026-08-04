const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyRoles = require('../middleware/verifyRoles');


const { 
    handleUploadrubrics,
    handleGetRubrics,
    handleUpdateRubrics,
    handleFindAllRubrics,
    handleDeleteRubric,
    handleUploadRubricsThroughExcelSheet,
} = require('../controllers/rubrics');


// Store file in memory to parse it on the fly
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit (optional but recommended)
});

// POST route to handle form submission
router.post('/upload', verifyRoles('admin'),  handleUploadrubrics);
router.get('/get', verifyRoles('admin'), handleGetRubrics);
router.put('/update', verifyRoles('admin'), handleUpdateRubrics);
router.get('/', verifyRoles('admin'), handleFindAllRubrics);
router.delete('/delete', verifyRoles('admin'), handleDeleteRubric);
router.post('/upload-rubric', upload.single('rubricFile'), handleUploadRubricsThroughExcelSheet);
module.exports = router;