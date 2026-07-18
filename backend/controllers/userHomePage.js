// controllers/assignSubjectController.js
const AssignSubject = require('../models/AssignSubject'); 
const Subject = require('../models/subject');

// ============================================================================
// REUSABLE HELPERS (Fixes the TypeError and reduces code duplication)
// ============================================================================

/**
 * Safely fetches a faculty's assignments for the current year.
 * Prevents "Cannot read properties of undefined (reading 'assignments')" crashes.
 */
const getFacultyAssignments = async (facultyId, yearStr) => {
    const record = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();
    
    // Optional chaining (?.) safely checks if the record and nested maps exist.
    // If anything is null/undefined, it returns an empty object {} instead of crashing.
    return record?.assignments?.[yearStr] || {};
};

/**
 * Generic progress calculator. Replaces 4 repetitive BCA/MCA functions.
 */
const calculateCourseProgress = async (facultyId, targetCourse, statusField) => {
    const currentYear = new Date().getFullYear();
    const currentYearStr = currentYear.toString();

    // 1. Safely fetch assignments
    const yearAssignments = await getFacultyAssignments(facultyId, currentYearStr);
    const courseSubjects = yearAssignments[targetCourse] || [];

    // Extract valid subject IDs
    const assignedSubjectIds = courseSubjects.map(sub => sub.subjectId).filter(Boolean);

    // 2. Early return if no subjects assigned
    if (assignedSubjectIds.length === 0) {
        return {
            course: targetCourse,
            totalSubjects: 0,
            uploadedSubjects: 0,
            pendingSubjects: 0,
            progressPercentage: "0.00"
        };
    }

    // 3. Query the master Subject collection (.lean() for speed)
    const subjectRecords = await Subject.find({
        subjectId: { $in: assignedSubjectIds },
        academicYear: currentYear,
        course: targetCourse
    }, `subjectId ${statusField}`).lean();

    // 4. Tally progress
    let uploadedCount = 0;
    let pendingCount = 0;

    subjectRecords.forEach(subject => {
        if (subject[statusField] === 'Uploaded') {
            uploadedCount++;
        } else {
            pendingCount++;
        }
    });

    const totalCount = uploadedCount + pendingCount;
    const progressPercentage = totalCount > 0 ? ((uploadedCount / totalCount) * 100).toFixed(2) : "0.00";

    return {
        course: targetCourse,
        totalSubjects: totalCount,
        uploadedSubjects: uploadedCount,
        pendingSubjects: pendingCount,
        progressPercentage
    };
};


// ============================================================================
// EXPORTED CONTROLLERS
// ============================================================================

// @desc    Get total assigned subjects categorized by course for the current year
const HangleGetAssignedSubjectCountForCurrentYear = async (req, res) => {
    try {
        if (!req.facultyId) return res.status(400).json({ message: "Faculty ID is missing." });

        const currentYear = new Date().getFullYear();
        const yearAssignments = await getFacultyAssignments(req.facultyId, currentYear.toString());

        const data = Object.keys(yearAssignments).map(courseKey => ({
            course: courseKey,
            totalSubjects: Array.isArray(yearAssignments[courseKey]) ? yearAssignments[courseKey].length : 0
        }));

        return res.status(200).json({ success: true, year: currentYear, data });

    } catch (error) {
        console.error("Error fetching assigned subjects count:", error);
        return res.status(500).json({ success: false, message: "Server Error fetching count." });
    }
};

// @desc    Count pending CO-PO mappings across all assigned courses
const HandleGetPendingCopoMappingCount = async (req, res) => {
    try {
        if (!req.facultyId) return res.status(400).json({ message: "Faculty ID is missing." });

        const currentYear = new Date().getFullYear();
        const yearAssignments = await getFacultyAssignments(req.facultyId, currentYear.toString());

        let assignedSubjectIds = [];
        let pendingCountsMap = {};

        // Extract IDs and initialize counters
        for (const [course, subjects] of Object.entries(yearAssignments)) {
            pendingCountsMap[course.toUpperCase()] = 0;
            if (Array.isArray(subjects)) {
                subjects.forEach(sub => sub.subjectId && assignedSubjectIds.push(sub.subjectId));
            }
        }

        if (assignedSubjectIds.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Check status in master collection
        const subjectRecords = await Subject.find({
            subjectId: { $in: assignedSubjectIds },
            academicYear: currentYear 
        }, 'subjectId course copoMappingStatus').lean();

        subjectRecords.forEach(subject => {
            const course = subject.course ? subject.course.toUpperCase() : "UNKNOWN";
            if (pendingCountsMap[course] === undefined) pendingCountsMap[course] = 0;
            
            if (subject.copoMappingStatus !== 'Uploaded') pendingCountsMap[course]++;
        });

        const data = Object.keys(pendingCountsMap).map(course => ({
            course, count: pendingCountsMap[course]
        }));

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error("Error calculating pending CO-PO mappings:", error);
        return res.status(500).json({ success: false, message: "Server Error calculating pending mappings." });
    }
};

// @desc    Count generated attainment reports across all assigned courses
const handleGetGeneratedReportCount = async (req, res) => {
    try {
        if (!req.facultyId) return res.status(400).json({ message: "Faculty ID is missing." });

        const currentYear = new Date().getFullYear();
        const yearAssignments = await getFacultyAssignments(req.facultyId, currentYear.toString());

        let assignedSubjectIds = [];
        let uploadedCountsMap = {};

        // Extract IDs and initialize counters
        for (const [course, subjects] of Object.entries(yearAssignments)) {
            uploadedCountsMap[course.toUpperCase()] = 0;
            if (Array.isArray(subjects)) {
                subjects.forEach(sub => sub.subjectId && assignedSubjectIds.push(sub.subjectId));
            }
        }

        if (assignedSubjectIds.length === 0) {
            return res.status(200).json({ success: true, year: currentYear, data: [] });
        }

        // Check status in master collection
        const subjectRecords = await Subject.find({
            subjectId: { $in: assignedSubjectIds },
            academicYear: currentYear 
        }, 'subjectId course status').lean();

        subjectRecords.forEach(subject => {
            const course = subject.course ? subject.course.toUpperCase() : "UNKNOWN";
            if (uploadedCountsMap[course] === undefined) uploadedCountsMap[course] = 0;
            
            if (subject.status === 'Uploaded') uploadedCountsMap[course]++;
        });

        const data = Object.keys(uploadedCountsMap).map(course => ({
            course, uploadedCount: uploadedCountsMap[course]
        }));

        return res.status(200).json({ success: true, year: currentYear, data });

    } catch (error) {
        console.error("Error calculating generated report count:", error);
        return res.status(500).json({ success: false, message: "Server Error calculating report count." });
    }
};

// ============================================================================
// PROGRESS ENDPOINTS (Using the unified helper function)
// ============================================================================

const HandleGetMyBCAProgress = async (req, res) => {
    try {
        if (!req.facultyId) return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
        const data = await calculateCourseProgress(req.facultyId, 'BCA', 'status');
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const handleGetMyMCAProgress = async (req, res) => {
    try {
        if (!req.facultyId) return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
        const data = await calculateCourseProgress(req.facultyId, 'MCA', 'status');
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const handleGetMyBCACopoProgress = async (req, res) => {
    try {
        if (!req.facultyId) return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
        const data = await calculateCourseProgress(req.facultyId, 'BCA', 'copoMappingStatus');
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const handleGetMyMCACopoProgress = async (req, res) => {
    try {
        if (!req.facultyId) return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
        const data = await calculateCourseProgress(req.facultyId, 'MCA', 'copoMappingStatus');
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    HangleGetAssignedSubjectCountForCurrentYear,
    HandleGetPendingCopoMappingCount,
    handleGetGeneratedReportCount,
    HandleGetMyBCAProgress,
    handleGetMyMCAProgress,
    handleGetMyBCACopoProgress,
    handleGetMyMCACopoProgress
};



// // controllers/assignSubjectController.js
// const AssignSubject = require('../models/AssignSubject'); 
// const Subject = require('../models/subject');


// //done
// const HangleGetAssignedSubjectCountForCurrentYear = async (req, res) => {
//   try {
//     const facultyId = req.facultyId; 

//     if (!facultyId) {
//       return res.status(400).json({ message: "Faculty ID is missing from user token." });
//     }

//     const currentYearStr = new Date().getFullYear().toString(); 
    
//     // 1. Add .lean() to convert the Mongoose Document (and Maps) into a plain JS object
//     // 2. Wrap facultyId in String() to ensure it matches the database type
//     const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

//     let data = []; 

//     // Because of .lean(), we can safely use bracket notation here again
//     if (facultyRecord && facultyRecord.assignments && facultyRecord.assignments[currentYearStr]) {
//       const yearAssignments = facultyRecord.assignments[currentYearStr];
      
//       // Loop through "MCA", "BCA", etc.
//       for (const programKey in yearAssignments) {
//         if (Array.isArray(yearAssignments[programKey])) {
//           const count = yearAssignments[programKey].length;
          
//           // Push the formatted object into the data array
//           data.push({
//             course: programKey,
//             totalSubjects: count
//           });
//         }
//       }
//     }

//     // Return the specific JSON format requested
//     return res.status(200).json({
//       success: true,
//       year: parseInt(currentYearStr),
//       data: data 
//     });

//   } catch (error) {
//     console.error("Error fetching assigned subjects count:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching the subject count."
//     });
//   }
// };



// //done
// const HandleGetPendingCopoMappingCount = async (req, res) => {
//   try {
//     const facultyId = req.facultyId; 

//     if (!facultyId) {
//       return res.status(400).json({ message: "Faculty ID is missing from user token." });
//     }

//     const currentYear = new Date().getFullYear(); 
//     const currentYearStr = currentYear.toString();

//     // 1. Fetch the user's assigned subjects
//     const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

//     let assignedSubjectIds = [];
//     let pendingCountsMap = {}; // Will hold { "BCA": 0, "MCA": 0 }

//     // 2. Extract every single assigned subjectId and initialize the courses
//     if (facultyRecord && facultyRecord.assignments && facultyRecord.assignments[currentYearStr]) {
//       const yearAssignments = facultyRecord.assignments[currentYearStr];
      
//       for (const courseKey in yearAssignments) {
//         if (Array.isArray(yearAssignments[courseKey])) {
//           // Initialize the course count to 0 so it appears in the output even if 0 are pending
//           pendingCountsMap[courseKey.toUpperCase()] = 0;

//           yearAssignments[courseKey].forEach(subject => {
//             if (subject.subjectId) {
//               assignedSubjectIds.push(subject.subjectId);
//             }
//           });
//         }
//       }
//     }

//     // 3. Early return if they have no subjects assigned this year
//     if (assignedSubjectIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: [] 
//       });
//     }

//     // 4. Query the master Subject collection for the assigned IDs
//     const subjectRecords = await Subject.find({
//       subjectId: { $in: assignedSubjectIds },
//       academicYear: currentYear 
//     }, 'subjectId course copoMappingStatus').lean();

//     // 5. Loop through the master records and tally up ONLY the pending statuses
//     subjectRecords.forEach(subject => {
//       const course = subject.course ? subject.course.toUpperCase() : "UNKNOWN";

//       // Safety check: Initialize if it somehow wasn't in assignments
//       if (pendingCountsMap[course] === undefined) {
//         pendingCountsMap[course] = 0;
//       }

//       // If the status is not 'Uploaded', count it as a pending mapping
//       if (subject.copoMappingStatus !== 'Uploaded') {
//         pendingCountsMap[course] += 1;
//       }
//     });

//     // 6. Format the map into the requested array structure
//     const data = Object.keys(pendingCountsMap).map(course => ({
//       course: course,
//       count: pendingCountsMap[course]
//     }));

//     // 7. Send the structured payload
//     return res.status(200).json({
//       success: true,
//       data: data
//     });

//   } catch (error) {
//     console.error("Error calculating pending CO-PO mappings:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while calculating pending mappings."
//     });
//   }
// };






// //done
// const handleGetGeneratedReportCount = async (req, res) => {
//   try {
//     const facultyId = req.facultyId; 

//     if (!facultyId) {
//       return res.status(400).json({ message: "Faculty ID is missing from user token." });
//     }

//     const currentYear = new Date().getFullYear(); 
//     const currentYearStr = currentYear.toString();

//     // 1. Fetch the user's assigned subjects
//     const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

//     let assignedSubjectIds = [];
//     let uploadedCountsMap = {};

//     // 2. Extract the assigned subject IDs into a flat array & initialize counts
//     if (facultyRecord && facultyRecord.assignments && facultyRecord.assignments[currentYearStr]) {
//       const yearAssignments = facultyRecord.assignments[currentYearStr];
      
//       for (const courseKey in yearAssignments) {
//         if (Array.isArray(yearAssignments[courseKey])) {
//           // Initialize the course count to 0 so it always appears in the output
//           uploadedCountsMap[courseKey.toUpperCase()] = 0;

//           yearAssignments[courseKey].forEach(subject => {
//             if (subject.subjectId) {
//               assignedSubjectIds.push(subject.subjectId);
//             }
//           });
//         }
//       }
//     }

//     // 3. Early return if they have no subjects assigned this year
//     if (assignedSubjectIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         year: currentYear,
//         data: [] 
//       });
//     }

//     // 4. Query the master Subject collection
//     const subjectRecords = await Subject.find({
//       subjectId: { $in: assignedSubjectIds },
//       academicYear: currentYear 
//     }, 'subjectId course status').lean();

//     // 5. Loop through the master records and tally up ONLY the uploaded statuses
//     subjectRecords.forEach(subject => {
//       const course = subject.course ? subject.course.toUpperCase() : "UNKNOWN";

//       // Safety check: Initialize if it wasn't captured in assignments
//       if (uploadedCountsMap[course] === undefined) {
//         uploadedCountsMap[course] = 0;
//       }

//       // Check the specific 'status' enum to see if the report is uploaded
//       if (subject.status === 'Uploaded') {
//         uploadedCountsMap[course] += 1;
//       }
//     });

//     // 6. Format the map into the requested array structure
//     const data = Object.keys(uploadedCountsMap).map(course => ({
//       course: course,
//       uploadedCount: uploadedCountsMap[course]
//     }));

//     // 7. Send the structured JSON response
//     return res.status(200).json({
//       success: true,
//       year: currentYear,
//       data: data
//     });

//   } catch (error) {
//     console.error("Error calculating generated report count:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while calculating the report count."
//     });
//   }
// };





// //done
// const HandleGetMyBCAProgress = async (req, res) => {
//   try {
//     // 1. Identify the user via the token middleware
//     const facultyId = req.facultyId; 
    
//     // 2. HARDCODED: This controller now strictly looks for BCA
//     const targetCourse = 'BCA';

//     if (!facultyId) {
//       return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
//     }

//     const currentYear = new Date().getFullYear();
//     const currentYearStr = currentYear.toString();

//     // 3. Fetch this exact user's master assignment record
//     const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

//     let assignedSubjectIds = [];

//     // 4. Dig into the assignments and pull ONLY the IDs for BCA
//     if (
//       facultyRecord && 
//       facultyRecord.assignments && 
//       facultyRecord.assignments[currentYearStr] &&
//       facultyRecord.assignments[currentYearStr][targetCourse] // Looks specifically for 'BCA'
//     ) {
//       const courseSubjects = facultyRecord.assignments[currentYearStr][targetCourse];
      
//       if (Array.isArray(courseSubjects)) {
//          courseSubjects.forEach(subject => {
//             if (subject.subjectId) {
//                assignedSubjectIds.push(subject.subjectId);
//             }
//          });
//       }
//     }

//     // 5. Early return if they aren't teaching any BCA subjects this year
//     if (assignedSubjectIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           course: targetCourse,
//           totalSubjects: 0,
//           uploadedSubjects: 0,
//           pendingSubjects: 0,
//           progressPercentage: "0.00" // String representation
//         }
//       });
//     }

//     // 6. Query the master Subject collection for JUST this user's BCA IDs
//     const subjectRecords = await Subject.find({
//       subjectId: { $in: assignedSubjectIds },
//       academicYear: currentYear,
//       course: targetCourse // Extra layer of safety ensuring it's BCA
//     }, 'subjectId status').lean();

//     // 7. Tally the progress
//     let uploadedCount = 0;
//     let pendingCount = 0;

//     subjectRecords.forEach(subject => {
//       if (subject.status === 'Uploaded') {
//         uploadedCount += 1;
//       } else {
//         pendingCount += 1; 
//       }
//     });

//     const totalCount = uploadedCount + pendingCount;

//     // 8. Send back the calculated percentages and counts without academicYear
//     return res.status(200).json({
//       success: true,
//       data: {
//         course: targetCourse,
//         totalSubjects: totalCount,
//         uploadedSubjects: uploadedCount,
//         pendingSubjects: pendingCount,
//         progressPercentage: totalCount > 0 
//           ? ((uploadedCount / totalCount) * 100).toFixed(2) // Removed parseFloat so it remains a string
//           : "0.00"
//       }
//     });

//   } catch (error) {
//     console.error(`Error calculating BCA course progress:`, error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while calculating your BCA course progress."
//     });
//   }
// };




// //done
// const handleGetMyMCAProgress = async (req, res) => {
//   try {
//     // 1. Identify the user via the token middleware
//     const facultyId = req.facultyId; 
    
//     // 2. HARDCODED: This controller now strictly looks for MCA
//     const targetCourse = 'MCA';

//     if (!facultyId) {
//       return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
//     }

//     const currentYear = new Date().getFullYear();
//     const currentYearStr = currentYear.toString();

//     // 3. Fetch this exact user's master assignment record
//     const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

//     let assignedSubjectIds = [];

//     // 4. Dig into the assignments and pull ONLY the IDs for MCA
//     if (
//       facultyRecord && 
//       facultyRecord.assignments && 
//       facultyRecord.assignments[currentYearStr] &&
//       facultyRecord.assignments[currentYearStr][targetCourse] // Looks specifically for 'MCA'
//     ) {
//       const courseSubjects = facultyRecord.assignments[currentYearStr][targetCourse];
      
//       if (Array.isArray(courseSubjects)) {
//          courseSubjects.forEach(subject => {
//             if (subject.subjectId) {
//                assignedSubjectIds.push(subject.subjectId);
//             }
//          });
//       }
//     }

//     // 5. Early return if they aren't teaching any MCA subjects this year
//     if (assignedSubjectIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           course: targetCourse,
//           totalSubjects: 0,
//           uploadedSubjects: 0,
//           pendingSubjects: 0,
//           progressPercentage: "0.00" // String representation
//         }
//       });
//     }

//     // 6. Query the master Subject collection for JUST this user's MCA IDs
//     const subjectRecords = await Subject.find({
//       subjectId: { $in: assignedSubjectIds },
//       academicYear: currentYear,
//       course: targetCourse // Extra layer of safety ensuring it's MCA
//     }, 'subjectId status').lean();

//     // 7. Tally the progress
//     let uploadedCount = 0;
//     let pendingCount = 0;

//     subjectRecords.forEach(subject => {
//       if (subject.status === 'Uploaded') {
//         uploadedCount += 1;
//       } else {
//         pendingCount += 1; 
//       }
//     });

//     const totalCount = uploadedCount + pendingCount;

//     // 8. Send back the calculated percentages and counts
//     return res.status(200).json({
//       success: true,
//       data: {
//         course: targetCourse,
//         totalSubjects: totalCount,
//         uploadedSubjects: uploadedCount,
//         pendingSubjects: pendingCount,
//         progressPercentage: totalCount > 0 
//           ? ((uploadedCount / totalCount) * 100).toFixed(2) // Removed parseFloat so it remains a string
//           : "0.00"
//       }
//     });

//   } catch (error) {
//     console.error(`Error calculating MCA course progress:`, error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while calculating your MCA course progress."
//     });
//   }
// };


// //done
// const handleGetMyBCACopoProgress = async (req, res) => {
//   try {
//     // 1. Identify the user via the token middleware
//     const facultyId = req.facultyId; 
    
//     // 2. HARDCODED: This controller now strictly looks for BCA
//     const targetCourse = 'BCA';

//     if (!facultyId) {
//       return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
//     }

//     const currentYear = new Date().getFullYear();
//     const currentYearStr = currentYear.toString();

//     // 3. Fetch this exact user's master assignment record
//     const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

//     let assignedSubjectIds = [];

//     // 4. Dig into the assignments and pull ONLY the IDs for BCA
//     if (
//       facultyRecord && 
//       facultyRecord.assignments && 
//       facultyRecord.assignments[currentYearStr] &&
//       facultyRecord.assignments[currentYearStr][targetCourse] // Looks specifically for 'BCA'
//     ) {
//       const courseSubjects = facultyRecord.assignments[currentYearStr][targetCourse];
      
//       if (Array.isArray(courseSubjects)) {
//          courseSubjects.forEach(subject => {
//             if (subject.subjectId) {
//                assignedSubjectIds.push(subject.subjectId);
//             }
//          });
//       }
//     }

//     // 5. Early return if they aren't teaching any BCA subjects this year
//     if (assignedSubjectIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           course: targetCourse,
//           totalSubjects: 0,
//           uploadedSubjects: 0,
//           pendingSubjects: 0,
//           progressPercentage: "0" // String representation
//         }
//       });
//     }

//     // 6. TARGETED QUERY: Look specifically at 'copoMappingStatus' for this user's BCA IDs
//     const subjectRecords = await Subject.find({
//       subjectId: { $in: assignedSubjectIds },
//       academicYear: currentYear,
//       course: targetCourse 
//     }, 'subjectId copoMappingStatus').lean();

//     // 7. Tally the progress
//     let uploadedCount = 0;
//     let pendingCount = 0;

//     subjectRecords.forEach(subject => {
//       // Checking the exact copoMappingStatus enum from your Subject schema
//       if (subject.copoMappingStatus === 'Uploaded') {
//         uploadedCount += 1;
//       } else {
//         // If it is 'Pending' (or undefined), count as pending
//         pendingCount += 1; 
//       }
//     });

//     const totalCount = uploadedCount + pendingCount;

//     // 8. Send back the calculated percentages and counts without academicYear
//     return res.status(200).json({
//       success: true,
//       data: {
//         course: targetCourse,
//         totalSubjects: totalCount,
//         uploadedSubjects: uploadedCount,
//         pendingSubjects: pendingCount,
//         progressPercentage: totalCount > 0 
//           ? ((uploadedCount / totalCount) * 100).toFixed(2) // Removed parseFloat so it remains a string
//           : "0"
//       }
//     });

//   } catch (error) {
//     console.error(`Error calculating BCA CO-PO progress:`, error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while calculating your BCA CO-PO progress."
//     });
//   }
// };





// //done
// const handleGetMyMCACopoProgress = async (req, res) => {
//   try {
//     // 1. Identify the user via the token middleware
//     const facultyId = req.facultyId; 
    
//     // 2. HARDCODED: This controller now strictly looks for MCA
//     const targetCourse = 'MCA';

//     if (!facultyId) {
//       return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
//     }

//     const currentYear = new Date().getFullYear();
//     const currentYearStr = currentYear.toString();

//     // 3. Fetch this exact user's master assignment record
//     const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

//     let assignedSubjectIds = [];

//     // 4. Dig into the assignments and pull ONLY the IDs for MCA
//     if (
//       facultyRecord && 
//       facultyRecord.assignments && 
//       facultyRecord.assignments[currentYearStr] &&
//       facultyRecord.assignments[currentYearStr][targetCourse] // Looks specifically for 'MCA'
//     ) {
//       const courseSubjects = facultyRecord.assignments[currentYearStr][targetCourse];
      
//       if (Array.isArray(courseSubjects)) {
//          courseSubjects.forEach(subject => {
//             if (subject.subjectId) {
//                assignedSubjectIds.push(subject.subjectId);
//             }
//          });
//       }
//     }

//     // 5. Early return if they aren't teaching any MCA subjects this year
//     if (assignedSubjectIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           course: targetCourse,
//           totalSubjects: 0,
//           uploadedSubjects: 0,
//           pendingSubjects: 0,
//           progressPercentage: "0.00" // String representation
//         }
//       });
//     }

//     // 6. TARGETED QUERY: Look specifically at 'copoMappingStatus' for this user's MCA IDs
//     const subjectRecords = await Subject.find({
//       subjectId: { $in: assignedSubjectIds },
//       academicYear: currentYear,
//       course: targetCourse 
//     }, 'subjectId copoMappingStatus').lean(); 

//     // 7. Tally the progress
//     let uploadedCount = 0;
//     let pendingCount = 0;

//     subjectRecords.forEach(subject => {
//       // Checking the exact copoMappingStatus enum from your Subject schema
//       if (subject.copoMappingStatus === 'Uploaded') {
//         uploadedCount += 1;
//       } else {
//         // If it is 'Pending' (or undefined), count as pending
//         pendingCount += 1; 
//       }
//     });

//     const totalCount = uploadedCount + pendingCount;

//     // 8. Send back the calculated percentages and counts without academicYear
//     return res.status(200).json({
//       success: true,
//       data: {
//         course: targetCourse,
//         totalSubjects: totalCount,
//         uploadedSubjects: uploadedCount,
//         pendingSubjects: pendingCount,
//         progressPercentage: totalCount > 0 
//           ? ((uploadedCount / totalCount) * 100).toFixed(2) // Removed parseFloat so it remains a string
//           : "0.00"
//       }
//     });

//   } catch (error) {
//     console.error(`Error calculating MCA CO-PO progress:`, error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while calculating your MCA CO-PO progress."
//     });
//   }
// };



// module.exports = { 
//   HangleGetAssignedSubjectCountForCurrentYear,
//   HandleGetPendingCopoMappingCount,
//   handleGetGeneratedReportCount,
//   HandleGetMyBCAProgress,
//   handleGetMyMCAProgress,
//   handleGetMyBCACopoProgress,
//   handleGetMyMCACopoProgress,
//  };