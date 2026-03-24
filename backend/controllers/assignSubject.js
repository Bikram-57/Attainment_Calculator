const assignSubject = require('../models/assignSubject')

async function handleAssignSubject(req, res) {

//     try {
//         const{subjectId, facultyId, year} = req.body;
//         const assignSub = await assignSubject.create({
//             subjectId,
//             facultyId,
//             year
//         });

//         res.status(201).json({
//             success: true,
//             message: "Assign subject to a faculty successfully",
//             data: {
//                 subjectId: assignSub.subjectId,
//                 facultyId: assignSub.facultyId,
//                 year: assignSub.year
//             }
//         })

//     } catch (error) {
//         if(error.code === 11000){
//             return res.status(400).json({
//                 sucess: false,
//                 message: "Duplicate IDs detected it is may be subjectId or facultyId"
//             })
//         }

//         return res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error.message
//         });      
//     }
// };

try {
        const { subjectId, facultyId, year } = req.body;

        // Find the faculty. If they exist, add the subject to the array.
        // If they don't exist, create a new document.
        const assignSub = await assignSubject.findOneAndUpdate(
            { facultyId: facultyId }, // Search condition
            { 
                $addToSet: { subjectIds: subjectId }, // Only adds subjectId if it isn't already in the array
                $set: { year: year } // Updates or sets the year
            },
            { 
                new: true, // Returns the updated document
                upsert: true, // Creates the document if it doesn't exist
                runValidators: true // Enforces model validation
            }
        );

        res.status(200).json({
            success: true,
            message: "Subject assigned to faculty successfully",
            data: {
                facultyId: assignSub.facultyId,
                subjectIds: assignSub.subjectIds,
                year: assignSub.year
            }
        });

    } catch (error) {
        // Handle potential errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate data detected."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });      
    }
}


async function getAssignedSubjectsByFaculty(req, res) {
    try {
        // Extract the facultyId from the URL parameters
        const { facultyId } = req.params; 

        // Find the single document associated with this faculty member
        const assignment = await assignSubject.findOne({ facultyId: facultyId });

        // If the database finds nothing, return a 404 (Not Found)
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: `No assigned subjects found for faculty ID: ${facultyId}`
            });
        }

        // If found, return the data
        res.status(200).json({
            success: true,
            data: {
                facultyId: assignment.facultyId,
                subjectIds: assignment.subjectIds,
                year: assignment.year
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching the faculty's subjects",
            error: error.message
        });
    }
}



module.exports = {
    handleAssignSubject,
    getAssignedSubjectsByFaculty,

}