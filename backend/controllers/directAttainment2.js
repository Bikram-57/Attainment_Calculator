// // Assuming your Mongoose model is named FinalAttainment
// const FinalAttainment = require('../models/finalAttainment');

// const extractAttainmentLevels = async (req, res) => {
//    try {
//         // Falling back to "MCA" and "2026" if req.body is empty for easy testing
//         const targetCourse = req.body.course || "MCA";       
//         const targetYear = req.body.academicYear || "2026";   

//         console.log(`\n=== 🔎 SEARCHING DB FOR BATCH: ${targetCourse} - ${targetYear} ===`);

//         // 1. The Magic Word: .lean()
//         // This tells Mongoose to step back and give us the raw JSON exactly as it is in the DB
//         const allSubjects = await FinalAttainment.find({
//             course: targetCourse,
//             academicYear: targetYear
//         }).lean(); 

//         if (!allSubjects || allSubjects.length === 0) {
//             console.log("❌ No subjects found for this batch.");
//             return res.status(404).json({ message: "No data found." });
//         }

//         console.log(`✅ Found ${allSubjects.length} subjects! Extracting grand totals...\n`);

//         // 2. Loop through every subject and safely extract the levels
//         const extractedBatchData = allSubjects.map(doc => {
//             const table = doc.attainmentTable;
//             let extractedLevels = {};

//             // Ensure the attainmentTable actually exists in this document before looping
//             if (table) {
//                 // Loop through "CO1", "CO2", "CO3", etc.
//                 Object.keys(table).forEach(coKey => {
//                     // Safety check to ensure grandTotal exists for that specific CO
//                     if (table[coKey] && table[coKey].grandTotal !== undefined) {
//                         extractedLevels[coKey] = table[coKey].grandTotal; 
//                     }
//                 });
//             }

//             return {
//                 subjectId: doc.subjectId, 
//                 levels: extractedLevels
//             };
//         });

//         // 3. Print the final formatted array to the console
//         console.log("=== FINAL EXTRACTED BATCH DATA ===");
//         console.log(JSON.stringify(extractedBatchData, null, 2));
//         console.log("==================================\n");

//         // Send it to the frontend or Postman!
//         return res.status(200).json({ 
//             success: true, 
//             count: extractedBatchData.length,
//             data: extractedBatchData 
//         });

//     } catch (error) {
//         console.error("Crash Error:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };

// module.exports = {
//     extractAttainmentLevels,
// }




// Assuming your Mongoose models are named like this (adjust paths if needed)
const FinalAttainment = require('../models/finalAttainment');
const CoPoMatrix = require('../models/coPoMapping'); 

const extractAttainmentLevels = async (req, res) => {
    try {
        // Falling back to "MCA" and "2026" if req.body is empty for easy testing
        const targetCourse = req.body.course || "MCA";       
        const targetYear = req.body.academicYear || "2026";   

        console.log(`\n=== 🔎 SEARCHING DB FOR BATCH: ${targetCourse} - ${targetYear} ===`);

        // 1. EXTRACT ATTAINMENT LEVELS
        const allSubjects = await FinalAttainment.find({
            course: targetCourse,
            academicYear: targetYear
        }).lean(); 

        if (!allSubjects || allSubjects.length === 0) {
            console.log("❌ No subjects found for this batch.");
            return res.status(404).json({ message: "No data found." });
        }

        // Grab all the subject IDs into an array (e.g., ["CA2301", "CA2302"])
        const subjectIdsArray = allSubjects.map(doc => doc.subjectId);
        console.log(`✅ Found ${subjectIdsArray.length} subjects! Fetching CO-PO matrices...\n`);

        // 2. EXTRACT CO-PO MATRICES (The "Same Way")
        // Use $in to find the matrices for ONLY the subjects we just found
        const allMatrices = await CoPoMatrix.find({
            subjectId: { $in: subjectIdsArray }
        }).lean();

        // Create a fast lookup dictionary for the matrices 
        // Example: matrixDict["CA2301"] = { CO1: { PO1: 3... } }
        const matrixDict = {};
        allMatrices.forEach(matDoc => {
            // Note: Use whatever field holds your matrix (matDoc.matrix, matDoc.mapping, etc.)
            matrixDict[matDoc.subjectId] = matDoc.matrix || matDoc.copoMapping || matDoc;
        });

        // 3. MERGE EVERYTHING TOGETHER
        const extractedBatchData = allSubjects.map(doc => {
            const table = doc.attainmentTable;
            let extractedLevels = {};

            // Ensure the attainmentTable actually exists in this document before looping
            if (table) {
                // Loop through "CO1", "CO2", "CO3", etc.
                Object.keys(table).forEach(coKey => {
                    // Safety check to ensure grandTotal exists for that specific CO
                    if (table[coKey] && table[coKey].grandTotal !== undefined) {
                        extractedLevels[coKey] = table[coKey].grandTotal; 
                    }
                });
            }

            // Grab the matching matrix from our dictionary
            const matchedMatrix = matrixDict[doc.subjectId] || null;

            return {
                subjectId: doc.subjectId, 
                levels: extractedLevels,
                copoMapping: matchedMatrix // Added the mapping to the final object!
            };
        });

        // 4. PRINT AND RETURN
        console.log("=== FINAL EXTRACTED BATCH DATA ===");
        console.log(JSON.stringify(extractedBatchData, null, 2));
        console.log("==================================\n");

        return res.status(200).json({ 
            success: true, 
            count: extractedBatchData.length,
            data: extractedBatchData 
        });

    } catch (error) {
        console.error("Crash Error:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    extractAttainmentLevels,
}