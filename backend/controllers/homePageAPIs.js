const Subject = require('../models/subject');

// ============================================================================
// 1. Current Year Reports (BCA & MCA specific)
// ============================================================================

// @desc    Get uploaded subject counts for current year (BCA & MCA)
const handleGetCurrentYearSubjectForBcaMcaCount = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const report = await Subject.aggregate([
            {
                $match: {
                    status: "Uploaded",
                    course: { $in: ["BCA", "MCA", "bca", "mca"] }, // Case tolerant
                    academicYear: currentYear
                }
            },
            {
                $group: {
                    _id: { $toUpper: "$course" },
                    uploadedCount: { $sum: 1 }
                }
            }
        ]);

        // Map over standard formats to ensure both always exist in response
        const data = ["BCA", "MCA"].map(courseName => ({
            course: courseName,
            uploadedCount: report.find(item => item._id === courseName)?.uploadedCount || 0
        }));

        return res.status(200).json({ success: true, year: currentYear, data });
    } catch (error) {
        console.error("Current Year Subject Count Error:", error);
        return res.status(500).json({ success: false, message: "Server Error fetching counts", error: error.message });
    }
};

// @desc    Get pending CO-PO mapping counts for current year (BCA & MCA)
const handleGetPendingCopoMappingStatus = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const report = await Subject.aggregate([
            {
                $match: {
                    copoMappingStatus: "Pending",
                    academicYear: currentYear,
                    course: { $in: ["BCA", "MCA", "bca", "mca"] }
                }
            },
            {
                $group: {
                    _id: { $toUpper: "$course" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const data = ["BCA", "MCA"].map(courseName => ({
            course: courseName,
            count: report.find(item => item._id === courseName)?.count || 0
        }));

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("COPO Mapping Status Error:", error);
        return res.status(500).json({ success: false, message: "Server Error fetching COPO mapping counts", error: error.message });
    }
};

// @desc    Get total subjects count for current year (BCA & MCA)
const handleGetCurrentYearTotalSubjectsByCourse = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const report = await Subject.aggregate([
            {
                $match: {
                    academicYear: currentYear,
                    course: { $in: ['BCA', 'MCA', 'bca', 'mca'] }
                }
            },
            {
                $group: {
                    _id: { $toUpper: '$course' },
                    totalSubjects: { $sum: 1 }
                }
            }
        ]);

        const data = ["BCA", "MCA"].map(courseName => ({
            course: courseName,
            totalSubjects: report.find(item => item._id === courseName)?.totalSubjects || 0
        }));

        return res.status(200).json({ success: true, year: currentYear, data });
    } catch (error) {
        console.error('Total Subjects Report Error:', error);
        return res.status(500).json({ success: false, message: 'Server Error fetching total subjects count', error: error.message });
    }
};

// ============================================================================
// 2. Progress Reports (Optimized with a Reusable Helper)
// ============================================================================

/**
 * HELPER: Highly optimized aggregation that calculates Uploaded, Pending, and Total 
 * in a SINGLE database pass using $cond (conditional sums).
 * 
 * @param {String} course - The course name (e.g., 'MCA')
 * @param {String} statusField - The DB field to check (e.g., 'status' or 'copoMappingStatus')
 */
const calculateProgressStats = async (course, statusField) => {
    const stats = await Subject.aggregate([
        // 1. Filter by target course (case-insensitive via regex or matching both)
        { $match: { course: { $regex: new RegExp(`^${course}$`, 'i') } } },
        
        // 2. Group into a single document, calculating all stats simultaneously
        {
            $group: {
                _id: null,
                uploadedCount: { 
                    $sum: { $cond: [{ $eq: [`$${statusField}`, "Uploaded"] }, 1, 0] } 
                },
                pendingCount: { 
                    $sum: { $cond: [{ $eq: [`$${statusField}`, "Pending"] }, 1, 0] } 
                },
                totalCount: { $sum: 1 }
            }
        }
    ]);

    // 3. Extract results safely (fallback to 0s if no subjects exist)
    const result = stats[0] || { uploadedCount: 0, pendingCount: 0, totalCount: 0 };
    
    return {
        course: course.toUpperCase(),
        totalSubjects: result.totalCount,
        uploadedSubjects: result.uploadedCount,
        pendingSubjects: result.pendingCount,
        progressPercentage: result.totalCount > 0 
            ? ((result.uploadedCount / result.totalCount) * 100).toFixed(2) 
            : 0
    };
};

// --- API Controllers relying on the optimized helper ---

const handleGetProgressOfMCA = async (req, res) => {
    try {
        const data = await calculateProgressStats('MCA', 'status');
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const handleGetProgressOfBCA = async (req, res) => {
    try {
        const data = await calculateProgressStats('BCA', 'status');
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const handleGetProgressOfCoPoMappingForMCA = async (req, res) => {
    try {
        const data = await calculateProgressStats('MCA', 'copoMappingStatus');
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const handleGetProgressOfCoPoMappingForBCA = async (req, res) => {
    try {
        const data = await calculateProgressStats('BCA', 'copoMappingStatus');
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    handleGetCurrentYearSubjectForBcaMcaCount,
    handleGetPendingCopoMappingStatus,
    handleGetCurrentYearTotalSubjectsByCourse,
    handleGetProgressOfMCA,
    handleGetProgressOfBCA,
    handleGetProgressOfCoPoMappingForMCA,
    handleGetProgressOfCoPoMappingForBCA,
};




// const Subject = require('../models/subject');

// const handleGetCurrentYearSubjectForBcaMcaCount = async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();

//     const report = await Subject.aggregate([
//       {
//         $match: {
//           status: "Uploaded",
//           course: { $in: ["BCA", "MCA"] },
//           academicYear: currentYear
//         }
//       },
//       {
//         $group: {
//           _id: "$course",
//           uploadedCount: { $sum: 1 }
//         }
//       }
//     ]);

//     const data = [
//       {
//         course: "BCA",
//         uploadedCount:
//           report.find(item => item._id === "BCA")?.uploadedCount || 0
//       },
//       {
//         course: "MCA",
//         uploadedCount:
//           report.find(item => item._id === "MCA")?.uploadedCount || 0
//       }
//     ];

//     return res.status(200).json({
//       success: true,
//       year: currentYear,
//       data
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server Error fetching current year counts",
//       error: error.message
//     });
//   }
// };



// // @desc    Get uploaded CO-PO mapping counts for current year (BCA & MCA)
// // @route   GET /api/reports/uploaded-copo-mapping-count
// // @access  Protect/Faculty
// const handleGetPendingCopoMappingStatus = async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();

//     const report = await Subject.aggregate([
//       {
//         $match: {
//           copoMappingStatus: "Pending",
//           academicYear: currentYear,
//           course: { $in: ["BCA", "MCA"] }
//         }
//       },
//       {
//         $group: {
//           _id: { $toUpper: "$course" },
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const data = [
//       {
//         course: "BCA",
//         count: report.find(item => item._id === "BCA")?.count || 0
//       },
//       {
//         course: "MCA",
//         count: report.find(item => item._id === "MCA")?.count || 0
//       }
//     ];

//     return res.status(200).json({
//       success: true,
//       data
//     });

//   } catch (error) {
//     console.error("COPO Mapping Status Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server Error fetching COPO mapping counts",
//       error: error.message
//     });
//   }
// };


// // @desc    Get total subjects count for current year (BCA & MCA)
// // @route   GET /api/reports/current-year-total-subjects
// // @access  Protect/Faculty
// const handleGetCurrentYearTotalSubjectsByCourse = async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();

//     const report = await Subject.aggregate([
//       {
//         $match: {
//           academicYear: currentYear,
//           course: { $in: ['BCA', 'MCA'] }
//         }
//       },
//       {
//         $group: {
//           _id: { $toUpper: '$course' },
//           totalSubjects: { $sum: 1 }
//         }
//       }
//     ]);

//     const data = [
//       {
//         course: 'BCA',
//         totalSubjects:
//           report.find(item => item._id === 'BCA')?.totalSubjects || 0
//       },
//       {
//         course: 'MCA',
//         totalSubjects:
//           report.find(item => item._id === 'MCA')?.totalSubjects || 0
//       }
//     ];

//     return res.status(200).json({
//       success: true,
//       year: currentYear,
//       data
//     });
//   } catch (error) {
//     console.error('Total Subjects Report Error:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Server Error fetching total subjects count',
//       error: error.message
//     });
//   }
// };


// const handleGetProgressOfMCA = async (req, res) => {
//   try {
//     const stats = await Subject.aggregate([
//       // 1. Filter only for MCA department
//       { $match: { course: 'MCA' } },
      
//       // 2. Group by status to get counts for each
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // 3. Format the response
//     const uploadedCount = stats.find(item => item._id === 'Uploaded')?.count || 0;
//     const pendingCount = stats.find(item => item._id === 'Pending')?.count || 0;
//     const totalCount = uploadedCount + pendingCount;

//     res.status(200).json({
//       success: true,
//       data: {
//         course: 'MCA',
//         totalSubjects: totalCount,
//         uploadedSubjects: uploadedCount,
//         pendingSubjects: pendingCount,
//         // Optional: include progress percentage
//         progressPercentage: totalCount > 0 
//           ? ((uploadedCount / totalCount) * 100).toFixed(2) 
//           : 0
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




// const handleGetProgressOfBCA = async (req, res) => {
//   try {
//     const stats = await Subject.aggregate([
//       // 1. Filter only for MCA department
//       { $match: { course: 'BCA' } },
      
//       // 2. Group by status to get counts for each
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // 3. Format the response
//     const uploadedCount = stats.find(item => item._id === 'Uploaded')?.count || 0;
//     const pendingCount = stats.find(item => item._id === 'Pending')?.count || 0;
//     const totalCount = uploadedCount + pendingCount;

//     res.status(200).json({
//       success: true,
//       data: {
//         course: 'BCA',
//         totalSubjects: totalCount,
//         uploadedSubjects: uploadedCount,
//         pendingSubjects: pendingCount,
//         // Optional: include progress percentage
//         progressPercentage: totalCount > 0 
//           ? ((uploadedCount / totalCount) * 100).toFixed(2) 
//           : 0
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// const handleGetProgressOfCoPoMappingForMCA = async (req, res) => {
//   try {
//     const stats = await Subject.aggregate([
//       // 1. Filter only for MCA department
//       { $match: { course: 'MCA' } },
      
//       // 2. Group by status to get counts for each
//       {
//         $group: {
//           _id: "$copoMappingStatus",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // 3. Format the response
//     const uploadedCount = stats.find(item => item._id === 'Uploaded')?.count || 0;
//     const pendingCount = stats.find(item => item._id === 'Pending')?.count || 0;
//     const totalCount = uploadedCount + pendingCount;

//     res.status(200).json({
//       success: true,
//       data: {
//         course: 'MCA',
//         totalSubjects: totalCount,
//         uploadedSubjects: uploadedCount,
//         pendingSubjects: pendingCount,
//         // Optional: include progress percentage
//         progressPercentage: totalCount > 0 
//           ? ((uploadedCount / totalCount) * 100).toFixed(2) 
//           : 0
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// const handleGetProgressOfCoPoMappingForBCA = async (req, res) => {
//   try {
//     const stats = await Subject.aggregate([
//       // 1. Filter only for MCA department
//       { $match: { course: 'BCA' } },
      
//       // 2. Group by status to get counts for each
//       {
//         $group: {
//           _id: "$copoMappingStatus",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // 3. Format the response
//     const uploadedCount = stats.find(item => item._id === 'Uploaded')?.count || 0;
//     const pendingCount = stats.find(item => item._id === 'Pending')?.count || 0;
//     const totalCount = uploadedCount + pendingCount;

//     res.status(200).json({
//       success: true,
//       data: {
//         course: 'BCA',
//         totalSubjects: totalCount,
//         uploadedSubjects: uploadedCount,
//         pendingSubjects: pendingCount,
//         // Optional: include progress percentage
//         progressPercentage: totalCount > 0 
//           ? ((uploadedCount / totalCount) * 100).toFixed(2) 
//           : 0
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// module.exports = {
//   handleGetCurrentYearSubjectForBcaMcaCount,
//   handleGetPendingCopoMappingStatus,
//   handleGetCurrentYearTotalSubjectsByCourse,
//   handleGetProgressOfMCA,
//   handleGetProgressOfBCA,
//   handleGetProgressOfCoPoMappingForMCA,
//   handleGetProgressOfCoPoMappingForBCA,
// };