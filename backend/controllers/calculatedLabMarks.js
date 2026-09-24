const xlsx = require('xlsx');
const CalculatedLabMark = require('../models/calculatedLabMarks');
const { getActiveRubric } = require('../utils/rubricHelper');

// async function uploadAndCalculateLabMarks(req, res) {
//     try {
//         const { subjectId, academicYear, course } = req.body;

//         const cleanSubjectId = subjectId?.trim().toUpperCase();
//         const cleanCourse = course?.trim().toUpperCase();
//         const cleanAcademicYear = academicYear?.trim();

//         if (!req.file) {
//             return res.status(400).json({ success: false, message: "Please upload an Excel file." });
//         }

//         // 1. Read the Excel File
//         const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0]; 
//         const sheet = workbook.Sheets[sheetName];
        
//         const rawExcelData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

//         if (rawExcelData.length < 3) {
//             return res.status(400).json({ success: false, message: "Excel file does not contain enough data rows." });
//         }

//         // 2. Parse the Multi-Level Headers (Keeping COs AND Total)
//         const row0 = rawExcelData[0];
//         const row1 = rawExcelData[1];
        
//         const keys = []; 
//         const validColumnIndices = []; 
//         let currentLab = "";

//         const maxCols = Math.max(row0.length, row1.length);

//         for (let i = 0; i < maxCols; i++) {
//             if (i === 0) {
//                 keys.push("RegNo");
//                 validColumnIndices.push(i);
//                 continue;
//             }
            
//             if (row0[i]) {
//                 currentLab = row0[i].toString().trim().replace(/\s+/g, '_'); 
//             }
            
//             const subHeader = row1[i]?.toString().trim().replace(/\s+/g, '_'); 
            
//             if (currentLab && subHeader) {
//                 keys.push(`${currentLab}_${subHeader}`); 
//                 validColumnIndices.push(i);
//             }
//         }

//         // 3. Extract Max Marks and Actual Student Marks
//         let maxMarks = {};
//         let actualMarks = [];

//         for (let r = 2; r < rawExcelData.length; r++) {
//             const row = rawExcelData[r];
//             if (!row || row.length === 0) continue;

//             const firstCell = String(row[0] || '').trim();
//             if (!firstCell) continue; 

//             if (firstCell.toLowerCase() === 'max marks') {
//                 for (let k = 1; k < keys.length; k++) {
//                     const colIndex = validColumnIndices[k];
//                     maxMarks[keys[k]] = Number(row[colIndex]) || 0;
//                 }
//             } else if (
//                 firstCell.toLowerCase().includes('target') || 
//                 firstCell.toLowerCase().includes('students') || 
//                 firstCell.toLowerCase().includes('attainment')
//             ) {
//                 continue; 
//             } else {
//                 let studentMarks = {};
//                 for (let k = 1; k < keys.length; k++) {
//                     const colIndex = validColumnIndices[k];
//                     studentMarks[keys[k]] = Number(row[colIndex]) || 0;
//                 }
//                 actualMarks.push({ regNo: firstCell, marks: studentMarks });
//             }
//         }

//         const totalStudents = actualMarks.length;

//         // 4. Fetch the Dynamic Rubric Thresholds
//         const { rubric: activeRubric, formattedYear, semesterType } = await getActiveRubric(
//             cleanSubjectId, 
//             cleanAcademicYear
//         );

//         if (!activeRubric?.thresholds?.length) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: `Calculation Logic: No rubric found for Exam Year ${formattedYear} in ${semesterType} Semester.` 
//             });
//         }

//         // 5. Perform the Attainment Math 
//         const attainmentReport = {};
//         const sortedThresholds = [...activeRubric.thresholds].sort((a, b) => b.minPercent - a.minPercent);

//         for (const [key, max] of Object.entries(maxMarks)) {
//             if (!max || max <= 0) continue; 

//             const target = max * 0.60; 
//             let countAbove = 0;
            
//             for (let i = 0; i < totalStudents; i++) {
//                 const score = actualMarks[i].marks[key] || 0;
//                 if (score >= target) {
//                     countAbove++;
//                 }
//             }

//             const percent = totalStudents > 0 ? parseFloat(((countAbove / totalStudents) * 100).toFixed(2)) : 0;

//             let level = 0; 
//             for (const threshold of sortedThresholds) {
//                 if (percent >= threshold.minPercent) {
//                     level = threshold.level;
//                     break; 
//                 }
//             }

//             attainmentReport[key] = {
//                 maxMarks: max, 
//                 targetMarks: parseFloat(target.toFixed(2)),
//                 studentsAboveTarget: countAbove,
//                 attainmentPercent: percent,
//                 attainmentLevel: level
//             };
//         }

//         // 6. Save the Fully Calculated Report to Database
//         let calculatedData = await CalculatedLabMark.findOneAndUpdate(
//             { subjectId: cleanSubjectId, academicYear: cleanAcademicYear, course: cleanCourse },
//             { 
//                 $set: { 
//                     maxMarks: maxMarks,       
//                     actualMarks: actualMarks, 
//                     reportData: attainmentReport,     
//                     totalStudents: totalStudents,
//                     calculatedAt: new Date() 
//                 } 
//             },
//             { upsert: true, new: true, strict: false, lean: true } 
//         );

//         // 🛡️ 7. STRIP THE _id FROM THE REGISTRATION ARRAY BEFORE SENDING RESPONSE
//         if (calculatedData && calculatedData.actualMarks) {
//             calculatedData.actualMarks = calculatedData.actualMarks.map(student => {
//                 const { _id, ...rest } = student; // Destructure to isolate and remove _id
//                 return rest;
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: `Excel uploaded and lab attainment calculated successfully for ${formattedYear}!`,
//             data: calculatedData
//         });

//     } catch (error) {
//         console.error("Excel Upload & Calc Error:", error.message);
        
//         if (error.message.includes("Could not determine the semester")) {
//             return res.status(404).json({ success: false, message: error.message });
//         }

//         return res.status(500).json({ success: false, message: "Error processing Excel file.", error: error.message });
//     }
// }






async function uploadAndCalculateLabMarks(req, res) {
    try {
        const { subjectId, academicYear, course } = req.body;

        const cleanSubjectId = subjectId?.trim().toUpperCase();
        const cleanCourse = course?.trim().toUpperCase();
        const cleanAcademicYear = academicYear?.trim();

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload an Excel file." });
        }

        // 1. Read the Excel File
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; 
        const sheet = workbook.Sheets[sheetName];
        
        const rawExcelData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (rawExcelData.length < 3) {
            return res.status(400).json({ success: false, message: "Excel file does not contain enough data rows." });
        }

        // 2. Parse the Multi-Level Headers (With Duplicate Protection)
        const row0 = rawExcelData[0];
        const row1 = rawExcelData[1];
        
        const keys = []; 
        const validColumnIndices = []; 
        let currentLab = "";
        
        // 🌟 FIX 1: Prevent duplicate column headers from overwriting each other
        const keyCounts = {}; 

        const maxCols = Math.max(row0.length, row1.length);

        for (let i = 0; i < maxCols; i++) {
            if (i === 0) {
                keys.push("RegNo");
                validColumnIndices.push(i);
                continue;
            }
            
            if (row0[i]) {
                currentLab = row0[i].toString().trim().replace(/\s+/g, '_'); 
            }
            
            const subHeader = row1[i]?.toString().trim().replace(/\s+/g, '_'); 
            
            if (currentLab && subHeader) {
                let baseKey = `${currentLab}_${subHeader}`;
                
                // If the key already exists (e.g., the second 'Lab 11' at the end of the sheet), append a number
                if (keyCounts[baseKey]) {
                    keyCounts[baseKey]++;
                    baseKey = `${baseKey}_${keyCounts[baseKey]}`; // Becomes Lab_11_CO1_2
                } else {
                    keyCounts[baseKey] = 1;
                }

                keys.push(baseKey); 
                validColumnIndices.push(i);
            }
        }

        // 3. Extract Max Marks and Actual Student Marks
        let maxMarks = {};
        let actualMarks = [];

        for (let r = 2; r < rawExcelData.length; r++) {
            const row = rawExcelData[r];
            if (!row || row.length === 0) continue;

            const firstCell = String(row[0] || '').trim();
            if (!firstCell) continue; 

            // 🌟 FIX 2: Uses .includes() to catch "Max Marks/CO" perfectly at the bottom of the sheet
            if (firstCell.toLowerCase().includes('max marks')) {
                for (let k = 1; k < keys.length; k++) {
                    const colIndex = validColumnIndices[k];
                    maxMarks[keys[k]] = Number(row[colIndex]) || 0;
                }
            } else if (
                firstCell.toLowerCase().includes('target') || 
                firstCell.toLowerCase().includes('students') || 
                firstCell.toLowerCase().includes('attainment')
            ) {
                continue; 
            } else {
                let studentMarks = {};
                for (let k = 1; k < keys.length; k++) {
                    const colIndex = validColumnIndices[k];
                    studentMarks[keys[k]] = Number(row[colIndex]) || 0;
                }
                actualMarks.push({ regNo: firstCell, marks: studentMarks });
            }
        }

        const totalStudents = actualMarks.length;

        // 4. Fetch the Dynamic Rubric Thresholds
        const { rubric: activeRubric, formattedYear, semesterType } = await getActiveRubric(
            cleanSubjectId, 
            cleanAcademicYear
        );

        if (!activeRubric?.thresholds?.length) {
            return res.status(404).json({ 
                success: false, 
                message: `Calculation Logic: No rubric found for Exam Year ${formattedYear} in ${semesterType} Semester.` 
            });
        }

        // 5. Perform the Attainment Math 
        const attainmentReport = {};
        const sortedThresholds = [...activeRubric.thresholds].sort((a, b) => b.minPercent - a.minPercent);

        for (const [key, max] of Object.entries(maxMarks)) {
            if (!max || max <= 0) continue; 

            const target = max * 0.60; 
            let countAbove = 0;
            
            for (let i = 0; i < totalStudents; i++) {
                const score = actualMarks[i].marks[key] || 0;
                if (score >= target) {
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

            attainmentReport[key] = {
                maxMarks: max, 
                targetMarks: parseFloat(target.toFixed(2)),
                studentsAboveTarget: countAbove,
                attainmentPercent: percent,
                attainmentLevel: level
            };
        }

        // 6. Save the Fully Calculated Report to Database
        let calculatedData = await CalculatedLabMark.findOneAndUpdate(
            { subjectId: cleanSubjectId, academicYear: cleanAcademicYear, course: cleanCourse },
            { 
                $set: { 
                    maxMarks: maxMarks,       
                    actualMarks: actualMarks, 
                    reportData: attainmentReport,     
                    totalStudents: totalStudents,
                    calculatedAt: new Date() 
                } 
            },
            { upsert: true, new: true, strict: false, lean: true } 
        );

        // 🛡️ 7. STRIP THE _id FROM THE REGISTRATION ARRAY BEFORE SENDING RESPONSE
        if (calculatedData && calculatedData.actualMarks) {
            calculatedData.actualMarks = calculatedData.actualMarks.map(student => {
                const { _id, ...rest } = student; 
                return rest;
            });
        }

        return res.status(200).json({
            success: true,
            message: `Excel uploaded and lab attainment calculated successfully for ${formattedYear}!`,
            data: calculatedData
        });

    } catch (error) {
        console.error("Excel Upload & Calc Error:", error.message);
        
        if (error.message.includes("Could not determine the semester")) {
            return res.status(404).json({ success: false, message: error.message });
        }

        return res.status(500).json({ success: false, message: "Error processing Excel file.", error: error.message });
    }
}























async function handleGetFetchCalculatedLabMarks(req, res) {
    try {
        // 1. Extract parameters from the query string
        const { subjectId, academicYear, course } = req.query;

        // 2. Validate that all parameters were provided
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required query parameters: subjectId, academicYear, and course are required." 
            });
        }

        // 3. Clean and format the inputs to match database conventions
        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        const cleanAcademicYear = academicYear.trim();

        // 4. Query the database
        // Using .lean() makes the query faster and returns a plain JavaScript object
        let attainmentData = await CalculatedLabMark.findOne({
            subjectId: cleanSubjectId,
            academicYear: cleanAcademicYear,
            course: cleanCourse
        }).lean();

        // 5. Handle the case where no data exists
        if (!attainmentData) {
            return res.status(404).json({ 
                success: false, 
                message: `No lab attainment record found for ${cleanCourse} ${cleanSubjectId} (Batch: ${cleanAcademicYear}).` 
            });
        }

        // 6. Strip the Mongoose _id from the actualMarks array before sending
        if (attainmentData.actualMarks && Array.isArray(attainmentData.actualMarks)) {
            attainmentData.actualMarks = attainmentData.actualMarks.map(student => {
                const { _id, ...rest } = student;
                return rest;
            });
        }

        // 7. Send the successful response
        return res.status(200).json({
            success: true,
            message: "Lab attainment data fetched successfully.",
            data: attainmentData
        });

    } catch (error) {
        console.error("Fetch Lab Attainment Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Server error while fetching lab attainment data.", 
            error: error.message 
        });
    }
}

module.exports = { 
    uploadAndCalculateLabMarks,
    handleGetFetchCalculatedLabMarks,
 };