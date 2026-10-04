// const CoPsoMapping = require('../models/coPsoMapping');
const CoPsoMapping = require('../models/coPsomapping');

// @desc    Create or update a CO-PSO articulation matrix
// @route   POST /api/mappings/co-pso
// @access  Private (Assuming you have JWT auth middleware)
// exports.saveCoPsoMapping = async (req, res) => {
    const handleSaveCoPsoMapping =  async (req, res) => {
  try {
    const { courseId, batch, matrix } = req.body;

    // 1. Basic validation
    if (!courseId || !batch || !matrix) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId, batch, and the mapping matrix.'
      });
    }

    // 2. Upsert (Update if exists, Insert if new)
    // We search by courseId and batch because there should only be one matrix per course per batch.
    const updatedMapping = await CoPsoMapping.findOneAndUpdate(
      { courseId: courseId, batch: batch },
      { $set: { matrix: matrix } },
      { 
        new: true,          // Return the updated document
        upsert: true,       // Create a new one if it doesn't exist
        runValidators: true // Ensure the 1-3 scale validation runs on updates
      }
    );

    // 3. Send success response
    res.status(200).json({
      success: true,
      message: 'CO-PSO mapping saved successfully!',
      data: updatedMapping
    });

  } catch (error) {
    console.error('Error saving CO-PSO mapping:', error);
    
    // Handle Mongoose validation errors gracefully
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Ensure mapping values are between 1 and 3.',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: Could not save mapping',
      error: error.message
    });
  }
};


module.exports = {
    handleSaveCoPsoMapping
}