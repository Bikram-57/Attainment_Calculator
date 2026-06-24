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



// @desc    Get uploaded CO-PO mapping counts for current year (BCA & MCA)
// @route   GET /api/reports/uploaded-copo-mapping-count
// @access  Protect/Faculty
const handleGetPendingCopoMappingStatus = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const report = await Subject.aggregate([
      {
        $match: {
          copoMappingStatus: "Pending",
          academicYear: currentYear,
          course: { $in: ["BCA", "MCA"] }
        }
      },
      {
        $group: {
          _id: { $toUpper: "$course" },
          count: { $sum: 1 }
        }
      }
    ]);

    const data = [
      {
        course: "BCA",
        count: report.find(item => item._id === "BCA")?.count || 0
      },
      {
        course: "MCA",
        count: report.find(item => item._id === "MCA")?.count || 0
      }
    ];

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("COPO Mapping Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error fetching COPO mapping counts",
      error: error.message
    });
  }
};

module.exports = {
  handleGetCurrentYearSubjectForBcaMcaCount,
  handleGetPendingCopoMappingStatus,
};