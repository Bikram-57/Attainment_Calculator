const Mark = require('../models/marks');
const Subject = require('../models/subject');
const xlsx = require('xlsx');

// ============================================================================
// 1. Upload & Process Marks from Excel
// ============================================================================
async function handleUploadMarks(req, res, isPipelineArg = false) {
    // 🛡️ THE PIPELINE SHIELD: Prevents Express from accidentally injecting the 'next' function
    const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

    try {
        if (!req.file || !req.file.buffer) {
            throw new Error("No file uploaded or file buffer missing.");
        }

        const { subjectId, academicYear, course, facultyId } = req.body;

        // SANITIZATION: Prevents accidental mismatches due to spaces or casing
        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        const cleanYear = academicYear.trim();

        // 1. Read Excel from Buffer (Memory Storage - No disk write overhead)
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: 0 });

        // 2. Fail-Fast: Find Footer (Max Marks) first to ensure format is valid
        const maxMarksIndex = rawData.findIndex(row => 
            row?.[0] && String(row[0]).trim().toLowerCase().includes("max marks")
        );
        
        if (maxMarksIndex === -1) {
            throw new Error("Format Error: 'Max Marks/CO' row not found at the bottom of the sheet.");
        }

        // 3. Identify Headers (Row 0: Exams, Row 1: COs and Totals)
        const row0 = rawData[0]; 
        const row1 = rawData[1]; 
        let currentExam = "";
        const dynamicMapping = [];

        // Scan for COs AND the Total columns dynamically
        row1.forEach((cell, index) => {
            const topHeader = String(row0[index]).trim();
            if (row0[index] && topHeader !== "0" && topHeader !== "") {
                currentExam = topHeader.replace(/\s+/g, '_');
            }
            
            const label = String(cell).trim().toUpperCase();
            
            // Capture both individual COs and TOTAL columns
            if (label.startsWith("CO") || label === "TOTAL") {
                dynamicMapping.push({ index, key: `${currentExam}_${label}` });
            }
        });

        // 4. Map Max Marks
        const maxMarksRow = rawData[maxMarksIndex];
        const maxMarksMap = {};
        
        dynamicMapping.forEach(col => { 
            maxMarksMap[col.key] = Number(maxMarksRow[col.index]) || 0; 
        });

        // 5. Map Student Data (Efficient single-pass iteration)
        const uniqueStudents = {};
        
        // Loop only through the rows containing actual student grades
        for (let i = 2; i < maxMarksIndex; i++) {
            const row = rawData[i];
            const regNo = String(row[0]).trim();
            
            if (regNo && regNo !== "0") {
                const marksMap = {};
                dynamicMapping.forEach(col => {
                    marksMap[col.key] = Number(row[col.index]) || 0;
                });
                
                // Using an object key automatically deduplicates if a student is listed twice
                uniqueStudents[regNo] = { regNo, marks: marksMap };
            }
        }
        
        const studentsBatch = Object.values(uniqueStudents);

        // 6. PARALLEL DATABASE EXECUTION (Speed Optimization)
        // Run the Marks upsert and Subject status update simultaneously
        const marksQuery = { subjectId: cleanSubjectId, academicYear: cleanYear, course: cleanCourse };
        
        const marksUpdatePromise = Mark.findOneAndUpdate(
            marksQuery, 
            { 
                $set: { 
                    facultyId, 
                    maxMarks: maxMarksMap, 
                    actualMarks: studentsBatch,
                    uploadedAt: new Date() 
                } 
            }, 
            { upsert: true, new: true, includeResultMetadata: true } 
        );

        const subjectUpdatePromise = Subject.findOneAndUpdate(
            { subjectId: cleanSubjectId, academicYear: cleanYear },
            { $set: { status: 'Uploaded' } },
            { new: true, lean: true } // .lean() makes the operation faster since we don't need the returned document
        );

        // Await both operations at the same time
        const [result] = await Promise.all([marksUpdatePromise, subjectUpdatePromise]);
        
        const isUpdate = result.lastErrorObject?.updatedExisting || false;

        // --- PIPELINE EXIT ---
        if (isPipeline) {
            return isUpdate; 
        }

        // 🛡️ THE HEADER SHIELD: Safe single response for direct API calls
        if (!res.headersSent) {
            return res.status(200).json({ 
                success: true, 
                message: isUpdate 
                    ? `Marks for ${cleanSubjectId} updated successfully.` 
                    : `New marks for ${cleanSubjectId} uploaded successfully.`,
                count: studentsBatch.length
            });
        }

    } catch (error) {
        console.error("Marks Controller Error:", error.message);
        
        if (isPipeline) throw error; 
        
        if (!res.headersSent) {
            return res.status(400).json({ success: false, error: error.message });
        }
    }
}

// ============================================================================
// 2. Retrieve Raw Marks Data
// ============================================================================
async function getRawMarksData(req, res) {
    try {
        const { subjectId, academicYear, course } = req.query;

        // 1. Validation
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({
                success: false,
                message: "Query parameters 'subjectId', 'academicYear', and 'course' are required."
            });
        }

        // 2. Sanitization
        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        const cleanYear = academicYear.trim();

        // 3. Fetch Data (.lean() strips Mongoose overhead for fast JSON delivery)
        const result = await Mark.findOne({
            subjectId: cleanSubjectId,
            academicYear: cleanYear,
            course: cleanCourse
        })
        .select('actualMarks maxMarks facultyId uploadedAt')
        .lean();

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No raw marks found for the specified subject and year."
            });
        }

        // 4. Return formatted response
        return res.status(200).json({
            success: true,
            subject: cleanSubjectId,
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

module.exports = {
    handleUploadMarks,
    getRawMarksData
};


// const Mark = require('../models/marks');
// const Subject = require('../models/subject');
// const xlsx = require('xlsx');



// async function handleUploadMarks(req, res, isPipelineArg = false) {
//     // 🛡️ THE PIPELINE SHIELD (The "Ignore" Function)
//     // If Express accidentally passes 'next', this forces it to false. 
//     // If the router passes 'true', the controller knows to ignore the res object.
//     const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

//     try {
//         if (!req.file || !req.file.buffer) {
//             throw new Error("No file uploaded or file buffer missing.");
//         }

//         const { subjectId, academicYear, course, facultyId } = req.body;

//         // 1. Read Excel from Buffer (Memory Storage)
//         const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: 0 });

//         // 2. Identify Headers (Row 0: Exams, Row 1: COs and Totals)
//         const row0 = rawData[0]; 
//         const row1 = rawData[1]; 
//         let currentExam = "";
//         const dynamicMapping = [];

//         // Scan for COs AND the Total columns dynamically
//         row1.forEach((cell, index) => {
//             if (row0[index] && String(row0[index]).trim() !== "0" && String(row0[index]).trim() !== "") {
//                 currentExam = String(row0[index]).trim().replace(/\s+/g, '_');
//             }
//             const label = String(cell).trim().toUpperCase();
            
//             // GRABS BOTH COs AND THE TOTAL COLUMN FROM THE SHEET
//             if (label.startsWith("CO") || label === "TOTAL") {
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

//         // 4. Map Student Data
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

//         // 5. Database Upsert for Marks
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

//         // 6. Database Update for Subject Status
//         await Subject.findOneAndUpdate(
//             { 
//                 subjectId: subjectId.toUpperCase(), 
//                 academicYear: academicYear 
//             },
//             { $set: { status: 'Uploaded' } },
//             { new: true }
//         );

//         // --- PIPELINE EXIT ---
//         // If the router is running this, quietly return the data and stop here.
//         if (isPipeline) {
//             return isUpdate; 
//         }

//         // 🛡️ THE HEADER SHIELD: Safe single response for direct API calls
//         if (!res.headersSent) {
//             return res.status(200).json({ 
//                 success: true, 
//                 message: isUpdate 
//                     ? `Marks for ${subjectId} updated successfully.` 
//                     : `New marks for ${subjectId} uploaded successfully.`,
//                 count: studentsBatch.length
//             });
//         }

//     } catch (error) {
//         console.error("Marks Controller Error:", error.message);
        
//         // If the router is running this, throw the error back to the router
//         if (isPipeline) {
//             throw error; 
//         }
        
//         // 🛡️ THE HEADER SHIELD: Safe single error response
//         if (!res.headersSent) {
//             return res.status(400).json({ success: false, error: error.message });
//         }
//     }
// }




// /**
//  * getRawMarksData
//  * Retrieves the exact student scores and max marks
//  */
// async function getRawMarksData(req, res) {
//     try {
//         const { subjectId, academicYear, course } = req.query;

//         if (!subjectId || !academicYear || !course) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Query parameters 'subjectId', 'academicYear', and 'course' are required."
//             });
//         }

//         const result = await Mark.findOne({
//             subjectId: subjectId.toUpperCase(),
//             academicYear: academicYear,
//             course: course.toUpperCase()
//         }).select('actualMarks maxMarks facultyId uploadedAt').lean();

//         if (!result) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No raw marks found for the specified subject and year."
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             subject: subjectId.toUpperCase(),
//             maxMarks: result.maxMarks,
//             students: result.actualMarks,
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
// module.exports = {
//     handleUploadMarks,
//     getRawMarksData
// };