const CalculatedMark = require('../models/calculatedMarks');
const FinalCOAttainment = require('../models/finalCoAttainment');

const generateFinalAttainment = async (req, res) => {
    try {
        const { subjectId, academicYear, course } = req.body;

        // Fetch data from your second collection (calculated_marks)
        const source = await CalculatedMark.findOne({ subjectId, academicYear, course });
        if (!source) return res.status(404).json({ error: "Calculated marks not found" });

        const results = source.attainmentResults;
        const coList = ["CO1", "CO2", "CO3", "CO4", "CO5"]; // Or dynamic from keys

        const coData = coList.map(co => {
            const getVal = (exam) => results[`${exam}_${co}`]?.attainmentLevel || 0;

            const components = [
                getVal("Quiz_1"), getVal("Sessional_1"), 
                getVal("Quiz_2"), getVal("Sessional_2"), 
                getVal("Assignment")
            ];

            const endSem = getVal("End_Sem");
            
            // Total Average Internals
            const totalAvgInt = Number((components.reduce((a, b) => a + b, 0) / components.length).toFixed(2));

            // Grand Total (50% Internal + 50% End Term)
            const grandTotal = Number(((totalAvgInt * 0.5) + (endSem * 0.5)).toFixed(2));

            return {
                coName: co,
                quiz1: components[0], sessional1: components[1],
                quiz2: components[2], sessional2: components[3],
                assignment: components[4],
                endSem,
                totalAvgInt,
                grandTotal
            };
        });

        // Final Bottom-Row value
        const finalAvg = Number((coData.reduce((s, c) => s + c.grandTotal, 0) / coData.length).toFixed(2));

        const report = await FinalCOAttainment.findOneAndUpdate(
            { subjectId, academicYear, course },
            { $set: { coData, finalCourseAttainment: finalAvg, facultyId: source.facultyId } },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { generateFinalAttainment };