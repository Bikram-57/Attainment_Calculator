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


