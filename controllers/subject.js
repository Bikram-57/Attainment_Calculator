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


module.exports = { 
  handleGenerateNewSubject, 
}