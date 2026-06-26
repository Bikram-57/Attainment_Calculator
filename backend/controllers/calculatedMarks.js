const Mark = require('../models/marks');
const CalculatedMark = require('../models/calculatedMarks');
const { getActiveRubric } = require('../utils/rubricHelper'); // Adjust the path if your helper is in a different folder
const logActivity = require('../utils/activityLogger');     // The new logger!


// async function handleCalculatedMarks(req, res, isPipeline = false) {
//     try {
//         const { subjectId, academicYear, course } = req.body;

//         // 1. Fetch the Raw Data
//         const rawData = await Mark.findOne({ 
//             subjectId: subjectId.toUpperCase(), 
//             academicYear, 
//             course: course.toUpperCase() 
//         }).lean(); 

//         if (!rawData) {
//             const errMsg = "Calculation Logic: Raw marks not found.";
//             if (isPipeline) throw new Error(errMsg);
//             return res.status(404).json({ success: false, message: errMsg });
//         }

//         // --- Fetch the Dynamic Rubric ---
//         const activeRubric = await getActiveRubric(course, academicYear);

//         if (!activeRubric || !activeRubric.thresholds || activeRubric.thresholds.length === 0) {
//             const errMsg = `Calculation Logic: No rubric found for ${course.toUpperCase()} in or before ${academicYear}.`;
//             if (isPipeline) throw new Error(errMsg);
//             return res.status(404).json({ success: false, message: errMsg });
//         }
//         // -------------------------------------

//         const totalStudents = rawData.actualMarks.length;
//         const attainmentReport = {};
//         const coKeys = Object.keys(rawData.maxMarks);

//         // 2. Perform the Math
//         coKeys.forEach(coKey => {
//             const max = rawData.maxMarks[coKey];

//             // SAFETY CHECK: Skip columns that have 0 max marks to avoid division by zero
//             if (!max || max <= 0) return; 

//             const target = max * 0.60; // 60% target
            
//             const countAbove = rawData.actualMarks.filter(student => {
//                 const score = student.marks[coKey] || 0;
//                 return score >= target;
//             }).length;

//             // Calculate percent and round safely to 2 decimals
//             const rawPercent = totalStudents > 0 ? (countAbove / totalStudents) * 100 : 0;
//             const percent = parseFloat(rawPercent.toFixed(2));

//             // --- Dynamic Level Calculation ---
//             let level = 0; // Default fallback

//             for (const threshold of activeRubric.thresholds) {
//                 if (percent >= threshold.minPercent && percent <= threshold.maxPercent) {
//                     level = threshold.level;
//                     break; 
//                 }
//             }
//             // --------------------------------------

//             // Individual report object (maxMarks is still kept here inside the report)
//             attainmentReport[coKey] = {
//                 maxMarks: max, 
//                 targetMarks: parseFloat(target.toFixed(2)),
//                 studentsAboveTarget: countAbove,
//                 attainmentPercent: percent,
//                 attainmentLevel: level
//             };
//         });

//         // 3. Save exactly in the requested order (top-level maxMarks removed)
//         const calculatedData = await CalculatedMark.findOneAndUpdate(
//             { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
//             { 
//                 $set: { 
//                     actualMarks: rawData.actualMarks, // 1. First actual marks
//                     reportData: attainmentReport,     // 2. Then after report data
//                     totalStudents,
//                     calculatedAt: new Date() 
//                 } 
//             },
//             { upsert: true, new: true, strict: false } 
//         );

//         // 4. Pass control safely for pipelines vs direct calls
//         if (isPipeline) {
//             return true; 
//         } else {
//             return res.status(200).json({
//                 success: true,
//                 message: "Attainment calculated and saved successfully.",
//                 data: calculatedData
//             });
//         }

//     } catch (error) {
//         console.error("Attainment Log Error:", error.message);
        
//         // 5. Handle errors
//         if (isPipeline) {
//             throw error; 
//         } else {
//             if (!res.headersSent) {
//                 return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//             }
//         }
//     }
// }














async function handleCalculatedMarks(req, res, isPipelineArg = false) {
    // 🛡️ THE PIPELINE SHIELD (The "Ignore" Function)
    // If Express accidentally passes 'next', this forces it to false. 
    // If the router passes 'true', the controller knows to ignore the res object.
    const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

    try {
        const { subjectId, academicYear, course } = req.body;

        // 1. Fetch the Raw Data
        const rawData = await Mark.findOne({ 
            subjectId: subjectId.toUpperCase(), 
            academicYear, 
            course: course.toUpperCase() 
        }).lean(); 

        if (!rawData) {
            const errMsg = "Calculation Logic: Raw marks not found.";
            if (isPipeline) throw new Error(errMsg);
            
            // 🛡️ THE HEADER SHIELD
            if (!res.headersSent) {
                return res.status(404).json({ success: false, message: errMsg });
            }
            return;
        }

        // --- Fetch the Dynamic Rubric ---
        const activeRubric = await getActiveRubric(course, academicYear);

        if (!activeRubric || !activeRubric.thresholds || activeRubric.thresholds.length === 0) {
            const errMsg = `Calculation Logic: No rubric found for ${course.toUpperCase()} in or before ${academicYear}.`;
            if (isPipeline) throw new Error(errMsg);
            
            // 🛡️ THE HEADER SHIELD
            if (!res.headersSent) {
                return res.status(404).json({ success: false, message: errMsg });
            }
            return;
        }
        // -------------------------------------

        const totalStudents = rawData.actualMarks.length;
        const attainmentReport = {};
        const coKeys = Object.keys(rawData.maxMarks);

        // 2. Perform the Math
        coKeys.forEach(coKey => {
            const max = rawData.maxMarks[coKey];

            // SAFETY CHECK: Skip columns that have 0 max marks to avoid division by zero
            if (!max || max <= 0) return; 

            const target = max * 0.60; // 60% target
            
            const countAbove = rawData.actualMarks.filter(student => {
                const score = student.marks[coKey] || 0;
                return score >= target;
            }).length;

            // Calculate percent and round safely to 2 decimals
            const rawPercent = totalStudents > 0 ? (countAbove / totalStudents) * 100 : 0;
            const percent = parseFloat(rawPercent.toFixed(2));

            // --- Dynamic Level Calculation ---
            let level = 0; // Default fallback

            for (const threshold of activeRubric.thresholds) {
                if (percent >= threshold.minPercent && percent <= threshold.maxPercent) {
                    level = threshold.level;
                    break; 
                }
            }
            // --------------------------------------

            // Individual report object (maxMarks is still kept here inside the report)
            attainmentReport[coKey] = {
                maxMarks: max, 
                targetMarks: parseFloat(target.toFixed(2)),
                studentsAboveTarget: countAbove,
                attainmentPercent: percent,
                attainmentLevel: level
            };
        });

        // 3. Save exactly in the requested order (top-level maxMarks removed)
        const calculatedData = await CalculatedMark.findOneAndUpdate(
            { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
            { 
                $set: { 
                    actualMarks: rawData.actualMarks, // 1. First actual marks
                    reportData: attainmentReport,     // 2. Then after report data
                    totalStudents,
                    calculatedAt: new Date() 
                } 
            },
            { upsert: true, new: true, strict: false } 
        );

        // --- PIPELINE EXIT ---
        // 4. Pass control safely for pipelines vs direct calls
        if (isPipeline) {
            return true; 
        } 
        
        // 🛡️ THE HEADER SHIELD
        if (!res.headersSent) {
            return res.status(200).json({
                success: true,
                message: "Attainment calculated and saved successfully.",
                data: calculatedData
            });
        }

    } catch (error) {
        console.error("Attainment Log Error:", error.message);
        
        // 5. Handle errors
        if (isPipeline) {
            throw error; 
        } 
        
        // 🛡️ THE HEADER SHIELD
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Server Error", error: error.message });
        }
    }
}





















// // ==========================================
// // 1. IMPORTS
// // ==========================================
// const Mark = require('../models/marks');                     // Adjust path if needed
// const CalculatedMark = require('../models/calculatedMarks'); // Adjust path if needed
// const User = require('../models/user');                     // Adjust path if needed
// const { getActiveRubric } = require('../utils/rubricHelper');// Adjust path if needed
// const logActivity = require('../utils/activityLogger');     // The new logger!

// // ==========================================
// // 2. CONTROLLER FUNCTIONS
// // ==========================================

// async function handleCalculatedMarks(req, res, isPipelineArg = false) {
//     // 🛡️ THE PIPELINE SHIELD
//     // If Express triggers this via API, isPipelineArg is the 'next' function.
//     // This line forces it to 'false' unless your pipeline explicitly passes the boolean true!
//     const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

//     try {
//         const { subjectId, academicYear, course } = req.body;

//         // 1. Fetch the Raw Data
//         const rawData = await Mark.findOne({ 
//             subjectId: subjectId.toUpperCase(), 
//             academicYear, 
//             course: course.toUpperCase() 
//         }).lean(); 

//         if (!rawData) {
//             const errMsg = `Calculation Logic: Raw marks not found for ${subjectId.toUpperCase()}.`;
//             if (isPipeline) throw new Error(errMsg);
//             // 🛡️ THE HEADER SHIELD: Only send if the pipeline hasn't already sent a response
//             if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
//             return; 
//         }

//         // --- Fetch the Dynamic Rubric ---
//         const activeRubric = await getActiveRubric(course, academicYear);

//         if (!activeRubric || !activeRubric.thresholds || activeRubric.thresholds.length === 0) {
//             const errMsg = `Calculation Logic: No rubric found for ${course.toUpperCase()} in or before ${academicYear}.`;
//             if (isPipeline) throw new Error(errMsg);
//             if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
//             return; 
//         }
//         // -------------------------------------

//         const totalStudents = rawData.actualMarks.length;
//         const attainmentReport = {};
//         const coKeys = Object.keys(rawData.maxMarks);

//         // 2. Perform the Math
//         coKeys.forEach(coKey => {
//             const max = rawData.maxMarks[coKey];
//             if (!max || max <= 0) return; 

//             const target = max * 0.60; 
            
//             const countAbove = rawData.actualMarks.filter(student => {
//                 const score = student.marks[coKey] || 0;
//                 return score >= target;
//             }).length;

//             const rawPercent = totalStudents > 0 ? (countAbove / totalStudents) * 100 : 0;
//             const percent = parseFloat(rawPercent.toFixed(2));

//             let level = 0; 

//             for (const threshold of activeRubric.thresholds) {
//                 if (percent >= threshold.minPercent && percent <= threshold.maxPercent) {
//                     level = threshold.level;
//                     break; 
//                 }
//             }

//             attainmentReport[coKey] = {
//                 maxMarks: max, 
//                 targetMarks: parseFloat(target.toFixed(2)),
//                 studentsAboveTarget: countAbove,
//                 attainmentPercent: percent,
//                 attainmentLevel: level
//             };
//         });

//         // 3. Save exactly in the requested order
//         const calculatedData = await CalculatedMark.findOneAndUpdate(
//             { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
//             { 
//                 $set: { 
//                     actualMarks: rawData.actualMarks, 
//                     reportData: attainmentReport,     
//                     totalStudents,
//                     calculatedAt: new Date() 
//                 } 
//             },
//             { upsert: true, new: true, strict: false } 
//         );

//         // ---> NEW ACTIVITY LOGGING TRIGGER <---
//         if (!isPipeline) {
//             const currentUser = await User.findById(req.user).select('name').lean();
//             const actorName = currentUser ? currentUser.name : "a Faculty Member";

//             await logActivity(
//                 req.user, 
//                 'CALCULATED_ATTAINMENT', 
//                 `Marks attainment calculated for ${subjectId.toUpperCase()} (${academicYear}) by ${actorName}`, 
//                 [] 
//             );
//         }

//         // 4. Pass control safely
//         if (isPipeline) {
//             return calculatedData; // Return the actual data instead of just 'true' for better pipeline use
//         } else {
//             if (!res.headersSent) {
//                 return res.status(200).json({
//                     success: true,
//                     message: "Attainment calculated and saved successfully.",
//                     data: calculatedData
//                 });
//             }
//         }

//     } catch (error) {
//         console.error("Attainment Log Error:", error.message);
        
//         // 5. Handle errors cleanly
//         if (isPipeline) {
//             throw error; 
//         } else {
//             if (!res.headersSent) {
//                 return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//             }
//         }
//     }
// }



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
            // THE FIX: Changed to actualMarks to match the database
            studentMarks: report.actualMarks, 
            
            // BONUS: Included maxMarks since we just saved it to the DB
            maxMarks: report.maxMarks,

            // The Attainment Table (Target, %, Level)
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




// ==========================================
// 3. EXPORTS
// ==========================================



module.exports = { 
    handleCalculatedMarks,
    getCalculatedWithStudentMarks,
};

