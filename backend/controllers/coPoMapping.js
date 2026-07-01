const CoPoMapping = require('../models/coPoMapping');
const Subject = require('../models/subject');
const User = require('../models/user');

// ... existing code ...
const AssignSubject = require('../models/assignSubject');


const logActivity = require('../utils/activityLogger');

// ============================================================================
// 1. Fetch Subjects Pending CO-PO Mapping
// ============================================================================
const getPendingSubjects = async (req, res) => {
    try {
        // Grab optional filters from the query string (e.g., ?academicYear=2024&semester=1)
        const { academicYear, semester } = req.query;

        // Build the search query looking specifically for 'Pending' status
        const query = { copoMappingStatus: 'Pending' };

        if (academicYear) query.academicYear = Number(academicYear);
        if (semester) query.semester = Number(semester);

        // Fetch and sort: newest years first, then by semester order
        const pendingSubjects = await Subject.find(query)
            .sort({ academicYear: -1, semester: 1 })
            .select('subjectId subjectName course academicYear semester copoMappingStatus'); // Only fetch needed fields

        return res.status(200).json({
            success: true,
            count: pendingSubjects.length,
            data: pendingSubjects
        });

    } catch (error) {
        console.error("Error fetching pending subjects:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
};














// ============================================================================
// 2. Save Mapping & Update Subject Status
// ============================================================================
const saveCoPoRelation = async (req, res) => {
    try {
        // const { subjectId, academicYear, course, mappingData, semester } = req.body;
        const { subjectId, subjectName, academicYear, course, mappingData, semester } = req.body;
        // Safety Check
        if (!subjectId || !mappingData) {
            return res.status(400).send("Subject ID or Mapping Data is missing.");
        }

        // --- STRICT 8-PO VALIDATION LOGIC ---
        const coKeys = Object.keys(mappingData);

        for (const co of coKeys) {
            const poKeys = Object.keys(mappingData[co]);

            if (poKeys.length > 8) {
                return res.status(400).json({
                    success: false,
                    message: `Logic Error: ${co} contains ${poKeys.length} POs. Maximum 8 POs allowed.`
                });
            }

            const invalidPOs = poKeys.filter(po => {
                const poNumber = parseInt(po.replace('PO', ''));
                return poNumber > 8 || isNaN(poNumber);
            });

            if (invalidPOs.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid POs in ${co}: [${invalidPOs.join(', ')}]. Only PO1-PO8 permitted.`
                });
            }
        }

        // Database Update: Save the Mapping
        await CoPoMapping.findOneAndUpdate(
            {
                subjectId: subjectId.toUpperCase(),
                academicYear,
                course: (course || "BCA" || "MCA").toUpperCase()
            },
            { $set: { mappingData, updatedAt: new Date() } },
            { upsert: true }
        );

        // Database Update: Mark Subject as Completed
        const subjectQuery = {
            subjectId: subjectId.toUpperCase(),
            academicYear: academicYear
        };

        if (semester) {
            subjectQuery.semester = semester;
        }

        await Subject.findOneAndUpdate(
            subjectQuery,
            { $set: { copoMappingStatus: 'Uploaded' } }
        );

        // ---> ADD THE TRIGGER HERE <---
        //   await logActivity(
        //         req.user, 
        //         // 'MAPPED_CO_PO', 
        //         'CO-PO Mapping uploaded!', 
        //         `${subjectId.toUpperCase()} (${academicYear})`, 
        //         [] 
        //     );
        // 1. Find the name of the person who uploaded it
       // 1. Get the uploader's name
        const currentUser = await User.findById(req.user).select('name').lean();
        const actorName = currentUser ? currentUser.name : "a Faculty Member";

        // 2. Force the backend to find the Subject Name using the ID!
        const subjectRecord = await Subject.findOne({ 
            subjectId: subjectId.toUpperCase(),
            academicYear: academicYear 
        }).lean();
        
        // Check for 'subjectName' or 'name' depending on how your schema is built
        const safeSubjectName = subjectRecord 
            ? (subjectRecord.subjectName || subjectRecord.name || "Unknown Subject") 
            : "Unknown Subject";

        const safeCourse = course ? course.toUpperCase() : "UNKNOWN COURSE";

        // 3. Fire the beautifully formatted notification!
        await logActivity(
            req.user,
            'UPLOADED_CO_PO_MAPPING', 
            // `CO-PO Mapping uploaded for ${subjectId.toUpperCase()} - ${safeSubjectName} (${safeCourse}, Batch: ${academicYear}) by ${actorName}`, 
            `CO-PO Mapping uploaded for ${subjectId.toUpperCase()} - ${safeSubjectName} (${safeCourse}, ${academicYear}) by ${actorName}`, 
            []
        );


        return res.status(200).json({
            success: true,
            message: "Data saved successfully and Subject status marked as Uploaded!",
            receivedData: { subjectId, academicYear }
        });

    } catch (error) {
        console.error("Save Error:", error.message);
        res.status(500).send("Server Error: " + error.message);
    }
};

// module.exports = {
//     getPendingSubjects,
//     saveCoPoRelation
// };


// const CoPoMapping = require('../models/coPoMapping');


// const saveCoPoRelation = async (req, res) => {
//     try {
//         const { subjectId, academicYear, course, mappingData } = req.body;

//         // 1. Safety Check
//         if (!subjectId || !mappingData) {
//             return res.status(400).send("Subject ID or Mapping Data is missing.");
//         }

//         // --- STRICT 8-PO VALIDATION LOGIC ---
//         const coKeys = Object.keys(mappingData);

//         for (const co of coKeys) {
//             const poKeys = Object.keys(mappingData[co]);

//             // Check if count exceeds 8
//             if (poKeys.length > 8) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Logic Error: ${co} contains ${poKeys.length} POs. As per latest rules, a maximum of 8 POs are allowed.`
//                 });
//             }

//             // Check if any PO key is outside the PO1-PO8 range
//             const invalidPOs = poKeys.filter(po => {
//                 const poNumber = parseInt(po.replace('PO', ''));
//                 return poNumber > 8 || isNaN(poNumber);
//             });

//             if (invalidPOs.length > 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Invalid POs detected in ${co}: [${invalidPOs.join(', ')}]. Only PO1 to PO8 are permitted.`
//                 });
//             }
//         }
//         // --- END OF VALIDATION ---

//         // 2. Database Update
//         await CoPoMapping.findOneAndUpdate(
//             { 
//                 subjectId: subjectId.toUpperCase(), 
//                 academicYear, 
//                 course: (course || "BCA").toUpperCase() 
//             },
//             { $set: { mappingData, updatedAt: new Date() } },
//             { upsert: true }
//         );

//         // 3. Success Response
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


// const saveCoPoRelation = async (req, res) => {
//     try {
//         const { subjectId, academicYear, course, mappingData } = req.body;

//         // 1. Safety Check
//         if (!subjectId || !mappingData) {
//             return res.status(400).send("Subject ID or Mapping Data is missing.");
//         }

//         // --- STRICT 8-PO VALIDATION LOGIC ---
//         const coKeys = Object.keys(mappingData);

//         for (const co of coKeys) {
//             const poKeys = Object.keys(mappingData[co]);

//             // Check if count exceeds 8
//             if (poKeys.length > 8) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Logic Error: ${co} contains ${poKeys.length} POs. As per latest rules, a maximum of 8 POs are allowed.`
//                 });
//             }

//             // Check if any PO key is outside the PO1-PO8 range
//             const invalidPOs = poKeys.filter(po => {
//                 const poNumber = parseInt(po.replace('PO', ''));
//                 return poNumber > 8 || isNaN(poNumber);
//             });

//             if (invalidPOs.length > 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Invalid POs detected in ${co}: [${invalidPOs.join(', ')}]. Only PO1 to PO8 are permitted.`
//                 });
//             }
//         }
//         // --- END OF VALIDATION ---

//         // 2. Database Update
//         await CoPoMapping.findOneAndUpdate(
//             { 
//                 subjectId: subjectId.toUpperCase(), 
//                 academicYear, 
//                 course: (course || "BCA").toUpperCase() 
//             },
//             { 
//                 $set: { 
//                     mappingData, 
//                     status: 'uploaded', // <-- Updates the status here
//                     updatedAt: new Date() 
//                 } 
//             },
//             { upsert: true }
//         );

//         // 3. Success Response
//         return res.status(200).json({
//             success: true,
//             message: "Data saved successfully and status updated to uploaded!",
//             receivedData: { subjectId, academicYear }
//         });

//     } catch (error) {
//         console.error("Save Error:", error.message);
//         res.status(500).send("Server Error: " + error.message);
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
            error: "Internal Server Error: " + error.messagecd 
        });
    }
};




//unsolved code


async function handleGetMyFilteredSubjects(req, res) {
    try {
        // 1. Identify the user (This comes from your verifyJWT middleware, NOT the body)
        const loggedInFacultyId = req.facultyId; 
        
        // 2. Get ONLY the year from the URL query (e.g., /my-subjects?year=2026)
        const { year } = req.query; 

        // Security checks
        if (!loggedInFacultyId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Token missing or invalid." });
        }
        if (!year) {
            return res.status(400).json({ success: false, message: "Year is required in the URL." });
        }

        // 3. Find the assignments for this specific faculty member
        const facultyDoc = await AssignSubject.findOne({ facultyId: loggedInFacultyId });

        if (!facultyDoc || !facultyDoc.assignments) {
            return res.status(200).json({ success: true, data: { year, subjects: [] } });
        }

        // 4. Safely check if this year exists in their assignments
        const isMap = typeof facultyDoc.assignments.get === 'function';
        const hasYear = isMap ? facultyDoc.assignments.has(year) : facultyDoc.assignments.hasOwnProperty(year);
        
        if (!hasYear) {
            return res.status(200).json({ success: true, data: { year, subjects: [] } });
        }

        // 5. Extract the subjects for this specific year
        const yearData = isMap ? facultyDoc.assignments.get(year) : facultyDoc.assignments[year];
        let assignedSubjects = [];

        const entries = isMap && typeof yearData.entries === 'function' 
            ? yearData.entries() 
            : Object.entries(yearData);

        for (const [courseName, subjectsArray] of entries) {
            const mappedSubs = subjectsArray.map(sub => {
                const plainSub = (typeof sub.toObject === 'function') ? sub.toObject() : sub;
                return { ...plainSub, course: courseName };
            });
            assignedSubjects = assignedSubjects.concat(mappedSubs);
        }

        if (assignedSubjects.length === 0) {
            return res.status(200).json({ success: true, data: { year, subjects: [] } });
        }

        // 6. Get the subject IDs and fetch their full details from the Subjects DB
        const subjectIdsToFetch = assignedSubjects.map(sub => sub.subjectId);

        const fullSubjectDetails = await Subject.find({ 
            subjectId: { $in: subjectIdsToFetch } 
        }).lean();

        // 7. Merge the assignment data with the full Subject DB data
        const enrichedSubjects = assignedSubjects.map(assigned => {
            const fullData = fullSubjectDetails.find(dbSub => dbSub.subjectId === assigned.subjectId);
            return {
                ...assigned,   
                ...(fullData || {}) 
            };
        });

        // 8. Send the final package back to the user
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
        return res.status(500).json({ 
            success: false, 
            message: "Server error while fetching assignments."
        });
    }
}

module.exports = {
    saveCoPoRelation,
    getCoPoRelation,
    handleGetMyFilteredSubjects
};