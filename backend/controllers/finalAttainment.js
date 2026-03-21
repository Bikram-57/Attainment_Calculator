// const CalculatedMark = require('../models/calculatedMarks');
// const FinalAttainment = require('../models/finalAttainment');

// async function handleFinalAttainment(req, res) {
//     try {
//         const { subjectId, academicYear, course } = req.body;

//         // 1. Fetch the 4-Row Calculation Data (Exam-wise)
//         const calculatedDoc = await CalculatedMark.findOne({ 
//             subjectId: subjectId.toUpperCase(), 
//             academicYear, 
//             course: course.toUpperCase() 
//         });

//         if (!calculatedDoc) throw new Error("Step 3: Internal Calculation data missing.");

//         const coGroups = {}; 
//         const tableData = {};

//         // 2. Sort exam levels into Internal vs External groups
//         calculatedDoc.reportData.forEach((data, key) => {
//             const match = key.match(/CO\d+$/);
//             if (match) {
//                 const coName = match[0];
//                 if (!coGroups[coName]) coGroups[coName] = { internal: [], external: 0 };

//                 // Map "E-Exam" or "End_Sem" as External; everything else as Internal
//                 if (key.toLowerCase().includes("e-exam") || key.toLowerCase().includes("e_exam") || key.toLowerCase().includes("end_sem")) {
//                     coGroups[coName].external = data.attainmentLevel;
//                 } else {
//                     coGroups[coName].internal.push(data.attainmentLevel);
//                 }
//             }
//         });

//         let totalGrandSum = 0;
//         const coKeys = Object.keys(coGroups);

//         // 3. Calculate Column H (Internal Avg) and Column I (50/50 Grand Total)
//         coKeys.forEach(co => {
//             const internals = coGroups[co].internal;
//             const avgInt = internals.length > 0 ? (internals.reduce((a, b) => a + b, 0) / internals.length) : 0;
//             const ext = coGroups[co].external;

//             // Weighted Math: (Internal Avg * 0.5) + (External Level * 0.5)
//             const grandTotal = (avgInt * 0.5) + (ext * 0.5);

//             tableData[co] = {
//                 internalAvg: parseFloat(avgInt.toFixed(2)),
//                 externalLevel: ext,
//                 grandTotal: parseFloat(grandTotal.toFixed(2))
//             };

//             totalGrandSum += grandTotal;
//         });

//         // 4. Final Course Attainment (Average of Column I)
//         const finalAttainment = coKeys.length > 0 ? (totalGrandSum / coKeys.length) : 0;

//         // 5. Update/Save to Final Attainment Collection
//         await FinalAttainment.findOneAndUpdate(
//             { subjectId: subjectId.toUpperCase(), academicYear, course: course.toUpperCase() },
//             { 
//                 $set: { 
//                     attainmentTable: tableData, 
//                     finalSubjectAttainment: parseFloat(finalAttainment.toFixed(2)),
//                     calculatedAt: new Date() 
//                 } 
//             },
//             { upsert: true }
//         );

//         return; // Complete

//     } catch (error) {
//         console.error("Final Attainment Log Error:", error.message);
//         throw error;
//     }
// }

// module.exports = { handleFinalAttainment };



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

module.exports = { handleFinalAttainment };