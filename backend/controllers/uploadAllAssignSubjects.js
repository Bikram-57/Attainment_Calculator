const xlsx = require('xlsx');
const fs = require('fs');
const AssignSubject = require('../models/assignSubject'); 
const User = require('../models/user');

// const HandleUploadAssignSubjects = async (req, res) => {
//   try {
//     // 1. File Validation
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'Please upload an Excel file.' });
//     }

//     // 2. Parse Excel
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
//         message: `Strict format validation failed. The Excel file must contain exactly these columns in this order: ${requiredHeaders.join(', ')}.` 
//       });
//     }

//     // 4. Extract Data & Identify Unique Faculty
//     const normalizedData = [];
//     const uniqueFacultyIds = new Set();

//     for (let i = 1; i < rawData.length; i++) {
//       const row = rawData[i];
//       if (row.length === 0) continue; // Skip empty rows

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

//     if (normalizedData.length === 0) {
//       fs.unlinkSync(req.file.path);
//       return res.status(400).json({ success: false, message: 'No data rows found below the headers.' });
//     }

//     // 5. Fetch Existing Database Records
//     const existingDocs = await AssignSubject.find({ 
//         facultyId: { $in: Array.from(uniqueFacultyIds) } 
//     });
    
//     // Map existing docs for quick memory lookup
//     const facultyMap = new Map();
//     existingDocs.forEach(doc => facultyMap.set(doc.facultyId, doc));

//     // 6. Merge Excel Data into Mongoose Documents
//     for (const data of normalizedData) {
//       let doc = facultyMap.get(data.facultyId);

//       // Create new document instance if faculty doesn't exist yet
//       if (!doc) {
//         doc = new AssignSubject({
//           facultyId: data.facultyId,
//           facultyName: 'Pending Update', // Placeholder due to missing Excel column
//           assignments: {}
//         });
//         facultyMap.set(data.facultyId, doc);
//       }

//       // Traverse Layer 1: The Year Map
//       if (!doc.assignments.has(data.academicYear)) {
//         doc.assignments.set(data.academicYear, new Map());
//       }
//       const yearMap = doc.assignments.get(data.academicYear);

//       // Traverse Layer 2: The Course Map
//       if (!yearMap.has(data.course)) {
//         yearMap.set(data.course, []);
//       }
//       const subjectsArray = yearMap.get(data.course);

//       // Prevent duplicate subject entries for the same year and course
//       const subjectExists = subjectsArray.some(sub => sub.subjectId === data.subjectId);
//       if (!subjectExists) {
//         subjectsArray.push({
//           subjectId: data.subjectId,
//           subjectName: data.subjectName
//         });
        
//         // Explicitly re-set to trigger Mongoose change tracking for nested Maps
//         yearMap.set(data.course, subjectsArray); 
//       }
//     }

//     // 7. Calculate totalYearsRecorded and Save
//     const savePromises = [];
//     for (const doc of facultyMap.values()) {
//       doc.totalYearsRecorded = doc.assignments.size;
//       savePromises.push(doc.save()); // .save() handles Mongoose map updates safely
//     }

//     await Promise.all(savePromises);

//     // 8. File Cleanup
//     fs.unlinkSync(req.file.path);

//     // 9. Response
//     res.status(201).json({
//       success: true,
//       message: 'Assigned subjects batch processed successfully.',
//       facultiesUpdated: facultyMap.size,
//       totalRecordsProcessed: normalizedData.length
//     });

//   } catch (error) {
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
//     console.error('Error processing Excel upload:', error);
//     res.status(500).json({ success: false, message: 'Server error during file processing.', error: error.message });
//   }
// };


//working


// const HandleUploadAssignSubjects = async (req, res) => {
//  try {
//     // 1. File Validation
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'Please upload an Excel file.' });
//     }

//     // 2. Read file from disk path (compatible with your current route)
//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

//     if (rawData.length === 0) {
//       fs.unlinkSync(req.file.path); // Clean up file
//       return res.status(400).json({ success: false, message: 'The uploaded Excel file is empty.' });
//     }

//     // 3. Strict Header Validation
//     const uploadedHeaders = rawData[0];
//     const requiredHeaders = ['facultyId', 'subjectId', 'subjectName', 'course', 'academicYear'];
    
//     const isValidFormat = uploadedHeaders.length >= requiredHeaders.length && 
//                           requiredHeaders.every((header, index) => uploadedHeaders[index] === header);

//     if (!isValidFormat) {
//       fs.unlinkSync(req.file.path); // Clean up file
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
//     const existingDocs = await AssignSubject.find({ facultyId: { $in: Array.from(uniqueFacultyIds) } });
//     const facultyMap = new Map();
//     existingDocs.forEach(doc => facultyMap.set(doc.facultyId, doc));

//     let newSubjectsAdded = 0;
//     let duplicatesSkipped = 0;

//     for (const data of normalizedData) {
//       let doc = facultyMap.get(data.facultyId);
//       if (!doc) {
//         doc = new AssignSubject({ facultyId: data.facultyId, facultyName: 'Pending Update', assignments: {} });
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
//     fs.unlinkSync(req.file.path); // Delete the temporary file from disk
    
//     res.status(201).json({
//       success: true,
//       message: 'Excel file processed successfully.',
//       newSubjectsAdded,
//       duplicatesSkipped,
//       facultiesInvolved: facultyMap.size
//     });

//   } catch (error) {
//     // Attempt cleanup if error occurs
//     if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
//     console.error('Error processing Excel upload:', error);
//     res.status(500).json({ success: false, message: 'Server error.', error: error.message });
//   }
// };


// module.exports = { HandleUploadAssignSubjects };








const HandleUploadAssignSubjects = async (req, res) => {
  try {
    // 1. File Validation
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file.' });
    }

    // 2. Read file from disk path
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    if (rawData.length === 0) {
      fs.unlinkSync(req.file.path); 
      return res.status(400).json({ success: false, message: 'The uploaded Excel file is empty.' });
    }

    // 3. Strict Header Validation
    const uploadedHeaders = rawData[0];
    const requiredHeaders = ['facultyId', 'subjectId', 'subjectName', 'course', 'academicYear'];
    
    const isValidFormat = uploadedHeaders.length >= requiredHeaders.length && 
                          requiredHeaders.every((header, index) => uploadedHeaders[index] === header);

    if (!isValidFormat) {
      fs.unlinkSync(req.file.path); 
      return res.status(400).json({ 
        success: false, 
        message: `Format validation failed. Must contain headers: ${requiredHeaders.join(', ')}` 
      });
    }

    // 4. Data Processing
    const normalizedData = [];
    const uniqueFacultyIds = new Set();

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (row.length === 0) continue;

      const facultyId = String(row[0]).trim().toUpperCase();
      uniqueFacultyIds.add(facultyId);

      normalizedData.push({
        facultyId: facultyId,
        subjectId: String(row[1]).trim(),
        subjectName: String(row[2]).trim(),
        course: String(row[3]).trim(),
        academicYear: String(row[4]).trim()
      });
    }

    // 5. Database Logic
    // Fetch existing AssignSubject documents
    const existingDocs = await AssignSubject.find({ facultyId: { $in: Array.from(uniqueFacultyIds) } });
    const facultyMap = new Map();
    existingDocs.forEach(doc => facultyMap.set(doc.facultyId, doc));

    // NEW: Fetch the actual User/Faculty documents to get their real names
    const existingUsers = await User.find({ facultyId: { $in: Array.from(uniqueFacultyIds) } });
    const userNameMap = new Map();
    
    // Map the facultyId to their real name. 
    // Change 'user.name' to 'user.fullName' or whatever your User schema uses.
    existingUsers.forEach(user => userNameMap.set(user.facultyId, user.name)); 

    let newSubjectsAdded = 0;
    let duplicatesSkipped = 0;

    for (const data of normalizedData) {
      let doc = facultyMap.get(data.facultyId);
      
      if (!doc) {
        // Look up the real name from the map we just created
        // If the user doesn't exist in the Users collection, fallback to 'Unknown Faculty'
        const actualFacultyName = userNameMap.get(data.facultyId) || 'Unknown Faculty';

        doc = new AssignSubject({ 
            facultyId: data.facultyId, 
            facultyName: actualFacultyName, // <-- Using the real name here!
            assignments: {} 
        });
        facultyMap.set(data.facultyId, doc);
      }

      if (!doc.assignments.has(data.academicYear)) doc.assignments.set(data.academicYear, new Map());
      const yearMap = doc.assignments.get(data.academicYear);

      if (!yearMap.has(data.course)) yearMap.set(data.course, []);
      const subjectsArray = yearMap.get(data.course);

      if (!subjectsArray.some(sub => sub.subjectId === data.subjectId)) {
        subjectsArray.push({ subjectId: data.subjectId, subjectName: data.subjectName });
        yearMap.set(data.course, subjectsArray);
        newSubjectsAdded++;
      } else {
        duplicatesSkipped++;
      }
    }

    for (const doc of facultyMap.values()) {
      doc.totalYearsRecorded = doc.assignments.size;
      await doc.save();
    }

    // 6. Final Clean up and Response
    fs.unlinkSync(req.file.path); 
    
    res.status(201).json({
      success: true,
      message: 'Excel file processed successfully.',
      newSubjectsAdded,
      duplicatesSkipped,
      facultiesInvolved: facultyMap.size
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Error processing Excel upload:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { HandleUploadAssignSubjects };