// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const { handleUploadMarks } = require('../controllers/marks');
// const { handleCalculatedMarks } = require('../controllers/calculatedMarks');
// // const { protect } = require('../middleware/authProject'); // Your JWT protection middleware

// // 1. Configure Multer Storage for the Excel files
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Ensure this folder exists in your root directory
//     },
//     filename: (req, file, cb) => {
//         // Keeps the filename unique to prevent overwriting
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// // 2. File Filter to enforce strict Excel formats
// const fileFilter = (req, file, cb) => {
//     const filetypes = /xlsx|xls|csv/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
//     if (extname) {
//         return cb(null, true);
//     } else {
//         cb(new Error('Only Excel/CSV files are allowed!'), false);
//     }
// };

// const upload = multer({ 
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// // 3. The Route
// // protect: Verifies the Faculty JWT
// // upload.single('excelFile'): Matches the name attribute in your Bootstrap form
// router.post(
//     '/upload-marks', 
//     // protect, 
//     upload.single('excelFile'), 
//     handleUploadMarks
// );

// module.exports = router;



const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

// Import both controllers
const { handleUploadMarks } = require('../controllers/marks'); // Your existing one
const { handleCalculatedMarks } = require('../controllers/calculatedMarks'); // The new one

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File required" });

        // Hit BOTH controllers at the SAME TIME
        await Promise.all([
            handleUploadMarks(req),
            handleCalculatedMarks(req)
        ]);

        // Delete file after both are done
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.status(200).json({ 
            success: true, 
            message: "Raw and Calculated data saved in parallel!" 
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

