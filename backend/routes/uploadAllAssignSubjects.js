const express = require('express');
const router = express.Router();
const multer = require('multer');

const verifyRoles = require('../middleware/verifyRoles');

// Import the controller
const { HandleUploadAssignSubjects } = require('../controllers/uploadAllAssignSubjects');

// Configure Multer for temporary disk storage
// Ensure the 'uploads/temp' directory exists in your project root, 
// or Multer will throw an error when trying to save the file.
const upload = multer({ dest: 'uploads/temp/' });

// Define the POST route
// 'file' is the key the frontend must use in its FormData object
router.post('/upload-excel', verifyRoles('admin', 'faculty'), upload.single('file'), HandleUploadAssignSubjects);

module.exports = router;