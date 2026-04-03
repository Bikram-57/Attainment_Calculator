const Mark = require('../models/marks');

const xlsx = require('xlsx');

/**
 * handleUploadMarks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Boolean} isPipeline - If true, returns data instead of sending a JSON response
 */


async function handleUploadMarks(req, res, isPipeline = false) {
    try {
        if (!req.file || !req.file.buffer) {
            throw new Error("No file uploaded or file buffer missing.");
        }

        const { subjectId, academicYear, course, facultyId } = req.body;

        // 1. Read Excel from Buffer (Memory Storage)
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: 0 });

        // 2. Identify Headers (Row 0: Exams, Row 1: COs and Totals)
        const row0 = rawData[0]; 
        const row1 = rawData[1]; 
        let currentExam = "";
        const dynamicMapping = [];

        // Scan for COs AND the Total columns dynamically
        row1.forEach((cell, index) => {
            if (row0[index] && String(row0[index]).trim() !== "0" && String(row0[index]).trim() !== "") {
                currentExam = String(row0[index]).trim().replace(/\s+/g, '_');
            }
            const label = String(cell).trim().toUpperCase();
            
            // GRABS BOTH COs AND THE TOTAL COLUMN FROM THE SHEET
            if (label.startsWith("CO") || label === "TOTAL") {
                dynamicMapping.push({ index, key: `${currentExam}_${label}` });
            }
        });

        // 3. Find Footer (Max Marks)
        const maxMarksIndex = rawData.findIndex(row => 
            row && row[0] && String(row[0]).trim().toLowerCase().includes("max marks")
        );
        if (maxMarksIndex === -1) throw new Error("Format Error: 'Max Marks/CO' row not found.");

        const maxMarksRow = rawData[maxMarksIndex];
        const maxMarksMap = {};
        
        dynamicMapping.forEach(col => { 
            maxMarksMap[col.key] = Number(maxMarksRow[col.index]) || 0; 
        });

        // 4. Map Student Data
        const dataRows = rawData.slice(2, maxMarksIndex);
        const uniqueStudents = {};
        
        dataRows.forEach(row => {
            const regNo = String(row[0]).trim();
            if (regNo && regNo !== "0") {
                const marksMap = {};
                
                dynamicMapping.forEach(col => {
                    marksMap[col.key] = Number(row[col.index]) || 0;
                });
                
                uniqueStudents[regNo] = { regNo, marks: marksMap };
            }
        });
        const studentsBatch = Object.values(uniqueStudents);

        // 5. Database Upsert
        const query = { 
            subjectId: subjectId.toUpperCase(), 
            academicYear, 
            course: course.toUpperCase() 
        };

        const updateData = { 
            $set: { 
                facultyId, 
                maxMarks: maxMarksMap, 
                actualMarks: studentsBatch,
                uploadedAt: new Date() 
            } 
        };

        const result = await Mark.findOneAndUpdate(query, updateData, { 
            upsert: true, 
            new: true, 
            includeResultMetadata: true 
        });

        const isUpdate = result.lastErrorObject.updatedExisting;

        // --- PIPELINE LOGIC ---
        if (isPipeline) {
            return isUpdate; 
        }

        return res.status(200).json({ 
            success: true, 
            message: isUpdate 
                ? `Marks for ${subjectId} updated successfully.` 
                : `New marks for ${subjectId} uploaded successfully.`,
            count: studentsBatch.length
        });

    } catch (error) {
        console.error("Marks Controller Error:", error.message);
        if (isPipeline) throw error; 
        return res.status(400).json({ success: false, error: error.message });
    }
}

/**
 * getRawMarksData
 * Retrieves the exact student scores and max marks
 */
async function getRawMarksData(req, res) {
    try {
        const { subjectId, academicYear, course } = req.query;
        
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ 
                success: false, 
                message: "Query parameters 'subjectId', 'academicYear', and 'course' are required." 
            });
        }

        const result = await Mark.findOne({
            subjectId: subjectId.toUpperCase(),
            academicYear: academicYear,
            course: course.toUpperCase()
        }).select('actualMarks maxMarks facultyId uploadedAt').lean();

        if (!result) {
            return res.status(404).json({ 
                success: false, 
                message: "No raw marks found for the specified subject and year." 
            });
        }

        return res.status(200).json({
            success: true,
            subject: subjectId.toUpperCase(),
            maxMarks: result.maxMarks,      
            students: result.actualMarks,    
            uploadedAt: result.uploadedAt
        });

    } catch (error) {
        console.error("API Error (getRawMarksData):", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "Internal Server Error while fetching raw data." 
        });
    }
}

// async function handleUploadMarks(req, res, isPipeline = false) {
//     try {
//         if (!req.file || !req.file.buffer) {
//             throw new Error("No file uploaded or file buffer missing.");
//         }

//         const { subjectId, academicYear, course, facultyId } = req.body;

//         // 1. Read Excel from Buffer (Memory Storage)
//         const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: 0 });

//         // 2. Identify Headers (Row 0: Exams, Row 1: COs)
//         const row0 = rawData[0]; 
//         const row1 = rawData[1]; 
//         let currentExam = "";
//         const dynamicMapping = [];

//         // Dynamic Scan for 1-5 COs per Exam
//         row1.forEach((cell, index) => {
//             if (row0[index] && String(row0[index]).trim() !== "0") {
//                 currentExam = String(row0[index]).trim().replace(/\s+/g, '_');
//             }
//             const label = String(cell).trim().toUpperCase();
//             if (label.startsWith("CO")) {
//                 dynamicMapping.push({ index, key: `${currentExam}_${label}` });
//             }
//         });

//         // 3. Find Footer (Max Marks)
//         const maxMarksIndex = rawData.findIndex(row => 
//             row && row[0] && String(row[0]).trim().toLowerCase().includes("max marks")
//         );
//         if (maxMarksIndex === -1) throw new Error("Format Error: 'Max Marks/CO' row not found.");

//         const maxMarksRow = rawData[maxMarksIndex];
//         const maxMarksMap = {};
//         dynamicMapping.forEach(col => { 
//             maxMarksMap[col.key] = Number(maxMarksRow[col.index]) || 0; 
//         });

//         // 4. Map Student Data (Handles duplicates within the file)
//         const dataRows = rawData.slice(2, maxMarksIndex);
//         const uniqueStudents = {};
        
//         dataRows.forEach(row => {
//             const regNo = String(row[0]).trim();
//             if (regNo && regNo !== "0") {
//                 const marksMap = {};
//                 dynamicMapping.forEach(col => {
//                     marksMap[col.key] = Number(row[col.index]) || 0;
//                 });
//                 uniqueStudents[regNo] = { regNo, marks: marksMap };
//             }
//         });
//         const studentsBatch = Object.values(uniqueStudents);

//         // 5. Database Upsert
//         const query = { 
//             subjectId: subjectId.toUpperCase(), 
//             academicYear, 
//             course: course.toUpperCase() 
//         };

//         const updateData = { 
//             $set: { 
//                 facultyId, 
//                 maxMarks: maxMarksMap, 
//                 actualMarks: studentsBatch,
//                 uploadedAt: new Date() 
//             } 
//         };

//         const result = await Mark.findOneAndUpdate(query, updateData, { 
//             upsert: true, 
//             new: true, 
//             includeResultMetadata: true 
//         });

//         const isUpdate = result.lastErrorObject.updatedExisting;

//         // --- PIPELINE LOGIC: PREVENT DOUBLE HEADERS ---
//         if (isPipeline) {
//             return isUpdate; // Return status to the router
//         }

//         // Only send response if called directly as a single route
//         return res.status(200).json({ 
//             success: true, 
//             message: isUpdate 
//                 ? `Marks for ${subjectId} updated successfully.` 
//                 : `New marks for ${subjectId} uploaded successfully.`,
//             count: studentsBatch.length
//         });

//     } catch (error) {
//         console.error("Marks Controller Error:", error.message);
        
//         // If in pipeline, let the router handle the error response
//         if (isPipeline) throw error; 
        
//         return res.status(400).json({ success: false, error: error.message });
//     }
// }



// /**
//  * getRawMarksData
//  * Retrieves the exact student scores and max marks as uploaded from Excel.
//  */
// async function getRawMarksData(req, res) {
//     try {
//         const { subjectId, academicYear, course } = req.query;
        
//         // 1. Validate Input
//         if (!subjectId || !academicYear || !course) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Query parameters 'subjectId', 'academicYear', and 'course' are required." 
//             });
//         }

//         // 2. Query the 'marks' collection
//         // .lean() makes the query faster by returning a plain JS object
//         const result = await Mark.findOne({
//             subjectId: subjectId.toUpperCase(),
//             academicYear: academicYear,
//             course: course.toUpperCase()
//         }).select('actualMarks maxMarks facultyId uploadedAt').lean();

//         // 3. Check if document exists
//         if (!result) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "No raw marks found for the specified subject and year." 
//             });
//         }

//         // 4. Send the raw data
//         return res.status(200).json({
//             success: true,
//             subject: subjectId.toUpperCase(),
//             maxMarks: result.maxMarks,       // Columns for your Table Header
//             students: result.actualMarks,    // Rows for your Table Body
//             uploadedAt: result.uploadedAt
//         });

//     } catch (error) {
//         console.error("API Error (getRawMarksData):", error.message);
//         return res.status(500).json({ 
//             success: false, 
//             error: "Internal Server Error while fetching raw data." 
//         });
//     }
// }

// module.exports = { getRawMarksData, ...others };

module.exports = { 
    handleUploadMarks,
    getRawMarksData
};