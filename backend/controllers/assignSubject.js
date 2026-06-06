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


// 2. Get ALL Assignments in the database
async function getAllFacultyAssignments(req, res) {
    try {
        const { academicYear } = req.query; // Updated to match our new naming convention

        // .lean() returns plain JS objects. Maps become standard objects.
        const allRecords = await assignSubject.find({}).lean();

        if (!allRecords || allRecords.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No assigned subjects found in the database."
            });
        }

        let dataToSend = allRecords;

        // If a specific year was requested, filter using object keys
        if (academicYear) {
            const academicYearStr = academicYear.toString().trim();

            dataToSend = allRecords.reduce((filteredRecords, faculty) => {
                // Check if the assignments object has this specific year as a key
                if (faculty.assignments && faculty.assignments[academicYearStr]) {
                    filteredRecords.push({
                        facultyId: faculty.facultyId,
                        // Return just that year's data in the new flat structure
                        assignments: {
                            [academicYearStr]: faculty.assignments[academicYearStr]
                        }
                    });
                }
                return filteredRecords;
            }, []); // Start with an empty array
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
// 3. Get ALL Subjects for a Specific Faculty Member
async function getAssignedSubjectsByFaculty(req, res) {
    try {
        const { facultyId } = req.params;
        const { academicYear } = req.query;

        const cleanFacultyId = facultyId.trim();
        const facultyRecord = await assignSubject.findOne({ facultyId: cleanFacultyId });

        // Maps use .size instead of .length to check if they are empty
        if (!facultyRecord || !facultyRecord.assignments || facultyRecord.assignments.size === 0) {
            return res.status(404).json({
                success: false,
                message: `No assigned subjects found for faculty ID: ${cleanFacultyId}`
            });
        }

        let dataToSend;

        // Handle optional year filtering directly with Map lookups
        if (academicYear) {
            const academicYearStr = academicYear.toString().trim();

            if (!facultyRecord.assignments.has(academicYearStr)) {
                return res.status(404).json({
                    success: false,
                    message: `No subjects found for faculty ID ${cleanFacultyId} in the year ${academicYearStr}`
                });
            }
            
            // Reconstruct the flat structure for the response
            dataToSend = {
                [academicYearStr]: facultyRecord.assignments.get(academicYearStr)
            };
        } else {
            // Convert the Map to a standard plain Object so it sends cleanly in JSON
            dataToSend = Object.fromEntries(facultyRecord.assignments);
        }

        return res.status(200).json({
            success: true,
            facultyId: facultyRecord.facultyId,
            totalYearsRecorded: Object.keys(dataToSend).length,
            data: dataToSend
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

        // Validation check
        if (!facultyId || !subjectId || academicYear === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide facultyId, subjectId, and academicYear."
            });
        }

        const cleanFacultyId = facultyId.trim();
        const cleanSubjectId = subjectId.trim();
        const academicYearStr = academicYear.toString().trim();

        // 1. Find the faculty document
        const facultyRecord = await assignSubject.findOne({ facultyId: cleanFacultyId });

        if (!facultyRecord) {
            return res.status(404).json({
                success: false,
                message: `Could not find faculty with ID: ${cleanFacultyId}`
            });
        }

        // 2. Check if the Map has this specific year key
        if (!facultyRecord.assignments.has(academicYearStr)) {
            return res.status(404).json({
                success: false,
                message: `No assignments found for the year ${academicYearStr}.`
            });
        }

        // 3. Extract the array of subjects for that year
        let yearSubjects = facultyRecord.assignments.get(academicYearStr);

        // 4. Check if the subject actually exists in that array
        if (!yearSubjects.includes(cleanSubjectId)) {
            return res.status(404).json({
                success: false,
                message: `Subject ${cleanSubjectId} is not assigned to this faculty for the year ${academicYearStr}.`
            });
        }

        // 5. Remove the subject by filtering it out
        yearSubjects = yearSubjects.filter(id => id !== cleanSubjectId);

        // 6. PRO TIP: Database Cleanup
        // If removing this subject leaves the year completely empty, delete the year key from the Map!
        if (yearSubjects.length === 0) {
            facultyRecord.assignments.delete(academicYearStr);
        } else {
            // Otherwise, update the Map with the new filtered array
            facultyRecord.assignments.set(academicYearStr, yearSubjects);
        }

        // 7. Save the updated document
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
    removeSubjectFromFaculty
};