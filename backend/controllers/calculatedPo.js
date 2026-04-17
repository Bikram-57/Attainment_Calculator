// const CoPoMapping = require('../models/coPoMapping');
// const FinalAttainment = require('../models/finalAttainment');
// const PoAttainmentResult = require('../models/calculatedPo'); 

// const calculateAndSavePOAttainment = async (req, res) => {
//     try {
//         const { subjectId, academicYear, course, status = "Active" } = req.body;

//         if (!subjectId || !academicYear || !course) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing required parameters. Please provide subjectId, academicYear, and course."
//             });
//         }

//         // 1. Clean inputs to prevent invisible space errors
//         const cleanSubjectId = subjectId.trim();
//         const cleanCourse = course.trim();
//         const cleanYear = String(academicYear).trim();

//         const courseRegex = new RegExp(`^${cleanCourse}$`, 'i');

//         const queryParams = { 
//             subjectId: cleanSubjectId, 
//             course: courseRegex,
//             $or: [{ year: cleanYear }, { academicYear: cleanYear }] 
//         };

//         // 2. Fetch data
//         const mappingDoc = await CoPoMapping.findOne(queryParams).lean();
//         const attainmentDoc = await FinalAttainment.findOne(queryParams).lean();

//         if (!mappingDoc || !attainmentDoc) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Data missing in database.",
//                 details: {
//                     searchedFor: queryParams,
//                     foundInMapping: !!mappingDoc,
//                     foundInAttainment: !!attainmentDoc
//                 }
//             });
//         }

//         // Fetching specifically from your exact schema structure
//         const finalCoAttainment = Number(attainmentDoc.finalSubjectAttainment);

//         if (isNaN(finalCoAttainment)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Document found, but 'finalSubjectAttainment' is missing or not a number."
//             });
//         }

//         const poAttainmentResults = {};
//         const poKeys = [1, 2, 3, 4, 5, 6, 7, 8];
//         const coKeys = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5']; // We need to check inside each CO

//         // 3. NEW LOGIC: Calculate POs by extracting from nested CO objects
//         poKeys.forEach(num => {
//             const poKeyUpper = `PO${num}`; // e.g., 'PO1'
//             const dbKey = `po${num}`;      // e.g., 'po1' (for saving in the new DB)

//             let activeMappings = [];

//             // Jump into CO1, CO2, etc., to find the value for this specific PO
//             coKeys.forEach(co => {
//                 if (mappingDoc[co] && mappingDoc[co][poKeyUpper] !== undefined) {
//                     const val = mappingDoc[co][poKeyUpper];
                    
//                     // Only add to calculations if it's a real number and NOT an empty string ""
//                     if (val !== "" && !isNaN(val) && Number(val) > 0) {
//                         activeMappings.push(Number(val));
//                     }
//                 }
//             });

//             if (activeMappings.length === 0) {
//                 poAttainmentResults[dbKey] = null;
//             } else {
//                 const sum = activeMappings.reduce((acc, curr) => acc + curr, 0);
//                 const averageMapping = sum / activeMappings.length;
                
//                 let calculatedPo = (averageMapping / 3) * finalCoAttainment;
                
//                 if (isNaN(calculatedPo)) {
//                     poAttainmentResults[dbKey] = null;
//                 } else {
//                     poAttainmentResults[dbKey] = Number(calculatedPo.toFixed(2));
//                 }
//             }
//         });

//         // 4. Save to Database
//         const savedResult = await PoAttainmentResult.findOneAndUpdate(
//             { subjectId: cleanSubjectId, academicYear: cleanYear },
//             {
//                 subjectId: cleanSubjectId,
//                 academicYear: cleanYear,
//                 course: cleanCourse,
//                 finalCoAttainment,
//                 poAttainments: poAttainmentResults,
//                 status 
//             },
//             { new: true, upsert: true } 
//         );

//         return res.status(200).json({
//             success: true,
//             message: "PO Attainment calculated and saved successfully.",
//             data: savedResult
//         });

//     } catch (error) {
//         console.error("Error calculating and saving PO Attainment:", error);
//         return res.status(500).json({ 
//             success: false, 
//             message: "Internal server error." 
//         });
//     }
// };

// module.exports = { calculateAndSavePOAttainment };



const CoPoMapping = require('../models/coPoMapping');
const FinalAttainment = require('../models/finalAttainment');
const CalculatedPo = require('../models/calculatedPo');

async function calculateAndSavePOAttainment(req, res) {
    try {
        const { subjectId, academicYear, course } = req.body;

        // 1. DIRECT DATABASE FETCH (Bypasses Schema issues)
        // We use .collection to get the raw MongoDB document exactly as seen in Atlas
        const mappingDoc = await CoPoMapping.collection.findOne({ 
            subjectId, 
            academicYear, 
            course 
        });

        const attainmentDoc = await FinalAttainment.findOne({ 
            subjectId, 
            academicYear, 
            course 
        }).lean();

        if (!mappingDoc || !attainmentDoc) {
            return res.status(404).json({ 
                success: false, 
                message: "Data not found",
                mappingFound: !!mappingDoc,
                attainmentFound: !!attainmentDoc 
            });
        }

        const subjectTotal = Number(attainmentDoc.finalSubjectAttainment);
        const poAttainments = {};
        const coKeys = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'];

        // 2. Calculation Loop
        for (let i = 1; i <= 8; i++) {
            const poKey = `PO${i}`;
            let validValues = [];

            coKeys.forEach(co => {
                // Accessing the raw document keys directly
                if (mappingDoc[co] && mappingDoc[co][poKey] !== undefined) {
                    const val = mappingDoc[co][poKey];
                    // Handle numbers and strings, ignore empty strings
                    if (val !== "" && val !== null && !isNaN(val)) {
                        validValues.push(Number(val));
                    }
                }
            });

            if (validValues.length === 0) {
                poAttainments[`po${i}`] = null;
            } else {
                const avg = validValues.reduce((a, b) => a + b, 0) / validValues.length;
                const calculatedValue = (avg / 3) * subjectTotal;
                poAttainments[`po${i}`] = Number(calculatedValue.toFixed(2));
            }
        }

        // 3. Save the result
        const result = await CalculatedPo.findOneAndUpdate(
            { subjectId, academicYear },
            {
                subjectId, academicYear, course,
                finalCoAttainment: subjectTotal,
                poAttainments,
                status: "Active"
            },
            { new: true, upsert: true }
        );

        return res.status(200).json({ success: true, data: result });

    } catch (error) {
        console.error("CRITICAL ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { calculateAndSavePOAttainment };