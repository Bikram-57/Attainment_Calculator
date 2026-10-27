const xlsx = require('xlsx');
const CoPoMapping = require('../models/coPoMapping');
const Subject = require('../models/subject');
const User = require('../models/user');
const AssignSubject = require('../models/assignSubject');
const logActivity = require('../utils/activityLogger');
// const { generateAndSavePoAttainment } = require('../controllers/calculatedPo');
const { generateAndSavePoAttainment } = require('../controllers/calculatedPO');
// ============================================================================
// 1. Fetch Subjects Pending CO-PO Mapping
// ============================================================================
const getPendingSubjects = async (req, res) => {
    try {
        const { academicYear, semester } = req.query;
        const query = { copoMappingStatus: 'Pending' };

        if (academicYear) query.academicYear = Number(academicYear);
        if (semester) query.semester = Number(semester);

        // OPTIMIZATION: .lean() strips heavy Mongoose methods for faster read-only queries
        const pendingSubjects = await Subject.find(query)
            .sort({ academicYear: -1, semester: 1 })
            .select('subjectId subjectName course academicYear semester copoMappingStatus')
            .lean(); 

        return res.status(200).json({ success: true, count: pendingSubjects.length, data: pendingSubjects });

    } catch (error) {
        console.error("Error fetching pending subjects:", error.message);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};


// Make sure to import your calculation controller at the top of this file:
// const { generateAndSavePoAttainment } = require('./path/to/your/attainment/controller');

const saveCoPoRelation = async (req, res) => {
    try {
        const { subjectId, subjectName, academicYear, course, mappingData, semester } = req.body;

        if (!subjectId || !mappingData || !course || !academicYear) {
            return res.status(400).json({ success: false, message: "Subject ID, Academic Year, Course, or Mapping Data is missing." });
        }

        const cleanSubjectId = subjectId.toUpperCase();
        const cleanCourse = course.toUpperCase();

        // 1. STRICT 8-PO VALIDATION LOGIC
        for (const [co, poMap] of Object.entries(mappingData)) {
            const poKeys = Object.keys(poMap);

            if (poKeys.length > 8) {
                return res.status(400).json({ success: false, message: `Logic Error: ${co} contains > 8 POs.` });
            }

            const invalidPOs = poKeys.filter(po => {
                const poNumber = parseInt(po.replace('PO', ''), 10);
                return poNumber > 8 || isNaN(poNumber);
            });

            if (invalidPOs.length > 0) {
                return res.status(400).json({ success: false, message: `Invalid POs in ${co}: [${invalidPOs.join(', ')}]. Only PO1-PO8 permitted.` });
            }
        }

        const subjectQuery = { subjectId: cleanSubjectId, academicYear };
        if (semester) subjectQuery.semester = semester;

        // 2. PARALLEL EXECUTION (Update the CO-PO Mapping)
        const [_, updatedSubject, currentUser] = await Promise.all([
            CoPoMapping.findOneAndUpdate( 
                { subjectId: cleanSubjectId, academicYear, course: cleanCourse },
                { $set: { mappingData, updatedAt: new Date() } },
                { upsert: true, new: true, lean: true }
            ),
            Subject.findOneAndUpdate(
                subjectQuery,
                { $set: { copoMappingStatus: 'Uploaded' } },
                { new: true, lean: true } 
            ),
            User.findById(req.user).select('name').lean()
        ]);

        // 3. ACTIVITY LOGGER
        const actorName = currentUser?.name || "a Faculty Member";
        const safeSubjectName = updatedSubject?.subjectName || updatedSubject?.name || subjectName || "Unknown Subject"; 

        await logActivity(
            req.user,
            'UPLOADED_CO_PO_MAPPING', 
            `CO-PO Mapping uploaded for ${cleanSubjectId} - ${safeSubjectName} (${cleanCourse}, ${academicYear}) by ${actorName}`, 
            []
        );

        // 4. THE MAGIC LINK: Trigger PO Attainment in Pipeline Mode!
        // We pass the exact same req and res, but add `true` for isPipelineArg
        try {
            await generateAndSavePoAttainment(req, res, true);
        } catch (calcError) {
            console.error("Warning: Mapping saved, but auto-recalculation failed:", calcError.message);
            // We log it but DON'T crash the request, because the mapping itself saved successfully.
        }

        // 5. FINAL SUCCESS RESPONSE
        return res.status(200).json({
            success: true,
            message: "Data saved successfully and PO Attainment recalculated!",
            receivedData: { subjectId, academicYear, course }
        });

    } catch (error) {
        console.error("Save Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};


// ============================================================================
// 3. Get CO-PO Relation (Single)
// ============================================================================
const getCoPoRelation = async (req, res) => {
    try {
        const { subjectId, academicYear, course } = req.query;

        if (!subjectId) return res.status(400).json({ success: false, message: "subjectId is required as a query parameter." });

        const record = await CoPoMapping.findOne({
            subjectId: subjectId.toUpperCase(),
            academicYear: academicYear,
            course: course?.toUpperCase()
        }).lean();

        if (!record) {
            return res.status(404).json({ success: false, message: "No mapping found for the specified criteria.", data: {} });
        }

        // SCALABLE FILTERING: Strictly output only PO1 to PO8 to sanitize legacy UI data
        const filteredMapping = {};
        for (const [co, poData] of Object.entries(record.mappingData)) {
            filteredMapping[co] = {};
            for (let i = 1; i <= 8; i++) {
                const poKey = `PO${i}`;
                filteredMapping[co][poKey] = poData[poKey] !== undefined ? poData[poKey] : 0;
            }
        }

        return res.status(200).json({
            success: true,
            subjectId: record.subjectId,
            academicYear: record.academicYear,
            course: record.course,
            mappingData: filteredMapping 
        });

    } catch (error) {
        console.error("Fetch API Error:", error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error: " + error.message });
    }
};

// ============================================================================
// 4. Get My Filtered Subjects
// ============================================================================
async function handleGetMyFilteredSubjects(req, res) {
    try {
        const loggedInFacultyId = req.facultyId; 
        const { year } = req.query; 

        if (!loggedInFacultyId) return res.status(401).json({ success: false, message: "Unauthorized: Token missing." });
        if (!year) return res.status(400).json({ success: false, message: "Year is required in the URL." });

        // OPTIMIZATION: .collection.findOne bypasses Mongoose 'Map' parsing entirely, 
        // returning a clean, native JS object. This eliminates complex map parsing logic.
        const facultyDoc = await AssignSubject.collection.findOne({ facultyId: loggedInFacultyId });

        if (!facultyDoc?.assignments?.[year]) {
            return res.status(200).json({ success: true, data: { year, subjects: [] } });
        }

        const yearData = facultyDoc.assignments[year];
        
        // Flatten nested course subjects into a single array dynamically
        const assignedSubjects = Object.entries(yearData).flatMap(([courseName, subjectsArray]) => 
            subjectsArray.map(sub => ({ ...sub, course: courseName }))
        );

        if (assignedSubjects.length === 0) {
            return res.status(200).json({ success: true, data: { year, subjects: [] } });
        }

        // Fetch full subject details for the specific year
        const subjectIdsToFetch = assignedSubjects.map(sub => sub.subjectId);
        const fullSubjectDetails = await Subject.find({ 
            subjectId: { $in: subjectIdsToFetch },
            academicYear: year // Constrain by year to prevent fetching legacy details
        }).lean();

        // O(1) LOOKUP OPTIMIZATION: Create a dictionary/map of subjects for instant merging 
        // (prevents slow O(N^2) loops inside large datasets)
        const subjectDictionary = fullSubjectDetails.reduce((acc, sub) => {
            acc[sub.subjectId] = sub;
            return acc;
        }, {});

        const enrichedSubjects = assignedSubjects.map(assigned => ({
            ...assigned,   
            ...(subjectDictionary[assigned.subjectId] || {}) 
        }));

        return res.status(200).json({
            success: true,
            data: {
                facultyName: facultyDoc.facultyName || "Faculty",
                year,
                subjects: enrichedSubjects
            }
        });

    } catch (error) {
        console.error("Error in handleGetMyFilteredSubjects:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching assignments." });
    }
}

// ============================================================================
// 5. Get CO-PO Relation By Year
// ============================================================================
const getCoPoRelationByYear = async (req, res) => {
    try {
        const { academicYear } = req.query;
        const query = academicYear ? { academicYear: academicYear.toString().trim() } : {};

        const records = await CoPoMapping.find(query).lean();

        if (!records.length) {
            return res.status(404).json({ success: false, message: "No mappings found for the specified year.", data: [] });
        }

        const formattedRecords = records.map(record => {
            const filteredMapping = {};

            if (record.mappingData) {
                for (const [co, poData] of Object.entries(record.mappingData)) {
                    filteredMapping[co] = {};
                    for (let i = 1; i <= 8; i++) {
                        const poKey = `PO${i}`;
                        filteredMapping[co][poKey] = poData[poKey] !== undefined ? poData[poKey] : 0;
                    }
                }
            }

            return {
                _id: record._id,
                subjectId: record.subjectId,
                academicYear: record.academicYear,
                course: record.course,
                mappingData: filteredMapping 
            };
        });

        return res.status(200).json({ success: true, count: formattedRecords.length, data: formattedRecords });

    } catch (error) {
        console.error("Fetch API Error:", error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error: " + error.message });
    }
};






/**
 * @desc    Process uploaded Excel sheet for CO-PO Mapping, validate format, extract data to JSON, and update database.
 * @route   POST /api/copo/upload-excel
 */
const handleCoPoMappingThroughExcelSheet = async (req, res) => {
    try {
        const { subjectId, subjectName, academicYear, course, semester } = req.body;
        const file = req.file;

        // 1. INPUT VALIDATION
        if (!subjectId || !academicYear || !course || !file) {
            return res.status(400).json({ 
                success: false, 
                message: "Subject ID, Academic Year, Course, and Excel file are required." 
            });
        }

        // Sanitize string inputs to prevent query mismatches
        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();

        // 2. EXCEL PARSING
        // Read buffer directly from memory to avoid disk I/O bottlenecks
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]]; 
        
        // Convert sheet to a 2D array. 
        // 'defval: ""' ensures empty cells aren't skipped, keeping array indices perfectly aligned
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        if (rawData.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: "Excel file is empty or missing data rows." 
            });
        }

        // 3. TEMPLATE HEADER VALIDATION
        // Enforce columns 1-8 strictly match PO1-PO8 (ignoring cell A1 at index 0)
        const expectedHeaders = ["PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8"];
        const headersRow = rawData[0]; // Cache first row for faster access

        for (let i = 1; i <= 8; i++) {
            const actualHeader = String(headersRow[i]).trim().toUpperCase();
            if (actualHeader !== expectedHeaders[i - 1]) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Invalid header at column ${i + 1}. Expected ${expectedHeaders[i - 1]}.` 
                });
            }
        }

        // 4. DATA EXTRACTION & FORMATTING
        const mappingData = {};
        // Use a Set for O(1) fast lookups of acceptable empty cell values
        const emptyIndicators = new Set(["—", "-", ""]); 

        // Iterate through data rows (skipping index 0 header row)
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            const coKey = String(row[0]).trim().toUpperCase();
            
            // Safely skip trailing blank rows at the bottom of the Excel sheet
            if (!coKey) continue; 

            // Strict prefix validation
            if (!coKey.startsWith('CO')) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Row ${i + 1} must start with a CO identifier (e.g., CO1). Found: '${row[0]}'` 
                });
            }

            mappingData[coKey] = {};

            // Map PO1 through PO8 horizontally across the row
            for (let j = 1; j <= 8; j++) {
                const poKey = `PO${j}`;
                let cellValue = row[j];

                if (emptyIndicators.has(cellValue)) {
                    mappingData[coKey][poKey] = "";
                } else {
                    const numValue = Number(cellValue);
                    
                    // Reject non-numeric text data
                    if (isNaN(numValue)) {
                        return res.status(400).json({ 
                            success: false, 
                            message: `Invalid value at ${coKey} -> ${poKey}. Must be a number or dash.` 
                        });
                    }
                    mappingData[coKey][poKey] = numValue;
                }
            }
        }

        // Failsafe: Ensure valid data was actually processed
        if (Object.keys(mappingData).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No valid mapping data could be extracted." 
            });
        }

        // 5. PARALLEL DATABASE EXECUTION
        // Dynamically build the subject query to accommodate optional semester filter
        const subjectQuery = { subjectId: cleanSubjectId, academicYear };
        if (semester) subjectQuery.semester = semester;

        // Run Upsert (Mapping), Update (Subject status), and Fetch (User profile) concurrently.
        // { lean: true } strips heavy Mongoose document methods for faster reads.
        const [_, updatedSubject, currentUser] = await Promise.all([
            CoPoMapping.findOneAndUpdate(
                { subjectId: cleanSubjectId, academicYear, course: cleanCourse },
                { 
                    $set: { 
                        mappingData, // ES6 Shorthand
                        updatedAt: new Date() 
                    } 
                },
                { upsert: true, new: true, lean: true } 
            ),
            Subject.findOneAndUpdate(
                subjectQuery,
                { $set: { copoMappingStatus: 'Uploaded' } },
                { new: true, lean: true } 
            ),
            User.findById(req.user).select('name').lean()
        ]);

        // 6. ACTIVITY LOGGING
        const actorName = currentUser?.name || "a Faculty Member";
        // Attempt to extract the subject name from DB response, fallback to req.body, then unknown
        const safeSubjectName = updatedSubject?.subjectName || updatedSubject?.name || subjectName || "Unknown Subject"; 

        await logActivity(
            req.user,
            'UPLOADED_CO_PO_MAPPING', 
            `CO-PO Mapping uploaded via Excel for ${cleanSubjectId} - ${safeSubjectName} (${cleanCourse}, ${academicYear}) by ${actorName}`, 
            []
        );

        // 7. SUCCESS RESPONSE
        return res.status(200).json({
            success: true,
            message: "Excel sheet processed and mapping data successfully saved to the database!"
        });

    } catch (error) {
        console.error("Excel Upload Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
};











module.exports = {
    getPendingSubjects,
    saveCoPoRelation,
    getCoPoRelation,
    handleGetMyFilteredSubjects,
    getCoPoRelationByYear,
    handleCoPoMappingThroughExcelSheet
};
