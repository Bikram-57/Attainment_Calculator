// const FinalAttainment = require('../models/finalAttainment');
// const CoPoMatrix = require('../models/coPoMapping');


// const extractAttainmentLevels = async (req, res) => {
//     try {
//         const targetCourse = req.body.course || "MCA";
//         const targetYear = req.body.academicYear || "2026";

//         console.log(`\n=== 🧮 CALCULATING 8-PO ATTAINMENT: ${targetCourse} - ${targetYear} ===`);

//         // 1. FETCH ALL SUBJECTS
//         const allSubjects = await FinalAttainment.find({
//             course: targetCourse,
//             academicYear: targetYear
//         }).lean();

//         if (!allSubjects || allSubjects.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No subjects found."
//             });
//         }

//         // 2. FETCH CO-PO MAPPINGS
//         const subjectIdsArray = allSubjects.map(doc => doc.subjectId);

//         const allMatrices = await CoPoMatrix.find({
//             subjectId: { $in: subjectIdsArray }
//         }).lean();

//         // 3. BUILD LOOKUP OBJECT
//         const matrixDict = {};

//         allMatrices.forEach(matDoc => {
//             matrixDict[matDoc.subjectId] =
//                 matDoc.mappingData ||
//                 matDoc.matrix ||
//                 matDoc.copoMapping ||
//                 {};
//         });

//         const standardPOs = [
//             'PO1',
//             'PO2',
//             'PO3',
//             'PO4',
//             'PO5',
//             'PO6',
//             'PO7',
//             'PO8'
//         ];

//         // 4. PROCESS EACH SUBJECT
//         const calculatedBatchData = allSubjects.map(doc => {

//             const table = doc.attainmentTable || {};
//             const extractedLevels = {};

//             // Extract CO attainment levels
//             Object.keys(table).forEach(coKey => {
//                 if (
//                     table[coKey] &&
//                     table[coKey].grandTotal !== undefined
//                 ) {
//                     extractedLevels[coKey] = table[coKey].grandTotal;
//                 }
//             });

//             const rawMatrix = matrixDict[doc.subjectId] || {};

//             const formattedTable = [];

//             const poTotals = {};
//             const poWeightCounts = {};

//             standardPOs.forEach(po => {
//                 poTotals[po] = 0;
//                 poWeightCounts[po] = 0;
//             });

//             // Build CO rows
//             Object.keys(extractedLevels).forEach((coKey, index) => {

//                 const coLevel = Number(extractedLevels[coKey]) || 0;

//                 // Get mapping for current CO
//                 const mappings = rawMatrix?.[coKey] || {};

//                 const row = {
//                     course: index === 0 ? doc.subjectId : "",
//                     co: coKey,
//                     attainmentLevel: coLevel
//                 };

//                 standardPOs.forEach(po => {

//                     const weight =
//                         mappings[po] === "" ||
//                         mappings[po] === undefined ||
//                         mappings[po] === null
//                             ? null
//                             : Number(mappings[po]);

//                     row[po] = weight;

//                     if (weight !== null) {
//                         poTotals[po] += coLevel * weight;
//                         poWeightCounts[po] += weight;
//                     }
//                 });

//                 formattedTable.push(row);
//             });

//             // 5. DIRECT PO ATTAINMENT ROW
//             const finalRow = {
//                 course: "Direct PO Attainment",
//                 co: "",
//                 attainmentLevel: ""
//             };

//             standardPOs.forEach(po => {
//                 finalRow[po] =
//                     poWeightCounts[po] > 0
//                         ? Number(
//                               (
//                                   poTotals[po] /
//                                   poWeightCounts[po]
//                               ).toFixed(2)
//                           )
//                         : null;
//             });

//             formattedTable.push(finalRow);

//             return {
//                 subjectId: doc.subjectId,
//                 tableData: formattedTable
//             };
//         });

//         return res.status(200).json({
//             success: true,
//             count: calculatedBatchData.length,
//             data: calculatedBatchData
//         });

//     } catch (error) {
//         console.error("Crash Error:", error);

//         return res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// };

// module.exports = {
//     extractAttainmentLevels
// };



const FinalAttainment = require('../models/finalAttainment');
const CoPoMatrix = require('../models/coPoMapping');
const DirectPoAttainment = require('../models/directPoAttainment'); // Your new schema

const extractAttainmentLevels = async (req, res) => {
    try {
        const targetCourse = req.body.course || "MCA";
        const targetYear = req.body.academicYear || "2026";

        console.log(`\n=== 🧮 CALCULATING 8-PO ATTAINMENT: ${targetCourse} - ${targetYear} ===`);

        // 1. FETCH ALL SUBJECTS
        const allSubjects = await FinalAttainment.find({
            course: targetCourse,
            academicYear: targetYear
        }).lean();

        if (!allSubjects || allSubjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No subjects found."
            });
        }

        // 2. FETCH CO-PO MAPPINGS
        const subjectIdsArray = allSubjects.map(doc => doc.subjectId);

        const allMatrices = await CoPoMatrix.find({
            subjectId: { $in: subjectIdsArray }
        }).lean();

        // 3. BUILD LOOKUP OBJECT
        const matrixDict = {};

        allMatrices.forEach(matDoc => {
            matrixDict[matDoc.subjectId] =
                matDoc.mappingData ||
                matDoc.matrix ||
                matDoc.copoMapping ||
                {};
        });

        const standardPOs = [
            'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8'
        ];

        // 4. PROCESS EACH SUBJECT
        const calculatedBatchData = allSubjects.map(doc => {

            const table = doc.attainmentTable || {};
            const extractedLevels = {};

            // Extract CO attainment levels
            Object.keys(table).forEach(coKey => {
                if (
                    table[coKey] &&
                    table[coKey].grandTotal !== undefined
                ) {
                    extractedLevels[coKey] = table[coKey].grandTotal;
                }
            });

            const rawMatrix = matrixDict[doc.subjectId] || {};

            const formattedTable = [];

            const poTotals = {};
            const poWeightCounts = {};

            standardPOs.forEach(po => {
                poTotals[po] = 0;
                poWeightCounts[po] = 0;
            });

            // Build CO rows
            Object.keys(extractedLevels).forEach((coKey, index) => {

                const coLevel = Number(extractedLevels[coKey]) || 0;

                // Get mapping for current CO
                const mappings = rawMatrix?.[coKey] || {};

                const row = {
                    course: index === 0 ? doc.subjectId : "",
                    co: coKey,
                    attainmentLevel: coLevel
                };

                standardPOs.forEach(po => {

                    const weight =
                        mappings[po] === "" ||
                        mappings[po] === undefined ||
                        mappings[po] === null
                            ? null
                            : Number(mappings[po]);

                    row[po] = weight;

                    if (weight !== null) {
                        poTotals[po] += coLevel * weight;
                        poWeightCounts[po] += weight;
                    }
                });

                formattedTable.push(row);
            });

            // 5. DIRECT PO ATTAINMENT ROW
            const finalRow = {
                course: "Direct PO Attainment",
                co: "",
                attainmentLevel: ""
            };

            standardPOs.forEach(po => {
                finalRow[po] =
                    poWeightCounts[po] > 0
                        ? Number(
                              (
                                  poTotals[po] /
                                  poWeightCounts[po]
                              ).toFixed(2)
                          )
                        : null;
            });

            formattedTable.push(finalRow);

            return {
                subjectId: doc.subjectId,
                tableData: formattedTable
            };
        });

        // 6. 💾 SAVE TO THE DATABASE 
        // This leverages the exact schema you have open in the Canvas
        await DirectPoAttainment.findOneAndUpdate(
            { course: targetCourse, academicYear: targetYear },
            { 
                $set: { 
                    subjects: calculatedBatchData, // This saves the entire JSON array perfectly
                    calculatedAt: new Date()
                } 
            },
            { new: true, upsert: true } // Creates it if it doesn't exist, updates it if it does
        );
        
        console.log("=== ✅ SAVED SUCCESSFULLY TO DB ===");

        // 7. RETURN JSON TO FRONTEND
        return res.status(200).json({
            success: true,
            count: calculatedBatchData.length,
            data: calculatedBatchData
        });

    } catch (error) {
        console.error("Crash Error:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    extractAttainmentLevels
};