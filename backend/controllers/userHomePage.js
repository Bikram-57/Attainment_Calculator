// controllers/assignSubjectController.js
const AssignSubject = require('../models/AssignSubject'); 
const Subject = require('../models/subject');

const getAssignedSubjectCountForCurrentYear = async (req, res) => {
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




const getPendingCopoMappingCount = async (req, res) => {
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





module.exports = { 
  getAssignedSubjectCountForCurrentYear,
  getPendingCopoMappingCount,
 };