const assignSubject = require('../models/assignSubject'); 
const Faculty = require('../models/user'); 
const Subject = require('../models/subject'); 
const logActivity = require('../utils/activityLogger');
    // controllers/assignmentController.js
// const FacultyAssignment = require('../models/FacultyAssignment'); 




// 1. Assign Subject


// async function handleAssignSubject(req, res) {
//     try {
//         const { facultyId, subjectId, subjectName, academicYear } = req.body;

//         if (!facultyId || !subjectId || !subjectName || academicYear === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'facultyId, subjectId, subjectName, and academicYear are strictly required.'
//             });
//         }

//         const cleanFacultyId = facultyId.trim();
//         const cleanSubjectId = subjectId.trim();
//         const cleanSubjectName = subjectName.trim().replace(/\s+/g, ' '); 
//         const academicYearStr = academicYear.toString().trim();

//         // Global Conflict Check
//         const queryKey = `assignments.${academicYearStr}`;
//         const existingAssignment = await assignSubject.findOne({
//             [queryKey]: { $elemMatch: { subjectId: cleanSubjectId } }
//         });

//         if (existingAssignment) {
//             return res.status(409).json({
//                 success: false,
//                 message: `Conflict: Subject ${cleanSubjectId} is already assigned to faculty ${existingAssignment.facultyId} for the year ${academicYearStr}.`
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
//             teacherDoc.assignments.set(academicYearStr, [{ subjectId: cleanSubjectId, subjectName: cleanSubjectName }]);
//         } else {
//             const yearSubjects = teacherDoc.assignments.get(academicYearStr) || [];
//             const alreadyExists = yearSubjects.some(sub => sub.subjectId === cleanSubjectId);
            
//             if (!alreadyExists) {
//                 yearSubjects.push({ subjectId: cleanSubjectId, subjectName: cleanSubjectName });
//                 teacherDoc.assignments.set(academicYearStr, yearSubjects);
//             }
            
//             // Update the total years count
//             teacherDoc.totalYearsRecorded = teacherDoc.assignments.size;
//         }

//         await teacherDoc.save();

//         // ---> NEW ACTIVITY LOGGING TRIGGER <---
//         await logActivity(
//             req.user, // The ID from your verifyJWT middleware
//             'ASSIGNED_SUBJECT', 
//             `${cleanSubjectId} - ${cleanSubjectName} assigned to ${teacherDoc.facultyName}`, 
//             [] // Empty array keeps this notification private to the actor and admins
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
        const cleanCourse = course.trim(); 
        const academicYearStr = academicYear.toString().trim();

        // 1. Updated Global Conflict Check for Nested Map
        // The path in DB is now: assignments.2026.MCA
        const queryKey = `assignments.${academicYearStr}.${cleanCourse}`;
        const existingAssignment = await assignSubject.findOne({
            [queryKey]: { $elemMatch: { subjectId: cleanSubjectId } }
        });

        if (existingAssignment) {
            return res.status(409).json({
                success: false,
                message: `Conflict: Subject ${cleanSubjectId} is already assigned to faculty ${existingAssignment.facultyId} for the year ${academicYearStr} in course ${cleanCourse}.`
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
            
            // 2. Create the inner map for the new document
            const courseMap = new Map();
            courseMap.set(cleanCourse, [{ 
                subjectId: cleanSubjectId, 
                subjectName: cleanSubjectName 
            }]);
            
            // Set the outer map
            teacherDoc.assignments.set(academicYearStr, courseMap);
            
        } else {
            // 3. Document exists: Handle Nested Map Logic
            
            // Ensure the year exists in the outer map
            if (!teacherDoc.assignments.has(academicYearStr)) {
                teacherDoc.assignments.set(academicYearStr, new Map());
            }
            
            // Get the inner map for this specific year
            const yearMap = teacherDoc.assignments.get(academicYearStr);
            
            // Get the array of subjects for this course (or default to empty array)
            const courseSubjects = yearMap.get(cleanCourse) || [];
            
            // Prevent duplicate subjects within this specific course
            const alreadyExists = courseSubjects.some(sub => sub.subjectId === cleanSubjectId);
            
            if (!alreadyExists) {
                courseSubjects.push({ 
                    subjectId: cleanSubjectId, 
                    subjectName: cleanSubjectName 
                });
                
                // Update the inner map
                yearMap.set(cleanCourse, courseSubjects);
                
                // CRITICAL: Tell Mongoose the nested map was modified, otherwise it won't save
                teacherDoc.markModified(`assignments.${academicYearStr}`);
            }
            
            // Update the total years count
            teacherDoc.totalYearsRecorded = teacherDoc.assignments.size;
        }

        await teacherDoc.save();

        // Activity Logging Trigger
        await logActivity(
            req.user, 
            'ASSIGNED_SUBJECT', 
            `${cleanSubjectId} - ${cleanSubjectName} (${cleanCourse}) assigned to ${teacherDoc.facultyName}`,
            [] 
        );

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




// async function handleAssignSubject(req, res) {
//     try {
//         const { facultyId, subjectId, subjectName, academicYear } = req.body;

//         if (!facultyId || !subjectId || !subjectName || academicYear === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'facultyId, subjectId, subjectName, and academicYear are strictly required.'
//             });
//         }

//         const cleanFacultyId = facultyId.trim();
//         const cleanSubjectId = subjectId.trim();
//         const cleanSubjectName = subjectName.trim().replace(/\s+/g, ' '); 
//         const academicYearStr = academicYear.toString().trim();

//         // Global Conflict Check
//         const queryKey = `assignments.${academicYearStr}`;
//         const existingAssignment = await assignSubject.findOne({
//             [queryKey]: { $elemMatch: { subjectId: cleanSubjectId } }
//         });

//         if (existingAssignment) {
//             return res.status(409).json({
//                 success: false,
//                 message: `Conflict: Subject ${cleanSubjectId} is already assigned to faculty ${existingAssignment.facultyId} for the year ${academicYearStr}.`
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
//             teacherDoc.assignments.set(academicYearStr, [{ subjectId: cleanSubjectId, subjectName: cleanSubjectName }]);
//         } else {
//             const yearSubjects = teacherDoc.assignments.get(academicYearStr) || [];
//             const alreadyExists = yearSubjects.some(sub => sub.subjectId === cleanSubjectId);
            
//             if (!alreadyExists) {
//                 yearSubjects.push({ subjectId: cleanSubjectId, subjectName: cleanSubjectName });
//                 teacherDoc.assignments.set(academicYearStr, yearSubjects);
//             }
            
//             // Update the total years count
//             teacherDoc.totalYearsRecorded = teacherDoc.assignments.size;
//         }

//         await teacherDoc.save();

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

        // ---> THE CRUCIAL FIX IS HERE <---
        // Instead of .some(), we use .find() to grab the actual object so we can read its name
        const subjectToRemove = yearSubjects.find(sub => sub.subjectId === cleanSubjectId);
        
        if (!subjectToRemove) {
            return res.status(404).json({
                success: false,
                message: `Subject ${cleanSubjectId} is not assigned to this faculty for the year ${academicYearStr}.`
            });
        }

        // Now we safely define the variable for the logger!
        const removedSubjectName = subjectToRemove.subjectName;
        // ---------------------------------

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

        // ---> THE TRIGGER <---
        await logActivity(
            req.user, 
            'REMOVED_SUBJECT', 
            `${cleanSubjectId} - ${removedSubjectName} removed from ${facultyRecord.facultyName}`, 
            [] 
        );

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


// async function removeSubjectFromFaculty(req, res) {
//     try {
//         const { facultyId, subjectId, academicYear } = req.body;

//         if (!facultyId || !subjectId || academicYear === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide facultyId, subjectId, and academicYear."
//             });
//         }

//         const cleanFacultyId = facultyId.trim();
//         const cleanSubjectId = subjectId.trim();
//         const academicYearStr = academicYear.toString().trim();

//         const facultyRecord = await assignSubject.findOne({ facultyId: cleanFacultyId });

//         if (!facultyRecord) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Could not find faculty with ID: ${cleanFacultyId}`
//             });
//         }

//         if (!facultyRecord.assignments.has(academicYearStr)) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No assignments found for the year ${academicYearStr}.`
//             });
//         }

//         let yearSubjects = facultyRecord.assignments.get(academicYearStr);

//         // Filter through array of objects to find match
//         const subjectExists = yearSubjects.some(sub => sub.subjectId === cleanSubjectId);
        
//         if (!subjectExists) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject ${cleanSubjectId} is not assigned to this faculty for the year ${academicYearStr}.`
//             });
//         }

//         // Filter the object OUT of the array
//         yearSubjects = yearSubjects.filter(sub => sub.subjectId !== cleanSubjectId);

//         if (yearSubjects.length === 0) {
//             facultyRecord.assignments.delete(academicYearStr);
//         } else {
//             facultyRecord.assignments.set(academicYearStr, yearSubjects);
//         }

//         // Keep the total years count accurate after deletion
//         facultyRecord.totalYearsRecorded = facultyRecord.assignments.size;

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




// const getDropdownData = async (req, res) => {
//   try {
//     // 1. Grab the ID exactly as your verifyJWT middleware attached it
//     const currentFacultyId = req.facultyId; 
    
//     // 2. Extract query parameters for the cascading logic
//     const { year, course } = req.query;

//     // 3. Find the assigned subjects specifically for this faculty member
//     // const record = await FacultyAssignment.findOne({ facultyId: currentFacultyId });

//     const record = await assignSubject.findOne({ facultyId: currentFacultyId });

//     if (!record || !record.assignments) {
//       return res.status(200).json({ success: true, data: [] });
//     }

//     // SCENARIO A: Fetch Subjects (Requires year & course)
//     // Used for the 3rd dropdown -> /api/assignments/dropdown?year=2026&course=MCA
//     if (year && course) {
//       const subjects = record.assignments[year]?.[course] || [];
//       return res.status(200).json({ success: true, type: 'subjects', data: subjects });
//     }

//     // SCENARIO B: Fetch Courses (Requires only year)
//     // Used for the 2nd dropdown -> /api/assignments/dropdown?year=2026
//     if (year && !course) {
//       const courses = record.assignments[year] ? Object.keys(record.assignments[year]) : [];
//       return res.status(200).json({ success: true, type: 'courses', data: courses });
//     }

//     // SCENARIO C: Fetch Years (No queries)
//     // Used for the 1st dropdown -> /api/assignments/dropdown
//     const years = Object.keys(record.assignments);
//     return res.status(200).json({ success: true, type: 'years', data: years });

//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// controllers/assignSubject.js

const getDropdownData = async (req, res) => {
  try {
    const currentFacultyId = req.facultyId; 
    const { year, course } = req.query;

    // Use .lean() to get a POJO (Plain Old JavaScript Object)
    const record = await assignSubject.findOne({ facultyId: currentFacultyId }).lean();

    // If record doesn't exist, return empty
    if (!record || !record.assignments) {
      return res.status(200).json({ success: true, type: 'empty', data: [] });
    }

    // 1. SCENARIO A: Requesting Subjects
    if (year && course) {
      const targetYear = String(year).trim();
      const targetCourse = String(course).toUpperCase().trim();

      // WITH .lean(), Mongoose maps are converted to plain objects.
      // So assignments[targetYear] IS correct, but ONLY if record.assignments is an object.
      // If it is a Map, you need to be careful.
      const yearData = record.assignments[targetYear];
      const subjects = yearData ? yearData[targetCourse] : [];
      
      return res.status(200).json({ success: true, type: 'subjects', data: subjects || [] });
    }

    // 2. SCENARIO B: Requesting Courses
    if (year && !course) {
      const targetYear = String(year).trim();
      const yearData = record.assignments[targetYear];
      
      // Get keys from the inner object
      const courses = yearData ? Object.keys(yearData) : [];
      
      return res.status(200).json({ success: true, type: 'courses', data: courses });
    }

    // 3. SCENARIO C: Requesting Years
    const years = Object.keys(record.assignments);
    
    return res.status(200).json({ success: true, type: 'years', data: years });

  } catch (error) {
    console.error("Dropdown Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
    handleAssignSubject,
    getAllFacultyAssignments,
    getAssignedSubjectsByFaculty,
    removeSubjectFromFaculty,
    getDropdownData
};