const Subject = require('../models/subject');






async function handleGenerateNewSubject(req, res) {
    try {
        // 1. Added 'semester' to the destructured body
        const { subjectId, subjectName, course, academicYear, semester } = req.body;
        
        // Optional but recommended: Check if required fields exist before hitting the database
        if (!subjectId || !subjectName || !course || !academicYear || !semester) {
             return res.status(400).json({
                 success: false,
                 message: "Please provide subjectId, subjectName, course, academicYear, and semester."
             });
        }

        // Status is automatically set to 'Pending' by the schema default
        const newSubject = await Subject.create({
            subjectId,
            subjectName,
            course,
            academicYear,
            semester // 2. Added 'semester' to the creation payload
        });

        res.status(201).json({
            success: true,
            data: newSubject
        });

    } catch (error) {
        // This catches the '11000' error so the NODE SERVER DOES NOT CRASH
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                // 3. UPDATED: Error message now mentions both academic year and semester
                message: `The Subject ID '${req.body.subjectId}' already exists for semester ${req.body.semester} in the academic year ${req.body.academicYear}.`
            });
        }

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
}










// @desc    Create a new subject
// @route   POST /api/subjects
// async function handleGenerateNewSubject(req, res) {
//     try {
//         const { subjectId, subjectName, course, academicYear } = req.body;
        
//         // Status is automatically set to 'Pending' by the schema default
//         const newSubject = await Subject.create({
//             subjectId,
//             subjectName,
//             course,
//             academicYear
//         });

//         res.status(201).json({
//             success: true,
//             data: newSubject
//         });

//     } catch (error) {
//         // This catches the '11000' error so the NODE SERVER DOES NOT CRASH
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 // UPDATED: Error message now mentions the specific academic year
//                 message: `The Subject ID '${req.body.subjectId}' already exists for the academic year ${req.body.academicYear}.`
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message
//         });
//     }
// }
















async function handleUpdateSubject(req, res) {
    try {
        const { id } = req.params; // Get subjectId from URL
        
        // 1. Extract the coordinates needed to FIND the document
        // 2. The rest operator (...) gathers all other incoming data into the 'updateFields' object
        const { academicYear, semester, ...updateFields } = req.body; 

        // Guard clause: Ensure we have the exact coordinates to find the subject
        if (!academicYear || !semester) {
            return res.status(400).json({ 
                success: false, 
                message: "Both academicYear and semester are required to identify and update a subject." 
            });
        }

        // STRICT SECURITY: Actively reject the request if they attempt to modify the subject code
        if (updateFields.subjectId) {
            return res.status(400).json({
                success: false,
                message: "Security Error: Modifying the Subject ID is strictly prohibited."
            });
        }

        // Find by subjectId AND academicYear AND semester
        const updatedSubject = await Subject.findOneAndUpdate(
            { 
                subjectId: id.toUpperCase(),
                academicYear: academicYear,
                semester: semester 
            }, 
            { $set: updateFields }, // Dynamically applies any new fields passed in the body            
            {
                new: true,           
                runValidators: true  
            }
        );

        if (!updatedSubject) {
            return res.status(404).json({
                success: false,
                message: `Subject with code ${id} for semester ${semester}, year ${academicYear} not found.`
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: updatedSubject
        });

    } catch (error) {
        // Catch duplicate key errors if a user tries to change the academicYear/semester 
        // to a combination where this subject already exists
        if (error.code === 11000) {
            return res.status(409).json({ 
                success: false,
                message: "Cannot update: This subject already exists in the target academic year and semester." 
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}








// @desc    Update a subject
// @route   PUT/PATCH /api/subjects/:id
// async function handleUpdateSubject(req, res) {
//     try {
//         const { id } = req.params; // Get subjectId from URL
//         const { subjectName, course, academicYear } = req.body; // UPDATED: Require academicYear

//         // UPDATED: Guard clause to ensure academicYear is provided
//         if (!academicYear) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "academicYear is required to update a subject." 
//             });
//         }

//         // Find by subjectId AND academicYear to update name/course
//         const updatedSubject = await Subject.findOneAndUpdate(
//             { 
//                 subjectId: id.toUpperCase(),
//                 academicYear: academicYear // UPDATED: Added to search criteria
//             }, 
//             { subjectName, course },            
//             {
//                 new: true,           
//                 runValidators: true  
//             }
//         );

//         if (!updatedSubject) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject with code ${id} for year ${academicYear} not found.`
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Subject updated successfully",
//             data: updatedSubject
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// }


// @desc    Get all subjects
// @route   GET /api/subjects
// async function handleGetAllSubject(req, res) {
//     try {
//         const subjects = await Subject.find();
//         res.status(200).json({
//             success: true,
//             count: subjects.length,
//             data: subjects
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }





async function handleGetAllSubject(req, res) {
    try {
        // Extract optional query parameters from the request URL
        const { academicYear, semester, course, status } = req.query;

        // Build a dynamic filter object based on what the frontend requested
        const filter = {};
        
        if (academicYear) filter.academicYear = Number(academicYear);
        if (semester) filter.semester = Number(semester);
        if (course) filter.course = course.toUpperCase(); 
        if (status) filter.status = status; // Handy if you want to filter by 'Pending' vs 'Uploaded'

        // Find subjects using the filter and sort them cleanly
        // Sorts by newest academic year first, then semester ascending, then alphabetical by name
        const subjects = await Subject.find(filter)
            .sort({ academicYear: -1, semester: 1, subjectName: 1 });

        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch subjects",
            error: error.message 
        });
    }
}




// @desc    Get a single subject by Subject Code and Year
// @route   GET /api/subjects/:id?year=YYYY
async function handleGetSubjectBySubjectId(req, res) {
    try {
        const { id } = req.params;
        const { year } = req.query; // UPDATED: Grab year from query parameters

        // UPDATED: Guard clause
        if (!year) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide an academic year query parameter (e.g., ?year=2026)" 
            });
        }

        // We use .findOne because subjectId + academicYear is unique
        const subject = await Subject.findOne({
            subjectId: id.toUpperCase(),
            academicYear: Number(year) // UPDATED: Added to search criteria
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: `Subject not found for code ${id} in year ${year}`
            });
        }

        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id?year=YYYY
async function handleDeleteSubject(req, res) {
    try {
        const { id } = req.params;
        const { year } = req.query; // UPDATED: Grab year from query parameters

        // UPDATED: Guard clause
        if (!year) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide an academic year query parameter to delete." 
            });
        }

        // Find by subjectId AND academicYear, then delete
        const deletedSubject = await Subject.findOneAndDelete({ 
            subjectId: id.toUpperCase(),
            academicYear: Number(year) // UPDATED: Added to search criteria
        });

        // If the subject doesn't exist
        if (!deletedSubject) {
            return res.status(404).json({
                success: false,
                message: `Subject with ID ${id} for year ${year} not found.`
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject deleted successfully",
            data: deletedSubject 
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
}

module.exports = {
    handleGenerateNewSubject,
    handleUpdateSubject,
    handleGetAllSubject,
    handleGetSubjectBySubjectId,
    handleDeleteSubject
};
