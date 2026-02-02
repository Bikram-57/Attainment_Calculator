// const Mark = require('../models/marks');
const CalculatedMark = require('../models/calculatedMarks');
const xlsx = require('xlsx');
const fs = require('fs');

// const processExcelUpload = async (req, res) => {
async function handleCalculatedMarks(req, res) {

const { subjectId, academicYear, course, facultyId } = req.body;
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });

    // --- PARSING RAW DATA ---
    const mainHeaders = rawData[0] || [];
    const coHeaders = rawData[1] || [];
    const maxMarksRow = rawData.find(row => row && row[0]?.toString().trim() === "Max Marks/CO");
    const maxMarksIndex = rawData.indexOf(maxMarksRow);
    const dataRows = rawData.slice(2, maxMarksIndex);

    let currentExam = "", headerMap = [], maxMarksMap = {}, regNoIndex = 0;

    for (let i = 0; i < coHeaders.length; i++) {
        if (mainHeaders[i]?.toString().trim()) currentExam = mainHeaders[i].toString().trim().replace(/\s+/g, '_');
        const coLabel = coHeaders[i]?.toString().trim() || "";
        if (coLabel.toLowerCase().includes('reg') || i === 0) regNoIndex = i;
        else if (currentExam && coLabel.toLowerCase().startsWith('co')) {
            const key = `${currentExam}_${coLabel}`;
            headerMap[i] = key;
            maxMarksMap[key] = Number(maxMarksRow[i]) || 0;
        }
    }

    const studentsBatch = dataRows.map((row) => {
        if (!row || !row[regNoIndex]) return null;
        let marks = {};
        headerMap.forEach((key, i) => {
            if (key) {
                const val = row[i];
                marks[key] = (val === 'AB' || val === null || val === "") ? 0 : Number(val);
            }
        });
        return { regNo: String(row[regNoIndex]).trim(), marks };
    }).filter(s => s !== null);

    // --- THE 4-STEP CALCULATION SEQUENCE ---
    let attainmentResults = {};
    let coGroups = {};
    const totalCount = studentsBatch.length;

    Object.keys(maxMarksMap).forEach((coKey) => {
        const maxVal = maxMarksMap[coKey];
        
        // 1. Target marks / Co (60% of Max)
        const targetMarks = Number((maxVal * 0.6).toFixed(2));

        // 2. Student >= 60% (Count of students hitting the target)
        const studentsAboveTarget = studentsBatch.filter(s => Number(s.marks[coKey]) >= targetMarks).length;

        // 3. Attainment Percent
        const attainmentPercent = Number(((studentsAboveTarget / totalCount) * 100).toFixed(2));

        // 4. Co Attainment Level
        let level = attainmentPercent >= 70 ? 3 : attainmentPercent >= 60 ? 2 : attainmentPercent >= 50 ? 1 : 0;

        // Store the sequence for this specific column
        attainmentResults[coKey] = {
            targetMarks,
            studentsAboveTarget,
            attainmentPercent,
            attainmentLevel: level
        };

        // Grouping for Final CO Average
        const coMatch = coKey.match(/CO\d+/i);
        if (coMatch) {
            const coName = coMatch[0].toUpperCase();
            if (!coGroups[coName]) coGroups[coName] = [];
            coGroups[coName].push(level);
        }
    });

    const finalAverages = {};
    Object.keys(coGroups).forEach(co => {
        const levels = coGroups[co];
        finalAverages[co] = Number((levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(2));
    });

    // --- SAVE TO DATABASE ---
    return await CalculatedMark.findOneAndUpdate(
        { subjectId, academicYear, course },
        { 
            $set: { 
                facultyId, 
                maxMarks: maxMarksMap, 
                actualMarks: studentsBatch, 
                attainmentResults, 
                finalCOAverages: finalAverages, 
                uploadedAt: new Date() 
            } 
        },
        { upsert: true, new: true }
    );
};
module.exports = { handleCalculatedMarks };