const Rubric = require('../models/rubrics');
const Subject = require('../models/subject'); 

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

        // 3. THE PROGRESSION MATH 
        const cleanYearStr = String(admissionYear).trim();
        const startYear = parseInt(cleanYearStr.split('-')[0], 10);
        
        const yearOffset = Math.ceil(semesterNum / 2) - 1;
        const calculatedStartYear = startYear + yearOffset;
        
        // This generates exactly "2026-2027" for a 2025 batch in Sem 3/4
        const examAcademicYear = `${calculatedStartYear}-${calculatedStartYear + 1}`;

        // 4. Query the database 
        // CRITICAL FIX: Removed the 'batch' requirement so it perfectly matches your JSON!
        const rubric = await Rubric.findOne({
            academicYear: examAcademicYear,
            semesterType: semesterType
        }).lean();
        
        return { 
            rubric: rubric, 
            formattedYear: examAcademicYear ,
            semesterType: semesterType
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