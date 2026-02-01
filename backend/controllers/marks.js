const mongoose = require('mongoose');
const Mark = require('../models/marks');
const xlsx = require('xlsx');
const fs = require('fs');

async function handleUploadMarks(req, res) {
//     try {
//         if (!req.file) return res.status(400).json({ error: "No file uploaded." });

//         const { subjectId, academicYear } = req.body;
//         if (!subjectId) return res.status(400).json({ error: "subjectId is required to name the collection." });

//         const workbook = xlsx.readFile(req.file.path);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

//         const mainHeaders = rawData[0];
//         const coHeaders = rawData[1];
//         const dataRows = rawData.slice(2);

//         let currentExam = "";

//         const finalData = dataRows.map(row => {
//             let studentPerformance = {};
//             let regNo = "";
//             let examTotals = {};

//             row.forEach((cell, i) => {
//                 if (mainHeaders[i]) {
//                     currentExam = mainHeaders[i].toString().trim().replace(/\s+/g, '_');
//                 }
//                 const coLabel = coHeaders[i] ? coHeaders[i].toString().trim() : "";

//                 // Detection for Reg No
//                 if (coLabel.toLowerCase().includes('reg') || (mainHeaders[i] && mainHeaders[i].toLowerCase().includes('reg')) || i === 0) {
//                     if (!regNo) regNo = cell;
//                 } else if (coLabel) {
//                     const value = (cell === 'AB' || !cell) ? 0 : Number(cell);
//                     const dynamicKey = `${currentExam}_${coLabel}`;
//                     studentPerformance[dynamicKey] = cell === 'AB' ? 'AB' : value;

//                     if (coLabel.toLowerCase().startsWith('co')) {
//                         examTotals[currentExam] = (examTotals[currentExam] || 0) + value;
//                     }
//                 }
//             });

//             Object.keys(examTotals).forEach(exam => {
//                 studentPerformance[`${exam}_Total`] = examTotals[exam];
//             });

//             return {
//                 regNo: regNo ? String(regNo).trim() : null,
//                 academicYear: academicYear,
//                 data: studentPerformance,
//                 uploadedAt: new Date()
//             };
//         });

//         const validEntries = finalData.filter(d => d.regNo);

//         if (validEntries.length > 0) {
//             // --- THE DYNAMIC PART ---
//             // Instead of Mark.insertMany, we target the collection by the subjectId variable
//             const dynamicCollection = mongoose.connection.db.collection(subjectId);
//             await dynamicCollection.insertMany(validEntries);
//             console.log(`Saved to collection: ${subjectId}`);
//         }

//         if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

//         res.status(200).json({
//             message: `Data stored successfully in collection: ${subjectId}`,
//             count: validEntries.length
//         });

//     } catch (error) {
//         if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
//         res.status(500).json({ error: error.message });
//     }
// };



try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded." });

        // These credentials now strictly control the override logic
        const { subjectId, academicYear, facultyId } = req.body;

        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });

        const mainHeaders = rawData[0] || []; 
        const coHeaders = rawData[1] || [];
        
        // Find the "Max Marks/CO" row at the bottom
        const maxMarksRow = rawData.find(row => 
            row && row[0] && row[0].toString().trim() === "Max Marks/CO"
        );

        if (!maxMarksRow) throw new Error("REJECTED: Could not find 'Max Marks/CO' row.");

        const maxMarksIndex = rawData.indexOf(maxMarksRow);
        const dataRows = rawData.slice(2, maxMarksIndex); 

        let currentExam = "";
        let headerMap = [];
        let maxMarksMap = {};
        let regNoIndex = 0;

        for (let i = 0; i < coHeaders.length; i++) {
            if (mainHeaders[i] && mainHeaders[i].toString().trim() !== "") {
                currentExam = mainHeaders[i].toString().trim().replace(/\s+/g, '_');
            }
            const coLabel = coHeaders[i] ? coHeaders[i].toString().trim() : "";

            if (coLabel.toLowerCase().includes('reg') || (mainHeaders[i] && mainHeaders[i].toString().toLowerCase().includes('reg'))) {
                regNoIndex = i;
            } 
            else if (currentExam && coLabel.toLowerCase().startsWith('co')) {
                const key = `${currentExam}_${coLabel}`;
                headerMap[i] = key;
                maxMarksMap[key] = Number(maxMarksRow[i]) || 0;
            }
        }

        const studentsBatch = dataRows.map((row) => {
            if (!row || row.length === 0) return null;
            let studentMarks = {};
            const regNo = row[regNoIndex];

            if (regNo && regNo.toString().trim() !== "") {
                headerMap.forEach((key, i) => {
                    if (key) {
                        const cell = row[i];
                        studentMarks[key] = (cell === 'AB' || cell === null || cell === "") ? 0 : Number(cell);
                    }
                });
                return { regNo: String(regNo).trim(), marks: studentMarks };
            }
            return null;
        }).filter(s => s !== null && Object.keys(s.marks).length > 0);

        // --- THE OVERRIDE FEATURE: MATCH BY SUBJECT AND YEAR ---
        await Mark.findOneAndUpdate(
            { 
                subjectId: subjectId, 
                academicYear: academicYear 
            }, 
            { 
                $set: { 
                    facultyId, 
                    maxMarks: maxMarksMap, 
                    actualMarks: studentsBatch,
                    uploadedAt: new Date() 
                } 
            },
            { upsert: true, new: true }
        );

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(200).json({ 
            success: true, 
            message: `Data for ${subjectId} in ${academicYear} has been overridden/saved.` 
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ success: false, error: error.message });
    }
};
module.exports = { handleUploadMarks };