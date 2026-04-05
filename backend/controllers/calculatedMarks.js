const Mark = require('../models/marks');
const CalculatedMark = require('../models/calculatedMarks');

/**
 * handleCalculatedMarks
 * Computes attainment levels for all COs (and Totals!) and saves to db
 */
// async function handleCalculatedMarks(req, res) {
//     try {
//         const { subjectId, academicYear, course } = req.body;

//         // 1. Fetch the Raw Data
//         // ADDED .lean() HERE: This is critical so Mongoose returns plain JS objects, 
//         // allowing us to easily loop through the dynamic "marks" keys.
//         const rawData = await Mark.findOne({ 
//             subjectId: subjectId.toUpperCase(), 
//             academicYear, 
//             course: course.toUpperCase() 
//         }).lean(); 

//         if (!rawData) {
//             return res.status(404).json({ success: false, message: "Calculation Logic: Raw marks not found." });
//         }

//         const totalStudents = rawData.actualMarks.length;
//         const attainmentReport = {};
//         const coKeys = Object.keys(rawData.maxMarks);

//         // 2. Perform the 4-Row Math
//         coKeys.forEach(coKey => {
//             const max = rawData.maxMarks[coKey];

//             // SAFETY CHECK: Skip columns that have 0 max marks to avoid division by zero
//             if (!max || max <= 0) return; 

//             const target = max * 0.60; // 60% target
            
//             const countAbove = rawData.actualMarks.filter(student => {
//                 const score = student.marks[coKey] || 0;
//                 return score >= target;
//             }).length;

//             // SAFETY CHECK: Avoid division by zero if there are no students
//             const percent = totalStudents > 0 ? (countAbove / totalStudents) * 100 : 0;

//             let level = 0;
//             if (percent >= 70) level = 3;
//             else if (percent >= 60) level = 2;
//             else if (percent >= 50) level = 1;

//             attainmentReport[coKey] = {
//                 targetMarks: parseFloat(target.toFixed(2)),
//                 studentsAboveTarget: countAbove,
//                 attainmentPercent: parseFloat(percent.toFixed(2)),
//                 attainmentLevel: level
//             };
//         });

//         // 3. Save everything (including Raw Marks) into the Calculated Document
//         const calculatedData = await CalculatedMark.findOneAndUpdate(
//             { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
//             { 
//                 $set: { 
//                     allStudentMarks: rawData.actualMarks, // <-- Including Raw Marks here
//                     reportData: attainmentReport, 
//                     totalStudents,
//                     calculatedAt: new Date() 
//                 } 
//             },
//             { upsert: true, new: true } // Added new: true to return the updated doc
//         );

//         // 4. FIX: Actually send a response back to the client so the request doesn't hang!
//         return res.status(200).json({
//             success: true,
//             message: "Attainment calculated and saved successfully.",
//             data: calculatedData
//         });

//     } catch (error) {
//         console.error("Attainment Log Error:", error.message);
//         return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// }

async function handleCalculatedMarks(req, res, isPipeline = false) {
    try {
        const { subjectId, academicYear, course } = req.body;

        // 1. Fetch the Raw Data
        // ADDED .lean() HERE: This is critical so Mongoose returns plain JS objects, 
        // allowing us to easily loop through the dynamic "marks" keys.
        const rawData = await Mark.findOne({ 
            subjectId: subjectId.toUpperCase(), 
            academicYear, 
            course: course.toUpperCase() 
        }).lean(); 

        if (!rawData) {
            const errMsg = "Calculation Logic: Raw marks not found.";
            // THE FIX: Throw an error if in pipeline, otherwise send 404
            if (isPipeline) throw new Error(errMsg);
            return res.status(404).json({ success: false, message: errMsg });
        }

        const totalStudents = rawData.actualMarks.length;
        const attainmentReport = {};
        const coKeys = Object.keys(rawData.maxMarks);

        // 2. Perform the 4-Row Math
        coKeys.forEach(coKey => {
            const max = rawData.maxMarks[coKey];

            // SAFETY CHECK: Skip columns that have 0 max marks to avoid division by zero
            if (!max || max <= 0) return; 

            const target = max * 0.60; // 60% target
            
            const countAbove = rawData.actualMarks.filter(student => {
                const score = student.marks[coKey] || 0;
                return score >= target;
            }).length;

            // SAFETY CHECK: Avoid division by zero if there are no students
            const percent = totalStudents > 0 ? (countAbove / totalStudents) * 100 : 0;

            let level = 0;
            if (percent >= 70) level = 3;
            else if (percent >= 60) level = 2;
            else if (percent >= 50) level = 1;

            attainmentReport[coKey] = {
                targetMarks: parseFloat(target.toFixed(2)),
                studentsAboveTarget: countAbove,
                attainmentPercent: parseFloat(percent.toFixed(2)),
                attainmentLevel: level
            };
        });

        // 3. Save everything (including Raw Marks) into the Calculated Document
        const calculatedData = await CalculatedMark.findOneAndUpdate(
            { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
            { 
                $set: { 
                    allStudentMarks: rawData.actualMarks, // <-- Including Raw Marks here
                    reportData: attainmentReport, 
                    totalStudents,
                    calculatedAt: new Date() 
                } 
            },
            { upsert: true, new: true } // Added new: true to return the updated doc
        );

        // 4. THE FIX: Only send a response if we are NOT in a pipeline
        if (isPipeline) {
            return true; // Pass control safely back to the main route
        } else {
            return res.status(200).json({
                success: true,
                message: "Attainment calculated and saved successfully.",
                data: calculatedData
            });
        }

    } catch (error) {
        console.error("Attainment Log Error:", error.message);
        
        // 5. THE FIX: Handle errors properly for pipelines vs direct calls
        if (isPipeline) {
            throw error; // Throw it so the main route's catch block can handle it
        } else {
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        }
    }
}

/**
 * getCalculatedWithStudentMarks
 * Returns the 4-row attainment data + the full student list with their scores.
 */
async function getCalculatedWithStudentMarks(req, res) {
    try {
        const { subjectId, academicYear, course } = req.query;

        // 1. Validation
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ 
                success: false, 
                message: "subjectId, academicYear, and course are required query parameters." 
            });
        }

        // 2. Fetch the document
        // .lean() ensures the nested Mixed/Maps are converted safely to standard JSON
        const report = await CalculatedMark.findOne({
            subjectId: subjectId.toUpperCase(),
            academicYear: academicYear,
            course: course.toUpperCase()
        }).lean();

        // 3. Handle 'Not Found'
        if (!report) {
            return res.status(404).json({ 
                success: false, 
                message: "No calculated data found for this subject." 
            });
        }

        // 4. Return the combined data
        return res.status(200).json({
            success: true,
            metadata: {
                subjectId: report.subjectId,
                academicYear: report.academicYear,
                course: report.course,
                totalStudents: report.totalStudents
            },
            // The Raw Student Marks (RegNo + Individual Scores)
            studentMarks: report.allStudentMarks, 
            // The 4-row Attainment Table (Target, %, Level)
            attainmentReport: report.reportData
        });

    } catch (error) {
        console.error("Fetch Combined Calculated Marks Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "Internal Server Error while fetching calculations." 
        });
    }
}

module.exports = { 
    handleCalculatedMarks,
    getCalculatedWithStudentMarks
};

// const Mark = require('../models/marks');
// const CalculatedMark = require('../models/calculatedMarks');

// async function handleCalculatedMarks(req, res) {
//     try {
//         const { subjectId, academicYear, course } = req.body;

//         // 1. Fetch the Raw Data
//         const rawData = await Mark.findOne({ 
//             subjectId: subjectId.toUpperCase(), 
//             academicYear, 
//             course: course.toUpperCase() 
//         });

//         if (!rawData) throw new Error("Calculation Logic: Raw marks not found.");

//         const totalStudents = rawData.actualMarks.length;
//         const attainmentReport = {};
//         const coKeys = Object.keys(rawData.maxMarks);

//         // 2. Perform the 4-Row Math
//         coKeys.forEach(coKey => {
//             const max = rawData.maxMarks[coKey];
//             const target = max * 0.60;
//             const countAbove = rawData.actualMarks.filter(student => (student.marks[coKey] || 0) >= target).length;
//             const percent = (countAbove / totalStudents) * 100;

//             let level = 0;
//             if (percent >= 70) level = 3;
//             else if (percent >= 60) level = 2;
//             else if (percent >= 50) level = 1;

//             attainmentReport[coKey] = {
//                 targetMarks: parseFloat(target.toFixed(2)),
//                 studentsAboveTarget: countAbove,
//                 attainmentPercent: parseFloat(percent.toFixed(2)),
//                 attainmentLevel: level
//             };
//         });

//         // 3. Save everything (including Raw Marks) into the Calculated Document
//         await CalculatedMark.findOneAndUpdate(
//             { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
//             { 
//                 $set: { 
//                     allStudentMarks: rawData.actualMarks, // <-- Including Raw Marks here
//                     reportData: attainmentReport, 
//                     totalStudents,
//                     calculatedAt: new Date() 
//                 } 
//             },
//             { upsert: true }
//         );

//         return; 

//     } catch (error) {
//         console.error("Attainment Log Error:", error.message);
//         throw error;
//     }
// }


// /**
//  * getCalculatedWithStudentMarks
//  * Returns the 4-row attainment data + the full student list with their scores.
//  */
// async function getCalculatedWithStudentMarks(req, res) {
//     try {
//         const { subjectId, academicYear, course } = req.query;

//         // 1. Validation
//         if (!subjectId || !academicYear || !course) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "subjectId, academicYear, and course are required query parameters." 
//             });
//         }

//         // 2. Fetch the document
//         // .lean() ensures the nested Maps (marks and reportData) are converted to JSON
//         const report = await CalculatedMark.findOne({
//             subjectId: subjectId.toUpperCase(),
//             academicYear: academicYear,
//             course: course.toUpperCase()
//         }).lean();

//         // 3. Handle 'Not Found'
//         if (!report) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "No calculated data found for this subject." 
//             });
//         }

//         // 4. Return the combined data
//         return res.status(200).json({
//             success: true,
//             metadata: {
//                 subjectId: report.subjectId,
//                 academicYear: report.academicYear,
//                 course: report.course,
//                 totalStudents: report.totalStudents
//             },
//             // The Raw Student Marks (RegNo + Individual Scores)
//             studentMarks: report.allStudentMarks, 
//             // The 4-row Attainment Table (Target, %, Level)
//             attainmentReport: report.reportData
//         });

//     } catch (error) {
//         console.error("Fetch Combined Calculated Marks Error:", error.message);
//         return res.status(500).json({ 
//             success: false, 
//             error: "Internal Server Error while fetching calculations." 
//         });
//     }
// }

// module.exports = { 
//     handleCalculatedMarks,
//     getCalculatedWithStudentMarks
// };