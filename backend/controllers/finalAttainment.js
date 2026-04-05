const CalculatedMark = require('../models/calculatedMarks');
const FinalAttainment = require('../models/finalAttainment');


async function handleFinalAttainment(req, res, isPipeline = false) {
    try {
        const { subjectId, academicYear, course } = req.body;

        // 1. SAFETY CHECK: Ensure all required fields exist before calling .toUpperCase()
        if (!subjectId || !academicYear || !course) {
            throw new Error("Missing required fields: subjectId, academicYear, or course.");
        }

        // 2. Fetch the calculated document
        const calculatedDoc = await CalculatedMark.findOne({ 
            subjectId: subjectId.toUpperCase(), 
            academicYear, 
            course: course.toUpperCase() 
        }).lean(); // .lean() converts the Mongoose doc to a plain JS object for easier handling

        if (!calculatedDoc) throw new Error("Step 3: Internal Calculation data missing.");
        if (!calculatedDoc.reportData) throw new Error("Step 3: reportData is empty or missing.");

        const coDataMap = {}; 

        // 3. SAFE ITERATION: Handle both standard JS Objects and Mongoose Maps
        // We use Object.entries() to safely loop through the keys and values
        const reportEntries = calculatedDoc.reportData instanceof Map 
            ? Array.from(calculatedDoc.reportData.entries()) 
            : Object.entries(calculatedDoc.reportData);

        reportEntries.forEach(([key, data]) => {
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
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes("e-exam") || lowerKey.includes("e_exam") || lowerKey.includes("end_sem")) {
                    coDataMap[coName].externalLevel = data.attainmentLevel || 0;
                } else {
                    coDataMap[coName].exams[examName] = data.attainmentLevel || 0;
                    coDataMap[coName].internalLevels.push(data.attainmentLevel || 0);
                }
            }
        });

        let totalGrandSum = 0;
        const finalTable = {};
        const coKeys = Object.keys(coDataMap);

        // 4. Build the full row for each CO
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

        // 5. Save to Final Attainment Collection
        await FinalAttainment.findOneAndUpdate(
            { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
            { 
                $set: { 
                    attainmentTable: finalTable, 
                    finalSubjectAttainment: parseFloat(finalAttainment.toFixed(2)),
                    calculatedAt: new Date() 
                } 
            },
            { upsert: true, new: true } // Added 'new: true' to return the updated doc if needed
        );

        // 6. PIPELINE HANDLING: 
        // If it's part of the pipeline, return out so the main route can respond.
        // If it's hit directly via a separate route, send a success response.
        if (isPipeline) {
            return true; 
        } else {
            return res.status(200).json({ success: true, message: "Final Attainment Calculated." });
        }

    } catch (error) {
        console.error("Final Attainment Log Error:", error.message);
        
        // If it's part of the pipeline, THROW the error so the main route's catch block grabs it
        if (isPipeline) {
            throw error;
        } else {
            // Otherwise, send a standard error response
            if (!res.headersSent) {
                return res.status(500).json({ success: false, error: error.message });
            }
        }
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