const xlsx = require('xlsx');
const fs = require('fs');
const AssignSubject = require('../models/assignSubject'); 
const User = require('../models/user');

const HandleUploadAssignSubjects = async (req, res) => {
  try {
    // 1. File Validation
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file.' });
    }

    // 2. Read Excel File (Optimized for Memory Buffer if available, fallback to Disk Path)
    let workbook;
    if (req.file.buffer) {
        workbook = xlsx.read(req.file.buffer, { type: 'buffer' }); // 🚀 Memory-fast read
    } else {
        workbook = xlsx.readFile(req.file.path); // Fallback for disk storage
    }

    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });

    if (rawData.length === 0) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); 
      return res.status(400).json({ success: false, message: 'The uploaded Excel file is empty.' });
    }

    // 3. Strict Header Validation
    const uploadedHeaders = rawData[0].map(h => String(h).trim());
    const requiredHeaders = ['facultyId', 'subjectId', 'subjectName', 'course', 'academicYear'];
    
    const isValidFormat = uploadedHeaders.length >= requiredHeaders.length && 
                          requiredHeaders.every((header, index) => uploadedHeaders[index] === header);

    if (!isValidFormat) {
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); 
      return res.status(400).json({ 
        success: false, 
        message: `Format validation failed. Must contain headers exactly as: ${requiredHeaders.join(', ')}` 
      });
    }

    // 4. Data Extraction & Normalization
    const normalizedData = [];
    const uniqueFacultyIds = new Set();

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0 || !String(row[0]).trim()) continue;

      const facultyId = String(row[0]).trim().toUpperCase();
      uniqueFacultyIds.add(facultyId);

      normalizedData.push({
        facultyId: facultyId,
        subjectId: String(row[1]).trim().toUpperCase(),
        subjectName: String(row[2]).trim(),
        course: String(row[3]).trim().toUpperCase(),
        academicYear: String(row[4]).trim()
      });
    }

    // 5. PARALLEL DATABASE FETCHING 🚀
    // Fetch both the assignment records and user records simultaneously to save time
    const facultyIdArray = Array.from(uniqueFacultyIds);
    const [existingDocs, existingUsers] = await Promise.all([
        AssignSubject.find({ facultyId: { $in: facultyIdArray } }),
        User.find({ facultyId: { $in: facultyIdArray } }).select('facultyId name').lean() // .lean() makes it extremely fast
    ]);

    // Build Fast Lookups (O(1) complexity)
    const facultyMap = new Map(existingDocs.map(doc => [doc.facultyId, doc]));
    const userNameMap = new Map(existingUsers.map(user => [user.facultyId, user.name]));

    let newSubjectsAdded = 0;
    let duplicatesSkipped = 0;

    // 6. Data Merging Logic
    for (const data of normalizedData) {
      let doc = facultyMap.get(data.facultyId);
      
      // Create new document structure if this faculty has no prior assignments
      if (!doc) {
        const actualFacultyName = userNameMap.get(data.facultyId) || 'Unknown Faculty';
        doc = new AssignSubject({ 
            facultyId: data.facultyId, 
            facultyName: actualFacultyName, 
            assignments: {} 
        });
        facultyMap.set(data.facultyId, doc);
      }

      // Initialize Nested Maps if missing
      if (!doc.assignments.has(data.academicYear)) doc.assignments.set(data.academicYear, new Map());
      const yearMap = doc.assignments.get(data.academicYear);

      if (!yearMap.has(data.course)) yearMap.set(data.course, []);
      const subjectsArray = yearMap.get(data.course);

      // Check for duplicates before pushing
      if (!subjectsArray.some(sub => sub.subjectId === data.subjectId)) {
        subjectsArray.push({ subjectId: data.subjectId, subjectName: data.subjectName });
        yearMap.set(data.course, subjectsArray);
        
        // CRITICAL FIX: Tell Mongoose the nested map was mutated, otherwise it won't save it!
        doc.markModified(`assignments.${data.academicYear}`);
        newSubjectsAdded++;
      } else {
        duplicatesSkipped++;
      }
    }

    // 7. PARALLEL DATABASE SAVING 🚀
    // Update counts and fire all save operations to MongoDB concurrently
    const savePromises = [];
    for (const doc of facultyMap.values()) {
      doc.totalYearsRecorded = doc.assignments.size;
      savePromises.push(doc.save());
    }
    
    await Promise.all(savePromises);

    // 8. Final Clean up (Only needed if disk storage is used)
    if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path); 
    }
    
    return res.status(201).json({
      success: true,
      message: 'Excel file processed successfully.',
      newSubjectsAdded,
      duplicatesSkipped,
      facultiesInvolved: facultyMap.size
    });

  } catch (error) {
    // Failsafe cleanup on crash
    if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    console.error('Error processing Excel upload:', error);
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { HandleUploadAssignSubjects };


// const xlsx = require('xlsx');
// const fs = require('fs');
// const AssignSubject = require('../models/assignSubject'); 
// const User = require('../models/user');



// const HandleUploadAssignSubjects = async (req, res) => {
//   try {
//     // 1. File Validation
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'Please upload an Excel file.' });
//     }

//     // 2. Read file from disk path
//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

//     if (rawData.length === 0) {
//       fs.unlinkSync(req.file.path); 
//       return res.status(400).json({ success: false, message: 'The uploaded Excel file is empty.' });
//     }

//     // 3. Strict Header Validation
//     const uploadedHeaders = rawData[0];
//     const requiredHeaders = ['facultyId', 'subjectId', 'subjectName', 'course', 'academicYear'];
    
//     const isValidFormat = uploadedHeaders.length >= requiredHeaders.length && 
//                           requiredHeaders.every((header, index) => uploadedHeaders[index] === header);

//     if (!isValidFormat) {
//       fs.unlinkSync(req.file.path); 
//       return res.status(400).json({ 
//         success: false, 
//         message: `Format validation failed. Must contain headers: ${requiredHeaders.join(', ')}` 
//       });
//     }

//     // 4. Data Processing
//     const normalizedData = [];
//     const uniqueFacultyIds = new Set();

//     for (let i = 1; i < rawData.length; i++) {
//       const row = rawData[i];
//       if (row.length === 0) continue;

//       const facultyId = String(row[0]).trim().toUpperCase();
//       uniqueFacultyIds.add(facultyId);

//       normalizedData.push({
//         facultyId: facultyId,
//         subjectId: String(row[1]).trim(),
//         subjectName: String(row[2]).trim(),
//         course: String(row[3]).trim(),
//         academicYear: String(row[4]).trim()
//       });
//     }

//     // 5. Database Logic
//     // Fetch existing AssignSubject documents
//     const existingDocs = await AssignSubject.find({ facultyId: { $in: Array.from(uniqueFacultyIds) } });
//     const facultyMap = new Map();
//     existingDocs.forEach(doc => facultyMap.set(doc.facultyId, doc));

//     // NEW: Fetch the actual User/Faculty documents to get their real names
//     const existingUsers = await User.find({ facultyId: { $in: Array.from(uniqueFacultyIds) } });
//     const userNameMap = new Map();
    
//     // Map the facultyId to their real name. 
//     // Change 'user.name' to 'user.fullName' or whatever your User schema uses.
//     existingUsers.forEach(user => userNameMap.set(user.facultyId, user.name)); 

//     let newSubjectsAdded = 0;
//     let duplicatesSkipped = 0;

//     for (const data of normalizedData) {
//       let doc = facultyMap.get(data.facultyId);
      
//       if (!doc) {
//         // Look up the real name from the map we just created
//         // If the user doesn't exist in the Users collection, fallback to 'Unknown Faculty'
//         const actualFacultyName = userNameMap.get(data.facultyId) || 'Unknown Faculty';

//         doc = new AssignSubject({ 
//             facultyId: data.facultyId, 
//             facultyName: actualFacultyName, // <-- Using the real name here!
//             assignments: {} 
//         });
//         facultyMap.set(data.facultyId, doc);
//       }

//       if (!doc.assignments.has(data.academicYear)) doc.assignments.set(data.academicYear, new Map());
//       const yearMap = doc.assignments.get(data.academicYear);

//       if (!yearMap.has(data.course)) yearMap.set(data.course, []);
//       const subjectsArray = yearMap.get(data.course);

//       if (!subjectsArray.some(sub => sub.subjectId === data.subjectId)) {
//         subjectsArray.push({ subjectId: data.subjectId, subjectName: data.subjectName });
//         yearMap.set(data.course, subjectsArray);
//         newSubjectsAdded++;
//       } else {
//         duplicatesSkipped++;
//       }
//     }

//     for (const doc of facultyMap.values()) {
//       doc.totalYearsRecorded = doc.assignments.size;
//       await doc.save();
//     }

//     // 6. Final Clean up and Response
//     fs.unlinkSync(req.file.path); 
    
//     res.status(201).json({
//       success: true,
//       message: 'Excel file processed successfully.',
//       newSubjectsAdded,
//       duplicatesSkipped,
//       facultiesInvolved: facultyMap.size
//     });

//   } catch (error) {
//     if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
//     console.error('Error processing Excel upload:', error);
//     res.status(500).json({ success: false, message: 'Server error.', error: error.message });
//   }
// };

// module.exports = { HandleUploadAssignSubjects };