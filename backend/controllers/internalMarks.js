const xlsx = require('xlsx');
const ExcelJS = require('exceljs');
const fs = require('fs');
const InternalMarks = require('../models/InternalMarks');
const EndSemMarks = require('../models/endSemMarks'); // A

// Helper function for fuzzy column name matching (For Numbers/Marks)
const extractValue = (row, possibleNames) => {
  if (!row) return 0;
  const rowKeys = Object.keys(row);
  const matchedKey = rowKeys.find(key => 
    possibleNames.some(name => key.toLowerCase().includes(name.toLowerCase()))
  );
  return matchedKey ? (parseFloat(row[matchedKey]) || 0) : 0;
};

// Helper function for fuzzy column name matching (For Text/Strings like Subject Code)
const extractTextValue = (row, possibleNames) => {
  if (!row) return '';
  const rowKeys = Object.keys(row);
  const matchedKey = rowKeys.find(key => 
    possibleNames.some(name => key.toLowerCase().includes(name.toLowerCase()))
  );
  return matchedKey ? String(row[matchedKey]).trim() : '';
};

// Core Math Function: Fills COs sequentially up to their maximum marks (Waterfall method)
// Optimized to prevent JavaScript floating-point subtraction errors
const fillCOs = (totalScore, maxMarksArray) => {
  // Multiply by 100 and round to deal with exact integers (e.g., 4.5 becomes 450)
  let remainingCents = Math.round((parseFloat(totalScore) || 0) * 100); 
  
  return maxMarksArray.map(maxMark => {
    const maxMarkCents = Math.round(maxMark * 100);
    
    if (remainingCents >= maxMarkCents) {
      remainingCents -= maxMarkCents;
      return maxMark;
    } else if (remainingCents > 0) {
      const assigned = remainingCents / 100;
      remainingCents = 0; // All marks have been distributed
      return assigned;
    } else {
      return 0; // No marks left to distribute
    }
  });
};

const handleProcessInternalMarks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { academicYear, course } = req.body;
    const courseName = course || 'BCA';

    if (!academicYear) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Academic Year is required.' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    if (rawData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Invalid or empty Excel file.' });
    }

    let headerRowIndex = -1;
    let regNoHeaderName = '';

    for (let i = 0; i < Math.min(15, rawData.length); i++) {
      const row = rawData[i];
      if (!row) continue;
      
      const foundRegKey = row.find(cell => {
        if (!cell) return false;
        const cellStr = cell.toString().toLowerCase().replace(/\s+/g, '');
        return cellStr === 'regno' || cellStr === 'rollno' || cellStr === 'registrationno';
      });

      if (foundRegKey) {
        headerRowIndex = i;
        regNoHeaderName = foundRegKey;
        break;
      }
    }

    if (headerRowIndex === -1) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Could not find a valid header row containing Registration Numbers.' });
    }

    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { range: headerRowIndex });

    // Use the new Text Extractor to safely pull the Subject Code and Name as strings
    const subCode = extractTextValue(data[0], ['sub code', 'subject code']) || 'SUBJECT_CODE';
    const subName = extractTextValue(data[0], ['sub name', 'subject name']) || 'SUBJECT_NAME';

    const outputData = [];
    const parsedStudents = [];

    const titleRow = `${subCode} - ${subName} (${academicYear}) Internal Marks`;
    
    outputData.push([titleRow]);
    outputData.push([
      'Reg No', 
      'Quiz 1', '', '', '', 
      'Mid Term', '', '', '', 
      'Quiz 2', '', '', '', 
      'Surprise Quiz', '', '', '', 
      'Assignment', '', '', '', '', ''
    ]);
    outputData.push([
      '', 
      'CO1', 'CO2', 'CO3', 'Total',              
      'CO1', 'CO2', 'CO3', 'Total',              
      'CO1', 'CO2', 'CO3', 'Total',              
      'CO1', 'CO2', 'CO3', 'Total',              
      'CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'Total' 
    ]);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      const actualRegKey = Object.keys(row).find(key => key.toString().trim() === regNoHeaderName.toString().trim());
      if (!actualRegKey || !row[actualRegKey]) continue;

      const regNo = String(row[actualRegKey]).trim();

      // Extract raw totals from the Excel sheet using the Number Extractor
      const q1Total = extractValue(row, ['quiz1', 'quiz 1', 'q1']);
      const midTotal = extractValue(row, ['mid-sem', 'midsem', 'mid term', 'mid exam']);
      const q2Total = extractValue(row, ['quiz2', 'quiz 2', 'q2']);
      const sqTotal = extractValue(row, ['quiz3', 'quiz 3', 'q3', 'surprise']); 
      const assignTotal = extractValue(row, ['assign', 'assignment']);

      // -------------------------------------------------------------
      // Distribute Marks Sequentially (Waterfall Method)
      // -------------------------------------------------------------
      const [q1_CO1, q1_CO2, q1_CO3] = fillCOs(q1Total, [2, 2, 1]);
      const [q2_CO1, q2_CO2, q2_CO3] = fillCOs(q2Total, [2, 2, 1]);
      const [sq_CO1, sq_CO2, sq_CO3] = fillCOs(sqTotal, [2, 2, 1]);
      const [mid_CO1, mid_CO2, mid_CO3] = fillCOs(midTotal, [20, 20, 10]);
      const [assign_CO1, assign_CO2, assign_CO3, assign_CO4, assign_CO5] = fillCOs(assignTotal, [1, 1, 1, 1, 1]);

      // Push to Excel array
      outputData.push([
        regNo,
        q1_CO1, q1_CO2, q1_CO3, q1Total,
        mid_CO1, mid_CO2, mid_CO3, midTotal,
        q2_CO1, q2_CO2, q2_CO3, q2Total,
        sq_CO1, sq_CO2, sq_CO3, sqTotal,
        assign_CO1, assign_CO2, assign_CO3, assign_CO4, assign_CO5, assignTotal
      ]);

      // Push mapped object into the database array
      parsedStudents.push({
        regNo: regNo,
        marks: {
          Quiz_1_CO1: q1_CO1, Quiz_1_CO2: q1_CO2, Quiz_1_CO3: q1_CO3, Quiz_1_TOTAL: q1Total,
          Mid_Term_CO1: mid_CO1, Mid_Term_CO2: mid_CO2, Mid_Term_CO3: mid_CO3, Mid_Term_TOTAL: midTotal,
          Quiz_2_CO1: q2_CO1, Quiz_2_CO2: q2_CO2, Quiz_2_CO3: q2_CO3, Quiz_2_TOTAL: q2Total,
          Surprise_Quiz_CO1: sq_CO1, Surprise_Quiz_CO2: sq_CO2, Surprise_Quiz_CO3: sq_CO3, Surprise_Quiz_TOTAL: sqTotal,
          Assignment_CO1: assign_CO1, Assignment_CO2: assign_CO2, Assignment_CO3: assign_CO3, Assignment_CO4: assign_CO4, Assignment_CO5: assign_CO5, Assignment_TOTAL: assignTotal
        }
      });
    }

    let subjectRecord = await InternalMarks.findOne({ 
      subjectId: subCode, 
      academicYear: academicYear 
    });

    if (!subjectRecord) {
      subjectRecord = new InternalMarks({
        academicYear: academicYear,
        course: courseName,
        subjectId: subCode,
        maxMarks: {
          Quiz_1_CO1: 2, Quiz_1_CO2: 2, Quiz_1_CO3: 1, Quiz_1_TOTAL: 5,
          Mid_Term_CO1: 20, Mid_Term_CO2: 20, Mid_Term_CO3: 10, Mid_Term_TOTAL: 50,
          Quiz_2_CO1: 2, Quiz_2_CO2: 2, Quiz_2_CO3: 1, Quiz_2_TOTAL: 5,
          Surprise_Quiz_CO1: 2, Surprise_Quiz_CO2: 2, Surprise_Quiz_CO3: 1, Surprise_Quiz_TOTAL: 5,
          Assignment_CO1: 1, Assignment_CO2: 1, Assignment_CO3: 1, Assignment_CO4: 1, Assignment_CO5: 1, Assignment_TOTAL: 5
        },
        actualMarks: []
      });
    } else {
      subjectRecord.maxMarks.Quiz_1_CO1 = 2; subjectRecord.maxMarks.Quiz_1_CO2 = 2; subjectRecord.maxMarks.Quiz_1_CO3 = 1; subjectRecord.maxMarks.Quiz_1_TOTAL = 5;
      subjectRecord.maxMarks.Mid_Term_CO1 = 20; subjectRecord.maxMarks.Mid_Term_CO2 = 20; subjectRecord.maxMarks.Mid_Term_CO3 = 10; subjectRecord.maxMarks.Mid_Term_TOTAL = 50;
      subjectRecord.maxMarks.Quiz_2_CO1 = 2; subjectRecord.maxMarks.Quiz_2_CO2 = 2; subjectRecord.maxMarks.Quiz_2_CO3 = 1; subjectRecord.maxMarks.Quiz_2_TOTAL = 5;
      subjectRecord.maxMarks.Surprise_Quiz_CO1 = 2; subjectRecord.maxMarks.Surprise_Quiz_CO2 = 2; subjectRecord.maxMarks.Surprise_Quiz_CO3 = 1; subjectRecord.maxMarks.Surprise_Quiz_TOTAL = 5;
      subjectRecord.maxMarks.Assignment_CO1 = 1; subjectRecord.maxMarks.Assignment_CO2 = 1; subjectRecord.maxMarks.Assignment_CO3 = 1; subjectRecord.maxMarks.Assignment_CO4 = 1; subjectRecord.maxMarks.Assignment_CO5 = 1; subjectRecord.maxMarks.Assignment_TOTAL = 5;
    }

    // Merge internal marks into the specific student records
    for (const parsedStudent of parsedStudents) {
      const existingStudentIndex = subjectRecord.actualMarks.findIndex(s => s.regNo === parsedStudent.regNo);

      if (existingStudentIndex >= 0) {
        Object.assign(
          subjectRecord.actualMarks[existingStudentIndex].marks, 
          parsedStudent.marks
        );
      } else {
        subjectRecord.actualMarks.push(parsedStudent);
      }
    }

    subjectRecord.uploadedAt = Date.now();
    await subjectRecord.save();

    // Excel formatting and output
    const newWb = xlsx.utils.book_new();
    const newWs = xlsx.utils.aoa_to_sheet(outputData);

    newWs['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 22 } }, 
      { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },  
      { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },  
      { s: { r: 1, c: 5 }, e: { r: 1, c: 8 } },  
      { s: { r: 1, c: 9 }, e: { r: 1, c: 12 } }, 
      { s: { r: 1, c: 13 }, e: { r: 1, c: 16 } },
      { s: { r: 1, c: 17 }, e: { r: 1, c: 22 } } 
    ];

    xlsx.utils.book_append_sheet(newWb, newWs, 'Internal Mapped');
    const buffer = xlsx.write(newWb, { type: 'buffer', bookType: 'xlsx' });

    fs.unlinkSync(req.file.path);

    res.setHeader('Content-Disposition', `attachment; filename="${subCode}_Internal_Mapped.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error processing internal marks:', error);
    res.status(500).json({ message: 'Internal server error processing internal data', error: error.message });
  }
};



    // const handleDownloadFormattedSheet = async (req, res) => {
    // try {
    //     const { subjectId, academicYear } = req.query;

    //     // =========================================================
    //     // 1. VALIDATE QUERY PARAMETERS
    //     // =========================================================

    //     if (!subjectId || !academicYear) {
    //     return res.status(400).json({
    //         message:
    //         "subjectId and academicYear are required query parameters.",
    //     });
    //     }

    //     // =========================================================
    //     // 2. FETCH INTERNAL MARKS
    //     // =========================================================

    //     const internalDoc = await InternalMarks.findOne({
    //     subjectId,
    //     academicYear,
    //     });

    //     // =========================================================
    //     // 3. FETCH END SEM MARKS
    //     // =========================================================

    //     const endSemDoc = await EndSemMarks.findOne({
    //     $or: [
    //         { subjectId: subjectId },
    //         { subjectCode: subjectId },
    //     ],
    //     academicYear,
    //     });

    //     // =========================================================
    //     // 4. CHECK WHETHER DATA EXISTS
    //     // =========================================================

    //     if (!internalDoc && !endSemDoc) {
    //     return res.status(404).json({
    //         message:
    //         "No records found for this Subject ID and Academic Year.",
    //     });
    //     }

    //     // =========================================================
    //     // 5. MERGE STUDENT DATA
    //     // =========================================================

    //     const studentMap = new Map();

    //     // ---------------------------------------------------------
    //     // Internal Marks
    //     // ---------------------------------------------------------

    //     if (internalDoc && internalDoc.actualMarks) {
    //     internalDoc.actualMarks.forEach((student) => {
    //         studentMap.set(student.regNo, {
    //         internal: student.marks || {},
    //         endSem: {},
    //         });
    //     });
    //     }

    //     // ---------------------------------------------------------
    //     // End Semester Marks
    //     // ---------------------------------------------------------

    //     if (endSemDoc && endSemDoc.students) {
    //     endSemDoc.students.forEach((student) => {
    //         if (studentMap.has(student.regNo)) {
    //         studentMap.get(student.regNo).endSem = student;
    //         } else {
    //         studentMap.set(student.regNo, {
    //             internal: {},
    //             endSem: student,
    //         });
    //         }
    //     });
    //     }

    //     // =========================================================
    //     // 6. CREATE EXCEL WORKBOOK
    //     // =========================================================

    //     const workbook = new ExcelJS.Workbook();

    //     const worksheet = workbook.addWorksheet(subjectId, {
    //     views: [
    //         {
    //         state: "frozen",

    //         // Freeze first column
    //         xSplit: 1,

    //         // Freeze first 2 rows
    //         ySplit: 2,
    //         },
    //     ],
    //     });

    //     // =========================================================
    //     // 7. ROW 1 - MAIN HEADERS
    //     // =========================================================

    //     worksheet.addRow([
    //     "Reg No",

    //     // -------------------------------------------------------
    //     // Quiz 1 - B:E
    //     // -------------------------------------------------------
    //     "Quiz 1",
    //     "",
    //     "",
    //     "",

    //     // -------------------------------------------------------
    //     // Mid Term - F:I
    //     // -------------------------------------------------------
    //     "Mid Term",
    //     "",
    //     "",
    //     "",

    //     // -------------------------------------------------------
    //     // Quiz 2 - J:M
    //     // -------------------------------------------------------
    //     "Quiz 2",
    //     "",
    //     "",
    //     "",

    //     // -------------------------------------------------------
    //     // Surprise Quiz - N:Q
    //     // -------------------------------------------------------
    //     "Surprise Quiz",
    //     "",
    //     "",
    //     "",

    //     // -------------------------------------------------------
    //     // Assignment - R:W
    //     // -------------------------------------------------------
    //     "Assignment",
    //     "",
    //     "",
    //     "",
    //     "",
    //     "",

    //     // -------------------------------------------------------
    //     // End Sem - X:AC
    //     // -------------------------------------------------------
    //     "End Sem",
    //     "",
    //     "",
    //     "",
    //     "",
    //     "",
    //     ]);

    //     // =========================================================
    //     // 8. ROW 2 - CO HEADERS
    //     // =========================================================

    //     worksheet.addRow([
    //     "",

    //     // -------------------------------------------------------
    //     // Quiz 1
    //     // -------------------------------------------------------
    //     "CO1",
    //     "CO2",
    //     "CO3",
    //     "Total",

    //     // -------------------------------------------------------
    //     // Mid Term
    //     // -------------------------------------------------------
    //     "CO1",
    //     "CO2",
    //     "CO3",
    //     "Total",

    //     // -------------------------------------------------------
    //     // Quiz 2
    //     // -------------------------------------------------------
    //     "CO1",
    //     "CO2",
    //     "CO3",
    //     "Total",

    //     // -------------------------------------------------------
    //     // Surprise Quiz
    //     // -------------------------------------------------------
    //     "CO1",
    //     "CO2",
    //     "CO3",
    //     "Total",

    //     // -------------------------------------------------------
    //     // Assignment
    //     // -------------------------------------------------------
    //     "CO1",
    //     "CO2",
    //     "CO3",
    //     "CO4",
    //     "CO5",
    //     "Total",

    //     // -------------------------------------------------------
    //     // End Sem
    //     // -------------------------------------------------------
    //     "CO1",
    //     "CO2",
    //     "CO3",
    //     "CO4",
    //     "CO5",
    //     "Total",
    //     ]);

    //     // =========================================================
    //     // 9. MERGE HEADER CELLS
    //     // =========================================================

    //     // ---------------------------------------------------------
    //     // Reg No
    //     // ---------------------------------------------------------

    //     worksheet.mergeCells("A1:A2");

    //     // ---------------------------------------------------------
    //     // Quiz 1
    //     // ---------------------------------------------------------

    //     worksheet.mergeCells("B1:E1");

    //     // ---------------------------------------------------------
    //     // Mid Term
    //     // ---------------------------------------------------------

    //     worksheet.mergeCells("F1:I1");

    //     // ---------------------------------------------------------
    //     // Quiz 2
    //     // ---------------------------------------------------------

    //     worksheet.mergeCells("J1:M1");

    //     // ---------------------------------------------------------
    //     // Surprise Quiz
    //     // ---------------------------------------------------------

    //     worksheet.mergeCells("N1:Q1");

    //     // ---------------------------------------------------------
    //     // Assignment
    //     // ---------------------------------------------------------

    //     worksheet.mergeCells("R1:W1");

    //     // ---------------------------------------------------------
    //     // End Sem
    //     // ---------------------------------------------------------

    //     worksheet.mergeCells("X1:AC1");

    //     // =========================================================
    //     // 10. SORT STUDENTS
    //     // =========================================================

    //     const sortedStudents = Array.from(
    //     studentMap.entries()
    //     ).sort((a, b) =>
    //     a[0].localeCompare(b[0], undefined, {
    //         numeric: true,
    //     })
    //     );

    //     // =========================================================
    //     // 11. HELPER FUNCTION
    //     // =========================================================

    //     const val = (value) => {
    //     return value !== null && value !== undefined
    //         ? value
    //         : "";
    //     };

    //     // =========================================================
    //     // 12. ADD STUDENT DATA
    //     //
    //     // DATA STARTS FROM ROW 3
    //     // =========================================================

    //     sortedStudents.forEach(([regNo, data]) => {
    //     const int = data.internal || {};
    //     const ext = data.endSem || {};

    //     worksheet.addRow([
    //         // =====================================================
    //         // A - REG NO
    //         // =====================================================

    //         regNo,

    //         // =====================================================
    //         // B:E - QUIZ 1
    //         // =====================================================

    //         val(int.Quiz_1_CO1),
    //         val(int.Quiz_1_CO2),
    //         val(int.Quiz_1_CO3),
    //         val(int.Quiz_1_TOTAL),

    //         // =====================================================
    //         // F:I - MID TERM
    //         // =====================================================

    //         val(int.Mid_Term_CO1),
    //         val(int.Mid_Term_CO2),
    //         val(int.Mid_Term_CO3),
    //         val(int.Mid_Term_TOTAL),

    //         // =====================================================
    //         // J:M - QUIZ 2
    //         // =====================================================

    //         val(int.Quiz_2_CO1),
    //         val(int.Quiz_2_CO2),
    //         val(int.Quiz_2_CO3),
    //         val(int.Quiz_2_TOTAL),

    //         // =====================================================
    //         // N:Q - SURPRISE QUIZ
    //         // =====================================================

    //         val(int.Surprise_Quiz_CO1),
    //         val(int.Surprise_Quiz_CO2),
    //         val(int.Surprise_Quiz_CO3),
    //         val(int.Surprise_Quiz_TOTAL),

    //         // =====================================================
    //         // R:W - ASSIGNMENT
    //         // =====================================================

    //         val(int.Assignment_CO1),
    //         val(int.Assignment_CO2),
    //         val(int.Assignment_CO3),
    //         val(int.Assignment_CO4),
    //         val(int.Assignment_CO5),
    //         val(int.Assignment_TOTAL),

    //         // =====================================================
    //         // X:AC - END SEM
    //         // =====================================================

    //         val(ext.co1),
    //         val(ext.co2),
    //         val(ext.co3),
    //         val(ext.co4),
    //         val(ext.co5),
    //         val(ext.total),
    //     ]);
    //     });

    //     // =========================================================
    //     // 13. ADD MAX MARKS / CO ROW
    //     // =========================================================

    //     const extMax =
    //     endSemDoc?.maxMarksPerCO || 20;

    //     worksheet.addRow([
    //     // =======================================================
    //     // A
    //     // =======================================================

    //     "Max\nMarks/CO",

    //     // =======================================================
    //     // B:E - QUIZ 1
    //     // =======================================================

    //     2,
    //     2,
    //     1,
    //     5,

    //     // =======================================================
    //     // F:I - MID TERM
    //     // =======================================================

    //     20,
    //     20,
    //     10,
    //     50,

    //     // =======================================================
    //     // J:M - QUIZ 2
    //     // =======================================================

    //     2,
    //     2,
    //     1,
    //     5,

    //     // =======================================================
    //     // N:Q - SURPRISE QUIZ
    //     // =======================================================

    //     2,
    //     2,
    //     1,
    //     5,

    //     // =======================================================
    //     // R:W - ASSIGNMENT
    //     // =======================================================

    //     1,
    //     1,
    //     1,
    //     1,
    //     1,
    //     5,

    //     // =======================================================
    //     // X:AC - END SEM
    //     // =======================================================

    //     extMax,
    //     extMax,
    //     extMax,
    //     extMax,
    //     extMax,
    //     extMax * 5,
    //     ]);

    //     // =========================================================
    //     // 14. COLORS
    //     // =========================================================

    //     const COLORS = {
    //     // Reg No header
    //     REG_HEADER: "FFE6B8B7",

    //     // Purple
    //     PURPLE: "FFCCC0DA",

    //     // Green
    //     GREEN: "FFD8E4BC",

    //     // Orange
    //     ORANGE: "FFFCD5B4",

    //     // Red
    //     RED: "FFC00000",

    //     // Black
    //     BLACK: "FF000000",

    //     // White
    //     WHITE: "FFFFFFFF",
    //     };

    //     // =========================================================
    //     // 15. COLUMN GROUPS
    //     // =========================================================

    //     const columnGroups = [
    //     // Reg No
    //     {
    //         start: 1,
    //         end: 1,
    //         color: COLORS.REG_HEADER,
    //     },

    //     // Quiz 1
    //     {
    //         start: 2,
    //         end: 5,
    //         color: COLORS.PURPLE,
    //     },

    //     // Mid Term
    //     {
    //         start: 6,
    //         end: 9,
    //         color: COLORS.GREEN,
    //     },

    //     // Quiz 2
    //     {
    //         start: 10,
    //         end: 13,
    //         color: COLORS.PURPLE,
    //     },

    //     // Surprise Quiz
    //     {
    //         start: 14,
    //         end: 17,
    //         color: COLORS.GREEN,
    //     },

    //     // Assignment
    //     {
    //         start: 18,
    //         end: 23,
    //         color: COLORS.PURPLE,
    //     },

    //     // End Sem
    //     {
    //         start: 24,
    //         end: 29,
    //         color: COLORS.GREEN,
    //     },
    //     ];

    //     // =========================================================
    //     // 16. APPLY STYLING
    //     // =========================================================

    //     worksheet.eachRow(
    //     {
    //         includeEmpty: true,
    //     },
    //     (row, rowNumber) => {
    //         // -----------------------------------------------------
    //         // ROW HEIGHT
    //         // -----------------------------------------------------

    //         if (rowNumber === 1) {
    //         row.height = 22;
    //         } else if (rowNumber === 2) {
    //         row.height = 22;
    //         } else if (
    //         rowNumber === worksheet.rowCount
    //         ) {
    //         row.height = 40;
    //         } else {
    //         row.height = 22;
    //         }

    //         // -----------------------------------------------------
    //         // EACH CELL
    //         // -----------------------------------------------------

    //         row.eachCell(
    //         {
    //             includeEmpty: true,
    //         },
    //         (cell, colNumber) => {
    //             // -------------------------------------------------
    //             // FONT
    //             // -------------------------------------------------

    //             cell.font = {
    //             name: "Calibri",
    //             size: 11,
    //             color: {
    //                 argb: COLORS.BLACK,
    //             },
    //             };

    //             // -------------------------------------------------
    //             // ALIGNMENT
    //             // -------------------------------------------------

    //             cell.alignment = {
    //             vertical: "middle",
    //             horizontal: "center",
    //             wrapText: true,
    //             };

    //             // -------------------------------------------------
    //             // BORDER
    //             // -------------------------------------------------

    //             cell.border = {
    //             top: {
    //                 style: "thin",
    //                 color: {
    //                 argb: COLORS.BLACK,
    //                 },
    //             },

    //             left: {
    //                 style: "thin",
    //                 color: {
    //                 argb: COLORS.BLACK,
    //                 },
    //             },

    //             bottom: {
    //                 style: "thin",
    //                 color: {
    //                 argb: COLORS.BLACK,
    //                 },
    //             },

    //             right: {
    //                 style: "thin",
    //                 color: {
    //                 argb: COLORS.BLACK,
    //                 },
    //             },
    //             };

    //             // -------------------------------------------------
    //             // HEADER COLOR
    //             // -------------------------------------------------

    //             if (
    //             rowNumber === 1 ||
    //             rowNumber === 2
    //             ) {
    //             const group =
    //                 columnGroups.find(
    //                 (group) =>
    //                     colNumber >= group.start &&
    //                     colNumber <= group.end
    //                 );

    //             if (group) {
    //                 cell.fill = {
    //                 type: "pattern",
    //                 pattern: "solid",
    //                 fgColor: {
    //                     argb: group.color,
    //                 },
    //                 };
    //             }
    //             }

    //             // -------------------------------------------------
    //             // REG NO COLUMN
    //             // -------------------------------------------------

    //             if (colNumber === 1) {
    //             // Header
    //             if (
    //                 rowNumber === 1 ||
    //                 rowNumber === 2
    //             ) {
    //                 cell.fill = {
    //                 type: "pattern",
    //                 pattern: "solid",
    //                 fgColor: {
    //                     argb: COLORS.REG_HEADER,
    //                 },
    //                 };

    //                 cell.font = {
    //                 name: "Calibri",
    //                 size: 11,
    //                 color: {
    //                     argb: COLORS.BLACK,
    //                 },
    //                 };
    //             }

    //             // Max Marks row
    //             else if (
    //                 rowNumber === worksheet.rowCount
    //             ) {
    //                 cell.fill = {
    //                 type: "pattern",
    //                 pattern: "solid",
    //                 fgColor: {
    //                     argb: COLORS.ORANGE,
    //                 },
    //                 };

    //                 cell.font = {
    //                 name: "Calibri",
    //                 size: 11,
    //                 color: {
    //                     argb: COLORS.BLACK,
    //                 },
    //                 };
    //             }

    //             // Student Reg No
    //             else {
    //                 cell.font = {
    //                 name: "Calibri",
    //                 size: 11,
    //                 color: {
    //                     argb: COLORS.RED,
    //                 },
    //                 };
    //             }
    //             }

    //             // -------------------------------------------------
    //             // MAX MARKS ROW
    //             // -------------------------------------------------

    //             if (
    //             rowNumber === worksheet.rowCount
    //             ) {
    //             if (colNumber === 1) {
    //                 cell.fill = {
    //                 type: "pattern",
    //                 pattern: "solid",
    //                 fgColor: {
    //                     argb: COLORS.ORANGE,
    //                 },
    //                 };
    //             } else {
    //                 cell.fill = {
    //                 type: "pattern",
    //                 pattern: "solid",
    //                 fgColor: {
    //                     argb: COLORS.WHITE,
    //                 },
    //                 };
    //             }

    //             cell.font = {
    //                 name: "Calibri",
    //                 size: 11,
    //                 color: {
    //                 argb: COLORS.BLACK,
    //                 },
    //             };

    //             cell.alignment = {
    //                 vertical: "middle",
    //                 horizontal: "center",
    //                 wrapText: true,
    //             };
    //             }
    //         }
    //         );
    //     }
    //     );

    //     // =========================================================
    //     // 17. COLUMN WIDTH
    //     // =========================================================

    //     // A - Reg No
    //     worksheet.getColumn(1).width = 14;

    //     // B:E - Quiz 1
    //     for (let i = 2; i <= 5; i++) {
    //     worksheet.getColumn(i).width = 9;
    //     }

    //     // F:I - Mid Term
    //     for (let i = 6; i <= 9; i++) {
    //     worksheet.getColumn(i).width = 9;
    //     }

    //     // J:M - Quiz 2
    //     for (let i = 10; i <= 13; i++) {
    //     worksheet.getColumn(i).width = 9;
    //     }

    //     // N:Q - Surprise Quiz
    //     for (let i = 14; i <= 17; i++) {
    //     worksheet.getColumn(i).width = 9;
    //     }

    //     // R:W - Assignment
    //     for (let i = 18; i <= 23; i++) {
    //     worksheet.getColumn(i).width = 9;
    //     }

    //     // X:AC - End Sem
    //     for (let i = 24; i <= 29; i++) {
    //     worksheet.getColumn(i).width = 9;
    //     }

    //     // =========================================================
    //     // 18. PAGE SETTINGS
    //     // =========================================================

    //     worksheet.pageSetup = {
    //     orientation: "landscape",
    //     paperSize: worksheet.PAPERSIZE_A4,
    //     fitToPage: true,
    //     fitToWidth: 1,
    //     fitToHeight: 0,
    //     };

    //     worksheet.pageSetup.margins = {
    //     left: 0.25,
    //     right: 0.25,
    //     top: 0.5,
    //     bottom: 0.5,
    //     header: 0.2,
    //     footer: 0.2,
    //     };

    //     // =========================================================
    //     // 19. SEND EXCEL FILE
    //     // =========================================================

    //     res.setHeader(
    //     "Content-Disposition",
    //     `attachment; filename="${subjectId}_Consolidated_Marks_${academicYear}.xlsx"`
    //     );

    //     res.setHeader(
    //     "Content-Type",
    //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    //     );

    //     await workbook.xlsx.write(res);

    //     res.end();

    // } catch (error) {
    //     console.error(
    //     "Error generating consolidated sheet:",
    //     error
    //     );

    //     res.status(500).json({
    //     message:
    //         "Internal server error processing download",
    //     error: error.message,
    //     });
    // }
    // };




const handleDownloadFormattedSheet = async (req, res) => {
  try {
    const { subjectId, academicYear } = req.query;

    // =========================================================
    // 1. VALIDATE QUERY PARAMETERS
    // =========================================================

    if (!subjectId || !academicYear) {
      return res.status(400).json({
        message:
          "subjectId and academicYear are required query parameters.",
      });
    }

    // =========================================================
    // 2. FETCH INTERNAL MARKS
    // =========================================================

    const internalDoc = await InternalMarks.findOne({
      subjectId,
      academicYear,
    });

    // =========================================================
    // 3. FETCH END SEM MARKS
    // =========================================================

    const endSemDoc = await EndSemMarks.findOne({
      $or: [
        { subjectId: subjectId },
        { subjectCode: subjectId },
      ],
      academicYear,
    });

    // =========================================================
    // 4. CHECK DATA
    // =========================================================

    if (!internalDoc && !endSemDoc) {
      return res.status(404).json({
        message:
          "No records found for this Subject ID and Academic Year.",
      });
    }

    // =========================================================
    // 5. MERGE STUDENT DATA
    // =========================================================

    const studentMap = new Map();

    // ---------------------------------------------------------
    // INTERNAL MARKS
    // ---------------------------------------------------------

    if (
      internalDoc &&
      Array.isArray(internalDoc.actualMarks)
    ) {
      internalDoc.actualMarks.forEach((student) => {
        if (!student.regNo) return;

        studentMap.set(String(student.regNo).trim(), {
          internal: student.marks || {},
          endSem: {},
        });
      });
    }

    // ---------------------------------------------------------
    // END SEM MARKS
    // ---------------------------------------------------------

    if (
      endSemDoc &&
      Array.isArray(endSemDoc.students)
    ) {
      endSemDoc.students.forEach((student) => {
        if (!student.regNo) return;

        const regNo = String(student.regNo).trim();

        if (studentMap.has(regNo)) {
          studentMap.get(regNo).endSem = student;
        } else {
          studentMap.set(regNo, {
            internal: {},
            endSem: student,
          });
        }
      });
    }

    // =========================================================
    // 6. CREATE WORKBOOK
    // =========================================================

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(
      String(subjectId).substring(0, 31),
      {
        views: [
          {
            state: "frozen",
            xSplit: 1,
            ySplit: 2,
          },
        ],
      }
    );

    // =========================================================
    // 7. ROW 1 - MAIN HEADERS
    // =========================================================

    worksheet.addRow([
      "Reg No",

      // Quiz 1 - B:E
      "Quiz 1",
      "",
      "",
      "",

      // Mid Term - F:I
      "Mid Term",
      "",
      "",
      "",

      // Quiz 2 - J:M
      "Quiz 2",
      "",
      "",
      "",

      // Surprise Quiz - N:Q
      "Surprise Quiz",
      "",
      "",
      "",

      // Assignment - R:W
      "Assignment",
      "",
      "",
      "",
      "",
      "",

      // End Sem - X:AC
      "End Sem",
      "",
      "",
      "",
      "",
      "",
    ]);

    // =========================================================
    // 8. ROW 2 - CO HEADERS
    // =========================================================

    worksheet.addRow([
      "",

      // Quiz 1
      "CO1",
      "CO2",
      "CO3",
      "Total",

      // Mid Term
      "CO1",
      "CO2",
      "CO3",
      "Total",

      // Quiz 2
      "CO1",
      "CO2",
      "CO3",
      "Total",

      // Surprise Quiz
      "CO1",
      "CO2",
      "CO3",
      "Total",

      // Assignment
      "CO1",
      "CO2",
      "CO3",
      "CO4",
      "CO5",
      "Total",

      // End Sem
      "CO1",
      "CO2",
      "CO3",
      "CO4",
      "CO5",
      "Total",
    ]);

    // =========================================================
    // 9. MERGE HEADER CELLS
    // =========================================================

    worksheet.mergeCells("A1:A2");

    worksheet.mergeCells("B1:E1");

    worksheet.mergeCells("F1:I1");

    worksheet.mergeCells("J1:M1");

    worksheet.mergeCells("N1:Q1");

    worksheet.mergeCells("R1:W1");

    worksheet.mergeCells("X1:AC1");

    // =========================================================
    // 10. SORT STUDENTS
    // =========================================================

    const sortedStudents = Array.from(
      studentMap.entries()
    ).sort((a, b) =>
      String(a[0]).localeCompare(
        String(b[0]),
        undefined,
        {
          numeric: true,
        }
      )
    );

    // =========================================================
    // 11. VALUE HELPER
    // =========================================================

    const val = (value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      return value;
    };

    // =========================================================
    // 12. ADD STUDENT DATA
    //
    // Student data starts from ROW 3
    // =========================================================

    sortedStudents.forEach(([regNo, data]) => {
      const int = data.internal || {};
      const ext = data.endSem || {};

      worksheet.addRow([
        // =====================================================
        // A - REG NO
        // =====================================================

        regNo,

        // =====================================================
        // B:E - QUIZ 1
        // =====================================================

        val(int.Quiz_1_CO1),
        val(int.Quiz_1_CO2),
        val(int.Quiz_1_CO3),
        val(int.Quiz_1_TOTAL),

        // =====================================================
        // F:I - MID TERM
        // =====================================================

        val(int.Mid_Term_CO1),
        val(int.Mid_Term_CO2),
        val(int.Mid_Term_CO3),
        val(int.Mid_Term_TOTAL),

        // =====================================================
        // J:M - QUIZ 2
        // =====================================================

        val(int.Quiz_2_CO1),
        val(int.Quiz_2_CO2),
        val(int.Quiz_2_CO3),
        val(int.Quiz_2_TOTAL),

        // =====================================================
        // N:Q - SURPRISE QUIZ
        // =====================================================

        val(int.Surprise_Quiz_CO1),
        val(int.Surprise_Quiz_CO2),
        val(int.Surprise_Quiz_CO3),
        val(int.Surprise_Quiz_TOTAL),

        // =====================================================
        // R:W - ASSIGNMENT
        // =====================================================

        val(int.Assignment_CO1),
        val(int.Assignment_CO2),
        val(int.Assignment_CO3),
        val(int.Assignment_CO4),
        val(int.Assignment_CO5),
        val(int.Assignment_TOTAL),

        // =====================================================
        // X:AC - END SEM
        // =====================================================

        val(ext.co1),
        val(ext.co2),
        val(ext.co3),
        val(ext.co4),
        val(ext.co5),
        val(ext.total),
      ]);
    });

    // =========================================================
    // 13. ADD MAX MARKS / CO ROW
    // =========================================================

    const extMax =
      Number(endSemDoc?.maxMarksPerCO) || 20;

    // IMPORTANT:
    // EXACT VALUE MUST BE:
    // "Max Marks/CO"
    //
    // DO NOT USE:
    // "Max\nMarks/CO"
    // =========================================================

    const maxMarksRow = worksheet.addRow([
      // A
      "Max Marks/CO",

      // -------------------------------------------------------
      // Quiz 1
      // -------------------------------------------------------

      2,
      2,
      1,
      5,

      // -------------------------------------------------------
      // Mid Term
      // -------------------------------------------------------

      20,
      20,
      10,
      50,

      // -------------------------------------------------------
      // Quiz 2
      // -------------------------------------------------------

      2,
      2,
      1,
      5,

      // -------------------------------------------------------
      // Surprise Quiz
      // -------------------------------------------------------

      2,
      2,
      1,
      5,

      // -------------------------------------------------------
      // Assignment
      // -------------------------------------------------------

      1,
      1,
      1,
      1,
      1,
      5,

      // -------------------------------------------------------
      // End Sem
      // -------------------------------------------------------

      extMax,
      extMax,
      extMax,
      extMax,
      extMax,
      extMax * 5,
    ]);

    // =========================================================
    // 14. IMPORTANT - FORCE EXACT MAX MARKS VALUE
    // =========================================================

    const maxMarksRowNumber =
      maxMarksRow.number;

    worksheet.getCell(
      maxMarksRowNumber,
      1
    ).value = "Max Marks/CO";

    // Make absolutely sure there are no extra values
    // after column AC.
    for (let col = 30; col <= worksheet.columnCount; col++) {
      worksheet.getCell(
        maxMarksRowNumber,
        col
      ).value = null;
    }

    // =========================================================
    // 15. COLORS
    // =========================================================

    const COLORS = {
      REG_HEADER: "FFE6B8B7",

      PURPLE: "FFCCC0DA",

      GREEN: "FFD8E4BC",

      ORANGE: "FFFCD5B4",

      RED: "FFC00000",

      BLACK: "FF000000",

      WHITE: "FFFFFFFF",
    };

    // =========================================================
    // 16. COLUMN GROUPS
    // =========================================================

    const columnGroups = [
      {
        start: 1,
        end: 1,
        color: COLORS.REG_HEADER,
      },

      {
        start: 2,
        end: 5,
        color: COLORS.PURPLE,
      },

      {
        start: 6,
        end: 9,
        color: COLORS.GREEN,
      },

      {
        start: 10,
        end: 13,
        color: COLORS.PURPLE,
      },

      {
        start: 14,
        end: 17,
        color: COLORS.GREEN,
      },

      {
        start: 18,
        end: 23,
        color: COLORS.PURPLE,
      },

      {
        start: 24,
        end: 29,
        color: COLORS.GREEN,
      },
    ];

    // =========================================================
    // 17. APPLY STYLING
    // =========================================================

    worksheet.eachRow(
      {
        includeEmpty: true,
      },
      (row, rowNumber) => {
        // -----------------------------------------------------
        // ROW HEIGHT
        // -----------------------------------------------------

        if (rowNumber === 1) {
          row.height = 22;
        } else if (rowNumber === 2) {
          row.height = 22;
        } else if (
          rowNumber === maxMarksRowNumber
        ) {
          row.height = 40;
        } else {
          row.height = 22;
        }

        // -----------------------------------------------------
        // CELLS
        // -----------------------------------------------------

        row.eachCell(
          {
            includeEmpty: true,
          },
          (cell, colNumber) => {
            // Only A:AC
            if (colNumber > 29) {
              return;
            }

            // -------------------------------------------------
            // DEFAULT FONT
            // -------------------------------------------------

            cell.font = {
              name: "Calibri",
              size: 11,
              color: {
                argb: COLORS.BLACK,
              },
            };

            // -------------------------------------------------
            // ALIGNMENT
            // -------------------------------------------------

            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
              wrapText: true,
            };

            // -------------------------------------------------
            // BORDER
            // -------------------------------------------------

            cell.border = {
              top: {
                style: "thin",
                color: {
                  argb: COLORS.BLACK,
                },
              },

              left: {
                style: "thin",
                color: {
                  argb: COLORS.BLACK,
                },
              },

              bottom: {
                style: "thin",
                color: {
                  argb: COLORS.BLACK,
                },
              },

              right: {
                style: "thin",
                color: {
                  argb: COLORS.BLACK,
                },
              },
            };

            // -------------------------------------------------
            // HEADER COLORS
            // -------------------------------------------------

            if (
              rowNumber === 1 ||
              rowNumber === 2
            ) {
              const group =
                columnGroups.find(
                  (group) =>
                    colNumber >= group.start &&
                    colNumber <= group.end
                );

              if (group) {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: {
                    argb: group.color,
                  },
                };
              }
            }

            // -------------------------------------------------
            // REG NO COLUMN
            // -------------------------------------------------

            if (colNumber === 1) {
              // Header
              if (
                rowNumber === 1 ||
                rowNumber === 2
              ) {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: {
                    argb: COLORS.REG_HEADER,
                  },
                };

                cell.font = {
                  name: "Calibri",
                  size: 11,
                  bold: true,
                  color: {
                    argb: COLORS.BLACK,
                  },
                };
              }

              // Max Marks/CO row
              else if (
                rowNumber === maxMarksRowNumber
              ) {
                cell.value = "Max Marks/CO";

                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: {
                    argb: COLORS.ORANGE,
                  },
                };

                cell.font = {
                  name: "Calibri",
                  size: 11,
                  bold: true,
                  color: {
                    argb: COLORS.BLACK,
                  },
                };

                cell.alignment = {
                  vertical: "middle",
                  horizontal: "center",
                  wrapText: true,
                };
              }

              // Student Reg No
              else {
                cell.font = {
                  name: "Calibri",
                  size: 11,
                  color: {
                    argb: COLORS.RED,
                  },
                };
              }
            }

            // -------------------------------------------------
            // MAX MARKS ROW
            // -------------------------------------------------

            if (
              rowNumber === maxMarksRowNumber
            ) {
              if (colNumber === 1) {
                cell.value = "Max Marks/CO";

                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: {
                    argb: COLORS.ORANGE,
                  },
                };
              } else {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: {
                    argb: COLORS.WHITE,
                  },
                };
              }

              cell.font = {
                name: "Calibri",
                size: 11,
                bold: true,
                color: {
                  argb: COLORS.BLACK,
                },
              };

              cell.alignment = {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
              };
            }
          }
        );
      }
    );

    // =========================================================
    // 18. FORCE FINAL VALUE ONE MORE TIME
    // =========================================================

    // This is intentionally done AFTER styling.
    // It guarantees the actual stored value is exactly
    // "Max Marks/CO".

    worksheet.getCell(
      maxMarksRowNumber,
      1
    ).value = "Max Marks/CO";

    // =========================================================
    // 19. COLUMN WIDTHS
    // =========================================================

    // Reg No
    worksheet.getColumn(1).width = 14;

    // Quiz 1
    for (let i = 2; i <= 5; i++) {
      worksheet.getColumn(i).width = 9;
    }

    // Mid Term
    for (let i = 6; i <= 9; i++) {
      worksheet.getColumn(i).width = 9;
    }

    // Quiz 2
    for (let i = 10; i <= 13; i++) {
      worksheet.getColumn(i).width = 9;
    }

    // Surprise Quiz
    for (let i = 14; i <= 17; i++) {
      worksheet.getColumn(i).width = 9;
    }

    // Assignment
    for (let i = 18; i <= 23; i++) {
      worksheet.getColumn(i).width = 9;
    }

    // End Sem
    for (let i = 24; i <= 29; i++) {
      worksheet.getColumn(i).width = 9;
    }

    // =========================================================
    // 20. PAGE SETUP
    // =========================================================

    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: worksheet.PAPERSIZE_A4,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    };

    worksheet.pageSetup.margins = {
      left: 0.25,
      right: 0.25,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    };

    // =========================================================
    // 21. FINAL VALIDATION BEFORE SENDING
    // =========================================================

    const finalRow =
      worksheet.getRow(maxMarksRowNumber);

    const finalValue = String(
      finalRow.getCell(1).value ?? ""
    )
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    console.log(
      "========================================"
    );

    console.log(
      "Max Marks/CO row:",
      maxMarksRowNumber
    );

    console.log(
      "Max Marks/CO cell value:",
      JSON.stringify(finalValue)
    );

    console.log(
      "Worksheet row count:",
      worksheet.rowCount
    );

    console.log(
      "========================================"
    );

    if (finalValue !== "Max Marks/CO") {
      throw new Error(
        `Failed to create Max Marks/CO row. Found: "${finalValue}"`
      );
    }

    if (
      maxMarksRowNumber !== worksheet.rowCount
    ) {
      throw new Error(
        "Max Marks/CO row is not the final row of the worksheet."
      );
    }

    // =========================================================
    // 22. RESPONSE HEADERS
    // =========================================================

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${subjectId}_Consolidated_Marks_${academicYear}.xlsx"`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // =========================================================
    // 23. WRITE FILE
    // =========================================================

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {
    console.error(
      "Error generating consolidated sheet:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message:
          "Internal server error processing download",
        error: error.message,
      });
    }

    res.end();
  }
};
    
    module.exports = {
        handleProcessInternalMarks,
        handleDownloadFormattedSheet
    };