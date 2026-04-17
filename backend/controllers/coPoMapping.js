const CoPoMapping = require('../models/coPoMapping');


const saveCoPoRelation = async (req, res) => {
    try {
        const { subjectId, academicYear, course, mappingData } = req.body;

        // 1. Safety Check
        if (!subjectId || !mappingData) {
            return res.status(400).send("Subject ID or Mapping Data is missing.");
        }

        // --- STRICT 8-PO VALIDATION LOGIC ---
        const coKeys = Object.keys(mappingData);

        for (const co of coKeys) {
            const poKeys = Object.keys(mappingData[co]);

            // Check if count exceeds 8
            if (poKeys.length > 8) {
                return res.status(400).json({
                    success: false,
                    message: `Logic Error: ${co} contains ${poKeys.length} POs. As per latest rules, a maximum of 8 POs are allowed.`
                });
            }

            // Check if any PO key is outside the PO1-PO8 range
            const invalidPOs = poKeys.filter(po => {
                const poNumber = parseInt(po.replace('PO', ''));
                return poNumber > 8 || isNaN(poNumber);
            });

            if (invalidPOs.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid POs detected in ${co}: [${invalidPOs.join(', ')}]. Only PO1 to PO8 are permitted.`
                });
            }
        }
        // --- END OF VALIDATION ---

        // 2. Database Update
        await CoPoMapping.findOneAndUpdate(
            { 
                subjectId: subjectId.toUpperCase(), 
                academicYear, 
                course: (course || "BCA").toUpperCase() 
            },
            { $set: { mappingData, updatedAt: new Date() } },
            { upsert: true }
        );

        // 3. Success Response
        return res.status(200).json({
            success: true,
            message: "Data saved successfully to MongoDB!",
            receivedData: { subjectId, academicYear }
        });

    } catch (error) {
        console.error("Save Error:", error.message);
        res.status(500).send("Server Error: " + error.message);
    }
};

// const saveCoPoRelation = async (req, res) => {
  
//     try {
//         const { subjectId, academicYear, course, mappingData } = req.body;

//         // 1. Safety Check
//         if (!subjectId) {
//             return res.status(400).send("Subject ID is missing.");
//         }

//         // 2. Database Update
//         await CoPoMapping.findOneAndUpdate(
//             { 
//                 subjectId: subjectId.toUpperCase(), 
//                 academicYear, 
//                 course: (course || "BCA" || 'MCA').toUpperCase() 
//             },
//             { $set: { mappingData, updatedAt: new Date() } },
//             { upsert: true }
//         );

//         // 3. THE FIX: 
//         // Instead of redirecting (which might fail), send a Success JSON 
//         // to confirm it's working 100%
//         return res.status(200).json({
//             success: true,
//             message: "Data saved successfully to MongoDB!",
//             receivedData: { subjectId, academicYear }
//         });

//     } catch (error) {
//         console.error("Save Error:", error.message);
//         res.status(500).send("Server Error: " + error.message);
//     }
// };


/**
 * getCoPoRelation
 * Fetches the existing mapping for a specific subject
 */
// const getCoPoRelation = async (req, res) => {
//  try {
//         // Query parameters from the URL: ?subjectId=CA2313&academicYear=2025-26&course=BCA
//         const { subjectId, academicYear, course } = req.query;

//         // 1. Validation: Ensure we have the subjectId
//         if (!subjectId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "subjectId is required as a query parameter."
//             });
//         }

//         // 2. Find the record in MongoDB
//         const record = await CoPoMapping.findOne({
//             subjectId: subjectId.toUpperCase(),
//             academicYear: academicYear,
//             course: course?.toUpperCase()
//         }).lean();

//         // 3. Handle Case: No Data Found
//         if (!record) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No mapping found for the specified criteria.",
//                 data: {}
//             });
//         }

//         // 4. Filter Logic: Ensure only 8 POs are returned per CO
//         const filteredMapping = {};
        
//         // Loop through the COs found (CO1, CO2, etc.)
//         Object.keys(record.mappingData).forEach(co => {
//             filteredMapping[co] = {};
//             // Restrict to PO1 through PO8
//             for (let i = 1; i <= 8; i++) {
//                 const poKey = `PO${i}`;
//                 // If the PO exists in DB, use it; otherwise, return an empty string
//                 filteredMapping[co][poKey] = record.mappingData[co][poKey] || "";
//             }
//         });

//         // 5. Send JSON Response
//         return res.status(200).json({
//             success: true,
//             subjectId: record.subjectId,
//             academicYear: record.academicYear,
//             course: record.course,
//             mappingData: filteredMapping
//         });

//     } catch (error) {
//         console.error("Fetch API Error:", error.message);
//         return res.status(500).json({
//             success: false,
//             error: "Internal Server Error: " + error.message
//         });
//     }
// };

const getCoPoRelation = async (req, res) => {
    try {
        const { subjectId, academicYear, course } = req.query;

        if (!subjectId) {
            return res.status(400).json({
                success: false,
                message: "subjectId is required as a query parameter."
            });
        }

        const record = await CoPoMapping.findOne({
            subjectId: subjectId.toUpperCase(),
            academicYear: academicYear,
            course: course?.toUpperCase()
        }).lean();

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "No mapping found for the specified criteria.",
                data: {}
            });
        }

        // LOGIC CHECK: 
        // If your database contains legacy 12-PO data, we should verify 
        // that we are only sending 8 POs to keep the frontend UI consistent.
        const filteredMapping = {};
        
        Object.keys(record.mappingData).forEach(co => {
            filteredMapping[co] = {};
            // Strictly fetch only PO1 to PO8
            for (let i = 1; i <= 8; i++) {
                const poKey = `PO${i}`;
                // Keep the value if it exists, otherwise default to 0 (better for calculations than "")
                filteredMapping[co][poKey] = record.mappingData[co][poKey] !== undefined ? record.mappingData[co][poKey] : 0;
            }
        });

        return res.status(200).json({
            success: true,
            subjectId: record.subjectId,
            academicYear: record.academicYear,
            course: record.course,
            mappingData: filteredMapping // Now guaranteed to be exactly 8 POs
        });

    } catch (error) {
        console.error("Fetch API Error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error: " + error.message
        });
    }
};


module.exports = { 
    saveCoPoRelation,
    getCoPoRelation
 };