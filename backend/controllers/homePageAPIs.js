const Subject = require('../models/subject');

const handleGetCurrentYearSubjectForBcaMcaCount = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const report = await Subject.aggregate([
      {
        $match: {
          status: "Uploaded",
          course: { $in: ["BCA", "MCA"] },
          academicYear: currentYear
        }
      },
      {
        $group: {
          _id: "$course",
          uploadedCount: { $sum: 1 }
        }
      }
    ]);

    const data = [
      {
        course: "BCA",
        uploadedCount:
          report.find(item => item._id === "BCA")?.uploadedCount || 0
      },
      {
        course: "MCA",
        uploadedCount:
          report.find(item => item._id === "MCA")?.uploadedCount || 0
      }
    ];

    return res.status(200).json({
      success: true,
      year: currentYear,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error fetching current year counts",
      error: error.message
    });
  }
};

module.exports = {
  handleGetCurrentYearSubjectForBcaMcaCount
};