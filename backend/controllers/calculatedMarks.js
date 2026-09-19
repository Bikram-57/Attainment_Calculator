const Mark = require('../models/marks');
const CalculatedMark = require('../models/calculatedMarks');
const { getActiveRubric } = require('../utils/rubricHelper'); 
const logActivity = require('../utils/activityLogger');     


// Ensure getActiveRubric is imported at the top!
// const { getActiveRubric } = require('../helpers/rubricHelper');

async function handleCalculatedMarks(req, res, isPipelineArg = false) {
    // 🛡️ THE PIPELINE SHIELD
    const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

    try {
        const { subjectId, academicYear, course } = req.body;
        const cleanSubjectId = subjectId?.trim().toUpperCase();
        const cleanCourse = course?.trim().toUpperCase();
        const cleanAcademicYear = academicYear?.trim(); // This acts as your Admission Batch Year

        // 1. Fetch the Raw Data 
        const rawData = await Mark.findOne({ 
            subjectId: cleanSubjectId, 
            academicYear: cleanAcademicYear, 
            course: cleanCourse 
        }).lean(); 

        if (!rawData) {
            const errMsg = "Calculation Logic: Raw marks not found.";
            if (isPipeline) throw new Error(errMsg);
            if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
            return;
        }

        // 2. Fetch the Dynamic Rubric
        // 🌟 CRITICAL FIX: Pass cleanSubjectId so the helper can find the semester!
        // We also destructure the `formattedYear` from your new helper response.
        const { rubric: activeRubric, formattedYear, semesterType } = await getActiveRubric(cleanSubjectId, cleanAcademicYear);

        if (!activeRubric?.thresholds?.length) {
            const errMsg = `Calculation Logic: No rubric found for Exam Year ${formattedYear} in ${semesterType} Semester.`;
            if (isPipeline) throw new Error(errMsg);
            if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
            return;
        }

        // 3. Perform the Math
        const totalStudents = rawData.actualMarks?.length || 0;
        const attainmentReport = {};
        
        const sortedThresholds = [...activeRubric.thresholds].sort((a, b) => b.minPercent - a.minPercent);

        for (const [coKey, max] of Object.entries(rawData.maxMarks || {})) {
            if (!max || max <= 0) continue; 

            const target = max * 0.60; // 60% target
            let countAbove = 0;
            
            for (let i = 0; i < totalStudents; i++) {
                if ((rawData.actualMarks[i].marks[coKey] || 0) >= target) {
                    countAbove++;
                }
            }

            const percent = totalStudents > 0 ? parseFloat(((countAbove / totalStudents) * 100).toFixed(2)) : 0;

            let level = 0; 
            for (const threshold of sortedThresholds) {
                if (percent >= threshold.minPercent) {
                    level = threshold.level;
                    break; 
                }
            }

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
                    maxMarks: rawData.maxMarks,       
                    actualMarks: rawData.actualMarks, 
                    reportData: attainmentReport,     
                    totalStudents,
                    calculatedAt: new Date() 
                } 
            },
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
