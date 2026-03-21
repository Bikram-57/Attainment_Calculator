const CalculatedMark = require('../models/calculatedMarks');
const FinalAttainment = require('../models/finalAttainment');



async function handleFinalAttainment(req, res) {
    try {
        const { subjectId, academicYear, course } = req.body;

        const calculatedDoc = await CalculatedMark.findOne({ 
            subjectId: subjectId.toUpperCase(), 
            academicYear, 
            course: course.toUpperCase() 
        });

        if (!calculatedDoc) throw new Error("Step 3: Internal Calculation data missing.");

        const coDataMap = {}; 

        // 1. Group EVERY exam level by CO
        calculatedDoc.reportData.forEach((data, key) => {
            const match = key.match(/CO\d+$/);
            if (match) {
                const coName = match[0]; // "CO1"
                const examName = key.replace(`_${coName}`, ""); // "Quiz_1"

                if (!coDataMap[coName]) {
                    coDataMap[coName] = { 
                        exams: {}, 
                        internalLevels: [], 
                        externalLevel: 0 
                    };
                }

                // Identify if it's External or Internal
                if (key.toLowerCase().includes("e-exam") || key.toLowerCase().includes("e_exam") || key.toLowerCase().includes("end_sem")) {
                    coDataMap[coName].externalLevel = data.attainmentLevel;
                } else {
                    coDataMap[coName].exams[examName] = data.attainmentLevel;
                    coDataMap[coName].internalLevels.push(data.attainmentLevel);
                }
            }
        });

        let totalGrandSum = 0;
        const finalTable = {};
        const coKeys = Object.keys(coDataMap);

        // 2. Build the full row for each CO
        coKeys.forEach(co => {
            const coInfo = coDataMap[co];
            const avgInt = coInfo.internalLevels.length > 0 
                ? (coInfo.internalLevels.reduce((a, b) => a + b, 0) / coInfo.internalLevels.length) 
                : 0;
            
            const grandTotal = (avgInt * 0.5) + (coInfo.externalLevel * 0.5);

            // Create the document object with individual exam scores
            finalTable[co] = {
                ...coInfo.exams, // Spreads Quiz_1: 2, Mid_Term: 3, etc.
                internalAvg: parseFloat(avgInt.toFixed(2)),
                externalLevel: coInfo.externalLevel,
                grandTotal: parseFloat(grandTotal.toFixed(2))
            };

            totalGrandSum += grandTotal;
        });

        const finalAttainment = coKeys.length > 0 ? (totalGrandSum / coKeys.length) : 0;

        // 3. Save to Final Attainment Collection
        await FinalAttainment.findOneAndUpdate(
            { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
            { 
                $set: { 
                    attainmentTable: finalTable, 
                    finalSubjectAttainment: parseFloat(finalAttainment.toFixed(2)),
                    calculatedAt: new Date() 
                } 
            },
            { upsert: true }
        );

        return; 

    } catch (error) {
        console.error("Final Attainment Log Error:", error.message);
        throw error;
    }
}

































/**
 * getFinalAttainment
 * Simple fetch for the final attainment document
 */
const getFinalAttainmentData = async (req, res) => {
    try {
        const { subjectId, academicYear, course } = req.query;

        // .lean() is the key to making sure the data "values" are actually readable in JSON
        const data = await FinalAttainment.findOne({ 
            subjectId, 
            academicYear, 
            course 
        }).lean();

        if (!data) {
            return res.status(404).json({ 
                success: false, 
                message: "No document found in Final Attainment collection." 
            });
        }

        // Return the full document as it is in the DB
        return res.status(200).json({ 
            success: true, 
            data 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};


module.exports = { 
    handleFinalAttainment,
    getFinalAttainmentData
 };