const CopoMapping = require('../models/coPoMapping'); 
const FinalLabAttainment = require('../models/finalLabAttainment'); 
const LabPoAttainment = require('../models/calculatedLabPo');
const User = require('../models/user');
const logActivity = require('../utils/activityLogger');

// ---------------------------------------------------------------------------
// 1. Generate & Save Lab PO Attainment
// ---------------------------------------------------------------------------
async function generateAndSaveLabPoAttainment(req, res, isPipelineArg = false) {
    // 🛡️ THE PIPELINE SHIELD
    const isPipeline = typeof isPipelineArg === 'boolean' ? isPipelineArg : false;

    try {
        // 🌟 CRITICAL FIX: Only expecting course, academicYear, and subjectId
        const { course, academicYear, subjectId } = req.body;

        if (!course || !academicYear || !subjectId) {
            const errMsg = 'Course, academicYear, and subjectId are required in the request body';
            if (isPipeline) throw new Error(errMsg);
            if (!res.headersSent) return res.status(400).json({ success: false, message: errMsg });
            return;
        }

        // --- INPUT SANITIZATION ---
        const cleanCourse = course.trim().toUpperCase();
        const cleanSubjectId = subjectId.trim().toUpperCase();
        let cleanYear = academicYear.trim();
        
        if (cleanYear.includes('-')) {
            cleanYear = cleanYear.split('-')[1].trim();
        }

        // 1. Fetch required prerequisites in parallel using .lean() for speed
        const [mappingRecord, finalLabAttainmentRecord] = await Promise.all([
            CopoMapping.findOne({ course: cleanCourse, subjectId: cleanSubjectId, academicYear: cleanYear }).lean(),
            FinalLabAttainment.findOne({ course: cleanCourse, subjectId: cleanSubjectId, academicYear: cleanYear }).lean()
        ]);

        // 2. Validation Checks
        if (!mappingRecord?.mappingData) {
            const errMsg = `Lab PO Logic: No CO-PO mappings found for Course: ${cleanCourse}, Subject: ${cleanSubjectId}, Year: ${cleanYear}`;
            if (isPipeline) throw new Error(errMsg);
            if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
            return;
        }

        if (!finalLabAttainmentRecord) {
            const errMsg = `Lab PO Logic: No Final Lab Attainment found for Course: ${cleanCourse}, Subject: ${cleanSubjectId}, Year: ${cleanYear}`;
            if (isPipeline) throw new Error(errMsg);
            if (!res.headersSent) return res.status(404).json({ success: false, message: errMsg });
            return;
        }

        const finalScore = finalLabAttainmentRecord.finalSubjectAttainment;
        const mappingData = mappingRecord.mappingData;

        // 3. CALCULATE THE AVERAGE CO & PO ATTAINMENT MATRIX
        const averageCo = {};
        const poAttainment = {};

        for (let i = 1; i <= 8; i++) {
            const poKey = `PO${i}`;
            let sum = 0;
            let count = 0;

            for (let j = 1; j <= 5; j++) {
                const coKey = `CO${j}`;

                if (mappingData[coKey]?.[poKey] !== undefined) {
                    const val = parseFloat(mappingData[coKey][poKey]);
                    if (!isNaN(val) && val > 0) {
                        sum += val;
                        count++;
                    }
                }
            }

            if (count > 0) {
                const avg = sum / count;
                averageCo[poKey] = Number.isInteger(avg) ? avg : parseFloat(avg.toFixed(2));
                
                const poScore = (avg * finalScore) / 3;
                poAttainment[poKey] = parseFloat(poScore.toFixed(2));
            } else {
                averageCo[poKey] = "";
                poAttainment[poKey] = "";
            }
        }

        // 4. PARALLEL EXECUTION: Save Data & Fetch User for Logger
        const savePromise = LabPoAttainment.findOneAndUpdate(
            { course: cleanCourse, subjectId: cleanSubjectId, academicYear: cleanYear },
            {
                $set: {
                    course: cleanCourse,
                    subjectId: cleanSubjectId,
                    academicYear: cleanYear,
                    mappingData,
                    averageCo,
                    finalSubjectAttainment: finalScore,
                    poAttainment,
                    calculatedAt: new Date()
                }
            },
            { new: true, upsert: true, lean: true } 
        );

        const userPromise = User.findById(req.user).select('name').lean();

        const [savedData, currentUser] = await Promise.all([savePromise, userPromise]);

        // 5. ACTIVITY LOGGER (Updated to work without subjectName)
        const actorName = currentUser?.name || "a Faculty Member";

        await logActivity(
            req.user, 
            'GENERATED_LAB_PO_ATTAINMENT', 
            `Complete Lab PO Attainment generated for Subject ${cleanSubjectId} (${cleanCourse}, ${cleanYear}) by ${actorName}`, 
            [] 
        );

        // --- PIPELINE EXIT ---
        if (isPipeline) return true;

        if (!res.headersSent) {
            return res.status(201).json({
                success: true,
                message: 'Lab PO Attainment calculated and saved successfully!',
                data: savedData
            });
        }

    } catch (error) {
        console.error('Error saving Lab PO Attainment data:', error.message);
        if (isPipeline) throw error;

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error during Lab PO database save',
                errorDetails: error.message
            });
        }
    }
}

// ---------------------------------------------------------------------------
// 2. Get Lab PO Attainment Data
// ---------------------------------------------------------------------------
const getLabPoAttainmentData = async (req, res) => {
    try {
        let { course, academicYear, subjectId } = req.query;

        if (!course || !academicYear || !subjectId) {
            return res.status(400).json({
                success: false,
                message: 'Course, academicYear, and subjectId are required query parameters'
            });
        }

        const cleanCourse = course.trim().toUpperCase();
        const cleanSubjectId = subjectId.trim().toUpperCase();
        let cleanYear = academicYear.trim();

        if (cleanYear.includes('-')) {
            cleanYear = cleanYear.split('-')[1].trim();
        }

        // 🌟 Uses the new LabPoAttainment schema
        const attainmentRecord = await LabPoAttainment.findOne({
            course: cleanCourse,
            subjectId: cleanSubjectId,
            academicYear: cleanYear
        }).lean();

        if (!attainmentRecord) {
            return res.status(404).json({
                success: false,
                message: `No Lab PO Attainment record found for Course: ${cleanCourse}, Subject: ${cleanSubjectId}, Year: ${cleanYear}`
            });
        }

        return res.status(200).json({
            success: true,
            data: attainmentRecord
        });

    } catch (error) {
        console.error('Error retrieving Lab PO Attainment data:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during data retrieval',
            errorDetails: error.message
        });
    }
};

module.exports = {
    generateAndSaveLabPoAttainment,
    getLabPoAttainmentData
};