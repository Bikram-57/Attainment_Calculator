// const assignSubject = require('../models/assignSubject'); //Current model
// const Faculty = require('../models/user'); // Model holding faculty names and faculty ids
// const Subject = require('../models/subject'); // Model holding subject names and Subject ids







// async function handleAssignSubject(req, res) {
//     try {
//         // 1. ADDED subjectName to the destructuring
//         const { facultyId, subjectId, subjectName, academicYear } = req.body;

//         // Validate inputs (including subjectName)
//         if (!facultyId || !subjectId || !subjectName || academicYear === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'facultyId, subjectId, subjectName, and academicYear are strictly required.'
//             });
//         }

//         // Sanitize inputs
//         const cleanFacultyId = facultyId.trim();
//         const cleanSubjectId = subjectId.trim();
//         const cleanSubjectName = subjectName.trim();
//         const academicYearStr = academicYear.toString().trim();

//         // ------------------------------------------------------------------
//         // 2. GLOBAL CONFLICT CHECK
//         const queryKey = `assignments.${academicYearStr}`;
        
//         // UPDATED: Use $elemMatch because the array now holds objects, not strings
//         const existingAssignment = await assignSubject.findOne({
//             [queryKey]: { $elemMatch: { subjectId: cleanSubjectId } }
//         });

//         if (existingAssignment) {
//             return res.status(409).json({
//                 success: false,
//                 message: `Conflict: Subject ${cleanSubjectId} is already assigned to faculty ${existingAssignment.facultyId} for the year ${academicYearStr}.`
//             });
//         }
//         // ------------------------------------------------------------------

//         // 3. Find the teacher 
//         let teacherDoc = await assignSubject.findOne({ facultyId: cleanFacultyId });

//         // 4. Create or Update Document
//         if (!teacherDoc) {
//             teacherDoc = new assignSubject({
//                 facultyId: cleanFacultyId,
//                 assignments: {} 
//             });
//             // FIXED: Save as an OBJECT, not a string
//             teacherDoc.assignments.set(academicYearStr, [{ 
//                 subjectId: cleanSubjectId, 
//                 subjectName: cleanSubjectName 
//             }]);
//         } else {
//             const yearSubjects = teacherDoc.assignments.get(academicYearStr) || [];
            
//             // Check locally just to be absolutely safe
//             const alreadyExists = yearSubjects.some(sub => sub.subjectId === cleanSubjectId);
            
//             if (!alreadyExists) {
//                 // FIXED: Push an OBJECT, not a string
//                 yearSubjects.push({ 
//                     subjectId: cleanSubjectId, 
//                     subjectName: cleanSubjectName 
//                 });
//                 teacherDoc.assignments.set(academicYearStr, yearSubjects);
//             }
//         }

//         // 5. Save to database
//         await teacherDoc.save();

//         // ==================================================================
//         // 6. FORMAT THE RESPONSE
//         // ==================================================================
        
//         // Fetch the Faculty Name
//         const facultyDetails = await Faculty.findOne({ facultyId: cleanFacultyId }).lean();
//         const facultyName = facultyDetails ? facultyDetails.name : "Unknown Faculty";

//         // Build the final response object (No more complex mapping needed!)
//         const responseData = {
//             _id: teacherDoc._id,
//             facultyId: teacherDoc.facultyId,
//             facultyName: facultyName,
//             assignments: teacherDoc.assignments, // The Map already holds perfectly formatted objects!
//             createdAt: teacherDoc.createdAt,
//             updatedAt: teacherDoc.updatedAt,
//             __v: teacherDoc.__v
//         };

//         // 7. Send the response
//         return res.status(200).json({
//             success: true,
//             message: 'Subject assigned successfully.',
//             data: responseData
//         });

//     } catch (error) {
//         console.error('Full Error Detail:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Server error while assigning subject.',
//             actualError: error.message,
//             stack: error.stack
//         });
//     }
// }





// // async function handleAssignSubject(req, res) {
// //     try {
// //         const { facultyId, subjectId, academicYear } = req.body;

// //         // 1. Validate inputs
// //         if (!facultyId || !subjectId || academicYear === undefined) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: 'facultyId, subjectId, and academicYear are strictly required.'
// //             });
// //         }

// //         // 2. Sanitize inputs
// //         const cleanFacultyId = facultyId.trim();
// //         const cleanSubjectId = subjectId.trim();
// //         const academicYearStr = academicYear.toString().trim();

// //         // ------------------------------------------------------------------
// //         // 3. NEW GLOBAL CONFLICT CHECK
// //         // Dynamically build the query key (e.g., "assignments.2026")
// //         const queryKey = `assignments.${academicYearStr}`;
        
// //         // Search the ENTIRE database to see if this subject is in this year's array anywhere
// //         const existingAssignment = await assignSubject.findOne({
// //             [queryKey]: cleanSubjectId
// //         });

// //         // If we found a match, block the request immediately
// //         if (existingAssignment) {
// //             return res.status(409).json({
// //                 success: false,
// //                 message: `Conflict: Subject ${cleanSubjectId} is already assigned to faculty ${existingAssignment.facultyId} for the year ${academicYearStr}.`
// //             });
// //         }
// //         // ------------------------------------------------------------------

// //         // 4. Find the teacher (We now know it is safe to assign the subject)
// //         let teacherDoc = await assignSubject.findOne({ facultyId: cleanFacultyId });

// //         // 5. Create new document if teacher doesn't exist
// //         if (!teacherDoc) {
// //             teacherDoc = new assignSubject({
// //                 facultyId: cleanFacultyId,
// //                 assignments: {} 
// //             });
            
// //             // Set the first subject for this year
// //             teacherDoc.assignments.set(academicYearStr, [cleanSubjectId]);
// //         } else {
// //             // 6. If teacher exists, get the array for the year (or default to empty array)
// //             // Note: We removed the localized duplicate check because the Global Check above handles it!
// //             const yearSubjects = teacherDoc.assignments.get(academicYearStr) || [];
            
// //             // Push the new subject and update the Map
// //             yearSubjects.push(cleanSubjectId);
// //             teacherDoc.assignments.set(academicYearStr, yearSubjects);
// //         }

// //         // 7. Save to database
// //         await teacherDoc.save();

// //         return res.status(200).json({
// //             success: true,
// //             message: 'Subject assigned successfully.',
// //             data: teacherDoc
// //         });

// //     } catch (error) {
// //         console.error('Full Error Detail:', error);
// //         return res.status(500).json({
// //             success: false,
// //             message: 'Server error while assigning subject.',
// //             actualError: error.message,
// //             stack: error.stack
// //         });
// //     }
// // }













// // 2. Get ALL Assignments in the database
// // async function getAllFacultyAssignments(req, res) {
// //     try {
// //         const { academicYear } = req.query; // Updated to match our new naming convention

// //         // .lean() returns plain JS objects. Maps become standard objects.
// //         const allRecords = await assignSubject.find({}).lean();

// //         if (!allRecords || allRecords.length === 0) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: "No assigned subjects found in the database."
// //             });
// //         }

// //         let dataToSend = allRecords;

// //         // If a specific year was requested, filter using object keys
// //         if (academicYear) {
// //             const academicYearStr = academicYear.toString().trim();

// //             dataToSend = allRecords.reduce((filteredRecords, faculty) => {
// //                 // Check if the assignments object has this specific year as a key
// //                 if (faculty.assignments && faculty.assignments[academicYearStr]) {
// //                     filteredRecords.push({
// //                         facultyId: faculty.facultyId,
// //                         // Return just that year's data in the new flat structure
// //                         assignments: {
// //                             [academicYearStr]: faculty.assignments[academicYearStr]
// //                         }
// //                     });
// //                 }
// //                 return filteredRecords;
// //             }, []); // Start with an empty array
// //         }

// //         return res.status(200).json({
// //             success: true,
// //             count: dataToSend.length,
// //             data: dataToSend
// //         });

// //     } catch (error) {
// //         console.error('Full Error Detail:', error);
// //         return res.status(500).json({
// //             success: false,
// //             message: "Server error while fetching assignments",
// //             actualError: error.message
// //         });
// //     }
// // }







// // Make sure this is at the top of your file!
// // const Faculty = require('../models/Faculty'); 

// async function getAllFacultyAssignments(req, res) {
//     try {
//         const { academicYear } = req.query;

//         // 1. Fetch all assignments from the database
//         // .lean() returns plain JS objects, meaning the Mongoose Map becomes a standard object automatically!
//         const allRecords = await assignSubject.find({}).lean();

//         if (!allRecords || allRecords.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No assigned subjects found in the database."
//             });
//         }

//         // ==================================================================
//         // 2. OPTIMIZED FACULTY NAME LOOKUP
//         // ==================================================================
        
//         // Extract an array of all the faculty IDs currently in the records
//         const facultyIds = allRecords.map(record => record.facultyId);

//         // Fetch all matching faculty details in ONE single database query (Super fast!)
//         const faculties = await Faculty.find({ facultyId: { $in: facultyIds } }).lean();

//         // Create a lookup dictionary/object for instant name mapping (e.g., { "CA1718": "John Doe" })
//         const facultyNameMap = {};
//         faculties.forEach(f => {
//             facultyNameMap[f.facultyId] = f.name;
//         });

//         // ==================================================================
//         // 3. FILTER AND FORMAT THE DATA
//         // ==================================================================

//         let dataToSend = [];

//         if (academicYear) {
//             const academicYearStr = academicYear.toString().trim();

//             dataToSend = allRecords.reduce((filteredRecords, faculty) => {
//                 // Check if the assignments object has this specific year as a key
//                 if (faculty.assignments && faculty.assignments[academicYearStr]) {
//                     filteredRecords.push({
//                         _id: faculty._id,
//                         facultyId: faculty.facultyId,
//                         facultyName: facultyNameMap[faculty.facultyId] || "Unknown Faculty", // Insert Name
//                         assignments: {
//                             [academicYearStr]: faculty.assignments[academicYearStr]
//                         },
//                         createdAt: faculty.createdAt,
//                         updatedAt: faculty.updatedAt,
//                         __v: faculty.__v
//                     });
//                 }
//                 return filteredRecords;
//             }, []);
//         } else {
//             // If no year specified, map over all records to attach the faculty names
//             dataToSend = allRecords.map(faculty => {
//                 return {
//                     _id: faculty._id,
//                     facultyId: faculty.facultyId,
//                     facultyName: facultyNameMap[faculty.facultyId] || "Unknown Faculty", // Insert Name
//                     assignments: faculty.assignments,
//                     createdAt: faculty.createdAt,
//                     updatedAt: faculty.updatedAt,
//                     __v: faculty.__v
//                 };
//             });
//         }

//         // 4. Send Response
//         return res.status(200).json({
//             success: true,
//             count: dataToSend.length,
//             data: dataToSend
//         });

//     } catch (error) {
//         console.error('Full Error Detail:', error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error while fetching assignments",
//             actualError: error.message
//         });
//     }
// }

// module.exports = { getAllFacultyAssignments };












// // 3. Get ALL Subjects for a Specific Faculty Member
// // 3. Get ALL Subjects for a Specific Faculty Member
// // async function getAssignedSubjectsByFaculty(req, res) {
// //     try {
// //         const { facultyId } = req.params;
// //         const { academicYear } = req.query;

// //         const cleanFacultyId = facultyId.trim();
// //         const facultyRecord = await assignSubject.findOne({ facultyId: cleanFacultyId });

// //         // Maps use .size instead of .length to check if they are empty
// //         if (!facultyRecord || !facultyRecord.assignments || facultyRecord.assignments.size === 0) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: `No assigned subjects found for faculty ID: ${cleanFacultyId}`
// //             });
// //         }

// //         let dataToSend;

// //         // Handle optional year filtering directly with Map lookups
// //         if (academicYear) {
// //             const academicYearStr = academicYear.toString().trim();

// //             if (!facultyRecord.assignments.has(academicYearStr)) {
// //                 return res.status(404).json({
// //                     success: false,
// //                     message: `No subjects found for faculty ID ${cleanFacultyId} in the year ${academicYearStr}`
// //                 });
// //             }
            
// //             // Reconstruct the flat structure for the response
// //             dataToSend = {
// //                 [academicYearStr]: facultyRecord.assignments.get(academicYearStr)
// //             };
// //         } else {
// //             // Convert the Map to a standard plain Object so it sends cleanly in JSON
// //             dataToSend = Object.fromEntries(facultyRecord.assignments);
// //         }

// //         return res.status(200).json({
// //             success: true,
// //             facultyId: facultyRecord.facultyId,
// //             totalYearsRecorded: Object.keys(dataToSend).length,
// //             data: dataToSend
// //         });

// //     } catch (error) {
// //         console.error('Full Error Detail:', error);
// //         return res.status(500).json({
// //             success: false,
// //             message: "Server error while fetching the faculty's subjects",
// //             actualError: error.message
// //         });
// //     }
// // }










// async function getAssignedSubjectsByFaculty(req, res) {
//     try {
//         const { facultyId } = req.params;
//         const { academicYear } = req.query;

//         const cleanFacultyId = facultyId.trim();
        
//         // 1. Fetch the assignment record
//         const facultyRecord = await assignSubject.findOne({ facultyId: cleanFacultyId });

//         // Maps use .size instead of .length to check if they are empty
//         if (!facultyRecord || !facultyRecord.assignments || facultyRecord.assignments.size === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No assigned subjects found for faculty ID: ${cleanFacultyId}`
//             });
//         }

//         // 2. Fetch the Faculty Name to enrich the data
//         const facultyDetails = await Faculty.findOne({ facultyId: cleanFacultyId }).lean();
//         const facultyName = facultyDetails ? facultyDetails.name : "Unknown Faculty";

//         let filteredAssignments;

//         // 3. Handle optional year filtering directly with Map lookups
//         if (academicYear) {
//             const academicYearStr = academicYear.toString().trim();

//             if (!facultyRecord.assignments.has(academicYearStr)) {
//                 return res.status(404).json({
//                     success: false,
//                     message: `No subjects found for faculty ID ${cleanFacultyId} in the year ${academicYearStr}`
//                 });
//             }
            
//             // Reconstruct the flat structure for the response
//             filteredAssignments = {
//                 [academicYearStr]: facultyRecord.assignments.get(academicYearStr)
//             };
//         } else {
//             // Convert the Map to a standard plain Object so it sends cleanly in JSON
//             filteredAssignments = Object.fromEntries(facultyRecord.assignments);
//         }

//         // 4. Build the final beautifully formatted response
//         const responseData = {
//             _id: facultyRecord._id,
//             facultyId: facultyRecord.facultyId,
//             facultyName: facultyName, // NEW: Added the teacher's name
//             totalYearsRecorded: Object.keys(filteredAssignments).length,
//             assignments: filteredAssignments, // Since we save objects now, this is automatically correct!
//             createdAt: facultyRecord.createdAt,
//             updatedAt: facultyRecord.updatedAt,
//             __v: facultyRecord.__v
//         };

//         return res.status(200).json({
//             success: true,
//             data: responseData
//         });

//     } catch (error) {
//         console.error('Full Error Detail:', error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error while fetching the faculty's subjects",
//             actualError: error.message
//         });
//     }
// }








// // 4. Delete a Specific Assignment Document
// async function removeSubjectFromFaculty(req, res) {
//     try {
//         const { facultyId, subjectId, academicYear } = req.body;

//         // Validation check
//         if (!facultyId || !subjectId || academicYear === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide facultyId, subjectId, and academicYear."
//             });
//         }

//         const cleanFacultyId = facultyId.trim();
//         const cleanSubjectId = subjectId.trim();
//         const academicYearStr = academicYear.toString().trim();

//         // 1. Find the faculty document
//         const facultyRecord = await assignSubject.findOne({ facultyId: cleanFacultyId });

//         if (!facultyRecord) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Could not find faculty with ID: ${cleanFacultyId}`
//             });
//         }

//         // 2. Check if the Map has this specific year key
//         if (!facultyRecord.assignments.has(academicYearStr)) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No assignments found for the year ${academicYearStr}.`
//             });
//         }

//         // 3. Extract the array of subjects for that year
//         let yearSubjects = facultyRecord.assignments.get(academicYearStr);

//         // 4. Check if the subject actually exists in that array
//         if (!yearSubjects.includes(cleanSubjectId)) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject ${cleanSubjectId} is not assigned to this faculty for the year ${academicYearStr}.`
//             });
//         }

//         // 5. Remove the subject by filtering it out
//         yearSubjects = yearSubjects.filter(id => id !== cleanSubjectId);

//         // 6. PRO TIP: Database Cleanup
//         // If removing this subject leaves the year completely empty, delete the year key from the Map!
//         if (yearSubjects.length === 0) {
//             facultyRecord.assignments.delete(academicYearStr);
//         } else {
//             // Otherwise, update the Map with the new filtered array
//             facultyRecord.assignments.set(academicYearStr, yearSubjects);
//         }

//         // 7. Save the updated document
//         await facultyRecord.save();

//         return res.status(200).json({
//             success: true,
//             message: "Subject removed successfully.",
//             data: facultyRecord
//         });

//     } catch (error) {
//         console.error('Full Error Detail:', error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error while deleting assignment",
//             actualError: error.message
//         });
//     }
// }

// module.exports = {
//     handleAssignSubject,
//     getAllFacultyAssignments,
//     getAssignedSubjectsByFaculty,
//     removeSubjectFromFaculty,
// };


const assignSubject = require('../models/assignSubject'); 
const Faculty = require('../models/user'); 
const Subject = require('../models/subject'); 

// 1. Assign Subject
async function handleAssignSubject(req, res) {
    try {
        const { facultyId, subjectId, subjectName, academicYear } = req.body;

        if (!facultyId || !subjectId || !subjectName || academicYear === undefined) {
            return res.status(400).json({
                success: false,
                message: 'facultyId, subjectId, subjectName, and academicYear are strictly required.'
            });
        }

        const cleanFacultyId = facultyId.trim();
        const cleanSubjectId = subjectId.trim();
        const cleanSubjectName = subjectName.trim().replace(/\s+/g, ' '); 
        const academicYearStr = academicYear.toString().trim();

        // Global Conflict Check
        const queryKey = `assignments.${academicYearStr}`;
        const existingAssignment = await assignSubject.findOne({
            [queryKey]: { $elemMatch: { subjectId: cleanSubjectId } }
        });

        if (existingAssignment) {
            return res.status(409).json({
                success: false,
                message: `Conflict: Subject ${cleanSubjectId} is already assigned to faculty ${existingAssignment.facultyId} for the year ${academicYearStr}.`
            });
        }

        let teacherDoc = await assignSubject.findOne({ facultyId: cleanFacultyId });

        if (!teacherDoc) {
            // Fetch name for the BRAND NEW document
            const facultyDetails = await Faculty.findOne({ facultyId: cleanFacultyId }).lean();
            const fetchedName = facultyDetails ? facultyDetails.name : "Unknown Faculty";

            teacherDoc = new assignSubject({
                facultyId: cleanFacultyId,
                facultyName: fetchedName,
                totalYearsRecorded: 1,
                assignments: {} 
            });
            teacherDoc.assignments.set(academicYearStr, [{ subjectId: cleanSubjectId, subjectName: cleanSubjectName }]);
        } else {
            const yearSubjects = teacherDoc.assignments.get(academicYearStr) || [];
            const alreadyExists = yearSubjects.some(sub => sub.subjectId === cleanSubjectId);
            
            if (!alreadyExists) {
                yearSubjects.push({ subjectId: cleanSubjectId, subjectName: cleanSubjectName });
                teacherDoc.assignments.set(academicYearStr, yearSubjects);
            }
            
            // Update the total years count
            teacherDoc.totalYearsRecorded = teacherDoc.assignments.size;
        }

        await teacherDoc.save();

        return res.status(200).json({
            success: true,
            message: 'Subject assigned successfully.',
            data: teacherDoc
        });

    } catch (error) {
        console.error('Full Error Detail:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while assigning subject.',
            actualError: error.message
        });
    }
}

// 2. Get ALL Assignments
async function getAllFacultyAssignments(req, res) {
    try {
        const { academicYear } = req.query;

        // .lean() makes mapping extremely fast and converts Map to standard Object
        const allRecords = await assignSubject.find({}).lean();

        if (!allRecords || allRecords.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No assigned subjects found in the database."
            });
        }

        let dataToSend = [];

        if (academicYear) {
            const academicYearStr = academicYear.toString().trim();

            dataToSend = allRecords.reduce((filteredRecords, faculty) => {
                if (faculty.assignments && faculty.assignments[academicYearStr]) {
                    filteredRecords.push({
                        _id: faculty._id,
                        facultyId: faculty.facultyId,
                        facultyName: faculty.facultyName,
                        totalYearsRecorded: faculty.totalYearsRecorded,
                        assignments: {
                            [academicYearStr]: faculty.assignments[academicYearStr]
                        },
                        createdAt: faculty.createdAt,
                        updatedAt: faculty.updatedAt,
                        __v: faculty.__v
                    });
                }
                return filteredRecords;
            }, []);
        } else {
            // Already perfectly formatted by the DB!
            dataToSend = allRecords;
        }

        return res.status(200).json({
            success: true,
            count: dataToSend.length,
            data: dataToSend
        });

    } catch (error) {
        console.error('Full Error Detail:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching assignments",
            actualError: error.message
        });
    }
}

// 3. Get ALL Subjects for a Specific Faculty Member
async function getAssignedSubjectsByFaculty(req, res) {
    try {
        const { facultyId } = req.params;
        const { academicYear } = req.query;

        const cleanFacultyId = facultyId.trim();
        
        // .lean() converts the DB doc into a standard JS Object instantly
        const facultyRecord = await assignSubject.findOne({ facultyId: cleanFacultyId }).lean();

        if (!facultyRecord || !facultyRecord.assignments || Object.keys(facultyRecord.assignments).length === 0) {
            return res.status(404).json({
                success: false,
                message: `No assigned subjects found for faculty ID: ${cleanFacultyId}`
            });
        }

        let filteredAssignments;

        if (academicYear) {
            const academicYearStr = academicYear.toString().trim();

            if (!facultyRecord.assignments[academicYearStr]) {
                return res.status(404).json({
                    success: false,
                    message: `No subjects found for faculty ID ${cleanFacultyId} in the year ${academicYearStr}`
                });
            }
            
            filteredAssignments = {
                [academicYearStr]: facultyRecord.assignments[academicYearStr]
            };
        } else {
            filteredAssignments = facultyRecord.assignments;
        }

        const responseData = {
            _id: facultyRecord._id,
            facultyId: facultyRecord.facultyId,
            facultyName: facultyRecord.facultyName,
            totalYearsRecorded: facultyRecord.totalYearsRecorded,
            assignments: filteredAssignments, 
            createdAt: facultyRecord.createdAt,
            updatedAt: facultyRecord.updatedAt,
            __v: facultyRecord.__v
        };

        return res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Full Error Detail:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching the faculty's subjects",
            actualError: error.message
        });
    }
}

// 4. Delete a Specific Assignment Document
async function removeSubjectFromFaculty(req, res) {
    try {
        const { facultyId, subjectId, academicYear } = req.body;

        if (!facultyId || !subjectId || academicYear === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide facultyId, subjectId, and academicYear."
            });
        }

        const cleanFacultyId = facultyId.trim();
        const cleanSubjectId = subjectId.trim();
        const academicYearStr = academicYear.toString().trim();

        const facultyRecord = await assignSubject.findOne({ facultyId: cleanFacultyId });

        if (!facultyRecord) {
            return res.status(404).json({
                success: false,
                message: `Could not find faculty with ID: ${cleanFacultyId}`
            });
        }

        if (!facultyRecord.assignments.has(academicYearStr)) {
            return res.status(404).json({
                success: false,
                message: `No assignments found for the year ${academicYearStr}.`
            });
        }

        let yearSubjects = facultyRecord.assignments.get(academicYearStr);

        // Filter through array of objects to find match
        const subjectExists = yearSubjects.some(sub => sub.subjectId === cleanSubjectId);
        
        if (!subjectExists) {
            return res.status(404).json({
                success: false,
                message: `Subject ${cleanSubjectId} is not assigned to this faculty for the year ${academicYearStr}.`
            });
        }

        // Filter the object OUT of the array
        yearSubjects = yearSubjects.filter(sub => sub.subjectId !== cleanSubjectId);

        if (yearSubjects.length === 0) {
            facultyRecord.assignments.delete(academicYearStr);
        } else {
            facultyRecord.assignments.set(academicYearStr, yearSubjects);
        }

        // Keep the total years count accurate after deletion
        facultyRecord.totalYearsRecorded = facultyRecord.assignments.size;

        await facultyRecord.save();

        return res.status(200).json({
            success: true,
            message: "Subject removed successfully.",
            data: facultyRecord
        });

    } catch (error) {
        console.error('Full Error Detail:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting assignment",
            actualError: error.message
        });
    }
}

module.exports = {
    handleAssignSubject,
    getAllFacultyAssignments,
    getAssignedSubjectsByFaculty,
    removeSubjectFromFaculty,
};