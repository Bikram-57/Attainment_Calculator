const Mark = require('../models/marks');
const CalculatedMark = require('../models/calculatedMarks');
const { getActiveRubric } = require('../utils/rubricHelper'); // Adjust the path if your helper is in a different folder

async function handleCalculatedMarks(req, res, isPipeline = false) {
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
            return res.status(404).json({ success: false, message: errMsg });
        }

        // --- Fetch the Dynamic Rubric ---
        const activeRubric = await getActiveRubric(course, academicYear);

        if (!activeRubric || !activeRubric.thresholds || activeRubric.thresholds.length === 0) {
            const errMsg = `Calculation Logic: No rubric found for ${course.toUpperCase()} in or before ${academicYear}.`;
            if (isPipeline) throw new Error(errMsg);
            return res.status(404).json({ success: false, message: errMsg });
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

        // 4. Pass control safely for pipelines vs direct calls
        if (isPipeline) {
            return true; 
        } else {
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
        } else {
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        }
    }
}



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

module.exports = { 
    handleCalculatedMarks,
    getCalculatedWithStudentMarks
};

