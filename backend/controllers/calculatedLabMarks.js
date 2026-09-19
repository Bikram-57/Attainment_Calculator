const LabMark = require('../models/LabMark'); // Adjust path to your raw lab marks model
const CalculatedLabMark = require('../models/CalculatedLabMark'); // Adjust path
const { getActiveRubric } = require('../utils/rubricHelper'); // Adjust path

async function handleCalculatedLabMarks(req, res, isPipelineArg = false) {
    // 🛡️ THE PIPELINE SHIELD
    const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

    try {
        const { subjectId, academicYear, course } = req.body;
        const cleanSubjectId = subjectId?.trim().toUpperCase();
        const cleanCourse = course?.trim().toUpperCase();
        const cleanAcademicYear = academicYear?.trim(); // Admission Batch Year

        // 1. Fetch the Raw Data for Labs
        const rawData = await LabMark.findOne({ 
            subjectId: cleanSubjectId, 
            academicYear: cleanAcademicYear, 
            course: cleanCourse 
        }).lean(); 

        if (!rawData) {
            const errMsg = "Lab Calculation Logic: Raw lab marks not found.";
            if (isPipeline) throw new Error(errMsg);
            if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
            return;
        }

        // 2. Fetch the Dynamic Rubric
        const { rubric: activeRubric, formattedYear, semesterType } = await getActiveRubric(cleanSubjectId, cleanAcademicYear);

        if (!activeRubric?.thresholds?.length) {
            const errMsg = `Lab Calculation Logic: No rubric found for Exam Year ${formattedYear} in ${semesterType} Semester.`;
            if (isPipeline) throw new Error(errMsg);
            if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
            return;
        }

        // 3. Perform the Math
        const totalStudents = rawData.actualMarks?.length || 0;
        const attainmentReport = {};
        
        // Sort thresholds highest to lowest (e.g., Level 3 -> Level 2 -> Level 1)
        const sortedThresholds = [...activeRubric.thresholds].sort((a, b) => b.minPercent - a.minPercent);

        for (const [coKey, max] of Object.entries(rawData.maxMarks || {})) {
            if (!max || max <= 0) continue; 

            const target = max * 0.60; // 60% target marks
            let countAbove = 0;
            
            for (let i = 0; i < totalStudents; i++) {
                // Accessing marks depending on how Mongoose structured the lean Map
                const studentMarks = rawData.actualMarks[i].marks || {};
                const score = studentMarks[coKey] || 0;
                
                if (score >= target) {
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
        const calculatedData = await CalculatedLabMark.findOneAndUpdate(
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
                message: `Lab attainment calculated and saved successfully for ${formattedYear}.`,
                data: calculatedData
            });
        }

    } catch (error) {
        console.error("Lab Attainment Log Error:", error.message);
        if (isPipeline) throw error; 
        
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Server Error", error: error.message });
        }
    }
}

module.exports = { handleCalculatedLabMarks };