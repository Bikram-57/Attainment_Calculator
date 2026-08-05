const Rubric = require('../models/rubrics');
const Subject = require('../models/subject'); 

// Note: 'admissionYear' is the year selected on the frontend (e.g., "2025")
async function getActiveRubric(subjectId, admissionYear) {
    try {
        // 1. Transparent Semester Lookup
        const subjectInfo = await Subject.findOne({ subjectId: subjectId.toUpperCase() }).lean();
        
        if (!subjectInfo || !subjectInfo.semester) {
            throw new Error(`Could not determine the semester for subject ${subjectId}.`);
        }

        const semesterNum = parseInt(subjectInfo.semester, 10);

        // 2. Determine ODD or EVEN
        const semesterType = (semesterNum % 2 === 0) ? 'EVEN' : 'ODD';

        // 3. 🌟 THE TIME-TRAVEL MATH 🌟
        let examAcademicYear = admissionYear;
        
        // If the frontend sends a flat batch year like "2025"
        if (admissionYear && !String(admissionYear).includes('-')) {
            const startYear = parseInt(admissionYear, 10);
            
            // Calculate how many years into the future the exam took place
            // Sem 1/2 = 0 | Sem 3/4 = 1 | Sem 5/6 = 2
            const yearOffset = Math.ceil(semesterNum / 2) - 1;
            
            // Apply the offset to find the real academic year
            const rubricStartYear = startYear + yearOffset;
            examAcademicYear = `${rubricStartYear}-${rubricStartYear + 1}`;
        }

        // 4. Query the database using the calculated future year and semester type
        const rubric = await Rubric.findOne({
            academicYear: examAcademicYear,
            semesterType: semesterType
        }).lean();
        
        // We return both the rubric and the formatted year so your controller 
        // can use the formatted year in its success/error messages!
        return { 
            rubric: rubric, 
            formattedYear: examAcademicYear 
        }; 
        
    } catch (error) {
        console.error("Error fetching dynamic rubric:", error);
        throw error; 
    }
}

module.exports = { getActiveRubric };







//old

// const Rubric = require('../models/rubrics');

// async function getActiveRubric(course, academicYear) {
//     try {
//         const rubric = await Rubric.findOne({
//             course: course.toUpperCase(),
//             year: { $lte: parseInt(academicYear) }
//         }).sort({ year: -1 });
        
//         return rubric;
//     } catch (error) {
//         console.error("Error fetching dynamic rubric:", error);
//         throw new Error("Database error while fetching rubric.");
//     }
// }

// // THIS LINE IS CRITICAL:
// module.exports = { getActiveRubric };