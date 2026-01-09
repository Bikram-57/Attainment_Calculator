const Subject = require('../models/subject')

async function handleGenerateNewSubject(req, res) {
    try {
        const { subjectId, subjectName, course } = req.body;
        console.log(req.body);
        
        await Subject.create({
           subjectId,
           subjectName,
           course
        })

        return res.status(201)
        .json({
            success: true,
            message: "Subject created successfully",
              data: {
                subjectId: subjectId,
                subjectName: subjectName,
                course: course
              }
        });
    }
     catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error saving data",
      error: error.message
    });
  }
};

async function handleGetSubjectBySubjectId(req, res) {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({ subjectId });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching subject",
      error: error.message
    });
  }
}


async function handleUpdateSubject(req, res) {
  try {
    const { subjectId } = req.params;
    const { subjectName, course } = req.body;

    const updatedSubject = await Subject.findOneAndUpdate(
      { subjectId },              
      { subjectName, course },     
      {
        new: true,                
        runValidators: true       
      }
    );

    if (!updatedSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: updatedSubject
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Subject ID already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update subject",
      error: error.message
    });
  }
}


async function handleDeleteSubject(req, res) {
  try {
    const { subjectId } = req.params;

    const deletedSubject = await Subject.findOneAndDelete({ subjectId });

    if (!deletedSubject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
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
      message: "Failed to delete subject",
      error: error.message
    });
  }
}


module.exports = { 
  handleGenerateNewSubject, 
  handleGetSubjectBySubjectId,
  handleUpdateSubject,
  handleDeleteSubject,
}