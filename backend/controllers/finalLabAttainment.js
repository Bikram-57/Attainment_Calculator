const CalculatedLabMark = require('../models/calculatedLabMarks'); 
const FinalLabAttainment = require('../models/finalLabAttainment');

// ============================================================================
// Calculate & Save Final Lab Attainment
// ============================================================================
async function handleFinalLabAttainment(req, res, isPipelineArg = false) {
    // 🛡️ THE PIPELINE SHIELD
    const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

    try {
        const { subjectId, academicYear, course } = req.body;

        // 1. SAFETY CHECK & SANITIZATION
        if (!subjectId || !academicYear || !course) {
            throw new Error("Missing required fields: subjectId, academicYear, or course.");
        }

        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        const cleanYear = academicYear.trim();

        // 2. FETCH CALCULATED LAB DOCUMENT
        const calculatedDoc = await CalculatedLabMark.findOne({ 
            subjectId: cleanSubjectId, 
            academicYear: cleanYear, 
            course: cleanCourse 
        }).lean(); 

        if (!calculatedDoc?.reportData) {
            throw new Error("Lab Calculation Logic: Step 3 Internal Calculation data or reportData is missing.");
        }

        const coDataMap = {}; 

        // 3. SAFE ITERATION THROUGH LAB REPORT DATA
        for (const [key, data] of Object.entries(calculatedDoc.reportData)) {
            // Matches 'CO1', 'CO2' at the end of keys like 'Lab_12_CO2'
            const match = key.match(/CO\d+$/); 
            
            if (match) {
                const coName = match[0]; // e.g., "CO1"
                // Removes "_CO1" from the end to get the exam/lab name (e.g., "Lab_12")
                const examName = key.replace(new RegExp(`_?${coName}$`), ""); 
                const level = data.attainmentLevel || 0;

                // Initialize the CO tracking object
                if (!coDataMap[coName]) {
                    coDataMap[coName] = { 
                        exams: {}, 
                        internalSum: 0,   
                        internalCount: 0, 
                        externalLevel: 0,
                        hasExternal: false // Track if an End Sem Lab exists
                    };
                }

                // Identify if the assessment is External (End Sem) or Internal (Lab 1, Lab 2, etc.)
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes("e-exam") || lowerKey.includes("e_exam") || lowerKey.includes("end_sem")) {
                    coDataMap[coName].externalLevel = level;
                    coDataMap[coName].hasExternal = true;
                } else {
                    coDataMap[coName].exams[examName] = level;
                    coDataMap[coName].internalSum += level;
                    coDataMap[coName].internalCount++;
                }
            }
        }

        let totalGrandSum = 0;
        const finalTable = {};
        const coKeys = Object.keys(coDataMap);

        // 4. BUILD THE FULL ROW FOR EACH CO
        for (const co of coKeys) {
            const coInfo = coDataMap[co];
            
            // Calculate Internal Lab Average
            const avgInt = coInfo.internalCount > 0 
                ? (coInfo.internalSum / coInfo.internalCount) 
                : 0;
            
            let grandTotal = 0;

            // Smart Weighting: If there is no End Sem, Internal counts for 100%
            if (coInfo.hasExternal) {
                grandTotal = (avgInt * 0.5) + (coInfo.externalLevel * 0.5);
            } else {
                grandTotal = avgInt;
            }

            // Create the finalized object combining individual lab assessments and averages
            finalTable[co] = {
                ...coInfo.exams, 
                internalAvg: parseFloat(avgInt.toFixed(2)),
                externalLevel: coInfo.externalLevel,
                grandTotal: parseFloat(grandTotal.toFixed(2))
            };

            totalGrandSum += grandTotal;
        }

        const finalAttainment = coKeys.length > 0 ? (totalGrandSum / coKeys.length) : 0;

        // 5. SAVE TO FINAL LAB ATTAINMENT COLLECTION
        const finalSavedData = await FinalLabAttainment.findOneAndUpdate(
            { subjectId: cleanSubjectId, academicYear: cleanYear, course: cleanCourse },
            { 
                $set: { 
                    attainmentTable: finalTable, 
                    finalSubjectAttainment: parseFloat(finalAttainment.toFixed(2)),
                    calculatedAt: new Date() 
                } 
            },
            { upsert: true, new: true, lean: true } 
        );

        // --- PIPELINE EXIT ---
        if (isPipeline) return true; 
        
        // 🛡️ THE HEADER SHIELD
        if (!res.headersSent) {
            return res.status(200).json({ 
                success: true, 
                message: "Final Lab Attainment Calculated successfully.",
                data: finalSavedData
            });
        }

    } catch (error) {
        console.error("Final Lab Attainment Log Error:", error.message);
        
        if (isPipeline) throw error;
        
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}







// ============================================================================
// Fetch Final Lab Attainment (GET)
// ============================================================================
async function handleGetFinalLabAttainment(req, res) {
    try {
        const { subjectId, academicYear, course } = req.query;

        // 1. Validate inputs
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required query parameters: subjectId, academicYear, and course are required." 
            });
        }

        // 2. Clean inputs to perfectly match database storage
        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        const cleanAcademicYear = academicYear.trim();

        // 3. Query the database
        const attainmentData = await FinalLabAttainment.findOne({
            subjectId: cleanSubjectId,
            academicYear: cleanAcademicYear,
            course: cleanCourse
        }).lean();

        // 4. Handle Empty Result (This is what you are currently hitting)
        if (!attainmentData) {
            return res.status(404).json({ 
                success: false, 
                message: `No final lab attainment record found for ${cleanCourse} ${cleanSubjectId} (Batch: ${cleanAcademicYear}).` 
            });
        }

        // 5. Success!
        return res.status(200).json({
            success: true,
            message: "Final lab attainment data fetched successfully.",
            data: attainmentData
        });

    } catch (error) {
        console.error("Fetch Final Lab Attainment Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Server error while fetching final lab attainment data.", 
            error: error.message 
        });
    }
}

module.exports = { 
    handleFinalLabAttainment,
    handleGetFinalLabAttainment, 
};



