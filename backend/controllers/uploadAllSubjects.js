const xlsx = require('xlsx');
const fs = require('fs');
const Subject = require('../models/subject');
const User = require('../models/user'); 
const logActivity = require('../utils/activityLogger');

// ============================================================================
// HELPER: Normalize Messy Excel Rows
// ============================================================================
const normalizeExcelRow = (row) => {
    const cleanRow = {};
    for (const key in row) {
        // Strip all spaces and normalize to lowercase for consistent property mapping
        const cleanKey = key.replace(/\s+/g, '').toLowerCase();
        cleanRow[cleanKey] = row[key];
    }

    return {
        subjectId: String(cleanRow.subjectid || cleanRow.subjectcode || '').toUpperCase().trim(), 
        subjectName: String(cleanRow.subjectname || cleanRow.name || '').trim(),
        course: String(cleanRow.course || cleanRow.program || '').toUpperCase().trim(),
        academicYear: String(cleanRow.academicyear || cleanRow.year || '').trim(),
        // Fallback checks handle both valid inputs and known Excel typos (e.g., 'Semesteer')
        semester: Number(cleanRow.semester || cleanRow.semesteer)
    };
};

// ============================================================================
// CONTROLLER: Batch Upload Subjects
// ============================================================================
async function handleUploadAllSubject(req, res) {
    try {
        // 1. File Validation
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No Excel file provided." });
        }

        // 2. Read Excel File (Prioritize fast memory buffer, fallback to disk)
        let workbook;
        if (req.file.buffer) {
            workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        } else {
            workbook = xlsx.readFile(req.file.path);
        }
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // 3. Prepare tracking mechanisms
        const uploadResults = {
            totalProcessed: jsonData.length,
            successful: [],
            failed: []
        };

        const processedIds = new Set();
        const validSubjectsToInsert = [];

        // 4. Data Extraction & Sanitization (Local Memory Loop)
        for (const rawRow of jsonData) {
            const { subjectId, subjectName, course, academicYear, semester } = normalizeExcelRow(rawRow);

            // A. Mandatory Fields Validation
            if (!subjectId || !subjectName || !course || !academicYear || !semester || isNaN(semester)) {
                uploadResults.failed.push({
                    subjectId: subjectId || 'Unknown',
                    reason: "Validation Failed: Missing or invalid mandatory fields."
                });
                continue; 
            }

            // B. Intra-File Duplicate Check (Prevents uploading identical rows from the same Excel sheet)
            if (processedIds.has(subjectId)) {
                uploadResults.failed.push({
                    subjectId: subjectId,
                    reason: "Validation Failed: Duplicate Subject ID found within the uploaded Excel file."
                });
                continue; 
            }

            processedIds.add(subjectId);
            validSubjectsToInsert.push({ subjectId, subjectName, course, academicYear, semester });
        }

        // 5. BULK DATABASE OPERATION (Massive Performance Optimization)
        // Instead of waiting for 500 individual DB calls, we send them all at once.
        if (validSubjectsToInsert.length > 0) {
            const bulkOps = validSubjectsToInsert.map(subject => ({
                insertOne: { document: subject }
            }));

            try {
                // ordered: false allows valid rows to insert even if some fail due to unique constraints
                await Subject.bulkWrite(bulkOps, { ordered: false });
                
                // If the bulkWrite fully succeeds, all valid subjects were successfully inserted
                uploadResults.successful = validSubjectsToInsert.map(s => s.subjectId);

            } catch (error) {
                // Handle mixed results (some passed, some triggered duplicate key errors)
                if (error.insertedDocs) {
                    error.insertedDocs.forEach(doc => uploadResults.successful.push(doc.subjectId));
                }
                
                if (error.writeErrors) {
                    error.writeErrors.forEach(err => {
                        uploadResults.failed.push({
                            subjectId: err.err.op.subjectId,
                            reason: err.code === 11000 
                                ? "Database Error: Subject ID already exists in the system for this term." 
                                : `Database Error: ${err.errmsg}`
                        });
                    });
                }
            }
        }

        // 6. Clean up the temporary file (if disk storage was used)
        if (req.file.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) { console.warn("File cleanup failed", e.message); }
        }

        // 7. BACKGROUND ACTIVITY LOGGER
        // Placed outside of 'await' so the response isn't delayed while the logger runs
        if (uploadResults.successful.length > 0) {
            const userId = req.user?._id || req.user?.id || req.user;
            
            User.findById(userId).select('name').lean()
                .then(currentUser => {
                    const actorName = currentUser?.name || "a Faculty Member";
                    return logActivity(
                        userId,
                        'BATCH_UPLOADED_SUBJECTS', 
                        `Batch uploaded ${uploadResults.successful.length} new subjects via Excel by ${actorName} (${uploadResults.failed.length} failed/skipped)`, 
                        []
                    );
                })
                .catch(logError => console.error("⚠️ Activity Logger Failed:", logError.message));
        }

        // 8. Return the detailed report
        return res.status(200).json({
            success: true,
            message: "Excel batch processing complete.",
            data: uploadResults
        });

    } catch (error) {
        // Failsafe disk cleanup if the process completely crashes
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }

        console.error("Upload All Subjects Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error during Excel processing",
            error: error.message
        });
    }
}

module.exports = {
    handleUploadAllSubject
};



// const xlsx = require('xlsx');
// const fs = require('fs');
// const Subject = require('../models/subject');
// const User = require('../models/user'); 
// const logActivity = require('../utils/activityLogger');

// // Helper function to handle messy Excel column headers
// const normalizeExcelRow = (row) => {
//     const cleanRow = {};
//     for (const key in row) {
//         // Strips all spaces and makes lowercase
//         const cleanKey = key.replace(/\s+/g, '').toLowerCase();
//         cleanRow[cleanKey] = row[key];
//     }

//     return {
//         subjectId: cleanRow.subjectid || cleanRow.subjectcode, 
//         subjectName: cleanRow.subjectname || cleanRow.name,
//         course: cleanRow.course || cleanRow.program,
//         academicYear: cleanRow.academicyear || cleanRow.year, // Updated to handle 'academic year' or 'year'
//         semester: cleanRow.semester || cleanRow.semesteer     // NEW: Handles the 'Semesteer' typo from your file
//     };
// };










// async function handleUploadAllSubject(req, res) {
//     try {
//         // 1. Ensure file exists
//         if (!req.file) {
//             return res.status(400).json({ success: false, message: "No Excel file provided." });
//         }

//         const filePath = req.file.path;

//         // 2. Parse the Excel file
//         const workbook = xlsx.readFile(filePath);
//         const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//         const jsonData = xlsx.utils.sheet_to_json(worksheet);

//         // 3. Prepare tracking arrays for the response
//         const uploadResults = {
//             totalProcessed: jsonData.length,
//             successful: [],
//             failed: []
//         };

//         // NEW: Track IDs within the current upload to prevent duplicates IN the Excel file itself
//         const processedIds = new Set();

//         // 4. Loop through the data one by one
//         for (const rawRow of jsonData) {
            
//             // UPDATED: Added semester to the destructured variables
//             const { subjectId, subjectName, course, academicYear, semester } = normalizeExcelRow(rawRow);

//             // UPDATED: Added semester to the mandatory fields validation
//             if (!subjectId || !subjectName || !course || !academicYear || !semester) {
//                 uploadResults.failed.push({
//                     subjectId: subjectId || 'Unknown',
//                     reason: "Validation Failed: Missing mandatory fields."
//                 });
//                 continue; 
//             }

//             // NEW: Normalize the Subject ID here so it is consistent across checks and the DB
//             const cleanSubjectId = String(subjectId).toUpperCase().trim();

//             // NEW: Check for duplicates WITHIN the uploaded Excel file
//             if (processedIds.has(cleanSubjectId)) {
//                 uploadResults.failed.push({
//                     subjectId: cleanSubjectId,
//                     reason: "Validation Failed: Duplicate Subject ID found within the uploaded Excel file."
//                 });
//                 continue; // Skip DB operation entirely for this row
//             }

//             // Add to our tracking set
//             processedIds.add(cleanSubjectId);

//             try {
//                 // Attempt to save to the database using the cleaned variables
//                 const newSubject = await Subject.create({
//                     subjectId: cleanSubjectId,
//                     subjectName: String(subjectName).trim(),
//                     course: String(course).trim(),
//                     academicYear: String(academicYear).trim(), // Formatted as String to allow formats like "2023-2024"
//                     semester: Number(semester)                 // NEW: Added semester as a Number
//                 });
                
//                 uploadResults.successful.push(newSubject.subjectId);

//             } catch (error) {
//                 // Catch DB-level errors (Already exists in the database)
//                 if (error.code === 11000) {
//                     uploadResults.failed.push({
//                         subjectId: cleanSubjectId, // Use the cleaned ID for the report
//                         reason: "Database Error: Subject ID already exists in the system."
//                     });
//                 } else {
//                     uploadResults.failed.push({
//                         subjectId: cleanSubjectId,
//                         reason: `Database Error: ${error.message}`
//                     });
//                 }
//             }
//         }

//         // 5. Clean up the temporary file
//         try { fs.unlinkSync(filePath); } catch (e) { console.warn("File cleanup failed", e); }

//         // ---> 🔔 THE BELL RINGER (Placed BEFORE the return!) <---
//         if (uploadResults.successful.length > 0) {
//             try {
//                 const userId = req.user?._id || req.user?.id || req.user;
//                 const currentUser = await User.findById(userId).select('name').lean();
//                 const actorName = currentUser ? currentUser.name : "a Faculty Member";

//                 await logActivity(
//                     userId,
//                     'BATCH_UPLOADED_SUBJECTS', 
//                     `Batch uploaded ${uploadResults.successful.length} new subjects via Excel by ${actorName} (${uploadResults.failed.length} failed/skipped)`, 
//                     []
//                 );
//             } catch (logError) {
//                 console.error("⚠️ Activity Logger Failed:", logError.message);
//             }
//         }
//         // ---------------------------------------------------------

//         // 6. Return the report
//         return res.status(200).json({
//             success: true,
//             message: "Excel batch processing complete.",
//             data: uploadResults
//         });

//     } catch (error) {
//         // Safety net file cleanup if the whole process crashes
//         if (req.file && req.file.path) {
//             try { fs.unlinkSync(req.file.path); } catch (e) {}
//         }
//         res.status(500).json({
//             success: false,
//             message: "Server Error during Excel processing",
//             error: error.message
//         });
//     }
// }

// module.exports = {
//     handleUploadAllSubject
// };




















