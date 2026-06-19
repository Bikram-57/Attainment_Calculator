const Subject = require('../models/subject');





//done
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



//done
async function handleUpdateSubject(req, res) {
    try {
        const { id } = req.params; // Get subjectId (subject code) from URL
        
        // Extract the possible fields from the request body
        const { subjectName, course, academicYear, semester } = req.body; 

        // 1. Build an object dynamically with ONLY the fields provided
        const updateFields = {};
        if (subjectName) updateFields.subjectName = subjectName;
        if (course) updateFields.course = course;
        if (academicYear) updateFields.academicYear = academicYear;
        if (semester) updateFields.semester = semester;

        // 2. Guard clause: Ensure they sent at least ONE thing to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide at least one field to update (subjectName, course, academicYear, or semester)." 
            });
        }

        // 3. Search ONLY by the subject code, and use $set to update only the provided fields
        const updatedSubject = await Subject.findOneAndUpdate(
            { 
                subjectId: id.toUpperCase() // Search by subjectcode
            }, 
            { 
                $set: updateFields // Only updates what is inside this object
            },            
            {
                new: true,           
                runValidators: true  
            }
        );

        if (!updatedSubject) {
            return res.status(404).json({
                success: false,
                message: `Subject with code ${id} not found.`
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: updatedSubject
        });

    } catch (error) {
        // Catch duplicate key errors if the new academicYear/semester 
        // conflicts with an existing record for this subject ID
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


//@desc    Get all subjects
//@route   GET /api/subjects
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


//done
async function handleGetAllSubject(req, res) {
    try {
        // Create an empty filter. If it stays empty, it gets ALL subjects.
        const filter = {};
        
        // If your frontend asks for a specific semester (e.g., ?semester=3), it adds it to the filter.
        if (req.query.semester) {
            filter.semester = req.query.semester;
        }

        // Find all subjects (or all subjects for the requested semester)
        const subjects = await Subject.find(filter);
        
        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}




// async function handleGetAllSubject(req, res) {
//     try {
//         // Extract optional query parameters from the request URL
//         const { academicYear, semester, course, status } = req.query;

//         // Build a dynamic filter object based on what the frontend requested
//         const filter = {};
        
//         if (academicYear) filter.academicYear = Number(academicYear);
//         if (semester) filter.semester = Number(semester);
//         if (course) filter.course = course.toUpperCase(); 
//         if (status) filter.status = status; // Handy if you want to filter by 'Pending' vs 'Uploaded'

//         // Find subjects using the filter and sort them cleanly
//         // Sorts by newest academic year first, then semester ascending, then alphabetical by name
//         const subjects = await Subject.find(filter)
//             .sort({ academicYear: -1, semester: 1, subjectName: 1 });

//         res.status(200).json({
//             success: true,
//             count: subjects.length,
//             data: subjects
//         });
        
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             message: "Failed to fetch subjects",
//             error: error.message 
//         });
//     }
// }




// @desc    Get a single subject by Subject Code and Year
// @route   GET /api/subjects/:id?year=YYYY
// async function handleGetSubjectBySubjectId(req, res) {
//     try {
//         const { id } = req.params;
//         const { year } = req.query; // UPDATED: Grab year from query parameters

//         // UPDATED: Guard clause
//         if (!year) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Please provide an academic year query parameter (e.g., ?year=2026)" 
//             });
//         }

//         // We use .findOne because subjectId + academicYear is unique
//         const subject = await Subject.findOne({
//             subjectId: id.toUpperCase(),
//             academicYear: Number(year) // UPDATED: Added to search criteria
//         });

//         if (!subject) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject not found for code ${id} in year ${year}`
//             });
//         }

//         res.status(200).json({ success: true, data: subject });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }


//done
async function handleGetSubjectBySubjectId(req, res) {
    try {
        const { id } = req.params; // Get subject code from the URL

        // Search ONLY by the subject code
        const subject = await Subject.findOne({
            subjectId: id.toUpperCase()
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: `Subject not found for code ${id}`
            });
        }

        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id?year=YYYY
// async function handleDeleteSubject(req, res) {
//     try {
//         const { id } = req.params;
//         const { year } = req.query; // UPDATED: Grab year from query parameters

//         // UPDATED: Guard clause
//         if (!year) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Please provide an academic year query parameter to delete." 
//             });
//         }

//         // Find by subjectId AND academicYear, then delete
//         const deletedSubject = await Subject.findOneAndDelete({ 
//             subjectId: id.toUpperCase(),
//             academicYear: Number(year) // UPDATED: Added to search criteria
//         });

//         // If the subject doesn't exist
//         if (!deletedSubject) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Subject with ID ${id} for year ${year} not found.`
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Subject deleted successfully",
//             data: deletedSubject 
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message
//         });
//     }
// }


async function handleDeleteSubject(req, res) {
    try {
        const { id } = req.params;

        // Find ONLY by subjectId and delete
        const deletedSubject = await Subject.findOneAndDelete({ 
            subjectId: id.toUpperCase()
        });

        // If the subject doesn't exist
        if (!deletedSubject) {
            return res.status(404).json({
                success: false,
                message: `Subject with ID ${id} not found.`
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


async function handleGetSubjectsByAcademicYear(req, res) {
    try {
        // Grab the academic year directly from the URL parameter
        const { academicYear } = req.params; 

        // Search the database for everything matching that year
        const subjects = await Subject.find({ 
            academicYear: Number(academicYear) 
        });

        // If nothing is found
        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No subjects found for academic year ${academicYear}.`
            });
        }

        // Return the full list of subjects for that year
        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error while fetching subjects by year",
            error: error.message 
        });
    }
}


async function handleGetSubjectsByYearAndCourse(req, res) {
    try {
        // Grab BOTH parameters directly from the URL
        const { academicYear, course } = req.params; 

        // Search the database requiring both fields to match exactly
        const subjects = await Subject.find({ 
            academicYear: Number(academicYear),
            // We use toUpperCase() and trim() to make sure "mca", "MCA ", and " MCA" all work
            course: course.toUpperCase().trim()
        });

        // If nothing matches that specific combination
        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No subjects found for course ${course.toUpperCase()} in academic year ${academicYear}.`
            });
        }

        // Return the filtered list of subjects
        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error while fetching subjects by year and course",
            error: error.message 
        });
    }
}



// @desc    Get subjects filtered by semester, course, and academic year
// @route   GET /api/subjects
// @access  Public/Private (Depending on your auth setup)
// const getSubjectsBySemester = async (req, res) => {
//   try {
//     const { semester, course, academicYear } = req.query;

//     // Build a dynamic query object
//     const query = {};
    
//     if (semester) query.semester = semester;
//     if (course) query.course = course;
//     if (academicYear) query.academicYear = academicYear;

//     // Optional: You can add validation here to ensure at least one filter is provided
//     if (Object.keys(query).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide at least one filter parameter (semester, course, or academicYear)."
//       });
//     }

//     const subjects = await Subject.find(query)
//       .select('subjectName subjectCode semester course academicYear') // Select only the fields you need
//       .sort({ subjectName: 1 }); // Sort alphabetically by subject name

//     return res.status(200).json({
//       success: true,
//       count: subjects.length,
//       data: subjects
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server Error fetching subjects",
//       error: error.message
//     });
//   }
// };

// controllers/subject.controller.js

// const handleGetSubjectsBySemester = async (req, res) => {
//   try {
//     const { semester, course, academicYear } = req.query;

//     const query = {};
    
//     // Only build the query using the list filters
//     if (semester) query.semester = semester;
//     if (course) query.course = course;
//     if (academicYear) query.academicYear = academicYear;

//     // Ensure they pass at least one of the three filters
//     if (Object.keys(query).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide semester, course, or academicYear."
//       });
//     }

//     const subjects = await Subject.find(query)
//       .select('subjectName subjectCode semester course academicYear')
//       .sort({ subjectName: 1 });

//     return res.status(200).json({
//       success: true,
//       count: subjects.length,
//       data: subjects
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server Error fetching subjects",
//       error: error.message
//     });
//   }
// };






/**
 * @desc    Get a list of subjects filtered by course, academicYear, and/or semester
 * @route   GET /api/subjects/filter
 * @access  Private/Admin (Adjust based on your auth)
 */


const handleGetSubjectsBySemester = async (req, res) => {
  try {
    const { course, academicYear, semester } = req.query;

    const query = {};

    if (course) {
      query.course = course.trim().toUpperCase();
    }

    if (academicYear) {
      const year = Number(academicYear);

      if (isNaN(year)) {
        return res.status(400).json({
          success: false,
          message: "academicYear must be a number"
        });
      }

      query.academicYear = year;
    }

    if (semester) {
      const sem = Number(semester);

      if (isNaN(sem)) {
        return res.status(400).json({
          success: false,
          message: "semester must be a number"
        });
      }

      query.semester = sem;
    }

    console.log("Received Query:", req.query);
    console.log("Mongo Query:", query);

    const subjects = await Subject.find(query);

    return res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });

  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
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
