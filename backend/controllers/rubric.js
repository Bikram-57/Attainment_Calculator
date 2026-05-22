const Rubric = require('../models/rubric');

// @desc    Upload or update a rubric
// @route   POST /api/rubrics

// exports.uploadRubric = async (req, res, next) => {
async function handleUploadRubrics (req, res, next) {
    try {
        const { course, academicYear, criteria } = req.body;

        if (!course || !academicYear || !criteria) {
            return res.status(400).json({ message: 'Course, academic year, and criteria are required.' });
        }

        // Upsert: Update if it exists, otherwise create new
        const rubric = await Rubric.findOneAndUpdate(
            { course: course.toUpperCase(), academicYear },
            { criteria },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Rubric saved successfully',
            data: rubric
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get rubric by course and year
// @route   GET /api/rubrics/:course/:year

async function handleGetRubrics (req, res, next) {
    try {
        const { course, year } = req.params;

        const rubric = await Rubric.findOne({ 
            course: course.toUpperCase(), 
            academicYear: year 
        });

        if (!rubric) {
            return res.status(404).json({ message: 'No rubric found for this course and year.' });
        }

        res.status(200).json({
            success: true,
            data: rubric
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleUploadRubrics,
    handleGetRubrics
}