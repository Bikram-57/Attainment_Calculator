const xlsx = require('xlsx');
const LabMark = require('../models/labMarks'); // Adjust the path as needed

// exports.uploadLabMarks = async (req, res) => {
async function handleRawMarksUpload(req, res, isPipelineArg = false) {

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an Excel file.' });
        }

        // Removed facultyId from extraction and validation
        const { subjectId, academicYear, course } = req.body;
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ error: 'Missing required metadata fields.' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        if (data.length < 4) {
            return res.status(400).json({ error: 'Invalid file format. Insufficient rows.' });
        }

        const colMap = {};
        let currentLab = "";

        const topHeader = data[0];
        const subHeader = data[1];

        for (let i = 1; i < Math.max(topHeader.length, subHeader.length); i++) {
            if (topHeader[i]) {
                currentLab = topHeader[i].toString().trim().replace(/\s+/g, '_');
            }
            const coName = subHeader[i];
            if (coName) {
                colMap[i] = `${currentLab}_${coName.toString().trim()}`;
            }
        }

        const maxMarks = {};
        const targetMarks = {};
        const actualMarks = [];

        for (let r = 2; r < data.length; r++) {
            const row = data[r];
            const rowLabel = row[0] ? row[0].toString().trim() : "";

            if (!rowLabel) continue;

            if (rowLabel.toLowerCase().includes('max marks')) {
                for (const colIndex in colMap) {
                    if (row[colIndex] !== undefined) {
                        maxMarks[colMap[colIndex]] = Number(row[colIndex]);
                    }
                }
                continue;
            }

            if (rowLabel.toLowerCase().includes('target marks')) {
                for (const colIndex in colMap) {
                    if (row[colIndex] !== undefined) {
                        targetMarks[colMap[colIndex]] = Number(row[colIndex]);
                    }
                }
                continue;
            }

            if (rowLabel.toLowerCase().includes('students') || rowLabel.toLowerCase().includes('attainment')) {
                continue;
            }

            const studentMarks = {};
            for (const colIndex in colMap) {
                if (row[colIndex] !== undefined) {
                    studentMarks[colMap[colIndex]] = Number(row[colIndex]);
                }
            }

            if (Object.keys(studentMarks).length > 0) {
                actualMarks.push({
                    regNo: rowLabel,
                    marks: studentMarks
                });
            }
        }

        // Removed facultyId from the update payload
        const updateData = {
            maxMarks,
            targetMarks,
            actualMarks,
            uploadedAt: Date.now()
        };

        const result = await LabMark.findOneAndUpdate(
            { subjectId, academicYear, course },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'Lab marks successfully uploaded and saved.',
            documentId: result._id,
            totalStudents: actualMarks.length
        });

    } catch (error) {
        console.error('Error parsing lab marks:', error);
        res.status(500).json({
            error: 'Failed to process lab marks file',
            details: error.message
        });
    }
};



// Ensure you have imported your models and rubric helper at the top of your file
// const LabMark = require('../models/LabMark');
// const CalculatedLabMark = require('../models/CalculatedLabMark'); // Assuming you have a model for this
// const { getActiveRubric } = require('../helpers/rubricHelper'); // Your existing rubric helper
// const xlsx = require('xlsx');

async function calculateLabAttainment(req, res, isPipelineArg = false) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an Excel file.' });
        }

        const { subjectId, academicYear, course } = req.body;
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ error: 'Missing required metadata fields.' });
        }

        // Clean inputs for consistent DB querying
        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        const cleanAcademicYear = academicYear.trim();

        // ==========================================
        // 1. PARSE EXCEL FILE
        // ==========================================
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        if (data.length < 4) {
            return res.status(400).json({ error: 'Invalid file format. Insufficient rows.' });
        }

        const colMap = {};
        let currentLab = "";

        const topHeader = data[0];
        const subHeader = data[1];

        for (let i = 1; i < Math.max(topHeader.length, subHeader.length); i++) {
            if (topHeader[i]) {
                currentLab = topHeader[i].toString().trim().replace(/\s+/g, '_');
            }
            const coName = subHeader[i];
            if (coName) {
                colMap[i] = `${currentLab}_${coName.toString().trim()}`;
            }
        }

        const maxMarks = {};
        const targetMarks = {};
        const actualMarks = [];

        for (let r = 2; r < data.length; r++) {
            const row = data[r];
            const rowLabel = row[0] ? row[0].toString().trim() : "";

            if (!rowLabel) continue;

            if (rowLabel.toLowerCase().includes('max marks')) {
                for (const colIndex in colMap) {
                    if (row[colIndex] !== undefined) maxMarks[colMap[colIndex]] = Number(row[colIndex]);
                }
                continue;
            }

            if (rowLabel.toLowerCase().includes('target marks')) {
                for (const colIndex in colMap) {
                    if (row[colIndex] !== undefined) targetMarks[colMap[colIndex]] = Number(row[colIndex]);
                }
                continue;
            }

            if (rowLabel.toLowerCase().includes('students') || rowLabel.toLowerCase().includes('attainment')) {
                continue;
            }

            const studentMarks = {};
            for (const colIndex in colMap) {
                if (row[colIndex] !== undefined) studentMarks[colMap[colIndex]] = Number(row[colIndex]);
            }

            if (Object.keys(studentMarks).length > 0) {
                actualMarks.push({
                    regNo: rowLabel,
                    marks: studentMarks
                });
            }
        }

        // Save Raw Marks to DB
        const rawUpdateData = { maxMarks, targetMarks, actualMarks, uploadedAt: Date.now() };
        const rawResult = await LabMark.findOneAndUpdate(
            { subjectId: cleanSubjectId, academicYear: cleanAcademicYear, course: cleanCourse },
            { $set: rawUpdateData },
            { new: true, upsert: true }
        );

        // ==========================================
        // 2. ATTAINMENT CALCULATION LOGIC
        // ==========================================
        
        // Fetch the Dynamic Rubric
        const { rubric: activeRubric, formattedYear, semesterType } = await getActiveRubric(cleanSubjectId, cleanAcademicYear);

        if (!activeRubric?.thresholds?.length) {
            const errMsg = `Raw marks saved, but calculation failed: No rubric found for Exam Year ${formattedYear} in ${semesterType} Semester.`;
            if (isPipelineArg) throw new Error(errMsg);
            return res.status(404).json({ success: false, message: errMsg });
        }

        const totalStudents = actualMarks.length;
        const attainmentReport = {};
        const coLevelSums = {};
        const coCounts = {};
        const finalCOAttainment = {};
        
        const sortedThresholds = [...activeRubric.thresholds].sort((a, b) => b.minPercent - a.minPercent);

        // Process Math using the parsed maps
        for (const [coKey, max] of Object.entries(maxMarks)) {
            if (!max || max <= 0) continue; 
            
            // Skip "Total" columns since we only calculate levels for COs
            if (coKey.toLowerCase().includes('total')) continue;

            const target = targetMarks[coKey];
            if (target === undefined) continue; 

            let countAbove = 0;
            
            for (let i = 0; i < totalStudents; i++) {
                if ((actualMarks[i].marks[coKey] || 0) >= target) {
                    countAbove++;
                }
            }

            const percent = totalStudents > 0 ? parseFloat(((countAbove / totalStudents) * 100).toFixed(2)) : 0;

            let level = 0; 
            for (const threshold of sortedThresholds) {
                if (percent >= threshold.minPercent) {
                    level = threshold.level;
                    break; 
                }
            }

            attainmentReport[coKey] = {
                maxMarks: max, 
                targetMarks: target,
                studentsAboveTarget: countAbove,
                attainmentPercent: percent,
                attainmentLevel: level
            };

            // Group by Base CO for Final Attainment (extracts "CO1" from "Lab_1_CO1")
            const coMatch = coKey.match(/(CO\d+)$/i);
            if (coMatch) {
                const baseCO = coMatch[1].toUpperCase();
                if (!coLevelSums[baseCO]) {
                    coLevelSums[baseCO] = 0;
                    coCounts[baseCO] = 0;
                }
                coLevelSums[baseCO] += level;
                coCounts[baseCO] += 1;
            }
        }

        // Calculate Final Averaged CO Attainments
        for (const [baseCO, sumLevel] of Object.entries(coLevelSums)) {
            finalCOAttainment[baseCO] = parseFloat((sumLevel / coCounts[baseCO]).toFixed(2));
        }

        // ==========================================
        // 3. SAVE CALCULATED REPORT
        // ==========================================
        const calculatedData = await CalculatedLabMark.findOneAndUpdate(
            { subjectId: cleanSubjectId, academicYear: cleanAcademicYear, course: cleanCourse },
            { 
                $set: { 
                    maxMarks,      
                    targetMarks, 
                    actualMarks, 
                    reportData: attainmentReport,     
                    finalCOAttainment, // Stores the averaged COs e.g., { "CO1": 2.5, "CO2": 1.8 }
                    totalStudents,
                    calculatedAt: new Date() 
                } 
            },
            { upsert: true, new: true, strict: false, lean: true } 
        );

        // --- PIPELINE EXIT ---
        if (isPipelineArg) return true; 

        return res.status(200).json({
            success: true,
            message: `Lab marks uploaded and attainment calculated successfully for ${formattedYear}.`,
            documentId: rawResult._id,
            totalStudents,
            calculatedData
        });

    } catch (error) {
        console.error('Error processing lab marks:', error);
        
        if (isPipelineArg) throw error;
        
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                error: 'Failed to process and calculate lab marks',
                details: error.message
            });
        }
    }
};



module.exports = {
    handleRawMarksUpload,
    calculateLabAttainment,
}