const assignSubject = require('../models/assignSubject'); 
const Faculty = require('../models/user'); 
const Subject = require('../models/subject'); 
const logActivity = require('../utils/activityLogger');

// ---------------------------------------------------------------------------
// 1. Assign Subject
// ---------------------------------------------------------------------------
async function handleAssignSubject(req, res) {
    try {
        const { facultyId, subjectId, subjectName, course, academicYear } = req.body;

        if (!facultyId || !subjectId || !subjectName || !course || academicYear === undefined) {
            return res.status(400).json({
                success: false,
                message: 'facultyId, subjectId, subjectName, course, and academicYear are strictly required.'
            });
        }

        const cleanFacultyId = facultyId.trim();
        const cleanSubjectId = subjectId.trim();
        const cleanSubjectName = subjectName.trim().replace(/\s+/g, ' '); 
        const cleanCourse = course.trim().toUpperCase(); 
        const academicYearStr = academicYear.toString().trim();

        // 1. Global Conflict Check: Ensure this exact subject isn't already taught by someone else this year/course
        const queryKey = `assignments.${academicYearStr}.${cleanCourse}`;
        const existingAssignment = await assignSubject.findOne({
            [queryKey]: { $elemMatch: { subjectId: cleanSubjectId } }
        }).lean(); // .lean() optimizes read-only queries

        if (existingAssignment) {
            return res.status(409).json({
                success: false,
                message: `Conflict: Subject ${cleanSubjectId} is already assigned to faculty ${existingAssignment.facultyId} for the year ${academicYearStr} in course ${cleanCourse}.`
            });
        }

        // 2. Fetch or Create Faculty Assignment Document
        let teacherDoc = await assignSubject.findOne({ facultyId: cleanFacultyId });

        if (!teacherDoc) {
            // Brand new faculty assignment: Setup initial structure
            const facultyDetails = await Faculty.findOne({ facultyId: cleanFacultyId }).lean();
            
            teacherDoc = new assignSubject({
                facultyId: cleanFacultyId,
                facultyName: facultyDetails?.name || "Unknown Faculty",
                totalYearsRecorded: 1,
                assignments: {
                    [academicYearStr]: {
                        [cleanCourse]: [{ subjectId: cleanSubjectId, subjectName: cleanSubjectName }]
                    }
                }
            });
        } else {
            // 3. Existing Document: Update nested map structures safely
            if (!teacherDoc.assignments.has(academicYearStr)) {
                teacherDoc.assignments.set(academicYearStr, new Map());
            }
            
            const yearMap = teacherDoc.assignments.get(academicYearStr);
            const courseSubjects = yearMap.get(cleanCourse) || [];
            
            // Prevent duplicate subjects for this faculty in this course
            const alreadyExists = courseSubjects.some(sub => sub.subjectId === cleanSubjectId);
            
            if (!alreadyExists) {
                courseSubjects.push({ subjectId: cleanSubjectId, subjectName: cleanSubjectName });
                yearMap.set(cleanCourse, courseSubjects);
                
                // Alert Mongoose that the nested dynamic map changed so it saves properly
                teacherDoc.markModified(`assignments.${academicYearStr}`);
            }
            
            teacherDoc.totalYearsRecorded = teacherDoc.assignments.size;
        }

        await teacherDoc.save();

        // 4. Log the action asynchronously
        await logActivity(
            req.user, 
            'ASSIGNED_SUBJECT', 
            `${cleanSubjectId} - ${cleanSubjectName} (${cleanCourse}) assigned to ${teacherDoc.facultyName}`,
            [] 
        );

        return res.status(200).json({ success: true, message: 'Subject assigned successfully.', data: teacherDoc });

    } catch (error) {
        console.error('Assign Subject Error:', error);
        return res.status(500).json({ success: false, message: 'Server error while assigning subject.', actualError: error.message });
    }
}

// ---------------------------------------------------------------------------
// 2. Get All Faculty Assignments
// ---------------------------------------------------------------------------
async function getAllFacultyAssignments(req, res) {
    try {
        const { academicYear, course } = req.query;
        let dbQuery = {};

        // OPTIMIZATION: Filter at the Database level instead of RAM.
        // This ensures MongoDB only returns documents that actually match the requested year/course.
        if (academicYear) {
            const yearStr = academicYear.toString().trim();
            if (course) {
                const courseStr = course.toString().toUpperCase().trim();
                dbQuery[`assignments.${yearStr}.${courseStr}`] = { $exists: true };
            } else {
                dbQuery[`assignments.${yearStr}`] = { $exists: true };
            }
        }

        // Bypass Mongoose Map stripping by using native driver collection
        const allRecords = await assignSubject.collection.find(dbQuery).toArray();

        if (!allRecords.length) {
            return res.status(404).json({ success: false, message: "No assigned subjects found matching criteria." });
        }

        let dataToSend = allRecords;

        // If filters were applied, we trim the payload to ONLY show the requested year/course data
        if (academicYear) {
            const yearStr = academicYear.toString().trim();
            const courseStr = course ? course.toString().toUpperCase().trim() : null;

            dataToSend = allRecords.map(faculty => {
                const filteredAssignments = courseStr 
                    ? { [yearStr]: { [courseStr]: faculty.assignments[yearStr][courseStr] } }
                    : { [yearStr]: faculty.assignments[yearStr] };

                return {
                    _id: faculty._id,
                    facultyId: faculty.facultyId,
                    facultyName: faculty.facultyName,
                    totalYearsRecorded: faculty.totalYearsRecorded,
                    assignments: filteredAssignments,
                    createdAt: faculty.createdAt,
                    updatedAt: faculty.updatedAt
                };
            });
        }

        return res.status(200).json({ success: true, count: dataToSend.length, data: dataToSend });

    } catch (error) {
        console.error('Fetch All Assignments Error:', error);
        return res.status(500).json({ success: false, message: "Server error", actualError: error.message });
    }
}

// ---------------------------------------------------------------------------
// 3. Get Assignments By Single Faculty
// ---------------------------------------------------------------------------
async function getAssignedSubjectsByFaculty(req, res) {
    try {
        const { facultyId } = req.params;
        const { academicYear, course } = req.query; 

        // Raw DB object bypasses Mongoose schema parsing bugs
        const facultyRecord = await assignSubject.collection.findOne({ facultyId: facultyId.trim() });

        if (!facultyRecord?.assignments || Object.keys(facultyRecord.assignments).length === 0) {
            return res.status(404).json({ success: false, message: `No assigned subjects found for faculty ID: ${facultyId}` });
        }

        let filteredAssignments = facultyRecord.assignments;

        // Drill down into specific year/course if requested
        if (academicYear) {
            const yearStr = academicYear.toString().trim();
            if (!facultyRecord.assignments[yearStr]) {
                return res.status(404).json({ success: false, message: `No subjects found in year ${yearStr}` });
            }

            if (course) {
                const courseStr = course.toString().toUpperCase().trim();
                if (!facultyRecord.assignments[yearStr][courseStr]) {
                    return res.status(404).json({ success: false, message: `No subjects found for course ${courseStr} in ${yearStr}` });
                }
                filteredAssignments = { [yearStr]: { [courseStr]: facultyRecord.assignments[yearStr][courseStr] } };
            } else {
                filteredAssignments = { [yearStr]: facultyRecord.assignments[yearStr] };
            }
        }

        facultyRecord.assignments = filteredAssignments;

        return res.status(200).json({ success: true, data: facultyRecord });

    } catch (error) {
        console.error('Fetch Faculty Subject Error:', error);
        return res.status(500).json({ success: false, message: "Server error", actualError: error.message });
    }
}

// ---------------------------------------------------------------------------
// 4. Remove Subject From Faculty
// ---------------------------------------------------------------------------
async function removeSubjectFromFaculty(req, res) {
    try {
        const { facultyId, subjectId, course, academicYear } = req.body;

        if (!facultyId || !subjectId || !course || academicYear === undefined) {
            return res.status(400).json({ success: false, message: "facultyId, subjectId, course, and academicYear required." });
        }

        const cleanCourse = course.trim().toUpperCase(); 
        const academicYearStr = academicYear.toString().trim();

        const facultyRecord = await assignSubject.findOne({ facultyId: facultyId.trim() });
        if (!facultyRecord) return res.status(404).json({ success: false, message: "Faculty not found" });

        // Ensure the path exists before attempting deletion
        if (!facultyRecord.assignments.has(academicYearStr)) return res.status(404).json({ success: false, message: "Year not found" });
        
        const yearMap = facultyRecord.assignments.get(academicYearStr);
        if (!yearMap.has(cleanCourse)) return res.status(404).json({ success: false, message: "Course not found" });

        let courseSubjects = yearMap.get(cleanCourse);
        const subjectToRemove = courseSubjects.find(sub => sub.subjectId === subjectId.trim());
        
        if (!subjectToRemove) return res.status(404).json({ success: false, message: "Subject not assigned to this faculty." });

        // Filter out the deleted subject
        courseSubjects = courseSubjects.filter(sub => sub.subjectId !== subjectId.trim());

        // Garbage Collection: Remove empty objects to keep database clean
        if (courseSubjects.length === 0) {
            yearMap.delete(cleanCourse); // No subjects left, remove course
            
            if (yearMap.size === 0) {
                facultyRecord.assignments.delete(academicYearStr); // No courses left, remove year
            } else {
                facultyRecord.assignments.set(academicYearStr, yearMap);
            }
        } else {
            yearMap.set(cleanCourse, courseSubjects);
            facultyRecord.assignments.set(academicYearStr, yearMap);
        }

        // Notify Mongoose of the structural change
        facultyRecord.markModified('assignments');
        facultyRecord.totalYearsRecorded = facultyRecord.assignments.size;
        
        await facultyRecord.save();

        await logActivity(req.user, 'REMOVED_SUBJECT', `${subjectId} removed from ${facultyRecord.facultyName}`, []);

        return res.status(200).json({ success: true, message: "Subject removed successfully.", data: facultyRecord });

    } catch (error) {
        console.error('Remove Subject Error:', error);
        return res.status(500).json({ success: false, message: "Server error", actualError: error.message });
    }
}

// ---------------------------------------------------------------------------
// 5. Get Dropdown Options
// ---------------------------------------------------------------------------
const getDropdownData = async (req, res) => {
    try {
        const { year, course } = req.query;
        // Native collection fetch for safe Map traversal
        const record = await assignSubject.collection.findOne({ facultyId: req.facultyId });

        if (!record?.assignments) return res.status(200).json({ success: true, type: 'empty', data: [] });

        const assignments = record.assignments; 

        // Determine dropdown data level based on provided query params
        if (year && course) {
            // Scenario A: Wants Subjects for a specific year and course
            const subjects = assignments[String(year).trim()]?.[String(course).toUpperCase().trim()] || [];
            return res.status(200).json({ success: true, type: 'subjects', data: subjects });
        }
        
        if (year && !course) {
            // Scenario B: Wants Courses for a specific year
            const courses = Object.keys(assignments[String(year).trim()] || {});
            return res.status(200).json({ success: true, type: 'courses', data: courses });
        }

        // Scenario C: Wants all active Years
        return res.status(200).json({ success: true, type: 'years', data: Object.keys(assignments) });

    } catch (error) {
        console.error("Dropdown Error:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ---------------------------------------------------------------------------
// 6. Get Assignments By Year (Note: Now mostly redundant given Function #2)
// ---------------------------------------------------------------------------
async function handleGetFacultyAssignmentsByYear(req, res) {
    try {
        const { academicYear } = req.query;
        if (!academicYear) return res.status(400).json({ success: false, message: "academicYear is required" });

        const yearStr = academicYear.toString().trim();
        
        // Optimize: Only fetch documents that actually contain this year
        const allRecords = await assignSubject.collection.find({ 
            [`assignments.${yearStr}`]: { $exists: true } 
        }).toArray();

        if (!allRecords.length) {
            return res.status(404).json({ success: false, message: "No assigned subjects found for this year." });
        }

        // Trim data to only include the requested year
        const dataToSend = allRecords.map(faculty => ({
            _id: faculty._id,
            facultyId: faculty.facultyId,
            facultyName: faculty.facultyName,
            totalYearsRecorded: faculty.totalYearsRecorded,
            assignments: { [yearStr]: faculty.assignments[yearStr] },
            createdAt: faculty.createdAt,
            updatedAt: faculty.updatedAt
        }));

        return res.status(200).json({ success: true, count: dataToSend.length, data: dataToSend });

    } catch (error) {
        console.error('Fetch Assignments By Year Error:', error);
        return res.status(500).json({ success: false, message: "Server error", actualError: error.message });
    }
}

module.exports = {
    handleAssignSubject,
    getAllFacultyAssignments,
    getAssignedSubjectsByFaculty,
    removeSubjectFromFaculty,
    getDropdownData,
    handleGetFacultyAssignmentsByYear,
};