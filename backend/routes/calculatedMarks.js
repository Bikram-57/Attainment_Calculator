const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { handleCalculatedMarks } = require('../controllers/calculatedMarks');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File required" });
        
        const result = await handleCalculatedMarks(req);

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(200).json({ success: true, message: "Calculated document created!", data: result });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;