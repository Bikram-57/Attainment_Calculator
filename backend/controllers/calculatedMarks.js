const Mark = require('../models/marks');
const CalculatedMark = require('../models/calculatedMarks');
const { getActiveRubric } = require('../utils/rubricHelper'); 
const logActivity = require('../utils/activityLogger');     

// ---------------------------------------------------------------------------
// 1. Calculate & Save Attainment Marks
// ---------------------------------------------------------------------------
// async function handleCalculatedMarks(req, res, isPipelineArg = false) {
//     // 🛡️ THE PIPELINE SHIELD
//     // If Express passes `next`, it's ignored. If passed `true` manually, it bypasses `res` sends.
//     const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

//     try {
//         const { subjectId, academicYear, course } = req.body;
//         const cleanSubjectId = subjectId?.toUpperCase();
//         const cleanCourse = course?.toUpperCase();

//         // 1. Fetch the Raw Data (Using .lean() for read-speed)
//         const rawData = await Mark.findOne({ 
//             subjectId: cleanSubjectId, 
//             academicYear, 
//             course: cleanCourse 
//         }).lean(); 

//         if (!rawData) {
//             const errMsg = "Calculation Logic: Raw marks not found.";
//             if (isPipeline) throw new Error(errMsg);
//             if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
//             return;
//         }

//         // 2. Fetch the Dynamic Rubric
//         const activeRubric = await getActiveRubric(cleanCourse, academicYear);

//         if (!activeRubric?.thresholds?.length) {
//             const errMsg = `Calculation Logic: No rubric found for ${cleanCourse} in or before ${academicYear}.`;
//             if (isPipeline) throw new Error(errMsg);
//             if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
//             return;
//         }

//         // 3. Perform the Math
//         const totalStudents = rawData.actualMarks?.length || 0;
//         const attainmentReport = {};
        
//         // OPTIMIZATION: Pre-sort thresholds descending once, so we can just break the loop on the first match
//         const sortedThresholds = [...activeRubric.thresholds].sort((a, b) => b.minPercent - a.minPercent);

//         // Iterate dynamically over CO keys using Object.entries
//         for (const [coKey, max] of Object.entries(rawData.maxMarks || {})) {
//             // SAFETY CHECK: Skip columns that have 0 max marks to avoid division by zero
//             if (!max || max <= 0) continue; 

//             const target = max * 0.60; // 60% target

//             // OPTIMIZATION: Standard loop instead of .filter().length saves memory by avoiding intermediate arrays
//             let countAbove = 0;
//             for (let i = 0; i < totalStudents; i++) {
//                 if ((rawData.actualMarks[i].marks[coKey] || 0) >= target) {
//                     countAbove++;
//                 }
//             }

//             // Calculate percent safely
//             const percent = totalStudents > 0 ? parseFloat(((countAbove / totalStudents) * 100).toFixed(2)) : 0;

//             // --- Dynamic Level Calculation ---
//             let level = 0; 
//             for (const threshold of sortedThresholds) {
//                 // Because we pre-sorted descending, the first threshold it is greater than is the correct level
//                 if (percent >= threshold.minPercent) {
//                     level = threshold.level;
//                     break; 
//                 }
//             }

//             // Construct report for this specific CO
//             attainmentReport[coKey] = {
//                 maxMarks: max, 
//                 targetMarks: parseFloat(target.toFixed(2)),
//                 studentsAboveTarget: countAbove,
//                 attainmentPercent: percent,
//                 attainmentLevel: level
//             };
//         }

//         // 4. Save exactly in the requested order
//         const calculatedData = await CalculatedMark.findOneAndUpdate(
//             { subjectId: cleanSubjectId, academicYear, course: cleanCourse },
//             { 
//                 $set: { 
//                     maxMarks: rawData.maxMarks,       // CRITICAL FIX: Save max marks so the GET API has them
//                     actualMarks: rawData.actualMarks, // First actual marks
//                     reportData: attainmentReport,     // Then report data
//                     totalStudents,
//                     calculatedAt: new Date() 
//                 } 
//             },
//             // lean: true forces Mongoose to return a plain object instead of a heavy document
//             { upsert: true, new: true, strict: false, lean: true } 
//         );

//         // --- PIPELINE EXIT ---
//         if (isPipeline) return true; 
        
//         if (!res.headersSent) {
//             return res.status(200).json({
//                 success: true,
//                 message: "Attainment calculated and saved successfully.",
//                 data: calculatedData
//             });
//         }

//     } catch (error) {
//         console.error("Attainment Log Error:", error.message);
//         if (isPipeline) throw error; 
        
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//         }
//     }
// }





async function handleCalculatedMarks(req, res, isPipelineArg = false) {
    // 🛡️ THE PIPELINE SHIELD
    // If Express passes `next`, it's ignored. If passed `true` manually, it bypasses `res` sends.
    const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

    try {
        const { subjectId, academicYear, course, batch } = req.body;
        const cleanSubjectId = subjectId?.trim().toUpperCase();
        const cleanCourse = course?.trim().toUpperCase();
        const cleanAcademicYear = academicYear?.trim();
        
        // Safely use batch if it exists, otherwise fall back to academicYear
        const cleanBatch = batch?.trim() || cleanAcademicYear; 

        // 1. Fetch the Raw Data (Using .lean() for read-speed)
        const rawData = await Mark.findOne({ 
            subjectId: cleanSubjectId, 
            academicYear: cleanAcademicYear, 
            course: cleanCourse 
            // Note: If you added batch to your Mark schema, add `batch: cleanBatch` here!
        }).lean(); 

        if (!rawData) {
            const errMsg = "Calculation Logic: Raw marks not found.";
            if (isPipeline) throw new Error(errMsg);
            if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
            return;
        }

        // 2. Fetch the Dynamic Rubric
        // 🌟 CRITICAL FIX: Pass cleanSubjectId instead of cleanCourse!
        // We also destructure both the rubric AND formattedYear from your new helper.
        const { rubric: activeRubric, formattedYear } = await getActiveRubric(cleanSubjectId, cleanBatch);

        if (!activeRubric?.thresholds?.length) {
            const errMsg = `Calculation Logic: No rubric found for Exam Year ${formattedYear}.`;
            if (isPipeline) throw new Error(errMsg);
            if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
            return;
        }

        // 3. Perform the Math
        const totalStudents = rawData.actualMarks?.length || 0;
        const attainmentReport = {};
        
        // OPTIMIZATION: Pre-sort thresholds descending once, so we can just break the loop on the first match
        const sortedThresholds = [...activeRubric.thresholds].sort((a, b) => b.minPercent - a.minPercent);

        // Iterate dynamically over CO keys using Object.entries
        for (const [coKey, max] of Object.entries(rawData.maxMarks || {})) {
            // SAFETY CHECK: Skip columns that have 0 max marks to avoid division by zero
            if (!max || max <= 0) continue; 

            const target = max * 0.60; // 60% target

            // OPTIMIZATION: Standard loop instead of .filter().length saves memory by avoiding intermediate arrays
            let countAbove = 0;
            for (let i = 0; i < totalStudents; i++) {
                if ((rawData.actualMarks[i].marks[coKey] || 0) >= target) {
                    countAbove++;
                }
            }

            // Calculate percent safely
            const percent = totalStudents > 0 ? parseFloat(((countAbove / totalStudents) * 100).toFixed(2)) : 0;

            // --- Dynamic Level Calculation ---
            let level = 0; 
            for (const threshold of sortedThresholds) {
                // Because we pre-sorted descending, the first threshold it is greater than is the correct level
                if (percent >= threshold.minPercent) {
                    level = threshold.level;
                    break; 
                }
            }

            // Construct report for this specific CO
            attainmentReport[coKey] = {
                maxMarks: max, 
                targetMarks: parseFloat(target.toFixed(2)),
                studentsAboveTarget: countAbove,
                attainmentPercent: percent,
                attainmentLevel: level
            };
        }

        // 4. Save exactly in the requested order
        const calculatedData = await CalculatedMark.findOneAndUpdate(
            { subjectId: cleanSubjectId, academicYear: cleanAcademicYear, course: cleanCourse },
            { 
                $set: { 
                    // batch: cleanBatch, // Uncomment if you want to save the batch to the DB here!
                    maxMarks: rawData.maxMarks,       // CRITICAL FIX: Save max marks so the GET API has them
                    actualMarks: rawData.actualMarks, // First actual marks
                    reportData: attainmentReport,     // Then report data
                    totalStudents,
                    calculatedAt: new Date() 
                } 
            },
            // lean: true forces Mongoose to return a plain object instead of a heavy document
            { upsert: true, new: true, strict: false, lean: true } 
        );

        // --- PIPELINE EXIT ---
        if (isPipeline) return true; 
        
        if (!res.headersSent) {
            return res.status(200).json({
                success: true,
                message: `Attainment calculated and saved successfully for ${formattedYear}.`,
                data: calculatedData
            });
        }

    } catch (error) {
        console.error("Attainment Log Error:", error.message);
        if (isPipeline) throw error; 
        
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Server Error", error: error.message });
        }
    }
}

// ---------------------------------------------------------------------------
// 2. Fetch Calculated Marks
// ---------------------------------------------------------------------------
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

        // 2. Fetch the document (.lean() ensures blazing fast read operations)
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

        // 4. Return the combined structured data
        return res.status(200).json({
            success: true,
            metadata: {
                subjectId: report.subjectId,
                academicYear: report.academicYear,
                course: report.course,
                totalStudents: report.totalStudents
            },
            studentMarks: report.actualMarks, 
            maxMarks: report.maxMarks, // FIXED: This will now successfully return data!
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
    getCalculatedWithStudentMarks,
};





// const Mark = require('../models/marks');
// const CalculatedMark = require('../models/calculatedMarks');
// const { getActiveRubric } = require('../utils/rubricHelper'); // Adjust the path if your helper is in a different folder
// const logActivity = require('../utils/activityLogger');     // The new logger!

// async function handleCalculatedMarks(req, res, isPipelineArg = false) {
//     // 🛡️ THE PIPELINE SHIELD (The "Ignore" Function)
//     // If Express accidentally passes 'next', this forces it to false. 
//     // If the router passes 'true', the controller knows to ignore the res object.
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
//             const errMsg = "Calculation Logic: Raw marks not found.";
//             if (isPipeline) throw new Error(errMsg);
            
//             // 🛡️ THE HEADER SHIELD
//             if (!res.headersSent) {
//                 return res.status(404).json({ success: false, message: errMsg });
//             }
//             return;
//         }

//         // --- Fetch the Dynamic Rubric ---
//         const activeRubric = await getActiveRubric(course, academicYear);

//         if (!activeRubric || !activeRubric.thresholds || activeRubric.thresholds.length === 0) {
//             const errMsg = `Calculation Logic: No rubric found for ${course.toUpperCase()} in or before ${academicYear}.`;
//             if (isPipeline) throw new Error(errMsg);
            
//             // 🛡️ THE HEADER SHIELD
//             if (!res.headersSent) {
//                 return res.status(404).json({ success: false, message: errMsg });
//             }
//             return;
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

//         // --- PIPELINE EXIT ---
//         // 4. Pass control safely for pipelines vs direct calls
//         if (isPipeline) {
//             return true; 
//         } 
        
//         // 🛡️ THE HEADER SHIELD
//         if (!res.headersSent) {
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
//         } 
        
//         // 🛡️ THE HEADER SHIELD
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//         }
//     }
// }







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
//         // .lean() ensures the nested Mixed/Maps are converted safely to standard JSON
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
//             // THE FIX: Changed to actualMarks to match the database
//             studentMarks: report.actualMarks, 
            
//             // BONUS: Included maxMarks since we just saved it to the DB
//             maxMarks: report.maxMarks,

//             // The Attainment Table (Target, %, Level)
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
//     getCalculatedWithStudentMarks,
// };

