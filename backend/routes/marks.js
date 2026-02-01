const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { handleUploadMarks } = require('../controllers/marks');
// const { protect } = require('../middleware/authProject'); // Your JWT protection middleware

// 1. Configure Multer Storage for the Excel files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this folder exists in your root directory
    },
    filename: (req, file, cb) => {
        // Keeps the filename unique to prevent overwriting
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// 2. File Filter to enforce strict Excel formats
const fileFilter = (req, file, cb) => {
    const filetypes = /xlsx|xls|csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only Excel/CSV files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 3. The Route
// protect: Verifies the Faculty JWT
// upload.single('excelFile'): Matches the name attribute in your Bootstrap form
router.post(
    '/upload-marks', 
    // protect, 
    upload.single('excelFile'), 
    handleUploadMarks
);

module.exports = router;