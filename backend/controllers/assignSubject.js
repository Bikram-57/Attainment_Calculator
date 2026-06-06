// controllers/assignSubject.js
const assignSubject = require('../models/assignSubject');

async function handleAssignSubject(req, res) {
    try {
        const { facultyId, subjectId, academicYear } = req.body;

        // 1. Validate inputs
        if (!facultyId || !subjectId || academicYear === undefined) {
            return res.status(400).json({
                success: false,
                message: 'facultyId, subjectId, and academicYear are strictly required.'
            });
        }

        // 2. Sanitize inputs
        const cleanFacultyId = facultyId.trim();
        const cleanSubjectId = subjectId.trim();
        const academicYearStr = academicYear.toString().trim();

        // ------------------------------------------------------------------
        // 3. NEW GLOBAL CONFLICT CHECK
        // Dynamically build the query key (e.g., "assignments.2026")
        const queryKey = `assignments.${academicYearStr}`;
        
        // Search the ENTIRE database to see if this subject is in this year's array anywhere
        const existingAssignment = await assignSubject.findOne({
            [queryKey]: cleanSubjectId
        });

        // If we found a match, block the request immediately
        if (existingAssignment) {
            return res.status(409).json({
                success: false,
                message: `Conflict: Subject ${cleanSubjectId} is already assigned to faculty ${existingAssignment.facultyId} for the year ${academicYearStr}.`
            });
        }
        // ------------------------------------------------------------------

        // 4. Find the teacher (We now know it is safe to assign the subject)
        let teacherDoc = await assignSubject.findOne({ facultyId: cleanFacultyId });

        // 5. Create new document if teacher doesn't exist
        if (!teacherDoc) {
            teacherDoc = new assignSubject({
                facultyId: cleanFacultyId,
                assignments: {} 
            });
            
            // Set the first subject for this year
            teacherDoc.assignments.set(academicYearStr, [cleanSubjectId]);
        } else {
            // 6. If teacher exists, get the array for the year (or default to empty array)
            // Note: We removed the localized duplicate check because the Global Check above handles it!
            const yearSubjects = teacherDoc.assignments.get(academicYearStr) || [];
            
            // Push the new subject and update the Map
            yearSubjects.push(cleanSubjectId);
            teacherDoc.assignments.set(academicYearStr, yearSubjects);
        }

        // 7. Save to database
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
            actualError: error.message,
            stack: error.stack
        });
    }
}

// module.exports = { handleAssignSubject };

// 7. Export the module so your Express router can access it
// module.exports = { handleAssignSubject };



//   try {
//         const { subjectId, subjectIds, facultyId, year } = req.body;

//         // Normalize the input into an array
//         let subjectsToAdd = [];
//         if (subjectIds && Array.isArray(subjectIds)) {
//             subjectsToAdd = subjectIds;
//         } else if (subjectId) {
//             subjectsToAdd = [subjectId];
//         }

//         // Validation check
//         if (subjectsToAdd.length === 0 || !year) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide a year and subjectId(s)."
//             });
//         }

//         // 1. Find the faculty document
//         let assignSub = await assignSubject.findOne({ facultyId: facultyId });

//         if (!assignSub) {
//             // SCENARIO A: Faculty doesn't exist yet. Create a new document.
//             assignSub = new assignSubject({
//                 facultyId: facultyId,
//                 assignments: [{
//                     year: Number(year),
//                     subjectIds: subjectsToAdd
//                 }]
//             });
//         } else {
//             // SCENARIO B: Faculty exists. Check if the year already exists in their array.
//             const yearIndex = assignSub.assignments.findIndex(a => a.year === Number(year));

//             if (yearIndex > -1) {
//                 // Year exists! Add new subjects, preventing exact duplicates
//                 subjectsToAdd.forEach(newSubject => {
//                     if (!assignSub.assignments[yearIndex].subjectIds.includes(newSubject)) {
//                         assignSub.assignments[yearIndex].subjectIds.push(newSubject);
//                     }
//                 });
//             } else {
//                 // Year does NOT exist yet for this faculty. Push a new year object.
//                 assignSub.assignments.push({
//                     year: Number(year),
//                     subjectIds: subjectsToAdd
//                 });
//             }
//         }

//         // 2. Save the document to the database
//         await assignSub.save();

//         res.status(200).json({
//             success: true,
//             message: "Subject(s) assigned successfully!",
//             data: {
//                 facultyId: assignSub.facultyId,
//                 assignments: assignSub.assignments
//             }
//         });

//     } catch (error) {
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Database index error. Make sure you dropped old unique indexes."
//             });
//         }

//         return res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error.message
//         });      
//     }
// }

// 2. Get ALL Assignments in the database
async function getAllFacultyAssignments(req, res) {
    try {
        const { year } = req.query; // Check if the frontend asked for a specific year

        // 1. Fetch all faculty records
        // .lean() makes the query faster by returning plain JS objects instead of heavy Mongoose documents
        const allRecords = await assignSubject.find({}).lean();

        if (!allRecords || allRecords.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No assigned subjects found in the database."
            });
        }

        let dataToSend = allRecords;

        // 2. If a year was requested, filter the nested arrays
        if (year) {
            const targetYear = Number(year);

            dataToSend = allRecords.map(faculty => {
                // Find only the assignment object for the requested year
                const yearData = faculty.assignments.find(a => a.year === targetYear);

                return {
                    facultyId: faculty.facultyId,
                    // If they taught that year, put it in an array. If not, return an empty array.
                    assignments: yearData ? [yearData] : []
                };
            })
                // Optional: Remove faculty members who have no assignments for that specific year
                .filter(faculty => faculty.assignments.length > 0);
        }

        res.status(200).json({
            success: true,
            count: dataToSend.length,
            data: dataToSend
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching assignments",
            error: error.message
        });
    }
}

// 3. Get ALL Subjects for a Specific Faculty Member
async function getAssignedSubjectsByFaculty(req, res) {
    try {
        const { facultyId } = req.params;
        const { year } = req.query; // Optional: Check if the frontend asked for a specific year

        // 1. Use .findOne() because there is now exactly ONE document per faculty
        const facultyRecord = await assignSubject.findOne({ facultyId: facultyId });

        // 2. Check if the faculty exists and has assignments
        if (!facultyRecord || !facultyRecord.assignments || facultyRecord.assignments.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No assigned subjects found for faculty ID: ${facultyId}`
            });
        }

        // 3. Handle optional year filtering
        let dataToSend = facultyRecord.assignments;

        if (year) {
            // Find the specific object in the array that matches the requested year
            const yearData = facultyRecord.assignments.find(a => a.year === Number(year));

            if (!yearData) {
                return res.status(404).json({
                    success: false,
                    message: `No subjects found for faculty ID ${facultyId} in the year ${year}`
                });
            }
            // Wrap in an array so the frontend always receives the same data structure type
            dataToSend = [yearData];
        }

        // 4. Send the successful response
        res.status(200).json({
            success: true,
            facultyId: facultyRecord.facultyId,
            totalYearsRecorded: dataToSend.length,
            data: dataToSend
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching the faculty's subjects",
            error: error.message
        });
    }
}

// 4. Delete a Specific Assignment Document
async function removeSubjectFromFaculty(req, res) {
    try {
        // We now need the year to know WHICH nested array to remove the subject from
        const { facultyId, subjectId, year } = req.body;

        // Validation check
        if (!facultyId || !subjectId || !year) {
            return res.status(400).json({
                success: false,
                message: "Please provide facultyId, subjectId, and year."
            });
        }

        // 1. Find the faculty document
        const facultyRecord = await assignSubject.findOne({ facultyId: facultyId });

        if (!facultyRecord) {
            return res.status(404).json({
                success: false,
                message: `Could not find faculty with ID: ${facultyId}`
            });
        }

        // 2. Find the index of the specific year in the assignments array
        const yearIndex = facultyRecord.assignments.findIndex(a => a.year === Number(year));

        if (yearIndex === -1) {
            return res.status(404).json({
                success: false,
                message: `No assignments found for the year ${year}.`
            });
        }

        // 3. Check if the subject actually exists in that year's array
        const subjectExists = facultyRecord.assignments[yearIndex].subjectIds.includes(subjectId);

        if (!subjectExists) {
            return res.status(404).json({
                success: false,
                message: `Subject ${subjectId} is not assigned to this faculty for the year ${year}.`
            });
        }

        // 4. Remove the subject by filtering it out
        facultyRecord.assignments[yearIndex].subjectIds = facultyRecord.assignments[yearIndex].subjectIds.filter(
            id => id !== subjectId
        );

        // 5. PRO TIP: Database Cleanup
        // If removing this subject leaves the year completely empty, remove the year object entirely!
        if (facultyRecord.assignments[yearIndex].subjectIds.length === 0) {
            facultyRecord.assignments.splice(yearIndex, 1);
        }

        // 6. Save the updated document
        await facultyRecord.save();

        res.status(200).json({
            success: true,
            message: "Subject removed successfully.",
            data: facultyRecord
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while deleting assignment",
            error: error.message
        });
    }
}

module.exports = {
    handleAssignSubject,
    getAllFacultyAssignments,
    getAssignedSubjectsByFaculty,
    removeSubjectFromFaculty
};