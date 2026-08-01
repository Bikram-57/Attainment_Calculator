const mongoose = require('mongoose');
const Subject = require('../models/subject');
const User = require('../models/user');
const logActivity = require('../utils/activityLogger');

// ============================================================================
// HELPER: Reusable Activity Logger
// ============================================================================
/**
 * Safely fetches the user's name and logs the activity without blocking the main thread.
 */
const logSubjectAction = async (req, actionType, messageContext) => {
    try {
        const userId = req.user?._id || req.user?.id || req.user;
        // .lean() provides a fast read just to get the user's name
        const currentUser = await User.findById(userId).select('name').lean();
        const actorName = currentUser?.name || "a Faculty Member";

        await logActivity(
            userId,
            actionType,
            `${messageContext} by ${actorName}`,
            []
        );
    } catch (logError) {
        console.error("⚠️ Activity Logger Failed:", logError.message);
    }
};

// ============================================================================
// 1. Create New Subject
// ============================================================================
async function handleGenerateNewSubject(req, res) {
    try {
        const { subjectId, subjectName, course, academicYear, semester } = req.body;

        if (!subjectId || !subjectName || !course || !academicYear || !semester) {
            return res.status(400).json({
                success: false,
                message: "Please provide subjectId, subjectName, course, academicYear, and semester."
            });
        }

        // SANITIZATION: Prevents accidental duplicates due to case sensitivity or spaces
        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        const cleanYear = Number(academicYear);
        const cleanSem = Number(semester);

        const newSubject = await Subject.create({
            subjectId: cleanSubjectId,
            subjectName: subjectName.trim(),
            course: cleanCourse,
            academicYear: cleanYear,
            semester: cleanSem
        });

        // Log Activity
        await logSubjectAction(req, 'CREATED_SUBJECT', 
            `New subject ${cleanSubjectId} - ${newSubject.subjectName} created for ${cleanCourse} (Year: ${cleanYear}, Sem: ${cleanSem})`
        );

        return res.status(201).json({ success: true, data: newSubject });

    } catch (error) {
        // Handle MongoDB Duplicate Key Error gracefully
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: `Conflict: Subject ID '${req.body.subjectId}' already exists for semester ${req.body.semester} in academic year ${req.body.academicYear}.`
            });
        }
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// ============================================================================
// 2. Update Subject
// ============================================================================
async function handleUpdateSubject(req, res) {
    try {
        const { id } = req.params;
        const { subjectName, course, academicYear, semester } = req.body;

        // 1. Build an object dynamically with ONLY the fields provided & sanitized
        const updateFields = {};
        if (subjectName) updateFields.subjectName = subjectName.trim();
        if (course) updateFields.course = course.trim().toUpperCase();
        if (academicYear) updateFields.academicYear = Number(academicYear);
        if (semester) updateFields.semester = Number(semester);

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update (subjectName, course, academicYear, or semester)."
            });
        }

        // 2. Search by subject code and update
        const updatedSubject = await Subject.findOneAndUpdate(
            { subjectId: id.trim().toUpperCase() },
            { $set: updateFields },
            { new: true, runValidators: true, lean: true } // lean: true for faster response
        );

        if (!updatedSubject) {
            return res.status(404).json({ success: false, message: `Subject with code ${id} not found.` });
        }

        // 3. Log Activity
        const safeCourse = updatedSubject.course || "UNKNOWN COURSE";
        await logSubjectAction(req, 'UPDATED_SUBJECT', 
            `Subject details updated for ${updatedSubject.subjectId} - ${updatedSubject.subjectName} (${safeCourse}, Year: ${updatedSubject.academicYear}, Sem: ${updatedSubject.semester})`
        );

        return res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: updatedSubject
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Cannot update: This subject already exists in the target academic year and semester."
            });
        }
        res.status(500).json({ success: false, error: error.message });
    }
}

// ============================================================================
// 3. Get All Subjects (Optional Semester Filter)
// ============================================================================
async function handleGetAllSubject(req, res) {
    try {
        const filter = {};
        if (req.query.semester) {
            filter.semester = Number(req.query.semester);
        }

        // .lean() heavily optimizes fetching large lists of documents
        const subjects = await Subject.find(filter).lean();

        res.status(200).json({ success: true, count: subjects.length, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// ============================================================================
// 4. Get Subject By Subject ID
// ============================================================================
async function handleGetSubjectBySubjectId(req, res) {
    try {
        const { id } = req.params;

        // .lean() for blazing fast single-document read
        const subject = await Subject.findOne({ subjectId: id.trim().toUpperCase() }).lean();

        if (!subject) {
            return res.status(404).json({ success: false, message: `Subject not found for code ${id}` });
        }

        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// ============================================================================
// 5. Delete Subject
// ============================================================================
// async function handleDeleteSubject(req, res) {
//     try {
//         const { id } = req.params;
//         const cleanId = id.trim().toUpperCase();

//         const deletedSubject = await Subject.findOneAndDelete({ subjectId: cleanId }).lean();

//         if (!deletedSubject) {
//             return res.status(404).json({ success: false, message: `Subject with ID ${cleanId} not found.` });
//         }

//         // Log Activity
//         const safeCourse = deletedSubject.course || "UNKNOWN COURSE";
//         await logSubjectAction(req, 'DELETED_SUBJECT', 
//             `Subject ${deletedSubject.subjectId} - ${deletedSubject.subjectName} (${safeCourse}, Year: ${deletedSubject.academicYear}, Sem: ${deletedSubject.semester}) was deleted`
//         );

//         return res.status(200).json({
//             success: true,
//             message: "Subject deleted successfully",
//             data: deletedSubject
//         });

//     } catch (error) {
//         return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// }

async function handleDeleteSubject(req, res) {
    try {
        const { id } = req.params;
        const cleanId = id.trim().toUpperCase();

        console.log(`\n--- STARTING CASCADE DELETE FOR: ${cleanId} ---`);

        // 1. Find the subject FIRST so we know its year and course
        const subjectToDelete = await Subject.findOne({ subjectId: cleanId }).lean();

        if (!subjectToDelete) {
            console.log(`--- ABORTED: Subject ${cleanId} not found in main collection --- \n`);
            return res.status(404).json({ success: false, message: `Subject with ID ${cleanId} not found.` });
        }

        const { academicYear, course } = subjectToDelete;

        // 2. Surgically remove from assignsubjects (Nested Structure)
        try {
            // Construct the dynamic path (e.g., "assignments.2026.BCA")
            const assignmentPath = `assignments.${academicYear}.${course}`;
            
            // Use $pull to remove just the one subject from the array without deleting the faculty record
            const assignResult = await mongoose.connection.collection('assignsubjects').updateMany(
                { [assignmentPath]: { $exists: true } }, // Find documents that have this year/course
                { $pull: { [assignmentPath]: { subjectId: cleanId } } } // Remove the specific subject
            );
            console.log(`[assignsubjects]: Pulled ${cleanId} from ${assignResult.modifiedCount} faculty records.`);
        } catch (assignError) {
            console.error(`[assignsubjects]: Error during update -`, assignError.message);
        }

        // 3. Delete from standard "flat" collections
        const flatCollections = [
            'calculatedmarks',
            'copomappings',
            'directattainments',
            'finalattainment',
            'marks',
            'poattainments',
            'rubrics'
        ];

        for (const collectionName of flatCollections) {
            try {
                const result = await mongoose.connection.collection(collectionName).deleteMany({ subjectId: cleanId });
                console.log(`[${collectionName}]: Found and deleted ${result.deletedCount} documents.`);
            } catch (cleanupError) {
                console.error(`[${collectionName}]: Error during cleanup -`, cleanupError.message);
            }
        }

        // 4. NOW actually delete the main subject document
        await Subject.findByIdAndDelete(subjectToDelete._id);
        console.log(`--- SUCCESS: Main Subject ${cleanId} deleted ---\n`);

        // 5. Log Activity
        const safeCourse = course || "UNKNOWN COURSE";
        await logSubjectAction(req, 'DELETED_SUBJECT', 
            `Subject ${cleanId} - ${subjectToDelete.subjectName} (${safeCourse}, Year: ${academicYear}, Sem: ${subjectToDelete.semester}) was deleted`
        );

        return res.status(200).json({
            success: true,
            message: "Subject and all related data completely deleted",
            data: subjectToDelete
        });

    } catch (error) {
        console.error("Delete Controller Error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}
// ============================================================================
// 6. Get Subjects By Academic Year
// ============================================================================
async function handleGetSubjectsByAcademicYear(req, res) {
    try {
        const { academicYear } = req.params;
        const subjects = await Subject.find({ academicYear: Number(academicYear) }).lean();

        if (!subjects.length) {
            return res.status(404).json({ success: false, message: `No subjects found for academic year ${academicYear}.` });
        }

        res.status(200).json({ success: true, count: subjects.length, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// ============================================================================
// 7. Get Subjects By Year and Course
// ============================================================================
async function handleGetSubjectsByYearAndCourse(req, res) {
    try {
        const { academicYear, course } = req.params;
        
        const subjects = await Subject.find({
            academicYear: Number(academicYear),
            course: course.trim().toUpperCase()
        }).lean();

        if (!subjects.length) {
            return res.status(404).json({
                success: false,
                message: `No subjects found for course ${course.toUpperCase()} in academic year ${academicYear}.`
            });
        }

        res.status(200).json({ success: true, count: subjects.length, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// ============================================================================
// 8. Get Subjects By Dynamic Query (Course, Year, Semester)
// ============================================================================
const handleGetSubjectsBySemester = async (req, res) => {
    try {
        const { course, academicYear, semester } = req.query;
        const query = {};

        // Build query dynamically & safely
        if (course) query.course = course.trim().toUpperCase();
        
        if (academicYear) {
            const year = Number(academicYear);
            if (isNaN(year)) return res.status(400).json({ success: false, message: "academicYear must be a valid number" });
            query.academicYear = year;
        }

        if (semester) {
            const sem = Number(semester);
            if (isNaN(sem)) return res.status(400).json({ success: false, message: "semester must be a valid number" });
            query.semester = sem;
        }

        const subjects = await Subject.find(query).lean();

        return res.status(200).json({ success: true, count: subjects.length, data: subjects });

    } catch (error) {
        console.error("Query Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    handleGenerateNewSubject,
    handleUpdateSubject,
    handleGetAllSubject,
    handleGetSubjectBySubjectId,
    handleDeleteSubject,
    handleGetSubjectsByAcademicYear,
    handleGetSubjectsByYearAndCourse,
    handleGetSubjectsBySemester,
};



// const Subject = require('../models/subject');
// const User = require('../models/user');
// const logActivity = require('../utils/activityLogger');



// //new
// async function handleGenerateNewSubject(req, res) {
//     try {
//         // 1. Added 'semester' to the destructured body
//         const { subjectId, subjectName, course, academicYear, semester } = req.body;

//         // Optional but recommended: Check if required fields exist before hitting the database
//         if (!subjectId || !subjectName || !course || !academicYear || !semester) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide subjectId, subjectName, course, academicYear, and semester."
//             });
//         }

//         // Status is automatically set to 'Pending' by the schema default
//         const newSubject = await Subject.create({
//             subjectId,
//             subjectName,
//             course,
//             academicYear,
//             semester // 2. Added 'semester' to the creation payload
//         });

//         // ---> 🔔 THE BELL RINGER (Placed BEFORE the return!) <---
//         try {
//             const userId = req.user?._id || req.user?.id || req.user;
//             const currentUser = await User.findById(userId).select('name').lean();
//             const actorName = currentUser ? currentUser.name : "a Faculty Member";

//             await logActivity(
//                 userId,
//                 'CREATED_SUBJECT',
//                 `New subject ${subjectId.toUpperCase()} - ${subjectName} created for ${course.toUpperCase()} (Year: ${academicYear}, Sem: ${semester}) by ${actorName}`,
//                 []
//             );
//         } catch (logError) {
//             console.error("⚠️ Activity Logger Failed:", logError.message);
//         }
//         // ---------------------------------------------------------

//         return res.status(201).json({
//             success: true,
//             data: newSubject
//         });

//     } catch (error) {
//         // This catches the '11000' error so the NODE SERVER DOES NOT CRASH
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 // 3. UPDATED: Error message now mentions both academic year and semester
//                 message: `The Subject ID '${req.body.subjectId}' already exists for semester ${req.body.semester} in the academic year ${req.body.academicYear}.`
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message
//         });
//     }
// }









// //new
// async function handleUpdateSubject(req, res) {
//     try {
//         const { id } = req.params; // Get subjectId (subject code) from URL

//         // Extract the possible fields from the request body
//         const { subjectName, course, academicYear, semester } = req.body;

//         // 1. Build an object dynamically with ONLY the fields provided
//         const updateFields = {};
//         if (subjectName) updateFields.subjectName = subjectName;
//         if (course) updateFields.course = course;
//         if (academicYear) updateFields.academicYear = academicYear;
//         if (semester) updateFields.semester = semester;

//         // 2. Guard clause: Ensure they sent at least ONE thing to update
//         if (Object.keys(updateFields).length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide at least one field to update (subjectName, course, academicYear, or semester)."
//             });
//         }

//         // 3. Search ONLY by the subject code, and use $set to update only the provided fields
//         const updatedSubject = await Subject.findOneAndUpdate(
//             {
//                 subjectId: id.toUpperCase() // Search by subjectcode
//             },
//             {
//                 $set: updateFields // Only updates what is inside this object
//             },
//             {
//                 new: true,
//                 runValidators: true
//             }
//         );

//         if (!updatedSubject) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject with code ${id} not found.`
//             });
//         }

    

//         // ---> 🔔 THE BELL RINGER (Placed BEFORE the return!) <---
//         try {
//             const userId = req.user?._id || req.user?.id || req.user;
//             const currentUser = await User.findById(userId).select('name').lean();
//             const actorName = currentUser ? currentUser.name : "a Faculty Member";

//             // Grab the safe course name just in case it's missing for some reason
//             const safeCourse = updatedSubject.course ? updatedSubject.course.toUpperCase() : "UNKNOWN COURSE";

//             await logActivity(
//                 userId,
//                 'UPDATED_SUBJECT',
//                 `Subject details updated for ${updatedSubject.subjectId.toUpperCase()} - ${updatedSubject.subjectName} (${safeCourse}, Year: ${updatedSubject.academicYear}, Sem: ${updatedSubject.semester}) by ${actorName}`,
//                 []
//             );
//         } catch (logError) {
//             console.error("⚠️ Activity Logger Failed:", logError.message);
//         }
//         // ---------------------------------------------------------


//         return res.status(200).json({
//             success: true,
//             message: "Subject updated successfully",
//             data: updatedSubject
//         });

//     } catch (error) {
//         // Catch duplicate key errors if the new academicYear/semester 
//         // conflicts with an existing record for this subject ID
//         if (error.code === 11000) {
//             return res.status(409).json({
//                 success: false,
//                 message: "Cannot update: This subject already exists in the target academic year and semester."
//             });
//         }

//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// }





// //done
// async function handleGetAllSubject(req, res) {
//     try {
//         // Create an empty filter. If it stays empty, it gets ALL subjects.
//         const filter = {};

//         // If your frontend asks for a specific semester (e.g., ?semester=3), it adds it to the filter.
//         if (req.query.semester) {
//             filter.semester = req.query.semester;
//         }

//         // Find all subjects (or all subjects for the requested semester)
//         const subjects = await Subject.find(filter);

//         res.status(200).json({
//             success: true,
//             count: subjects.length,
//             data: subjects
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }




// //done
// async function handleGetSubjectBySubjectId(req, res) {
//     try {
//         const { id } = req.params; // Get subject code from the URL

//         // Search ONLY by the subject code
//         const subject = await Subject.findOne({
//             subjectId: id.toUpperCase()
//         });

//         if (!subject) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject not found for code ${id}`
//             });
//         }

//         res.status(200).json({ success: true, data: subject });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }



// //new
// async function handleDeleteSubject(req, res) {
//     try {
//         const { id } = req.params;

//         // 1. Find ONLY by subjectId and delete
//         const deletedSubject = await Subject.findOneAndDelete({
//             subjectId: id.toUpperCase()
//         });

//         // 2. If the subject doesn't exist
//         if (!deletedSubject) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject with ID ${id} not found.`
//             });
//         }

//         // ---> 🔔 THE BELL RINGER (Placed BEFORE the response!) <---
//         try {
//             const userId = req.user?._id || req.user?.id || req.user;
//             const currentUser = await User.findById(userId).select('name').lean();
//             const actorName = currentUser ? currentUser.name : "a Faculty Member";

//             const safeCourse = deletedSubject.course ? deletedSubject.course.toUpperCase() : "UNKNOWN COURSE";

//             await logActivity(
//                 userId,
//                 'DELETED_SUBJECT', 
//                 `Subject ${deletedSubject.subjectId.toUpperCase()} - ${deletedSubject.subjectName} (${safeCourse}, Year: ${deletedSubject.academicYear}, Sem: ${deletedSubject.semester}) was deleted by ${actorName}`, 
//                 []
//             );
//         } catch (logError) {
//             console.error("⚠️ Activity Logger Failed:", logError.message);
//         }
//         // ---------------------------------------------------------

//         // 3. Success response
//         return res.status(200).json({
//             success: true,
//             message: "Subject deleted successfully",
//             data: deletedSubject
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message
//         });
//     }
// }


// async function handleGetSubjectsByAcademicYear(req, res) {
//     try {
//         // Grab the academic year directly from the URL parameter
//         const { academicYear } = req.params;

//         // Search the database for everything matching that year
//         const subjects = await Subject.find({
//             academicYear: Number(academicYear)
//         });

//         // If nothing is found
//         if (subjects.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No subjects found for academic year ${academicYear}.`
//             });
//         }

//         // Return the full list of subjects for that year
//         res.status(200).json({
//             success: true,
//             count: subjects.length,
//             data: subjects
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server Error while fetching subjects by year",
//             error: error.message
//         });
//     }
// }


// async function handleGetSubjectsByYearAndCourse(req, res) {
//     try {
//         // Grab BOTH parameters directly from the URL
//         const { academicYear, course } = req.params;

//         // Search the database requiring both fields to match exactly
//         const subjects = await Subject.find({
//             academicYear: Number(academicYear),
//             // We use toUpperCase() and trim() to make sure "mca", "MCA ", and " MCA" all work
//             course: course.toUpperCase().trim()
//         });

//         // If nothing matches that specific combination
//         if (subjects.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No subjects found for course ${course.toUpperCase()} in academic year ${academicYear}.`
//             });
//         }

//         // Return the filtered list of subjects
//         res.status(200).json({
//             success: true,
//             count: subjects.length,
//             data: subjects
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server Error while fetching subjects by year and course",
//             error: error.message
//         });
//     }
// }





// const handleGetSubjectsBySemester = async (req, res) => {
//     try {
//         const { course, academicYear, semester } = req.query;

//         const query = {};

//         if (course) {
//             query.course = course.trim().toUpperCase();
//         }

//         if (academicYear) {
//             const year = Number(academicYear);

//             if (isNaN(year)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "academicYear must be a number"
//                 });
//             }

//             query.academicYear = year;
//         }

//         if (semester) {
//             const sem = Number(semester);

//             if (isNaN(sem)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "semester must be a number"
//                 });
//             }

//             query.semester = sem;
//         }

//         console.log("Received Query:", req.query);
//         console.log("Mongo Query:", query);

//         const subjects = await Subject.find(query);

//         return res.status(200).json({
//             success: true,
//             count: subjects.length,
//             data: subjects
//         });

//     } catch (error) {
//         console.error("Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };


// module.exports = {
//     handleGenerateNewSubject,   //activity Added
//     handleUpdateSubject,         //activity Added
//     handleGetAllSubject,
//     handleGetSubjectBySubjectId,
//     handleDeleteSubject,          //activity Added
//     handleGetSubjectsByAcademicYear,
//     handleGetSubjectsByYearAndCourse,
//     handleGetSubjectsBySemester,
// };
