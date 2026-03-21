const CoPoMapping = require('../models/coPoMapping');


const saveCoPoRelation = async (req, res) => {
  
    try {
        const { subjectId, academicYear, course, mappingData } = req.body;

        // 1. Safety Check
        if (!subjectId) {
            return res.status(400).send("Subject ID is missing.");
        }

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

        // 3. THE FIX: 
        // Instead of redirecting (which might fail), send a Success JSON 
        // to confirm it's working 100%
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


/**
 * getCoPoRelation
 * Fetches the existing mapping for a specific subject
 */
const getCoPoRelation = async (req, res) => {
 try {
        // Query parameters from the URL: ?subjectId=CA2313&academicYear=2025-26&course=BCA
        const { subjectId, academicYear, course } = req.query;

        // 1. Validation: Ensure we have the subjectId
        if (!subjectId) {
            return res.status(400).json({
                success: false,
                message: "subjectId is required as a query parameter."
            });
        }

        // 2. Find the record in MongoDB
        const record = await CoPoMapping.findOne({
            subjectId: subjectId.toUpperCase(),
            academicYear: academicYear,
            course: course?.toUpperCase()
        }).lean();

        // 3. Handle Case: No Data Found
        if (!record) {
            return res.status(404).json({
                success: false,
                message: "No mapping found for the specified criteria.",
                data: {}
            });
        }

        // 4. Filter Logic: Ensure only 8 POs are returned per CO
        const filteredMapping = {};
        
        // Loop through the COs found (CO1, CO2, etc.)
        Object.keys(record.mappingData).forEach(co => {
            filteredMapping[co] = {};
            // Restrict to PO1 through PO8
            for (let i = 1; i <= 8; i++) {
                const poKey = `PO${i}`;
                // If the PO exists in DB, use it; otherwise, return an empty string
                filteredMapping[co][poKey] = record.mappingData[co][poKey] || "";
            }
        });

        // 5. Send JSON Response
        return res.status(200).json({
            success: true,
            subjectId: record.subjectId,
            academicYear: record.academicYear,
            course: record.course,
            mappingData: filteredMapping
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