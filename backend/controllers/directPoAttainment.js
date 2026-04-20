const CopoMapping = require('../models/coPoMapping');
const CoAttainment = require('../models/finalAttainment');
const directPo = require('../models/directPoAttainment');

async function handleGenerateDirectPoAttainment(req, res) {

    try {
        let { course, academicYear, subjectId } = req.body;

        // 1. Validation & Sanitization
        if (!course || !academicYear || !subjectId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (academicYear.includes('-')) {
            academicYear = academicYear.split('-')[1].trim();
        }

        // 2. Fetch Records using .lean() to get raw JSON objects
        const [mappingRecord, attainmentRecord] = await Promise.all([
            CopoMapping.findOne({ course, subjectId, academicYear }).lean(),
            CoAttainment.findOne({ course, subjectId, academicYear }).lean()
        ]);

        if (!mappingRecord || !attainmentRecord) {
            return res.status(404).json({
                success: false,
                message: 'Mapping or Attainment data missing for this criteria'
            });
        }

        // 3. Bulletproof Mapping Data Extraction 
        const mappingData = mappingRecord.mappingData || mappingRecord.data || mappingRecord;

        const finalData = {};
        const directPoAttainment = {};

        // --- THE FIX IS HERE ---
        // Point directly to the attainmentTable object we found in the database
        const attainmentSource = attainmentRecord.attainmentTable || attainmentRecord.data || attainmentRecord;

        // 4. Extract Exact Grand Total from Final Attainment DB
        Object.keys(mappingData).forEach(coKey => {
            // Ignore MongoDB specific keys if they slip through
            if (coKey === '_id' || coKey === '__v' || coKey === 'course' || coKey === 'academicYear' || coKey === 'subjectId') return;

            // Extract the CO object from the correct source path
            const dbCoObject = attainmentSource[coKey];

            let extractedGrandTotal = 0;
            if (dbCoObject && dbCoObject.grandTotal !== undefined) {
                extractedGrandTotal = parseFloat(dbCoObject.grandTotal);
            }

            // X-RAY DEBUGGING: Watch your terminal to confirm it pulls 0.8, 0.4, etc.
            console.log(`Extraction - ${coKey} | GrandTotal Found: ${extractedGrandTotal}`);

            finalData[coKey] = {
                grandTotal: extractedGrandTotal,
                ...mappingData[coKey]
            };
        });

        // 5. Calculate Direct PO Attainment (Weighted Average: Top / Bottom)
        for (let i = 1; i <= 8; i++) {
            const poKey = `PO${i}`;
            let weightedSum = 0;
            let mappingSum = 0;

            Object.keys(finalData).forEach(coKey => {
                const coAttainment = finalData[coKey].grandTotal; // Uses the exact extracted value
                const mappingValue = parseFloat(finalData[coKey][poKey]);

                if (!isNaN(mappingValue) && mappingValue > 0) {
                    weightedSum += (coAttainment * mappingValue);
                    mappingSum += mappingValue;
                }
            });

            if (mappingSum > 0) {
                const result = weightedSum / mappingSum;
                directPoAttainment[poKey] = parseFloat(result.toFixed(2));
            } else {
                directPoAttainment[poKey] = "";
            }
        }

        // 6. SAVE/UPDATE Database
        const savedData = await directPo.findOneAndUpdate(
            { course, academicYear, subjectId },
            {
                course,
                academicYear,
                subjectId,
                data: finalData,
                directPoAttainment: directPoAttainment
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 7. Final Response
        return res.status(200).json({
            success: true,
            message: "Direct PO Attainment calculated and saved successfully",
            data: savedData.data,
            directPoAttainment: savedData.directPoAttainment
        });

    } catch (error) {
        console.error('Calculation Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during calculation',
            error: error.message
        });
    }
}


// async function fetchCoGrandTotals(req, res) {
//     try {
//         let { course, academicYear, subjectId } = req.query;

//         if (!course || !academicYear || !subjectId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required query parameters: course, academicYear, subjectId'
//             });
//         }

//         if (academicYear.includes('-')) {
//             academicYear = academicYear.split('-')[1].trim();
//         }

//         const attainmentRecord = await CoAttainment.findOne({ course, subjectId, academicYear }).lean();

//         if (!attainmentRecord) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Final Attainment data not found for this criteria'
//             });
//         }

//         const grandTotals = {};

//         // --- THE FIX IS HERE ---
//         // We explicitly tell it to look inside attainmentTable
//         const sourceData = attainmentRecord.attainmentTable || attainmentRecord.data || attainmentRecord;

//         Object.keys(sourceData).forEach(key => {
//             const cleanKey = key.trim().toUpperCase();

//             if (cleanKey.startsWith('CO')) {
//                 const coObject = sourceData[key];

//                 if (coObject && coObject.grandTotal !== undefined) {
//                     grandTotals[cleanKey] = parseFloat(coObject.grandTotal);
//                 } else {
//                     grandTotals[cleanKey] = 0;
//                 }
//             }
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Grand Totals fetched successfully",
//             data: grandTotals
//         });

//     } catch (error) {
//         console.error('Fetch Error:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal server error while fetching totals',
//             error: error.message
//         });
//     }
// }

async function getDirectPoAttainment(req, res) {
    try {
        // Since it's a GET request, we use req.query instead of req.body
        let { course, academicYear, subjectId } = req.query;

        // 1. Validation
        if (!course || !academicYear || !subjectId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required query parameters: course, academicYear, subjectId' 
            });
        }

        // 2. Sanitization (Keep it consistent with your save logic)
        if (academicYear.includes('-')) {
            academicYear = academicYear.split('-')[1].trim();
        }

        // 3. Fetch from Database
        // We use .lean() to get a fast, plain JSON object
        const savedAttainment = await directPo.findOne({ 
            course, 
            academicYear, 
            subjectId 
        }).lean();

        // 4. Handle Not Found
        if (!savedAttainment) {
            return res.status(404).json({ 
                success: false, 
                message: 'No Direct PO Attainment found for this subject. Please generate it first.' 
            });
        }

        // 5. Send Success Response
        // This structure perfectly matches what your frontend table expects
        return res.status(200).json({
            success: true,
            message: 'Direct PO Attainment retrieved successfully',
            data: savedAttainment.data,
            directPoAttainment: savedAttainment.directPoAttainment
        });

    } catch (error) {
        console.error('Fetch Direct PO Attainment Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error while fetching data',
            error: error.message 
        });
    }
}

module.exports = {
    handleGenerateDirectPoAttainment,
    // fetchCoGrandTotals
    getDirectPoAttainment
};