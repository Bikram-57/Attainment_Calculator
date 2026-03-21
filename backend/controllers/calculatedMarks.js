const Mark = require('../models/marks');
const CalculatedMark = require('../models/calculatedMarks');

async function handleCalculatedMarks(req, res) {
    try {
        const { subjectId, academicYear, course } = req.body;

        // 1. Fetch the Raw Data
        const rawData = await Mark.findOne({ 
            subjectId: subjectId.toUpperCase(), 
            academicYear, 
            course: course.toUpperCase() 
        });

        if (!rawData) throw new Error("Calculation Logic: Raw marks not found.");

        const totalStudents = rawData.actualMarks.length;
        const attainmentReport = {};
        const coKeys = Object.keys(rawData.maxMarks);

        // 2. Perform the 4-Row Math
        coKeys.forEach(coKey => {
            const max = rawData.maxMarks[coKey];
            const target = max * 0.60;
            const countAbove = rawData.actualMarks.filter(student => (student.marks[coKey] || 0) >= target).length;
            const percent = (countAbove / totalStudents) * 100;

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
        await CalculatedMark.findOneAndUpdate(
            { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
            { 
                $set: { 
                    allStudentMarks: rawData.actualMarks, // <-- Including Raw Marks here
                    reportData: attainmentReport, 
                    totalStudents,
                    calculatedAt: new Date() 
                } 
            },
            { upsert: true }
        );

        return; 

    } catch (error) {
        console.error("Attainment Log Error:", error.message);
        throw error;
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
        // .lean() ensures the nested Maps (marks and reportData) are converted to JSON
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
            // The 4-row Attainment Table (Target, %, Level)
            attainmentReport: report.reportData, 
            // The Raw Student Marks (RegNo + Individual Scores)
            studentMarks: report.allStudentMarks 
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