//current working


// const xlsx = require('xlsx');
// const fs = require('fs');
// const Subject = require('../models/subject');
// const User = require('../models/user'); 
// const logActivity = require('../utils/activityLogger');

// // ============================================================================
// // HELPER: Normalize Messy Excel Rows
// // ============================================================================
// const normalizeExcelRow = (row) => {
//     const cleanRow = {};
//     for (const key in row) {
//         // Strip all spaces and normalize to lowercase for consistent property mapping
//         const cleanKey = key.replace(/\s+/g, '').toLowerCase();
//         cleanRow[cleanKey] = row[key];
//     }

//     return {
//         subjectId: String(cleanRow.subjectid || cleanRow.subjectcode || '').toUpperCase().trim(), 
//         subjectName: String(cleanRow.subjectname || cleanRow.name || '').trim(),
//         course: String(cleanRow.course || cleanRow.program || '').toUpperCase().trim(),
//         academicYear: String(cleanRow.academicyear || cleanRow.year || '').trim(),
//         // Fallback checks handle both valid inputs and known Excel typos (e.g., 'Semesteer')
//         semester: Number(cleanRow.semester || cleanRow.semesteer)
//     };
// };

// // ============================================================================
// // CONTROLLER: Batch Upload Subjects
// // ============================================================================
// async function handleUploadAllSubject(req, res) {
//     try {
//         // 1. File Validation
//         if (!req.file) {
//             return res.status(400).json({ success: false, message: "No Excel file provided." });
//         }

//         // 2. Read Excel File (Prioritize fast memory buffer, fallback to disk)
//         let workbook;
//         if (req.file.buffer) {
//             workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//         } else {
//             workbook = xlsx.readFile(req.file.path);
//         }
        
//         const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//         const jsonData = xlsx.utils.sheet_to_json(worksheet);

//         // 3. Prepare tracking mechanisms
//         const uploadResults = {
//             totalProcessed: jsonData.length,
//             successful: [],
//             failed: []
//         };

//         const processedIds = new Set();
//         const validSubjectsToInsert = [];

//         // 4. Data Extraction & Sanitization (Local Memory Loop)
//         for (const rawRow of jsonData) {
//             const { subjectId, subjectName, course, academicYear, semester } = normalizeExcelRow(rawRow);

//             // A. Mandatory Fields Validation
//             if (!subjectId || !subjectName || !course || !academicYear || !semester || isNaN(semester)) {
//                 uploadResults.failed.push({
//                     subjectId: subjectId || 'Unknown',
//                     reason: "Validation Failed: Missing or invalid mandatory fields."
//                 });
//                 continue; 
//             }

//             // B. Intra-File Duplicate Check (Prevents uploading identical rows from the same Excel sheet)
//             if (processedIds.has(subjectId)) {
//                 uploadResults.failed.push({
//                     subjectId: subjectId,
//                     reason: "Validation Failed: Duplicate Subject ID found within the uploaded Excel file."
//                 });
//                 continue; 
//             }

//             processedIds.add(subjectId);
//             validSubjectsToInsert.push({ subjectId, subjectName, course, academicYear, semester });
//         }

//         // 5. BULK DATABASE OPERATION (Massive Performance Optimization)
//         // Instead of waiting for 500 individual DB calls, we send them all at once.
//         if (validSubjectsToInsert.length > 0) {
//             const bulkOps = validSubjectsToInsert.map(subject => ({
//                 insertOne: { document: subject }
//             }));

//             try {
//                 // ordered: false allows valid rows to insert even if some fail due to unique constraints
//                 await Subject.bulkWrite(bulkOps, { ordered: false });
                
//                 // If the bulkWrite fully succeeds, all valid subjects were successfully inserted
//                 uploadResults.successful = validSubjectsToInsert.map(s => s.subjectId);

//             } catch (error) {
//                 // Handle mixed results (some passed, some triggered duplicate key errors)
//                 if (error.insertedDocs) {
//                     error.insertedDocs.forEach(doc => uploadResults.successful.push(doc.subjectId));
//                 }
                
//                 if (error.writeErrors) {
//                     error.writeErrors.forEach(err => {
//                         uploadResults.failed.push({
//                             subjectId: err.err.op.subjectId,
//                             reason: err.code === 11000 
//                                 ? "Database Error: Subject ID already exists in the system for this term." 
//                                 : `Database Error: ${err.errmsg}`
//                         });
//                     });
//                 }
//             }
//         }

//         // 6. Clean up the temporary file (if disk storage was used)
//         if (req.file.path && fs.existsSync(req.file.path)) {
//             try { fs.unlinkSync(req.file.path); } catch (e) { console.warn("File cleanup failed", e.message); }
//         }

//         // 7. BACKGROUND ACTIVITY LOGGER
//         // Placed outside of 'await' so the response isn't delayed while the logger runs
//         if (uploadResults.successful.length > 0) {
//             const userId = req.user?._id || req.user?.id || req.user;
            
//             User.findById(userId).select('name').lean()
//                 .then(currentUser => {
//                     const actorName = currentUser?.name || "a Faculty Member";
//                     return logActivity(
//                         userId,
//                         'BATCH_UPLOADED_SUBJECTS', 
//                         `Batch uploaded ${uploadResults.successful.length} new subjects via Excel by ${actorName} (${uploadResults.failed.length} failed/skipped)`, 
//                         []
//                     );
//                 })
//                 .catch(logError => console.error("⚠️ Activity Logger Failed:", logError.message));
//         }

//         // 8. Return the detailed report
//         return res.status(200).json({
//             success: true,
//             message: "Excel batch processing complete.",
//             data: uploadResults
//         });

//     } catch (error) {
//         // Failsafe disk cleanup if the process completely crashes
//         if (req.file?.path && fs.existsSync(req.file.path)) {
//             try { fs.unlinkSync(req.file.path); } catch (e) {}
//         }

//         console.error("Upload All Subjects Error:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Server Error during Excel processing",
//             error: error.message
//         });
//     }
// }

// module.exports = {
//     handleUploadAllSubject
// };









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

    // Safely extract and format subjectType to match Mongoose Enum ('Theory' or 'Lab')
    let rawType = String(cleanRow.subjecttype || cleanRow.type || '').trim();
    let formattedType = rawType ? rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase() : '';

    return {
        subjectId: String(cleanRow.subjectid || cleanRow.subjectcode || '').toUpperCase().trim(), 
        subjectName: String(cleanRow.subjectname || cleanRow.name || '').trim(),
        subjectType: formattedType, // NEW FIELD
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
            const { subjectId, subjectName, subjectType, course, academicYear, semester } = normalizeExcelRow(rawRow);

            // A. Mandatory Fields Validation (Added subjectType)
            if (!subjectId || !subjectName || !subjectType || !course || !academicYear || !semester || isNaN(semester)) {
                uploadResults.failed.push({
                    subjectId: subjectId || 'Unknown',
                    reason: "Validation Failed: Missing or invalid mandatory fields (requires ID, name, type, course, year, and semester)."
                });
                continue; 
            }

            // A2. Subject Type Enum Validation
            if (!['Theory', 'Lab'].includes(subjectType)) {
                uploadResults.failed.push({
                    subjectId: subjectId,
                    reason: `Validation Failed: Invalid subjectType '${subjectType}'. Must be 'Theory' or 'Lab'.`
                });
                continue; 
            }

            // B. Intra-File Duplicate Check 
            // UPDATED: Now uses a composite key because a Subject ID is only unique per Year/Semester
            const uniqueRowKey = `${subjectId}_${academicYear}_${semester}`;
            if (processedIds.has(uniqueRowKey)) {
                uploadResults.failed.push({
                    subjectId: subjectId,
                    reason: `Validation Failed: Duplicate entry for ${subjectId} in Year ${academicYear}, Sem ${semester} found within the uploaded Excel file.`
                });
                continue; 
            }

            processedIds.add(uniqueRowKey);
            validSubjectsToInsert.push({ subjectId, subjectName, subjectType, course, academicYear, semester });
        }

        // 5. BULK DATABASE OPERATION (Massive Performance Optimization)
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
                                ? "Database Error: Subject ID already exists in the system for this specific academic year and semester." 
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