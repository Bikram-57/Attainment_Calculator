// controllers/assignSubjectController.js
const AssignSubject = require('../models/AssignSubject'); 
const Subject = require('../models/subject');


//done
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

    let data = []; 

    // Because of .lean(), we can safely use bracket notation here again
    if (facultyRecord && facultyRecord.assignments && facultyRecord.assignments[currentYearStr]) {
      const yearAssignments = facultyRecord.assignments[currentYearStr];
      
      // Loop through "MCA", "BCA", etc.
      for (const programKey in yearAssignments) {
        if (Array.isArray(yearAssignments[programKey])) {
          const count = yearAssignments[programKey].length;
          
          // Push the formatted object into the data array
          data.push({
            course: programKey,
            totalSubjects: count
          });
        }
      }
    }

    // Return the specific JSON format requested
    return res.status(200).json({
      success: true,
      year: parseInt(currentYearStr),
      data: data 
    });

  } catch (error) {
    console.error("Error fetching assigned subjects count:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the subject count."
    });
  }
};



//done
const HandleGetPendingCopoMappingCount = async (req, res) => {
  try {
    const facultyId = req.facultyId; 

    if (!facultyId) {
      return res.status(400).json({ message: "Faculty ID is missing from user token." });
    }

    const currentYear = new Date().getFullYear(); 
    const currentYearStr = currentYear.toString();

    // 1. Fetch the user's assigned subjects
    const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

    let assignedSubjectIds = [];
    let pendingCountsMap = {}; // Will hold { "BCA": 0, "MCA": 0 }

    // 2. Extract every single assigned subjectId and initialize the courses
    if (facultyRecord && facultyRecord.assignments && facultyRecord.assignments[currentYearStr]) {
      const yearAssignments = facultyRecord.assignments[currentYearStr];
      
      for (const courseKey in yearAssignments) {
        if (Array.isArray(yearAssignments[courseKey])) {
          // Initialize the course count to 0 so it appears in the output even if 0 are pending
          pendingCountsMap[courseKey.toUpperCase()] = 0;

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
        data: [] 
      });
    }

    // 4. Query the master Subject collection for the assigned IDs
    const subjectRecords = await Subject.find({
      subjectId: { $in: assignedSubjectIds },
      academicYear: currentYear 
    }, 'subjectId course copoMappingStatus').lean();

    // 5. Loop through the master records and tally up ONLY the pending statuses
    subjectRecords.forEach(subject => {
      const course = subject.course ? subject.course.toUpperCase() : "UNKNOWN";

      // Safety check: Initialize if it somehow wasn't in assignments
      if (pendingCountsMap[course] === undefined) {
        pendingCountsMap[course] = 0;
      }

      // If the status is not 'Uploaded', count it as a pending mapping
      if (subject.copoMappingStatus !== 'Uploaded') {
        pendingCountsMap[course] += 1;
      }
    });

    // 6. Format the map into the requested array structure
    const data = Object.keys(pendingCountsMap).map(course => ({
      course: course,
      count: pendingCountsMap[course]
    }));

    // 7. Send the structured payload
    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error calculating pending CO-PO mappings:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating pending mappings."
    });
  }
};






//done
const handleGetGeneratedReportCount = async (req, res) => {
  try {
    const facultyId = req.facultyId; 

    if (!facultyId) {
      return res.status(400).json({ message: "Faculty ID is missing from user token." });
    }

    const currentYear = new Date().getFullYear(); 
    const currentYearStr = currentYear.toString();

    // 1. Fetch the user's assigned subjects
    const facultyRecord = await AssignSubject.findOne({ facultyId: String(facultyId) }).lean();

    let assignedSubjectIds = [];
    let uploadedCountsMap = {};

    // 2. Extract the assigned subject IDs into a flat array & initialize counts
    if (facultyRecord && facultyRecord.assignments && facultyRecord.assignments[currentYearStr]) {
      const yearAssignments = facultyRecord.assignments[currentYearStr];
      
      for (const courseKey in yearAssignments) {
        if (Array.isArray(yearAssignments[courseKey])) {
          // Initialize the course count to 0 so it always appears in the output
          uploadedCountsMap[courseKey.toUpperCase()] = 0;

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
        year: currentYear,
        data: [] 
      });
    }

    // 4. Query the master Subject collection
    const subjectRecords = await Subject.find({
      subjectId: { $in: assignedSubjectIds },
      academicYear: currentYear 
    }, 'subjectId course status').lean();

    // 5. Loop through the master records and tally up ONLY the uploaded statuses
    subjectRecords.forEach(subject => {
      const course = subject.course ? subject.course.toUpperCase() : "UNKNOWN";

      // Safety check: Initialize if it wasn't captured in assignments
      if (uploadedCountsMap[course] === undefined) {
        uploadedCountsMap[course] = 0;
      }

      // Check the specific 'status' enum to see if the report is uploaded
      if (subject.status === 'Uploaded') {
        uploadedCountsMap[course] += 1;
      }
    });

    // 6. Format the map into the requested array structure
    const data = Object.keys(uploadedCountsMap).map(course => ({
      course: course,
      uploadedCount: uploadedCountsMap[course]
    }));

    // 7. Send the structured JSON response
    return res.status(200).json({
      success: true,
      year: currentYear,
      data: data
    });

  } catch (error) {
    console.error("Error calculating generated report count:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while calculating the report count."
    });
  }
};





//done
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
          totalSubjects: 0,
          uploadedSubjects: 0,
          pendingSubjects: 0,
          progressPercentage: "0.00" // String representation
        }
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

    // 8. Send back the calculated percentages and counts without academicYear
    return res.status(200).json({
      success: true,
      data: {
        course: targetCourse,
        totalSubjects: totalCount,
        uploadedSubjects: uploadedCount,
        pendingSubjects: pendingCount,
        progressPercentage: totalCount > 0 
          ? ((uploadedCount / totalCount) * 100).toFixed(2) // Removed parseFloat so it remains a string
          : "0.00"
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




//done
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
          totalSubjects: 0,
          uploadedSubjects: 0,
          pendingSubjects: 0,
          progressPercentage: "0.00" // String representation
        }
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
        totalSubjects: totalCount,
        uploadedSubjects: uploadedCount,
        pendingSubjects: pendingCount,
        progressPercentage: totalCount > 0 
          ? ((uploadedCount / totalCount) * 100).toFixed(2) // Removed parseFloat so it remains a string
          : "0.00"
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


//done
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
          totalSubjects: 0,
          uploadedSubjects: 0,
          pendingSubjects: 0,
          progressPercentage: "0" // String representation
        }
      });
    }

    // 6. TARGETED QUERY: Look specifically at 'copoMappingStatus' for this user's BCA IDs
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

    // 8. Send back the calculated percentages and counts without academicYear
    return res.status(200).json({
      success: true,
      data: {
        course: targetCourse,
        totalSubjects: totalCount,
        uploadedSubjects: uploadedCount,
        pendingSubjects: pendingCount,
        progressPercentage: totalCount > 0 
          ? ((uploadedCount / totalCount) * 100).toFixed(2) // Removed parseFloat so it remains a string
          : "0"
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





//done
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
          totalSubjects: 0,
          uploadedSubjects: 0,
          pendingSubjects: 0,
          progressPercentage: "0.00" // String representation
        }
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

    // 8. Send back the calculated percentages and counts without academicYear
    return res.status(200).json({
      success: true,
      data: {
        course: targetCourse,
        totalSubjects: totalCount,
        uploadedSubjects: uploadedCount,
        pendingSubjects: pendingCount,
        progressPercentage: totalCount > 0 
          ? ((uploadedCount / totalCount) * 100).toFixed(2) // Removed parseFloat so it remains a string
          : "0.00"
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