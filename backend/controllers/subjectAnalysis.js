const AttainmentModel = require('../models/finalAttainment'); 

const getSemesterAttainments = async (req, res) => {
  try {
    // 1. Now we ask for 'semester' along with course and year!
    const { course, academicYear, semester } = req.query;

    if (!course || !academicYear || !semester) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide 'course', 'academicYear', and 'semester'." 
      });
    }

    // Convert semester to a Number (URLs always send data as Strings)
    // If your Subject DB stores semester as a String like "2", remove this line!
    const numericSemester = parseInt(semester, 10);

    // 2. Run the Aggregation Pipeline
    const results = await AttainmentModel.aggregate([
      // Step A: Filter Attainments by Course and Year
      { 
        $match: { 
          course: course, 
          academicYear: academicYear 
        } 
      },
      
      // Step B: Join with the Subjects collection
      {
        $lookup: {
          from: "subjects",          // Your subjects collection name
          localField: "subjectId",
          foreignField: "subjectId",
          as: "subjectDetails"
        }
      },

      // Step C: Flatten the array (we remove preserveNullAndEmptyArrays so it drops unknown subjects)
      {
        $unwind: "$subjectDetails"
      },

      // Step D: THE FIX! Filter by the semester saved in the Subject DB
      {
        $match: {
          "subjectDetails.semester": numericSemester // Matches the requested semester
        }
      },

      // Step E: Format the final output
      { 
        $project: { 
          _id: 0,
          subjectId: 1,
          finalSubjectAttainment: 1,
          subjectName: "$subjectDetails.subjectName"
        } 
      }
    ]);

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error("Error in getSemesterAttainments:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the attainment data."
    });
  }
};

module.exports = {
  getSemesterAttainments
};