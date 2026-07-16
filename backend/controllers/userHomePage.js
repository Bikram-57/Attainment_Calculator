// controllers/assignSubjectController.js
const AssignSubject = require('../models/AssignSubject'); 
const Subject = require('../models/subject');

const HangleGetAssignedSubjectCountForCurrentYear = async (req, res) => {
  try {
    const facultyId = req.facultyId; 

    if (!facultyId) {
      return res.status(400).json({ message: "Faculty ID is missing from user token." });
    }

    const currentYearStr = new Date().getFullYear().toString(); 
    
    // 1. Add .lean() to convert the Mongoose Document (and Maps) into a plain JS object
    // 2. Wrap facultyId in String() to ensure it matches the database type
    const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

    let totalCount = 0;
    let programCounts = {}; 

    // Because of .lean(), we can safely use bracket notation here again
    if (facultyRecord && facultyRecord.assignments && facultyRecord.assignments[currentYearStr]) {
      const yearAssignments = facultyRecord.assignments[currentYearStr];
      
      // Loop through "MCA", "BCA", etc.
      for (const programKey in yearAssignments) {
        if (Array.isArray(yearAssignments[programKey])) {
          const count = yearAssignments[programKey].length;
          
          programCounts[programKey] = count;
          totalCount += count;
        }
      }
    }

    return res.status(200).json({
      success: true,
      year: parseInt(currentYearStr),
      totalAssignedSubjects: totalCount,
      programBreakdown: programCounts 
    });

  } catch (error) {
    console.error("Error fetching assigned subjects count:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the subject count."
    });
  }
};




const HandleGetPendingCopoMappingCount = async (req, res) => {
  try {
    const facultyId = req.facultyId; 

    if (!facultyId) {
      return res.status(400).json({ message: "Faculty ID is missing from user token." });
    }

    // Note: Your Subject schema uses Number for academicYear, so we parse it to an integer
    const currentYear = new Date().getFullYear(); 
    const currentYearStr = currentYear.toString();

    // 1. Fetch the user's assigned subjects
    const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

    let assignedSubjectIds = [];

    // 2. Extract every single assigned subjectId into a flat array
    if (facultyRecord && facultyRecord.assignments && facultyRecord.assignments[currentYearStr]) {
      const yearAssignments = facultyRecord.assignments[currentYearStr];
      
      for (const courseKey in yearAssignments) {
        if (Array.isArray(yearAssignments[courseKey])) {
          yearAssignments[courseKey].forEach(subject => {
            if (subject.subjectId) {
              assignedSubjectIds.push(subject.subjectId); // e.g., ["CA2201", "CA2301"]
            }
          });
        }
      }
    }

    // 3. Early return if they have no subjects assigned this year
    if (assignedSubjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        academicYear: currentYear,
        overall: { totalAssigned: 0, completedCount: 0, pendingCount: 0 },
        programBreakdown: {},
        message: "No subjects assigned for the current year."
      });
    }

    // 4. Query the master Subject collection!
    // We look up all assigned IDs for the current year and grab their status and course
    const subjectRecords = await Subject.find({
      subjectId: { $in: assignedSubjectIds },
      academicYear: currentYear // Matching your Number schema type
    }, 'subjectId course copoMappingStatus').lean();

    // 5. Prepare tracking variables
    let programBreakdown = {};
    let overall = { totalAssigned: 0, completedCount: 0, pendingCount: 0 };

    // 6. Loop through the master records and tally up the exact statuses
    subjectRecords.forEach(subject => {
      // Ensure the course name is uppercase just in case (e.g., "MCA")
      const course = subject.course ? subject.course.toUpperCase() : "UNKNOWN";

      // Initialize the course in our breakdown if it doesn't exist yet
      if (!programBreakdown[course]) {
        programBreakdown[course] = { totalAssigned: 0, completedCount: 0, pendingCount: 0 };
      }

      // Add to total assigned counts
      programBreakdown[course].totalAssigned += 1;
      overall.totalAssigned += 1;

      // Check the strict enum from your schema
      if (subject.copoMappingStatus === 'Uploaded') {
        programBreakdown[course].completedCount += 1;
        overall.completedCount += 1;
      } else {
        // If it is 'Pending' (or anything else), count it as pending
        programBreakdown[course].pendingCount += 1;
        overall.pendingCount += 1;
      }
    });

    // 7. Send the structured payload
    return res.status(200).json({
      success: true,
      academicYear: currentYear,
      overall: overall,
      programBreakdown: programBreakdown
    });

  } catch (error) {
    console.error("Error calculating pending CO-PO mappings:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating pending mappings."
    });
  }
};







const handleGetGeneratedReportCount = async (req, res) => {
  try {
    const facultyId = req.facultyId; 

    if (!facultyId) {
      return res.status(400).json({ message: "Faculty ID is missing from user token." });
    }

    // Grab the current year (Number for Subject DB, String for AssignSubject DB)
    const currentYear = new Date().getFullYear(); 
    const currentYearStr = currentYear.toString();

    // 1. Fetch the user's assigned subjects
    const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

    let assignedSubjectIds = [];

    // 2. Extract the assigned subject IDs into a flat array
    if (facultyRecord && facultyRecord.assignments && facultyRecord.assignments[currentYearStr]) {
      const yearAssignments = facultyRecord.assignments[currentYearStr];
      
      for (const courseKey in yearAssignments) {
        if (Array.isArray(yearAssignments[courseKey])) {
          yearAssignments[courseKey].forEach(subject => {
            if (subject.subjectId) {
              assignedSubjectIds.push(subject.subjectId);
            }
          });
        }
      }
    }

    // 3. Early return if they have no subjects assigned this year
    if (assignedSubjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        academicYear: currentYear,
        overall: { totalAssigned: 0, completedCount: 0, pendingCount: 0 },
        programBreakdown: {},
        message: "No subjects assigned for the current year."
      });
    }

    // 4. Query the master Subject collection
    // We specifically ask Mongoose to only return the 'status' field alongside course and ID
    const subjectRecords = await Subject.find({
      subjectId: { $in: assignedSubjectIds },
      academicYear: currentYear 
    }, 'subjectId course status').lean();

    // 5. Prepare tracking variables
    let programBreakdown = {};
    let overall = { totalAssigned: 0, completedCount: 0, pendingCount: 0 };

    // 6. Loop through the master records and evaluate the 'status' enum
    subjectRecords.forEach(subject => {
      const course = subject.course ? subject.course.toUpperCase() : "UNKNOWN";

      // Initialize the course (MCA/BCA) if it doesn't exist yet
      if (!programBreakdown[course]) {
        programBreakdown[course] = { totalAssigned: 0, completedCount: 0, pendingCount: 0 };
      }

      // Increment assigned counts
      programBreakdown[course].totalAssigned += 1;
      overall.totalAssigned += 1;

      // Check the specific 'status' enum to see if the report is uploaded
      if (subject.status === 'Uploaded') {
        programBreakdown[course].completedCount += 1;
        overall.completedCount += 1;
      } else {
        // If it is 'Pending', count it as pending
        programBreakdown[course].pendingCount += 1;
        overall.pendingCount += 1;
      }
    });

    // 7. Send the structured JSON response
    return res.status(200).json({
      success: true,
      academicYear: currentYear,
      overall: overall,
      programBreakdown: programBreakdown
    });

  } catch (error) {
    console.error("Error calculating generated report count:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating the report count."
    });
  }
};






const HandleGetMyBCAProgress = async (req, res) => {
  try {
    // 1. Identify the user via the token middleware
    const facultyId = req.facultyId; 
    
    // 2. HARDCODED: This controller now strictly looks for BCA
    const targetCourse = 'BCA';

    if (!facultyId) {
      return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
    }

    const currentYear = new Date().getFullYear();
    const currentYearStr = currentYear.toString();

    // 3. Fetch this exact user's master assignment record
    const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

    let assignedSubjectIds = [];

    // 4. Dig into the assignments and pull ONLY the IDs for BCA
    if (
      facultyRecord && 
      facultyRecord.assignments && 
      facultyRecord.assignments[currentYearStr] &&
      facultyRecord.assignments[currentYearStr][targetCourse] // Looks specifically for 'BCA'
    ) {
      const courseSubjects = facultyRecord.assignments[currentYearStr][targetCourse];
      
      if (Array.isArray(courseSubjects)) {
         courseSubjects.forEach(subject => {
            if (subject.subjectId) {
               assignedSubjectIds.push(subject.subjectId);
            }
         });
      }
    }

    // 5. Early return if they aren't teaching any BCA subjects this year
    if (assignedSubjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          course: targetCourse,
          academicYear: currentYear,
          totalSubjects: 0,
          uploadedSubjects: 0,
          pendingSubjects: 0,
          progressPercentage: 0
        },
        message: `No subjects assigned to you for ${targetCourse} in ${currentYear}.`
      });
    }

    // 6. Query the master Subject collection for JUST this user's BCA IDs
    const subjectRecords = await Subject.find({
      subjectId: { $in: assignedSubjectIds },
      academicYear: currentYear,
      course: targetCourse // Extra layer of safety ensuring it's BCA
    }, 'subjectId status').lean();

    // 7. Tally the progress
    let uploadedCount = 0;
    let pendingCount = 0;

    subjectRecords.forEach(subject => {
      if (subject.status === 'Uploaded') {
        uploadedCount += 1;
      } else {
        pendingCount += 1; 
      }
    });

    const totalCount = uploadedCount + pendingCount;

    // 8. Send back the calculated percentages and counts
    return res.status(200).json({
      success: true,
      data: {
        course: targetCourse,
        academicYear: currentYear,
        totalSubjects: totalCount,
        uploadedSubjects: uploadedCount,
        pendingSubjects: pendingCount,
        progressPercentage: totalCount > 0 
          ? parseFloat(((uploadedCount / totalCount) * 100).toFixed(2))
          : 0
      }
    });

  } catch (error) {
    console.error(`Error calculating BCA course progress:`, error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating your BCA course progress."
    });
  }
};






const handleGetMyMCAProgress = async (req, res) => {
  try {
    // 1. Identify the user via the token middleware
    const facultyId = req.facultyId; 
    
    // 2. HARDCODED: This controller now strictly looks for MCA
    const targetCourse = 'MCA';

    if (!facultyId) {
      return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
    }

    const currentYear = new Date().getFullYear();
    const currentYearStr = currentYear.toString();

    // 3. Fetch this exact user's master assignment record
    const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

    let assignedSubjectIds = [];

    // 4. Dig into the assignments and pull ONLY the IDs for MCA
    if (
      facultyRecord && 
      facultyRecord.assignments && 
      facultyRecord.assignments[currentYearStr] &&
      facultyRecord.assignments[currentYearStr][targetCourse] // Looks specifically for 'MCA'
    ) {
      const courseSubjects = facultyRecord.assignments[currentYearStr][targetCourse];
      
      if (Array.isArray(courseSubjects)) {
         courseSubjects.forEach(subject => {
            if (subject.subjectId) {
               assignedSubjectIds.push(subject.subjectId);
            }
         });
      }
    }

    // 5. Early return if they aren't teaching any MCA subjects this year
    if (assignedSubjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          course: targetCourse,
          academicYear: currentYear,
          totalSubjects: 0,
          uploadedSubjects: 0,
          pendingSubjects: 0,
          progressPercentage: 0
        },
        message: `No subjects assigned to you for ${targetCourse} in ${currentYear}.`
      });
    }

    // 6. Query the master Subject collection for JUST this user's MCA IDs
    const subjectRecords = await Subject.find({
      subjectId: { $in: assignedSubjectIds },
      academicYear: currentYear,
      course: targetCourse // Extra layer of safety ensuring it's MCA
    }, 'subjectId status').lean();

    // 7. Tally the progress
    let uploadedCount = 0;
    let pendingCount = 0;

    subjectRecords.forEach(subject => {
      if (subject.status === 'Uploaded') {
        uploadedCount += 1;
      } else {
        pendingCount += 1; 
      }
    });

    const totalCount = uploadedCount + pendingCount;

    // 8. Send back the calculated percentages and counts
    return res.status(200).json({
      success: true,
      data: {
        course: targetCourse,
        academicYear: currentYear,
        totalSubjects: totalCount,
        uploadedSubjects: uploadedCount,
        pendingSubjects: pendingCount,
        progressPercentage: totalCount > 0 
          ? parseFloat(((uploadedCount / totalCount) * 100).toFixed(2))
          : 0
      }
    });

  } catch (error) {
    console.error(`Error calculating MCA course progress:`, error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating your MCA course progress."
    });
  }
};





const handleGetMyBCACopoProgress = async (req, res) => {
  try {
    // 1. Identify the user via the token middleware
    const facultyId = req.facultyId; 
    
    // 2. HARDCODED: This controller now strictly looks for BCA
    const targetCourse = 'BCA';

    if (!facultyId) {
      return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
    }

    const currentYear = new Date().getFullYear();
    const currentYearStr = currentYear.toString();

    // 3. Fetch this exact user's master assignment record
    const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

    let assignedSubjectIds = [];

    // 4. Dig into the assignments and pull ONLY the IDs for BCA
    if (
      facultyRecord && 
      facultyRecord.assignments && 
      facultyRecord.assignments[currentYearStr] &&
      facultyRecord.assignments[currentYearStr][targetCourse] // Looks specifically for 'BCA'
    ) {
      const courseSubjects = facultyRecord.assignments[currentYearStr][targetCourse];
      
      if (Array.isArray(courseSubjects)) {
         courseSubjects.forEach(subject => {
            if (subject.subjectId) {
               assignedSubjectIds.push(subject.subjectId);
            }
         });
      }
    }

    // 5. Early return if they aren't teaching any BCA subjects this year
    if (assignedSubjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          course: targetCourse,
          academicYear: currentYear,
          totalSubjects: 0,
          uploadedSubjects: 0,
          pendingSubjects: 0,
          progressPercentage: 0
        },
        message: `No subjects assigned to you for ${targetCourse} in ${currentYear}.`
      });
    }

    // 6. TARGETED QUERY: Look specifically at 'copoMappingStatus' for this user's BCA IDs
    const subjectRecords = await Subject.find({
      subjectId: { $in: assignedSubjectIds },
      academicYear: currentYear,
      course: targetCourse 
    }, 'subjectId copoMappingStatus').lean(); // <-- Specifically asking for copoMappingStatus

    // 7. Tally the progress
    let uploadedCount = 0;
    let pendingCount = 0;

    subjectRecords.forEach(subject => {
      // Checking the exact copoMappingStatus enum from your Subject schema
      if (subject.copoMappingStatus === 'Uploaded') {
        uploadedCount += 1;
      } else {
        // If it is 'Pending' (or undefined), count as pending
        pendingCount += 1; 
      }
    });

    const totalCount = uploadedCount + pendingCount;

    // 8. Send back the calculated percentages and counts
    return res.status(200).json({
      success: true,
      data: {
        course: targetCourse,
        academicYear: currentYear,
        totalSubjects: totalCount,
        uploadedSubjects: uploadedCount,
        pendingSubjects: pendingCount,
        progressPercentage: totalCount > 0 
          ? parseFloat(((uploadedCount / totalCount) * 100).toFixed(2))
          : 0
      }
    });

  } catch (error) {
    console.error(`Error calculating BCA CO-PO progress:`, error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating your BCA CO-PO progress."
    });
  }
};











const handleGetMyMCACopoProgress = async (req, res) => {
  try {
    // 1. Identify the user via the token middleware
    const facultyId = req.facultyId; 
    
    // 2. HARDCODED: This controller now strictly looks for MCA
    const targetCourse = 'MCA';

    if (!facultyId) {
      return res.status(401).json({ message: "Unauthorized. Faculty ID missing." });
    }

    const currentYear = new Date().getFullYear();
    const currentYearStr = currentYear.toString();

    // 3. Fetch this exact user's master assignment record
    const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

    let assignedSubjectIds = [];

    // 4. Dig into the assignments and pull ONLY the IDs for MCA
    if (
      facultyRecord && 
      facultyRecord.assignments && 
      facultyRecord.assignments[currentYearStr] &&
      facultyRecord.assignments[currentYearStr][targetCourse] // Looks specifically for 'MCA'
    ) {
      const courseSubjects = facultyRecord.assignments[currentYearStr][targetCourse];
      
      if (Array.isArray(courseSubjects)) {
         courseSubjects.forEach(subject => {
            if (subject.subjectId) {
               assignedSubjectIds.push(subject.subjectId);
            }
         });
      }
    }

    // 5. Early return if they aren't teaching any MCA subjects this year
    if (assignedSubjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          course: targetCourse,
          academicYear: currentYear,
          totalSubjects: 0,
          uploadedSubjects: 0,
          pendingSubjects: 0,
          progressPercentage: 0
        },
        message: `No subjects assigned to you for ${targetCourse} in ${currentYear}.`
      });
    }

    // 6. TARGETED QUERY: Look specifically at 'copoMappingStatus' for this user's MCA IDs
    const subjectRecords = await Subject.find({
      subjectId: { $in: assignedSubjectIds },
      academicYear: currentYear,
      course: targetCourse 
    }, 'subjectId copoMappingStatus').lean(); 

    // 7. Tally the progress
    let uploadedCount = 0;
    let pendingCount = 0;

    subjectRecords.forEach(subject => {
      // Checking the exact copoMappingStatus enum from your Subject schema
      if (subject.copoMappingStatus === 'Uploaded') {
        uploadedCount += 1;
      } else {
        // If it is 'Pending' (or undefined), count as pending
        pendingCount += 1; 
      }
    });

    const totalCount = uploadedCount + pendingCount;

    // 8. Send back the calculated percentages and counts
    return res.status(200).json({
      success: true,
      data: {
        course: targetCourse,
        academicYear: currentYear,
        totalSubjects: totalCount,
        uploadedSubjects: uploadedCount,
        pendingSubjects: pendingCount,
        progressPercentage: totalCount > 0 
          ? parseFloat(((uploadedCount / totalCount) * 100).toFixed(2))
          : 0
      }
    });

  } catch (error) {
    console.error(`Error calculating MCA CO-PO progress:`, error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating your MCA CO-PO progress."
    });
  }
};




module.exports = { 
  HangleGetAssignedSubjectCountForCurrentYear,
  HandleGetPendingCopoMappingCount,
  handleGetGeneratedReportCount,
  HandleGetMyBCAProgress,
  handleGetMyMCAProgress,
  handleGetMyBCACopoProgress,
  handleGetMyMCACopoProgress,
 };