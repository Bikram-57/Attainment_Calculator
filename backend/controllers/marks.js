const mongoose = require('mongoose');
const xlsx = require('xlsx');
const fs = require('fs');

// --- UPLOAD CONTROLLER ---
const handleExcelData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // 1. Generate Collection Name from Filename
        // Example: "Quiz 1.xlsx" -> "Quiz_1"
        const collectionName = req.file.originalname
            .replace(/\.[^/.]+$/, "")  // Remove extension
            .replace(/\s+/g, '_');     // Replace spaces with underscores

        // 2. Read the Excel File
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0]; // Gets the first sheet
        const sheet = workbook.Sheets[sheetName];

        // 3. Convert to "Matrix" (Array of Arrays)
        // 'header: 1' grabs the data row-by-row. This is CRITICAL for your nested headers.
        // 'defval: ""' keeps empty cells as empty strings so columns don't shift.
        const gridData = xlsx.utils.sheet_to_json(sheet, { 
            header: 1, 
            defval: "",
            blankrows: false 
        });

        // 4. Store in a NEW Dynamic Collection
        // We access the raw MongoDB connection to create a collection on the fly
        const db = mongoose.connection.db;
        
        // We store the grid data as one document in this new collection
        await db.collection(collectionName).insertOne({ data: gridData });

        // 5. Cleanup Temp File
        fs.unlinkSync(req.file.path);

        res.status(200).json({ 
            message: "File uploaded successfully!", 
            collection: collectionName,
            rows: gridData.length 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- FETCH CONTROLLER ---
const getData = async (req, res) => {
    try {
        // We need to know WHICH collection to fetch from
        // usage: /api/data?collection=Quiz_1
        const { collection } = req.query;

        if (!collection) {
            return res.status(400).json({ message: "Collection name required in query" });
        }

        const db = mongoose.connection.db;

        // Find the single document holding our sheet
        const result = await db.collection(collection).findOne({});

        // Return just the 'data' array so the frontend gets a clean List of Lists
        res.status(200).json(result ? result.data : []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { handleExcelData, getData };