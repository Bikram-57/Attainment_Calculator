const Subject = require('../models/subject');

// @desc    Create a new subject
// @route   POST /api/subjects
async function handleGenerateNewSubject(req, res) {
    try {
        const { subjectId, subjectName, course, academicYear } = req.body;
        
        // Status is automatically set to 'Pending' by the schema default
        const newSubject = await Subject.create({
            subjectId,
            subjectName,
            course,
            academicYear
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
                // UPDATED: Error message now mentions the specific academic year
                message: `The Subject ID '${req.body.subjectId}' already exists for the academic year ${req.body.academicYear}.`
            });
        }

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
}

// @desc    Update a subject
// @route   PUT/PATCH /api/subjects/:id
async function handleUpdateSubject(req, res) {
    try {
        const { id } = req.params; // Get subjectId from URL
        const { subjectName, course, academicYear } = req.body; // UPDATED: Require academicYear

        // UPDATED: Guard clause to ensure academicYear is provided
        if (!academicYear) {
            return res.status(400).json({ 
                success: false, 
                message: "academicYear is required to update a subject." 
            });
        }

        // Find by subjectId AND academicYear to update name/course
        const updatedSubject = await Subject.findOneAndUpdate(
            { 
                subjectId: id.toUpperCase(),
                academicYear: academicYear // UPDATED: Added to search criteria
            }, 
            { subjectName, course },            
            {
                new: true,           
                runValidators: true  
            }
        );

        if (!updatedSubject) {
            return res.status(404).json({
                success: false,
                message: `Subject with code ${id} for year ${academicYear} not found.`
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: updatedSubject
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


// @desc    Get all subjects
// @route   GET /api/subjects
async function handleGetAllSubject(req, res) {
    try {
        const subjects = await Subject.find();
        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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


















// const Subject = require('../models/subject');

// async function handleGenerateNewSubject(req, res) {

//     try {
//         const { subjectId, subjectName, course, academicYear } = req.body;
//         // console.log(req.body);
        

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
//                 message: `The Subject ID '${req.body.subjectId}' is already in the database.`
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message
//         });
//     }
// };

// async function handleUpdateSubject(req, res) {

//     try {
//         const { id } = req.params; // Get code from URL
//         const { subjectName, course} = req.body;

//         // Find by subjectCode and update name/course
//         const updatedSubject = await Subject.findOneAndUpdate(
//             { subjectId: id.toUpperCase() }, // Search criteria
//             { subjectName, course },            // Data to update
//             {
//                 new: true,           // Return the updated document
//                 runValidators: true  // Ensure schema rules are followed
//             }
//         );

//         if (!updatedSubject) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject with code ${id} not found.`
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
// };


// // @desc    Get all subjects
// // @route   GET /api/subjects
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
// };

// // @desc    Get a single subject by Subject Code
// // @route   GET /api/subjects/:code
// async function handleGetSubjectBySubjectId(req, res) {

//     try {
//         // We use .findOne because subjectCode is unique
//         const subject = await Subject.findOne({
//             subjectId: req.params.id.toUpperCase()
//         });

//         if (!subject) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Subject not found"
//             });
//         }

//         res.status(200).json({ success: true, data: subject });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // @desc    Delete a subject
// // @route   DELETE /api/subjects/:id


// async function handleDeleteSubject(req, res) {

//     try {
//         const { id } = req.params;

//         // Find by subjectId and delete
//         const deletedSubject = await Subject.findOneAndDelete({ 
//             subjectId: id.toUpperCase() 
//         });

//         // If the subject doesn't exist
//         if (!deletedSubject) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject with ID ${id} not found.`
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Subject deleted successfully",
//             data: deletedSubject // Returns the deleted data one last time
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message
//         });
//     }
// };

// module.exports = {
//     handleGenerateNewSubject,
//     handleUpdateSubject,
//     handleGetAllSubject,
//     handleGetSubjectBySubjectId,
//     handleDeleteSubject
// }