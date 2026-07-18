const CoPoMapping = require('../models/coPoMapping');
const Subject = require('../models/subject');
const User = require('../models/user');
const AssignSubject = require('../models/assignSubject');
const logActivity = require('../utils/activityLogger');

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

// ============================================================================
// 2. Save CO-PO Relation
// ============================================================================
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

        // 2. PARALLEL EXECUTION (Massive Performance Boost)
        // Run the Mapping Upsert, Subject Update, and User Fetch simultaneously instead of one by one.
        // We use { new: true } on the Subject update to return the document, eliminating the need for a 4th DB call later!
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
        // Grab the name from the subject we just updated, fallback to req.body, fallback to unknown
        const safeSubjectName = updatedSubject?.subjectName || updatedSubject?.name || subjectName || "Unknown Subject"; 

        await logActivity(
            req.user,
            'UPLOADED_CO_PO_MAPPING', 
            `CO-PO Mapping uploaded for ${cleanSubjectId} - ${safeSubjectName} (${cleanCourse}, ${academicYear}) by ${actorName}`, 
            []
        );

        return res.status(200).json({
            success: true,
            message: "Data saved successfully and Subject status marked as Uploaded!",
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

module.exports = {
    getPendingSubjects,
    saveCoPoRelation,
    getCoPoRelation,
    handleGetMyFilteredSubjects,
    getCoPoRelationByYear,
};




// const CoPoMapping = require('../models/coPoMapping');
// const Subject = require('../models/subject');
// const User = require('../models/user');

// // ... existing code ...
// const AssignSubject = require('../models/assignSubject');


// const logActivity = require('../utils/activityLogger');

// // ============================================================================
// // 1. Fetch Subjects Pending CO-PO Mapping
// // ============================================================================
// const getPendingSubjects = async (req, res) => {
//     try {
//         // Grab optional filters from the query string (e.g., ?academicYear=2024&semester=1)
//         const { academicYear, semester } = req.query;

//         // Build the search query looking specifically for 'Pending' status
//         const query = { copoMappingStatus: 'Pending' };

//         if (academicYear) query.academicYear = Number(academicYear);
//         if (semester) query.semester = Number(semester);

//         // Fetch and sort: newest years first, then by semester order
//         const pendingSubjects = await Subject.find(query)
//             .sort({ academicYear: -1, semester: 1 })
//             .select('subjectId subjectName course academicYear semester copoMappingStatus'); // Only fetch needed fields

//         return res.status(200).json({
//             success: true,
//             count: pendingSubjects.length,
//             data: pendingSubjects
//         });

//     } catch (error) {
//         console.error("Error fetching pending subjects:", error.message);
//         res.status(500).json({
//             success: false,
//             message: "Server Error: " + error.message
//         });
//     }
// };






// const saveCoPoRelation = async (req, res) => {
//     try {
//         const { subjectId, subjectName, academicYear, course, mappingData, semester } = req.body;

//         // 1. Strict Safety Check (Added course & academicYear to ensure database integrity)
//         if (!subjectId || !mappingData || !course || !academicYear) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Subject ID, Academic Year, Course, or Mapping Data is missing."
//             });
//         }

//         // 2. STRICT 8-PO VALIDATION LOGIC
//         const coKeys = Object.keys(mappingData);

//         for (const co of coKeys) {
//             const poKeys = Object.keys(mappingData[co]);

//             // Prevent more than 8 POs
//             if (poKeys.length > 8) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Logic Error: ${co} contains ${poKeys.length} POs. Maximum 8 POs allowed.`
//                 });
//             }

//             // Prevent invalid PO naming (e.g., PO9)
//             const invalidPOs = poKeys.filter(po => {
//                 const poNumber = parseInt(po.replace('PO', ''));
//                 return poNumber > 8 || isNaN(poNumber);
//             });

//             if (invalidPOs.length > 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Invalid POs in ${co}: [${invalidPOs.join(', ')}]. Only PO1-PO8 permitted.`
//                 });
//             }
//         }

//         // 3. Database Update: Save the Mapping (Upsert logic completely prevents duplicates)
//         await CoPoMapping.findOneAndUpdate(
//             {
//                 subjectId: subjectId.toUpperCase(),
//                 academicYear: academicYear,
//                 course: course.toUpperCase() // Fixed: Using the variable directly ensures it doesn't break
//             },
//             { $set: { mappingData, updatedAt: new Date() } },
//             { upsert: true, new: true }
//         );

//         // 4. Database Update: Mark Subject as Completed in the Subject Collection
//         const subjectQuery = {
//             subjectId: subjectId.toUpperCase(),
//             academicYear: academicYear
//         };

//         if (semester) {
//             subjectQuery.semester = semester;
//         }

//         await Subject.findOneAndUpdate(
//             subjectQuery,
//             { $set: { copoMappingStatus: 'Uploaded' } }
//         );

//         // 5. Notification Trigger: Log the Activity
//         // Get the uploader's name safely
//         const currentUser = await User.findById(req.user).select('name').lean();
//         const actorName = currentUser ? currentUser.name : "a Faculty Member";

//         // Find the Subject Name using the ID
//         const subjectRecord = await Subject.findOne({ 
//             subjectId: subjectId.toUpperCase(),
//             academicYear: academicYear 
//         }).lean();
        
//         // Fallback checks just in case the DB lookup fails, we use the name from req.body
//         const safeSubjectName = subjectRecord 
//             ? (subjectRecord.subjectName || subjectRecord.name || subjectName || "Unknown Subject") 
//             : (subjectName || "Unknown Subject"); 

//         const safeCourse = course.toUpperCase();

//         // Fire the formatted notification!
//         // Uncomment this once your logActivity function is imported
        
//         await logActivity(
//             req.user,
//             'UPLOADED_CO_PO_MAPPING', 
//             `CO-PO Mapping uploaded for ${subjectId.toUpperCase()} - ${safeSubjectName} (${safeCourse}, ${academicYear}) by ${actorName}`, 
//             []
//         );
        

//         // 6. Return Success Response
//         return res.status(200).json({
//             success: true,
//             message: "Data saved successfully and Subject status marked as Uploaded!",
//             receivedData: { subjectId, academicYear, course }
//         });

//     } catch (error) {
//         console.error("Save Error:", error.message);
//         return res.status(500).json({
//             success: false,
//             message: "Server Error: " + error.message
//         });
//     }
// };


// const getCoPoRelation = async (req, res) => {
//     try {
//         const { subjectId, academicYear, course } = req.query;

//         if (!subjectId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "subjectId is required as a query parameter."
//             });
//         }

//         const record = await CoPoMapping.findOne({
//             subjectId: subjectId.toUpperCase(),
//             academicYear: academicYear,
//             course: course?.toUpperCase()
//         }).lean();

//         if (!record) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No mapping found for the specified criteria.",
//                 data: {}
//             });
//         }

//         // LOGIC CHECK: 
//         // If your database contains legacy 12-PO data, we should verify 
//         // that we are only sending 8 POs to keep the frontend UI consistent.
//         const filteredMapping = {};

//         Object.keys(record.mappingData).forEach(co => {
//             filteredMapping[co] = {};
//             // Strictly fetch only PO1 to PO8
//             for (let i = 1; i <= 8; i++) {
//                 const poKey = `PO${i}`;
//                 // Keep the value if it exists, otherwise default to 0 (better for calculations than "")
//                 filteredMapping[co][poKey] = record.mappingData[co][poKey] !== undefined ? record.mappingData[co][poKey] : 0;
//             }
//         });

//         return res.status(200).json({
//             success: true,
//             subjectId: record.subjectId,
//             academicYear: record.academicYear,
//             course: record.course,
//             mappingData: filteredMapping // Now guaranteed to be exactly 8 POs
//         });

//     } catch (error) {
//         console.error("Fetch API Error:", error.message);
//         return res.status(500).json({
//             success: false,
//             error: "Internal Server Error: " + error.messagecd 
//         });
//     }
// };




// //unsolved code


// async function handleGetMyFilteredSubjects(req, res) {
//     try {
//         // 1. Identify the user (This comes from your verifyJWT middleware, NOT the body)
//         const loggedInFacultyId = req.facultyId; 
        
//         // 2. Get ONLY the year from the URL query (e.g., /my-subjects?year=2026)
//         const { year } = req.query; 

//         // Security checks
//         if (!loggedInFacultyId) {
//             return res.status(401).json({ success: false, message: "Unauthorized: Token missing or invalid." });
//         }
//         if (!year) {
//             return res.status(400).json({ success: false, message: "Year is required in the URL." });
//         }

//         // 3. Find the assignments for this specific faculty member
//         const facultyDoc = await AssignSubject.findOne({ facultyId: loggedInFacultyId });

//         if (!facultyDoc || !facultyDoc.assignments) {
//             return res.status(200).json({ success: true, data: { year, subjects: [] } });
//         }

//         // 4. Safely check if this year exists in their assignments
//         const isMap = typeof facultyDoc.assignments.get === 'function';
//         const hasYear = isMap ? facultyDoc.assignments.has(year) : facultyDoc.assignments.hasOwnProperty(year);
        
//         if (!hasYear) {
//             return res.status(200).json({ success: true, data: { year, subjects: [] } });
//         }

//         // 5. Extract the subjects for this specific year
//         const yearData = isMap ? facultyDoc.assignments.get(year) : facultyDoc.assignments[year];
//         let assignedSubjects = [];

//         const entries = isMap && typeof yearData.entries === 'function' 
//             ? yearData.entries() 
//             : Object.entries(yearData);

//         for (const [courseName, subjectsArray] of entries) {
//             const mappedSubs = subjectsArray.map(sub => {
//                 const plainSub = (typeof sub.toObject === 'function') ? sub.toObject() : sub;
//                 return { ...plainSub, course: courseName };
//             });
//             assignedSubjects = assignedSubjects.concat(mappedSubs);
//         }

//         if (assignedSubjects.length === 0) {
//             return res.status(200).json({ success: true, data: { year, subjects: [] } });
//         }

//         // 6. Get the subject IDs and fetch their full details from the Subjects DB
//         const subjectIdsToFetch = assignedSubjects.map(sub => sub.subjectId);

//         const fullSubjectDetails = await Subject.find({ 
//             subjectId: { $in: subjectIdsToFetch } 
//         }).lean();

//         // 7. Merge the assignment data with the full Subject DB data
//         const enrichedSubjects = assignedSubjects.map(assigned => {
//             const fullData = fullSubjectDetails.find(dbSub => dbSub.subjectId === assigned.subjectId);
//             return {
//                 ...assigned,   
//                 ...(fullData || {}) 
//             };
//         });

//         // 8. Send the final package back to the user
//         return res.status(200).json({
//             success: true,
//             data: {
//                 facultyName: facultyDoc.facultyName || "Faculty",
//                 year,
//                 subjects: enrichedSubjects
//             }
//         });

//     } catch (error) {
//         console.error("Error in handleGetMyFilteredSubjects:", error);
//         return res.status(500).json({ 
//             success: false, 
//             message: "Server error while fetching assignments."
//         });
//     }
// }


// const getCoPoRelationByYear = async (req, res) => {
//     try {
//         // Only require academicYear as the filter
//         const { academicYear } = req.query;

//         // Build the query object
//         const query = {};
//         if (academicYear) {
//             query.academicYear = academicYear.toString().trim();
//         }

//         // Fetch ALL matching records for the year using find() instead of findOne()
//         const records = await CoPoMapping.find(query).lean();

//         if (!records || records.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No mappings found for the specified year.",
//                 data: []
//             });
//         }

//         // Loop through all records and apply the 8-PO strict filter to each one
//         const formattedRecords = records.map(record => {
//             const filteredMapping = {};

//             if (record.mappingData) {
//                 Object.keys(record.mappingData).forEach(co => {
//                     filteredMapping[co] = {};
//                     // Strictly fetch only PO1 to PO8
//                     for (let i = 1; i <= 8; i++) {
//                         const poKey = `PO${i}`;
//                         // Keep the value if it exists, otherwise default to 0
//                         filteredMapping[co][poKey] = record.mappingData[co][poKey] !== undefined ? record.mappingData[co][poKey] : 0;
//                     }
//                 });
//             }

//             return {
//                 _id: record._id,
//                 subjectId: record.subjectId,
//                 academicYear: record.academicYear,
//                 course: record.course,
//                 mappingData: filteredMapping // Now guaranteed to be exactly 8 POs
//             };
//         });

//         return res.status(200).json({
//             success: true,
//             count: formattedRecords.length,
//             data: formattedRecords
//         });

//     } catch (error) {
//         console.error("Fetch API Error:", error.message);
//         return res.status(500).json({
//             success: false,
//             // Fixed the typo "error.messagecd" from the original code
//             error: "Internal Server Error: " + error.message 
//         });
//     }
// };


// module.exports = {
//     saveCoPoRelation,
//     getCoPoRelation,
//     handleGetMyFilteredSubjects,
//     getCoPoRelationByYear,
// };