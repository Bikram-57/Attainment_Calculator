const Rubric = require('../models/rubrics');

// const uploadRubric = async (req, res) => {
async function handleUploadrubrics (req, res){
  try {
    const { course, year, thresholds } = req.body;

    // 1. Basic sanity check before hitting the database
    if (!course || !year || !thresholds || !Array.isArray(thresholds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course, year, and thresholds array are required.' 
      });
    }

    // 2. Look for an existing rubric for this exact course and year
    let rubric = await Rubric.findOne({ course, year });

    if (rubric) {
      // If it exists, overwrite the old ranges with the new form data
      rubric.thresholds = thresholds;
    } else {
      // If it doesn't exist, create a brand new one
      rubric = new Rubric({ course, year, thresholds });
    }

    // 3. Save the document
    // This triggers all the schema validators: mandatory levels, min < max, and overlap prevention.
    await rubric.save();

    return res.status(200).json({
      success: true,
      message: 'Rubric ranges saved successfully!',
      data: rubric
    });

  } catch (error) {
    // 4. Handle Mongoose Validation Errors gracefully
    if (error.name === 'ValidationError') {
      // Extract the specific error messages we wrote in the schema
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation Error', 
        errors: messages 
      });
    }

    // Handle generic server errors
    console.error('Error in uploadRubric:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error while saving rubric.' 
    });
  }
};


async function handleGetRubrics(req, res) {
  try {
    // For a GET request, we take parameters from the URL query string
    // const { course, year } = req.query;
    const { course, year } = req.body;
    console.log(req.query);
    

    // 1. Basic validation
    if (!course || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both course and year to search.'
      });
    }

    // 2. The Smart Search with Fallback Logic
    // This looks for a rubric for the requested year OR the most recent previous year
    const rubric = await Rubric.findOne({ 
      course: course.toUpperCase(), // Ensure uppercase matching (BCA or MCA)
      year: { $lte: parseInt(year) } // Less than or equal to the requested year
    }).sort({ year: -1 }); // Sort descending so we grab the closest year first

    // 3. Handle if absolutely no rubric exists
    if (!rubric) {
      return res.status(404).json({
        success: false,
        message: `No rubric found for ${course.toUpperCase()} in or before the year ${year}.`
      });
    }

    // 4. Return the found rubric
    return res.status(200).json({
      success: true,
      message: `Rubric found (Active Year: ${rubric.year})`,
      data: rubric
    });

  } catch (error) {
    console.error('Error fetching rubric:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error while searching for rubric.'
    });
  }
};



// const updateRubricByCourseYear = async (req, res) => {
async function handleUpdateRubrics (req, res){
  try {
    // Grab everything from the request body
    const { course, year, thresholds } = req.body;

    // 1. Basic validation
    if (!course || !year || !thresholds || !Array.isArray(thresholds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course, year, and the new thresholds array are required to update.' 
      });
    }

    // 2. Search for the exact rubric using course and year
    const rubric = await Rubric.findOne({ 
        course: course.toUpperCase(), // Ensure uppercase matching
        year: parseInt(year) 
    });

    // 3. If it doesn't exist, reject the request (Strict Update)
    if (!rubric) {
      return res.status(404).json({
        success: false,
        message: `No existing rubric found for ${course.toUpperCase()} in ${year}. Cannot update.`
      });
    }

    // 4. Update the ranges
    rubric.thresholds = thresholds;

    // 5. Save the document (Triggers anti-overlap and level validators)
    await rubric.save();

    return res.status(200).json({
      success: true,
      message: `Rubric for ${rubric.course} (${rubric.year}) updated successfully!`,
      data: rubric
    });

  } catch (error) {
    // Handle Mongoose Schema Validation Errors (overlaps, missing levels)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation Error', 
        errors: messages 
      });
    }

    console.error('Error updating rubric by course/year:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error while updating rubric.' 
    });
  }
};



// const getAllRubrics = async (req, res) => {
async function handleFindAllRubrics (req, res){
  try {
    // Fetch all rubrics from the database
    // Sorting: course: 1 (A-Z), year: -1 (Newest to oldest)
    const rubrics = await Rubric.find().sort({ course: 1, year: -1 });

    // Check if the database is completely empty
    if (!rubrics || rubrics.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No rubrics found in the database.'
      });
    }

    return res.status(200).json({
      success: true,
      count: rubrics.length, // Helpful metric for your frontend
      data: rubrics
    });

  } catch (error) {
    console.error('Error fetching all rubrics:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error while fetching rubrics.'
    });
  }
};


module.exports = { 
    handleUploadrubrics,
    handleGetRubrics,
    handleUpdateRubrics,
    handleFindAllRubrics,
 };