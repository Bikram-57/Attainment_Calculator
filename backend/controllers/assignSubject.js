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


// const assignSubject = require('../models/assignSubject'); 
// const Faculty = require('../models/user'); 
// const Subject = require('../models/subject'); 
// const logActivity = require('../utils/activityLogger');
//     // controllers/assignmentController.js
// // const FacultyAssignment = require('../models/FacultyAssignment'); 




// // 1. Assign Subject

// //done
// async function handleAssignSubject(req, res) {
//     try {
//         const { facultyId, subjectId, subjectName, course, academicYear } = req.body;

//         if (!facultyId || !subjectId || !subjectName || !course || academicYear === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'facultyId, subjectId, subjectName, course, and academicYear are strictly required.'
//             });
//         }

//         const cleanFacultyId = facultyId.trim();
//         const cleanSubjectId = subjectId.trim();
//         const cleanSubjectName = subjectName.trim().replace(/\s+/g, ' '); 
//         const cleanCourse = course.trim(); 
//         const academicYearStr = academicYear.toString().trim();

//         // 1. Updated Global Conflict Check for Nested Map
//         // The path in DB is now: assignments.2026.MCA
//         const queryKey = `assignments.${academicYearStr}.${cleanCourse}`;
//         const existingAssignment = await assignSubject.findOne({
//             [queryKey]: { $elemMatch: { subjectId: cleanSubjectId } }
//         });

//         if (existingAssignment) {
//             return res.status(409).json({
//                 success: false,
//                 message: `Conflict: Subject ${cleanSubjectId} is already assigned to faculty ${existingAssignment.facultyId} for the year ${academicYearStr} in course ${cleanCourse}.`
//             });
//         }

//         let teacherDoc = await assignSubject.findOne({ facultyId: cleanFacultyId });

//         if (!teacherDoc) {
//             // Fetch name for the BRAND NEW document
//             const facultyDetails = await Faculty.findOne({ facultyId: cleanFacultyId }).lean();
//             const fetchedName = facultyDetails ? facultyDetails.name : "Unknown Faculty";

//             teacherDoc = new assignSubject({
//                 facultyId: cleanFacultyId,
//                 facultyName: fetchedName,
//                 totalYearsRecorded: 1,
//                 assignments: {} 
//             });
            
//             // 2. Create the inner map for the new document
//             const courseMap = new Map();
//             courseMap.set(cleanCourse, [{ 
//                 subjectId: cleanSubjectId, 
//                 subjectName: cleanSubjectName 
//             }]);
            
//             // Set the outer map
//             teacherDoc.assignments.set(academicYearStr, courseMap);
            
//         } else {
//             // 3. Document exists: Handle Nested Map Logic
            
//             // Ensure the year exists in the outer map
//             if (!teacherDoc.assignments.has(academicYearStr)) {
//                 teacherDoc.assignments.set(academicYearStr, new Map());
//             }
            
//             // Get the inner map for this specific year
//             const yearMap = teacherDoc.assignments.get(academicYearStr);
            
//             // Get the array of subjects for this course (or default to empty array)
//             const courseSubjects = yearMap.get(cleanCourse) || [];
            
//             // Prevent duplicate subjects within this specific course
//             const alreadyExists = courseSubjects.some(sub => sub.subjectId === cleanSubjectId);
            
//             if (!alreadyExists) {
//                 courseSubjects.push({ 
//                     subjectId: cleanSubjectId, 
//                     subjectName: cleanSubjectName 
//                 });
                
//                 // Update the inner map
//                 yearMap.set(cleanCourse, courseSubjects);
                
//                 // CRITICAL: Tell Mongoose the nested map was modified, otherwise it won't save
//                 teacherDoc.markModified(`assignments.${academicYearStr}`);
//             }
            
//             // Update the total years count
//             teacherDoc.totalYearsRecorded = teacherDoc.assignments.size;
//         }

//         await teacherDoc.save();

//         // Activity Logging Trigger
//         await logActivity(
//             req.user, 
//             'ASSIGNED_SUBJECT', 
//             `${cleanSubjectId} - ${cleanSubjectName} (${cleanCourse}) assigned to ${teacherDoc.facultyName}`,
//             [] 
//         );

//         return res.status(200).json({
//             success: true,
//             message: 'Subject assigned successfully.',
//             data: teacherDoc
//         });

//     } catch (error) {
//         console.error('Full Error Detail:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Server error while assigning subject.',
//             actualError: error.message
//         });
//     }
// }




// //done
// async function getAllFacultyAssignments(req, res) {
//     try {
//         // Added 'course' parameter support
//         const { academicYear, course } = req.query;

//         // 🔥 THE BYPASS: .collection.find({}).toArray() 
//         // This guarantees Mongoose does not strip out your nested course Maps.
//         const allRecords = await assignSubject.collection.find({}).toArray();

//         if (!allRecords || allRecords.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No assigned subjects found in the database."
//             });
//         }

//         let dataToSend = [];

//         if (academicYear) {
//             const yearStr = academicYear.toString().trim();
//             const courseStr = course ? course.toString().toUpperCase().trim() : null;

//             dataToSend = allRecords.reduce((filteredRecords, faculty) => {
//                 // Ensure the faculty has assignments for this specific year
//                 if (faculty.assignments && faculty.assignments[yearStr]) {
                    
//                     // SCENARIO 1: Filter by Year AND Course
//                     if (courseStr) {
//                         if (faculty.assignments[yearStr][courseStr]) {
//                             filteredRecords.push({
//                                 _id: faculty._id,
//                                 facultyId: faculty.facultyId,
//                                 facultyName: faculty.facultyName,
//                                 totalYearsRecorded: faculty.totalYearsRecorded,
//                                 assignments: {
//                                     [yearStr]: {
//                                         [courseStr]: faculty.assignments[yearStr][courseStr]
//                                     }
//                                 },
//                                 createdAt: faculty.createdAt,
//                                 updatedAt: faculty.updatedAt
//                             });
//                         }
//                     } 
//                     // SCENARIO 2: Filter by Year only (returns all courses for that year)
//                     else {
//                         filteredRecords.push({
//                             _id: faculty._id,
//                             facultyId: faculty.facultyId,
//                             facultyName: faculty.facultyName,
//                             totalYearsRecorded: faculty.totalYearsRecorded,
//                             assignments: {
//                                 [yearStr]: faculty.assignments[yearStr]
//                             },
//                             createdAt: faculty.createdAt,
//                             updatedAt: faculty.updatedAt
//                         });
//                     }
//                 }
//                 return filteredRecords;
//             }, []);
//         } else {
//             // SCENARIO 3: No filters, return everything exactly as it is in DB
//             dataToSend = allRecords;
//         }

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



// //done
// async function getAssignedSubjectsByFaculty(req, res) {
//     try {
//         const { facultyId } = req.params;
//         // Added 'course' query parameter support to match the new schema structure
//         const { academicYear, course } = req.query; 

//         const cleanFacultyId = facultyId.trim();
        
//         // 🔥 THE BYPASS: Use .collection.findOne() so Mongoose doesn't strip your nested Maps
//         const facultyRecord = await assignSubject.collection.findOne({ facultyId: cleanFacultyId });

//         if (!facultyRecord || !facultyRecord.assignments || Object.keys(facultyRecord.assignments).length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No assigned subjects found for faculty ID: ${cleanFacultyId}`
//             });
//         }

//         let filteredAssignments = {};

//         // SCENARIO 1: Filter by Year
//         if (academicYear) {
//             const yearStr = academicYear.toString().trim();

//             if (!facultyRecord.assignments[yearStr]) {
//                 return res.status(404).json({
//                     success: false,
//                     message: `No subjects found for faculty ID ${cleanFacultyId} in the year ${yearStr}`
//                 });
//             }

//             // SCENARIO 2: Filter by Year AND Course
//             if (course) {
//                 const courseStr = course.toString().toUpperCase().trim();
                
//                 if (!facultyRecord.assignments[yearStr][courseStr]) {
//                     return res.status(404).json({
//                         success: false,
//                         message: `No subjects found for course ${courseStr} in the year ${yearStr}`
//                     });
//                 }
                
//                 // Return just that specific year and course
//                 filteredAssignments = {
//                     [yearStr]: {
//                         [courseStr]: facultyRecord.assignments[yearStr][courseStr]
//                     }
//                 };
//             } else {
//                 // Return all courses for that specific year
//                 filteredAssignments = {
//                     [yearStr]: facultyRecord.assignments[yearStr]
//                 };
//             }
//         } else {
//             // SCENARIO 3: No filters, return everything
//             filteredAssignments = facultyRecord.assignments;
//         }

//         const responseData = {
//             _id: facultyRecord._id,
//             facultyId: facultyRecord.facultyId,
//             facultyName: facultyRecord.facultyName,
//             totalYearsRecorded: facultyRecord.totalYearsRecorded,
//             assignments: filteredAssignments, 
//             createdAt: facultyRecord.createdAt,
//             updatedAt: facultyRecord.updatedAt,
//             // (Skipped __v because .collection doesn't always return it, and the frontend rarely needs it)
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





// async function removeSubjectFromFaculty(req, res) {
//     try {
//         // 1. ADDED 'course' to the required inputs
//         const { facultyId, subjectId, course, academicYear } = req.body;

//         if (!facultyId || !subjectId || !course || academicYear === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide facultyId, subjectId, course, and academicYear."
//             });
//         }

//         const cleanFacultyId = facultyId.trim();
//         const cleanSubjectId = subjectId.trim();
//         const cleanCourse = course.trim().toUpperCase(); 
//         const academicYearStr = academicYear.toString().trim();

//         // Find the faculty document
//         const facultyRecord = await assignSubject.findOne({ facultyId: cleanFacultyId });

//         if (!facultyRecord) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Could not find faculty with ID: ${cleanFacultyId}`
//             });
//         }

//         // 2. CHECK YEAR LEVEL
//         if (!facultyRecord.assignments.has(academicYearStr)) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No assignments found for the year ${academicYearStr}.`
//             });
//         }

//         // Get the inner map (the courses)
//         const yearMap = facultyRecord.assignments.get(academicYearStr);

//         // 3. CHECK COURSE LEVEL
//         if (!yearMap.has(cleanCourse)) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No assignments found for course ${cleanCourse} in the year ${academicYearStr}.`
//             });
//         }

//         let courseSubjects = yearMap.get(cleanCourse);

//         // 4. FIND AND REMOVE THE SUBJECT
//         const subjectToRemove = courseSubjects.find(sub => sub.subjectId === cleanSubjectId);
        
//         if (!subjectToRemove) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject ${cleanSubjectId} is not assigned to this faculty for ${academicYearStr} - ${cleanCourse}.`
//             });
//         }

//         const removedSubjectName = subjectToRemove.subjectName;

//         // Filter the object OUT of the array
//         courseSubjects = courseSubjects.filter(sub => sub.subjectId !== cleanSubjectId);

//         // 5. NESTED GARBAGE COLLECTION (Keeps DB clean)
//         if (courseSubjects.length === 0) {
//             // If no subjects left in this course, delete the course key entirely
//             yearMap.delete(cleanCourse);
            
//             // If no courses left in this year, delete the year key entirely
//             if (yearMap.size === 0) {
//                 facultyRecord.assignments.delete(academicYearStr);
//             } else {
//                 facultyRecord.assignments.set(academicYearStr, yearMap);
//             }
//         } else {
//             // Otherwise, just save the updated array back to the course
//             yearMap.set(cleanCourse, courseSubjects);
//             facultyRecord.assignments.set(academicYearStr, yearMap);
//         }

//         // THE FIX: Mark the root 'assignments' map as modified, NOT the specific year string
//         facultyRecord.markModified('assignments');

//         // Keep the total years count accurate after deletion
//         facultyRecord.totalYearsRecorded = facultyRecord.assignments.size;

//         await facultyRecord.save();

//         // 6. LOGGING
//         await logActivity(
//             req.user, 
//             'REMOVED_SUBJECT', 
//             `${cleanSubjectId} - ${removedSubjectName} (${cleanCourse}) removed from ${facultyRecord.facultyName}`, 
//             [] 
//         );

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


// //done
// const getDropdownData = async (req, res) => {
//   try {
//     const currentFacultyId = req.facultyId; 
//     const { year, course } = req.query;

//     // 🔥 THE ULTIMATE BYPASS 🔥
//     // Using .collection.findOne() bypasses the Mongoose schema completely.
//     // It returns a 100% raw JavaScript object straight from MongoDB.
//     const record = await assignSubject.collection.findOne({ facultyId: currentFacultyId });

//     if (!record || !record.assignments) {
//       return res.status(200).json({ success: true, type: 'empty', data: [] });
//     }

//     // Because we used .collection, we are guaranteed a normal JavaScript object.
//     // No Maps, no Mongoose bugs. Just pure data.
//     const assignments = record.assignments; 

//     // 1. SCENARIO A: Requesting Subjects
//     if (year && course) {
//       const targetYear = String(year).trim();
//       const targetCourse = String(course).toUpperCase().trim();

//       const yearData = assignments[targetYear];
//       const subjects = yearData ? yearData[targetCourse] : [];
      
//       return res.status(200).json({ 
//         success: true, 
//         type: 'subjects', 
//         data: subjects || [] 
//       });
//     }

//     // 2. SCENARIO B: Requesting Courses
//     if (year && !course) {
//       const targetYear = String(year).trim();
//       const yearData = assignments[targetYear];
      
//       const courses = yearData ? Object.keys(yearData) : [];
      
//       return res.status(200).json({ 
//         success: true, 
//         type: 'courses', 
//         data: courses 
//       });
//     }

//     // 3. SCENARIO C: Requesting Years
//     const years = Object.keys(assignments);
    
//     return res.status(200).json({ 
//       success: true, 
//       type: 'years', 
//       data: years 
//     });

//   } catch (error) {
//     console.error("Dropdown Error:", error);
//     res.status(500).json({ success: false, message: 'Server Error', error: error.message });
//   }
// };


// async function handleGetFacultyAssignmentsByYear(req, res) {
//     try {
//         // Only accept academicYear as a filter
//         const { academicYear } = req.query;

//         // 🔥 THE BYPASS: .collection.find({}).toArray() 
//         // This guarantees Mongoose does not strip out your nested course Maps.
//         const allRecords = await assignSubject.collection.find({}).toArray();

//         if (!allRecords || allRecords.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No assigned subjects found in the database."
//             });
//         }

//         let dataToSend = [];

//         if (academicYear) {
//             const yearStr = academicYear.toString().trim();

//             dataToSend = allRecords.reduce((filteredRecords, faculty) => {
//                 // Ensure the faculty has assignments for this specific year
//                 if (faculty.assignments && faculty.assignments[yearStr]) {
                    
//                     // Filter by Year only (keeps the faculty object but isolates the requested year)
//                     filteredRecords.push({
//                         _id: faculty._id,
//                         facultyId: faculty.facultyId,
//                         facultyName: faculty.facultyName,
//                         totalYearsRecorded: faculty.totalYearsRecorded,
//                         assignments: {
//                             [yearStr]: faculty.assignments[yearStr]
//                         },
//                         createdAt: faculty.createdAt,
//                         updatedAt: faculty.updatedAt
//                     });
//                 }
//                 return filteredRecords;
//             }, []);
//         } else {
//             // No filters applied, return everything exactly as it is in the DB
//             dataToSend = allRecords;
//         }

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



// module.exports = {
//     handleAssignSubject,
//     getAllFacultyAssignments,
//     getAssignedSubjectsByFaculty,
//     removeSubjectFromFaculty,
//     getDropdownData,
//     handleGetFacultyAssignmentsByYear,
// };