// const xlsx = require('xlsx');
// const fs = require('fs');
// const Subject = require('../models/subject');

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
//         year: cleanRow.year
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
            
//             const { subjectId, subjectName, course, year } = normalizeExcelRow(rawRow);

//             if (!subjectId || !subjectName || !course || !year) {
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
//                     year: Number(year)
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

const xlsx = require('xlsx');
const fs = require('fs');
const Subject = require('../models/subject');

// Helper function to handle messy Excel column headers
const normalizeExcelRow = (row) => {
    const cleanRow = {};
    for (const key in row) {
        // Strips all spaces and makes lowercase
        const cleanKey = key.replace(/\s+/g, '').toLowerCase();
        cleanRow[cleanKey] = row[key];
    }

    return {
        subjectId: cleanRow.subjectid || cleanRow.subjectcode, 
        subjectName: cleanRow.subjectname || cleanRow.name,
        course: cleanRow.course || cleanRow.program,
        academicYear: cleanRow.academicyear || cleanRow.year // Updated to handle 'academic year' or 'year'
    };
};

async function handleUploadAllSubject(req, res) {
    try {
        // 1. Ensure file exists
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No Excel file provided." });
        }

        const filePath = req.file.path;

        // 2. Parse the Excel file
        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // 3. Prepare tracking arrays for the response
        const uploadResults = {
            totalProcessed: jsonData.length,
            successful: [],
            failed: []
        };

        // NEW: Track IDs within the current upload to prevent duplicates IN the Excel file itself
        const processedIds = new Set();

        // 4. Loop through the data one by one
        for (const rawRow of jsonData) {
            
            // Replaced 'year' with 'academicYear'
            const { subjectId, subjectName, course, academicYear } = normalizeExcelRow(rawRow);

            if (!subjectId || !subjectName || !course || !academicYear) {
                uploadResults.failed.push({
                    subjectId: subjectId || 'Unknown',
                    reason: "Validation Failed: Missing mandatory fields."
                });
                continue; 
            }

            // NEW: Normalize the Subject ID here so it is consistent across checks and the DB
            const cleanSubjectId = String(subjectId).toUpperCase().trim();

            // NEW: Check for duplicates WITHIN the uploaded Excel file
            if (processedIds.has(cleanSubjectId)) {
                uploadResults.failed.push({
                    subjectId: cleanSubjectId,
                    reason: "Validation Failed: Duplicate Subject ID found within the uploaded Excel file."
                });
                continue; // Skip DB operation entirely for this row
            }

            // Add to our tracking set
            processedIds.add(cleanSubjectId);

            try {
                // Attempt to save to the database using the cleaned variables
                const newSubject = await Subject.create({
                    subjectId: cleanSubjectId,
                    subjectName: String(subjectName).trim(),
                    course: String(course).trim(),
                    academicYear: String(academicYear).trim() // Formatted as String to allow formats like "2023-2024"
                });
                
                uploadResults.successful.push(newSubject.subjectId);

            } catch (error) {
                // Catch DB-level errors (Already exists in the database)
                if (error.code === 11000) {
                    uploadResults.failed.push({
                        subjectId: cleanSubjectId, // Use the cleaned ID for the report
                        reason: "Database Error: Subject ID already exists in the system."
                    });
                } else {
                    uploadResults.failed.push({
                        subjectId: cleanSubjectId,
                        reason: `Database Error: ${error.message}`
                    });
                }
            }
        }

        // 5. Clean up the temporary file
        try { fs.unlinkSync(filePath); } catch (e) { console.warn("File cleanup failed", e); }

        // 6. Return the report
        return res.status(200).json({
            success: true,
            message: "Excel batch processing complete.",
            data: uploadResults
        });

    } catch (error) {
        // Safety net file cleanup if the whole process crashes
        if (req.file && req.file.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        res.status(500).json({
            success: false,
            message: "Server Error during Excel processing",
            error: error.message
        });
    }
}

module.exports = {
    handleUploadAllSubject
};