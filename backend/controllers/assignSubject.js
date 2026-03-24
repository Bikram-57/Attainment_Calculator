const assignSubject = require('../models/assignSubject');

// 1. Assign Subject (Creates a brand new document every time)
async function handleAssignSubject(req, res) {
   try {
        // Accept either a single subjectId (String) OR subjectIds (Array) from the request
        const { subjectId, subjectIds, facultyId, year } = req.body;

        // Normalize the input into an array so we can handle both cases seamlessly
        let subjectsToAdd = [];
        if (subjectIds && Array.isArray(subjectIds)) {
            subjectsToAdd = subjectIds;
        } else if (subjectId) {
            subjectsToAdd = [subjectId];
        }

        // Validation check
        if (subjectsToAdd.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a subjectId or an array of subjectIds."
            });
        }

        // Core Logic: Match Faculty -> Add to Array -> Prevent Duplicates
        const assignSub = await assignSubject.findOneAndUpdate(
            { facultyId: facultyId }, // 1. Match the faculty ID
            { 
                // 2. $addToSet + $each adds the items but IGNORES exact duplicates
                $addToSet: { subjectIds: { $each: subjectsToAdd } },
                $set: { year: year } // Update or set the year
            },
            { 
                new: true, // Return the updated document in the response
                upsert: true, // If the facultyId doesn't exist at all, create a new document
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Subject(s) assigned successfully without duplicates!",
            data: {
                facultyId: assignSub.facultyId,
                subjectIds: assignSub.subjectIds,
                year: assignSub.year
            }
        });

    } catch (error) {
        // Catch leftover index errors just in case
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Database index error. Make sure you dropped old unique indexes in MongoDB."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });      
    }
}

// 2. Get ALL Assignments in the database
async function getAllFacultyAssignments(req, res) {
    try {
        const allAssignments = await assignSubject.find({});

        res.status(200).json({
            success: true,
            count: allAssignments.length,
            data: allAssignments
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching assignments",
            error: error.message
        });
    }
}

// 3. Get ALL Subjects for a Specific Faculty Member
async function getAssignedSubjectsByFaculty(req, res) {
    try {
        const { facultyId } = req.params; 

        // Use .find() because this faculty will have multiple documents
        const assignments = await assignSubject.find({ facultyId: facultyId });

        if (!assignments || assignments.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No assigned subjects found for faculty ID: ${facultyId}`
            });
        }

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching the faculty's subjects",
            error: error.message
        });
    }
}

// 4. Delete a Specific Assignment Document
async function removeSubjectFromFaculty(req, res) {
   try {
        // Assuming you are still passing these in the Postman body as discussed
        const { facultyId, subjectId } = req.body;

        // Validation check
        if (!facultyId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: "Please provide both facultyId and subjectId."
            });
        }

        // 1. Find the faculty by ID
        // 2. Use $pull to yank the specific subjectId out of the subjectIds array
        const updatedAssignment = await assignSubject.findOneAndUpdate(
            { facultyId: facultyId },
            { $pull: { subjectIds: subjectId } }, 
            { new: true } // Return the freshly updated document
        );

        // If the faculty doesn't exist at all
        if (!updatedAssignment) {
            return res.status(404).json({
                success: false,
                message: `Could not find faculty with ID: ${facultyId}`
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject removed from faculty successfully",
            data: updatedAssignment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while deleting assignment",
            error: error.message
        });
    }
}

module.exports = {
    handleAssignSubject,
    getAllFacultyAssignments,
    getAssignedSubjectsByFaculty,
    removeSubjectFromFaculty
};