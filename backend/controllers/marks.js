const mongoose = require('mongoose');
const Mark = require('../models/marks');
const xlsx = require('xlsx');
const fs = require('fs');

async function handleUploadMarks(req, res) {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded." });

        const { subjectId, academicYear } = req.body;
        if (!subjectId) return res.status(400).json({ error: "subjectId is required to name the collection." });

        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        const mainHeaders = rawData[0];
        const coHeaders = rawData[1];
        const dataRows = rawData.slice(2);

        let currentExam = "";

        const finalData = dataRows.map(row => {
            let studentPerformance = {};
            let regNo = "";
            let examTotals = {};

            row.forEach((cell, i) => {
                if (mainHeaders[i]) {
                    currentExam = mainHeaders[i].toString().trim().replace(/\s+/g, '_');
                }
                const coLabel = coHeaders[i] ? coHeaders[i].toString().trim() : "";

                // Detection for Reg No
                if (coLabel.toLowerCase().includes('reg') || (mainHeaders[i] && mainHeaders[i].toLowerCase().includes('reg')) || i === 0) {
                    if (!regNo) regNo = cell;
                } else if (coLabel) {
                    const value = (cell === 'AB' || !cell) ? 0 : Number(cell);
                    const dynamicKey = `${currentExam}_${coLabel}`;
                    studentPerformance[dynamicKey] = cell === 'AB' ? 'AB' : value;

                    if (coLabel.toLowerCase().startsWith('co')) {
                        examTotals[currentExam] = (examTotals[currentExam] || 0) + value;
                    }
                }
            });

            Object.keys(examTotals).forEach(exam => {
                studentPerformance[`${exam}_Total`] = examTotals[exam];
            });

            return {
                regNo: regNo ? String(regNo).trim() : null,
                academicYear: academicYear,
                data: studentPerformance,
                uploadedAt: new Date()
            };
        });

        const validEntries = finalData.filter(d => d.regNo);

        if (validEntries.length > 0) {
            // --- THE DYNAMIC PART ---
            // Instead of Mark.insertMany, we target the collection by the subjectId variable
            const dynamicCollection = mongoose.connection.db.collection(subjectId);
            await dynamicCollection.insertMany(validEntries);
            console.log(`Saved to collection: ${subjectId}`);
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: `Data stored successfully in collection: ${subjectId}`,
            count: validEntries.length
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
};


module.exports = { handleUploadMarks };