const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleUploadAllSubject } = require("../controllers/uploadAllSubjects");
const verifyRoles = require('../middleware/verifyRoles');


// Configure multer to store files temporarily in an 'uploads' folder
const upload = multer({ dest: 'uploads/' }); 

// The string 'excelFile' must match the Key name in Postman exactly
// router.post('/', upload.single('excelFile'), handleUploadAllSubject);
router.post('/', verifyRoles('admin'), upload.single('excelFile'), handleUploadAllSubject);

module.exports = router;