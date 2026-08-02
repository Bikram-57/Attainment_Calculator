const Rubric = require('../models/rubrics');

async function getActiveRubric(course, academicYear) {
    try {
        const rubric = await Rubric.findOne({
            course: course.toUpperCase(),
            year: { $lte: parseInt(academicYear) }
        }).sort({ year: -1 });
        
        return rubric;
    } catch (error) {
        console.error("Error fetching dynamic rubric:", error);
        throw new Error("Database error while fetching rubric.");
    }
}

// THIS LINE IS CRITICAL:
module.exports = { getActiveRubric };