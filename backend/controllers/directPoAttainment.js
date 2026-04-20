const CopoMapping = require('../models/coPoMapping');
const CoAttainment = require('../models/finalAttainment');
// const PoAttainment = require('../models/calculatedPo');

async function handleGenerateDirectPoAttainment(req, res) {
  try {
    // 1. Extract query parameters
    const { course, academicYear, subjectId } = req.query;

    // 2. Basic validation
    if (!course || !academicYear || !subjectId) {
      return res.status(400).json({ 
        message: 'Please provide course, academicYear, and subjectId to search for the mapping.' 
      });
    }

    // 3. Clean the inputs (Fixes invisible trailing spaces)
    const cleanCourse = course.trim();
    const cleanYear = academicYear.trim(); 
    const cleanSubjectId = subjectId.trim();

    // 4. Retrieve the raw document from the DB
    // I removed .select() so we fetch exactly what is in the database, ignoring schema restrictions for a moment
    const mappingData = await CopoMapping.findOne({ 
      course: cleanCourse,
      academicYear: cleanYear, 
      subjectId: cleanSubjectId 
    }).lean(); 

    // 5. Check if the document exists at all
    if (!mappingData) {
      return res.status(404).json({ 
        message: `No mapping document found for Course: ${cleanCourse}, Year: ${cleanYear}, SubjectID: ${cleanSubjectId}.` 
      });
    }

    // 6. "Smart" Field Extraction
    // This checks for your intended name, and the most common typo variations
    const mappingBlueprint = mappingData.coPoMapping || mappingData.copoMapping || mappingData.mapping;

    // 7. Final Error Catch (with debugging info sent right to Postman)
    if (!mappingBlueprint) {
      // If we still can't find the data, we grab the actual keys the database returned
      const actualDatabaseKeys = Object.keys(mappingData);
      
      console.log("FAILED: Document found, but mapping field missing. Actual keys are:", actualDatabaseKeys);
      
      return res.status(404).json({ 
        message: 'Document found, but the mapping array is missing or empty.',
        hint: 'Check your database collection. Here are the exact fields that currently exist in this document:',
        actualFieldsInDatabase: actualDatabaseKeys 
      });
    }

    // 8. Success Response
    return res.status(200).json({
      message: 'Mapping retrieved successfully',
      mapping: mappingBlueprint
    });

  } catch (error) {
    console.error('Error retrieving mapping:', error);
    return res.status(500).json({ message: 'Internal server error during mapping retrieval.' });
  }
}

module.exports = {
  handleGenerateDirectPoAttainment
};