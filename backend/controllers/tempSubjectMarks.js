// // controllers/marksController.js
// const xlsx = require('xlsx');
// const fs = require('fs');
// const exceljs = require('exceljs');
// const SubjectMarks = require('../models/TempSubjectMarks'); // Ensure this matches your exact model filename

// // -------------------------------------------------------------
// // Helper Functions
// // -------------------------------------------------------------

// const extractValue = (row, possibleNames) => {
//   if (!row) return 0;
//   const rowKeys = Object.keys(row);
//   const matchedKey = rowKeys.find((key) =>
//     possibleNames.some((name) => key.toLowerCase().includes(name.toLowerCase()))
//   );
//   return matchedKey ? parseFloat(row[matchedKey]) || 0 : 0;
// };

// const extractExactMark = (row, exactName) => {
//   if (!row) return 0;
//   const rowKeys = Object.keys(row);
//   const matchedKey = rowKeys.find(key => key.trim().toLowerCase() === exactName.toLowerCase());
//   return matchedKey ? parseFloat(row[matchedKey]) || 0 : 0;
// };

// const extractTextValue = (row, possibleNames) => {
//   if (!row) return "";
//   const rowKeys = Object.keys(row);
//   const matchedKey = rowKeys.find((key) =>
//     possibleNames.some((name) => key.toLowerCase().includes(name.toLowerCase()))
//   );
//   return matchedKey ? String(row[matchedKey]).trim() : "";
// };

// const fillCOs = (totalScore, maxMarksArray) => {
//   let remainingCents = Math.round((parseFloat(totalScore) || 0) * 100);
//   return maxMarksArray.map((maxMark) => {
//     const maxMarkCents = Math.round(maxMark * 100);
//     if (remainingCents >= maxMarkCents) {
//       remainingCents -= maxMarkCents;
//       return maxMark;
//     } else if (remainingCents > 0) {
//       const assigned = remainingCents / 100;
//       remainingCents = 0;
//       return assigned;
//     } else {
//       return 0;
//     }
//   });
// };

// const findHeaderRow = (rawData) => {
//   for (let i = 0; i < Math.min(15, rawData.length); i++) {
//     const row = rawData[i];
//     if (!row) continue;
//     const foundRegKey = row.find((cell) => {
//       if (!cell) return false;
//       const cellStr = cell.toString().toLowerCase().replace(/\s+/g, "");
//       return (cellStr === "regno" || cellStr === "rollno" || cellStr === "registrationno");
//     });
//     if (foundRegKey) return { index: i, key: foundRegKey };
//   }
//   return { index: -1, key: "" };
// };

// const isValidRegNo = (regNo) => {
//   if (!regNo) return false;
//   const lower = regNo.toString().toLowerCase().trim();
  
//   // Ignore common Excel footers, headers, or empty cells
//   if (
//     lower.includes('sikkim') || 
//     lower.includes('subject') || 
//     lower.includes('reg') || 
//     lower.includes('name') || 
//     lower.includes('total') ||
//     lower === ''
//   ) {
//     return false;
//   }
  
//   // Registration numbers should be at least 5 characters long
//   if (lower.length < 5) return false;
  
//   return true;
// };

// // -------------------------------------------------------------
// // Main Controller
// // -------------------------------------------------------------

// const processAssessmentFiles = async (req, res) => {
//   try {
//     // 1. Validate both files are present
//     if (!req.files || !req.files['internalMarks'] || !req.files['externalMarks']) {
//       return res.status(400).json({ message: "Both internalMarks and externalMarks files are required." });
//     }

//     // Capture subjectId from req.body alongside academicYear and course
//     const { academicYear, course, subjectId } = req.body;
//     const courseName = course || "BCA";
//     const internalFile = req.files['internalMarks'][0];
//     const externalFile = req.files['externalMarks'][0];

//     if (!academicYear) {
//       fs.unlinkSync(internalFile.path);
//       fs.unlinkSync(externalFile.path);
//       return res.status(400).json({ message: "Academic Year is required." });
//     }

//     const studentMap = {}; 
//     let subCode = "SUBJECT_CODE";
//     let subName = "SUBJECT_NAME";

//     // ==========================================
//     // 2. PROCESS INTERNAL FILE
//     // ==========================================
//     const intWorkbook = xlsx.readFile(internalFile.path);
//     const intSheetName = intWorkbook.SheetNames[0];
//     const intRawData = xlsx.utils.sheet_to_json(intWorkbook.Sheets[intSheetName], { header: 1 });
    
//     const intHeaderInfo = findHeaderRow(intRawData);
//     if (intHeaderInfo.index !== -1) {
//       const intData = xlsx.utils.sheet_to_json(intWorkbook.Sheets[intSheetName], { range: intHeaderInfo.index });
      
//       // Extract Subject Code and Name accurately from the first actual data row
//       if (intData.length > 0) {
//         const firstRow = intData[0];
//         const scKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub code') || key.toLowerCase().includes('subject code'));
//         const snKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub name') || key.toLowerCase().includes('subject name'));
        
//         if (scKey && firstRow[scKey]) subCode = String(firstRow[scKey]).trim();
//         if (snKey && firstRow[snKey]) subName = String(firstRow[snKey]).trim();
//       }

//       for (const row of intData) {
//         const actualRegKey = Object.keys(row).find(key => key.toString().trim() === intHeaderInfo.key.toString().trim());
//         if (!actualRegKey || !row[actualRegKey]) continue;

//         const regNo = String(row[actualRegKey]).trim();
        
//         // Skip if this isn't a valid registration number
//         if (!isValidRegNo(regNo)) continue;

//         const q1Total = extractValue(row, ["quiz1", "quiz 1", "q1"]);
//         const midTotal = extractValue(row, ["mid-sem", "midsem", "mid term", "mid exam"]);
//         const q2Total = extractValue(row, ["quiz2", "quiz 2", "q2"]);
//         const sqTotal = extractValue(row, ["quiz3", "quiz 3", "q3", "surprise"]);
//         const assignTotal = extractValue(row, ["assign", "assignment"]);

//         const [q1_CO1, q1_CO2, q1_CO3] = fillCOs(q1Total, [2, 2, 1]);
//         const [q2_CO1, q2_CO2, q2_CO3] = fillCOs(q2Total, [2, 2, 1]);
//         const [sq_CO1, sq_CO2, sq_CO3] = fillCOs(sqTotal, [2, 2, 1]);
//         const [mid_CO1, mid_CO2, mid_CO3] = fillCOs(midTotal, [20, 20, 10]);
//         const [assign_CO1, assign_CO2, assign_CO3, assign_CO4, assign_CO5] = fillCOs(assignTotal, [1, 1, 1, 1, 1]);

//         studentMap[regNo] = {
//           regNo: regNo,
//           marks: {
//             Quiz_1_CO1: q1_CO1, Quiz_1_CO2: q1_CO2, Quiz_1_CO3: q1_CO3, Quiz_1_TOTAL: q1Total,
//             Mid_Term_CO1: mid_CO1, Mid_Term_CO2: mid_CO2, Mid_Term_CO3: mid_CO3, Mid_Term_TOTAL: midTotal,
//             Quiz_2_CO1: q2_CO1, Quiz_2_CO2: q2_CO2, Quiz_2_CO3: q2_CO3, Quiz_2_TOTAL: q2Total,
//             Surprise_Quiz_CO1: sq_CO1, Surprise_Quiz_CO2: sq_CO2, Surprise_Quiz_CO3: sq_CO3, Surprise_Quiz_TOTAL: sqTotal,
//             Assignment_CO1: assign_CO1, Assignment_CO2: assign_CO2, Assignment_CO3: assign_CO3, Assignment_CO4: assign_CO4, Assignment_CO5: assign_CO5, Assignment_TOTAL: assignTotal,
//             End_Sem_CO1: 0, End_Sem_CO2: 0, End_Sem_CO3: 0, End_Sem_CO4: 0, End_Sem_CO5: 0, End_Sem_TOTAL: 0
//           }
//         };
//       }
//     }

//     // ==========================================
//     // 3. PROCESS EXTERNAL FILE
//     // ==========================================
//     const extWorkbook = xlsx.readFile(externalFile.path);
//     const extSheetName = extWorkbook.SheetNames[0];
//     const extRawData = xlsx.utils.sheet_to_json(extWorkbook.Sheets[extSheetName], { header: 1 });
    
//     const extHeaderInfo = findHeaderRow(extRawData);
//     if (extHeaderInfo.index !== -1) {
//       const extData = xlsx.utils.sheet_to_json(extWorkbook.Sheets[extSheetName], { range: extHeaderInfo.index });

//       // Fallback: If internal file lacked subject code, extract it from external file
//       if (subCode === "SUBJECT_CODE" && extData.length > 0) {
//         const firstRow = extData[0];
//         const scKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub code') || key.toLowerCase().includes('subject code'));
//         const snKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub name') || key.toLowerCase().includes('subject name'));
        
//         if (scKey && firstRow[scKey]) subCode = String(firstRow[scKey]).trim();
//         if (snKey && firstRow[snKey]) subName = String(firstRow[snKey]).trim();
//       }

//       for (const row of extData) {
//         const actualRegKey = Object.keys(row).find(key => key.toString().trim() === extHeaderInfo.key.toString().trim());
//         if (!actualRegKey || !row[actualRegKey]) continue;

//         const regNo = String(row[actualRegKey]).trim();
        
//         if (!isValidRegNo(regNo)) continue;

//         const remarks = extractTextValue(row, ["remarks"]).toUpperCase();
//         const ansBook = extractTextValue(row, ["ans book", "ab/dt/mp"]).toUpperCase();
        
//         // Remove students entirely if Absent or Left
//         if (remarks.includes('LEFT') || remarks.includes('AB') || ansBook.includes('AB') || ansBook === 'ABSENT') {
//           if (studentMap[regNo]) {
//             delete studentMap[regNo];
//           }
//           continue; 
//         }

//         let es_co1 = extractExactMark(row, '1a') + extractExactMark(row, '1b');
//         let es_co2 = extractExactMark(row, '2a') + extractExactMark(row, '2b');
//         let es_co3 = extractExactMark(row, '3a') + extractExactMark(row, '3b');
//         let es_co4 = extractExactMark(row, '4a') + extractExactMark(row, '4b');
//         let es_co5 = extractExactMark(row, '5a') + extractExactMark(row, '5b');
        
//         const es_Total = es_co1 + es_co2 + es_co3 + es_co4 + es_co5;

//         if (!studentMap[regNo]) {
//           studentMap[regNo] = {
//             regNo: regNo,
//             marks: {
//               Quiz_1_CO1: 0, Quiz_1_CO2: 0, Quiz_1_CO3: 0, Quiz_1_TOTAL: 0,
//               Mid_Term_CO1: 0, Mid_Term_CO2: 0, Mid_Term_CO3: 0, Mid_Term_TOTAL: 0,
//               Quiz_2_CO1: 0, Quiz_2_CO2: 0, Quiz_2_CO3: 0, Quiz_2_TOTAL: 0,
//               Surprise_Quiz_CO1: 0, Surprise_Quiz_CO2: 0, Surprise_Quiz_CO3: 0, Surprise_Quiz_TOTAL: 0,
//               Assignment_CO1: 0, Assignment_CO2: 0, Assignment_CO3: 0, Assignment_CO4: 0, Assignment_CO5: 0, Assignment_TOTAL: 0,
//             }
//           };
//         }

//         studentMap[regNo].marks.End_Sem_CO1 = es_co1;
//         studentMap[regNo].marks.End_Sem_CO2 = es_co2;
//         studentMap[regNo].marks.End_Sem_CO3 = es_co3;
//         studentMap[regNo].marks.End_Sem_CO4 = es_co4;
//         studentMap[regNo].marks.End_Sem_CO5 = es_co5;
//         studentMap[regNo].marks.End_Sem_TOTAL = es_Total;
//       }
//     }

//     // ==========================================
//     // 4. SAVE TO MONGODB
//     // ==========================================
//     const parsedStudents = Object.values(studentMap);

//     // Prefer the subjectId from req.body, but fallback to the extracted subCode
//     const queryId = subjectId || subCode;

//     let subjectRecord = await SubjectMarks.findOne({
//       subjectId: queryId,
//       academicYear: academicYear,
//     });

//     if (!subjectRecord) {
//       subjectRecord = new SubjectMarks({
//         academicYear: academicYear,
//         course: courseName,
//         subjectId: queryId,    
//         subjectCode: subCode,  
//         subjectName: subName,  
//       });
//     } else {
//       subjectRecord.subjectCode = subCode;
//       subjectRecord.subjectName = subName; 
//     }

//     subjectRecord.maxMarks = {
//       Quiz_1_CO1: 2, Quiz_1_CO2: 2, Quiz_1_CO3: 1, Quiz_1_TOTAL: 5,
//       Mid_Term_CO1: 20, Mid_Term_CO2: 20, Mid_Term_CO3: 10, Mid_Term_TOTAL: 50,
//       Quiz_2_CO1: 2, Quiz_2_CO2: 2, Quiz_2_CO3: 1, Quiz_2_TOTAL: 5,
//       Surprise_Quiz_CO1: 2, Surprise_Quiz_CO2: 2, Surprise_Quiz_CO3: 1, Surprise_Quiz_TOTAL: 5,
//       Assignment_CO1: 1, Assignment_CO2: 1, Assignment_CO3: 1, Assignment_CO4: 1, Assignment_CO5: 1, Assignment_TOTAL: 5,
//       End_Sem_CO1: 20, End_Sem_CO2: 20, End_Sem_CO3: 20, End_Sem_CO4: 20, End_Sem_CO5: 20, End_Sem_TOTAL: 100
//     };

//     subjectRecord.actualMarks = parsedStudents;
//     subjectRecord.uploadedAt = Date.now();
//     await subjectRecord.save();

//     // ==========================================
//     // 5. GENERATE EXCEL EXPORT
//     // ==========================================
//     const outputData = [];
//     const titleRow = `${subCode} - ${subName} (${academicYear}) Complete Marks Mapping`;
//     outputData.push([titleRow]);
    
//     outputData.push([
//       "Reg No", "Quiz 1", "", "", "", "Mid Term", "", "", "", "Quiz 2", "", "", "", 
//       "Surprise Quiz", "", "", "", "Assignment", "", "", "", "", "", "End Sem", "", "", "", "", "", ""
//     ]);
    
//     outputData.push([
//       "", "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "CO4", "CO5", "Total", "CO1", "CO2", "CO3", "CO4", "CO5", "Total"
//     ]);

//     for (const student of parsedStudents) {
//       const m = student.marks;
//       outputData.push([
//         student.regNo,
//         m.Quiz_1_CO1, m.Quiz_1_CO2, m.Quiz_1_CO3, m.Quiz_1_TOTAL,
//         m.Mid_Term_CO1, m.Mid_Term_CO2, m.Mid_Term_CO3, m.Mid_Term_TOTAL,
//         m.Quiz_2_CO1, m.Quiz_2_CO2, m.Quiz_2_CO3, m.Quiz_2_TOTAL,
//         m.Surprise_Quiz_CO1, m.Surprise_Quiz_CO2, m.Surprise_Quiz_CO3, m.Surprise_Quiz_TOTAL,
//         m.Assignment_CO1, m.Assignment_CO2, m.Assignment_CO3, m.Assignment_CO4, m.Assignment_CO5, m.Assignment_TOTAL,
//         m.End_Sem_CO1, m.End_Sem_CO2, m.End_Sem_CO3, m.End_Sem_CO4, m.End_Sem_CO5, m.End_Sem_TOTAL
//       ]);
//     }

//     const newWb = xlsx.utils.book_new();
//     const newWs = xlsx.utils.aoa_to_sheet(outputData);

//     newWs["!merges"] = [
//       { s: { r: 0, c: 0 }, e: { r: 0, c: 28 } }, 
//       { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },  
//       { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },  
//       { s: { r: 1, c: 5 }, e: { r: 1, c: 8 } },  
//       { s: { r: 1, c: 9 }, e: { r: 1, c: 12 } }, 
//       { s: { r: 1, c: 13 }, e: { r: 1, c: 16 } }, 
//       { s: { r: 1, c: 17 }, e: { r: 1, c: 22 } }, 
//       { s: { r: 1, c: 23 }, e: { r: 1, c: 28 } }, 
//     ];

//     xlsx.utils.book_append_sheet(newWb, newWs, "Combined Mapping");
//     const buffer = xlsx.write(newWb, { type: "buffer", bookType: "xlsx" });

//     // Clean up temporary files
//     fs.unlinkSync(internalFile.path);
//     fs.unlinkSync(externalFile.path);

//     res.setHeader("Content-Disposition", `attachment; filename="${subCode}_Complete_Mapping.xlsx"`);
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     return res.send(buffer);

//   } catch (error) {
//     if (req.files) {
//       if (req.files['internalMarks'] && fs.existsSync(req.files['internalMarks'][0].path)) {
//         fs.unlinkSync(req.files['internalMarks'][0].path);
//       }
//       if (req.files['externalMarks'] && fs.existsSync(req.files['externalMarks'][0].path)) {
//         fs.unlinkSync(req.files['externalMarks'][0].path);
//       }
//     }
//     console.error("Error processing marks files:", error);
//     res.status(500).json({
//       message: "Internal server error processing files",
//       error: error.message,
//     });
//   }
// };





















// /**
//  * GET Controller to download the fully mapped internal and external marks
//  * with EXACT styling matching "Java Programming (1).xlsx".
//  * Expects ?subjectId=XXX & academicYear=YYYY in the query string.
//  */
// const downloadMappedMarks = async (req, res) => {
//   try {
//     const { subjectId, academicYear } = req.query;

//     if (!subjectId || !academicYear) {
//       return res.status(400).json({ 
//         message: "subjectId and academicYear are required query parameters." 
//       });
//     }

//     // 1. Fetch the unified data from MongoDB
//     const subjectRecord = await SubjectMarks.findOne({ subjectId, academicYear });

//     if (!subjectRecord) {
//       return res.status(404).json({ 
//         message: "No records found for the specified subject and academic year." 
//       });
//     }

//     const subCode = subjectRecord.subjectCode || subjectRecord.subjectId || "SUBJECT";
//     const subName = subjectRecord.subjectName || "MARKS";
//     const actualMarks = subjectRecord.actualMarks || [];
//     const maxMarks = subjectRecord.maxMarks || {};

//     // 2. Initialize ExcelJS Workbook
//     const workbook = new exceljs.Workbook();
//     const sheet = workbook.addWorksheet("Sheet1");

//     // Helper Objects for Styling
//     const thinBorder = {
//       top: { style: 'thin' },
//       left: { style: 'thin' },
//       bottom: { style: 'thin' },
//       right: { style: 'thin' }
//     };
    
//     const centerAlign = { vertical: 'middle', horizontal: 'center' };

//     // Hex colors matching the original Excel file
//     const colors = {
//       regNo: 'FFD99694',       // Dusty Rose / Peach
//       quiz1: 'FFCCC1DA',       // Lavender / Light Purple
//       midTerm: 'FFC5D9F1',     // Light Blue (Theme 9 Tint 0.8)
//       quiz2: 'FFCCC1DA',       // Lavender / Light Purple
//       surpriseQuiz: 'FFC5D9F1',// Light Blue
//       assignment: 'FFCCC1DA',  // Lavender / Light Purple
//       endSem: 'FFC5D9F1'       // Light Blue
//     };

//     // 3. Build Header Rows
//     // We add blank arrays first to establish the rows, then fill and style them.
//     const row1 = sheet.addRow([
//       "Reg No", 
//       "Quiz 1", "", "", "", 
//       "Mid Term", "", "", "", 
//       "Quiz 2", "", "", "", 
//       "Surprise Quiz", "", "", "", 
//       "Assignment", "", "", "", "", "", 
//       "End Sem", "", "", "", "", ""
//     ]);

//     const row2 = sheet.addRow([
//       "", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "CO4", "CO5", "Total", 
//       "CO1", "CO2", "CO3", "CO4", "CO5", "Total"
//     ]);

//     // 4. Merge Header Cells
//     sheet.mergeCells('A1:A2'); // Reg No
//     sheet.mergeCells('B1:E1'); // Quiz 1
//     sheet.mergeCells('F1:I1'); // Mid Term
//     sheet.mergeCells('J1:M1'); // Quiz 2
//     sheet.mergeCells('N1:Q1'); // Surprise Quiz
//     sheet.mergeCells('R1:W1'); // Assignment
//     sheet.mergeCells('X1:AC1');// End Sem

//     // Helper function to apply color to a specific block of columns
//     const applyColorToBlock = (rowObj, startCol, endCol, colorHex) => {
//       for (let i = startCol; i <= endCol; i++) {
//         const cell = rowObj.getCell(i);
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: colorHex }
//         };
//       }
//     };

//     // Style Row 1 & Row 2 Colors
//     applyColorToBlock(row1, 1, 1, colors.regNo);
//     applyColorToBlock(row1, 2, 5, colors.quiz1);
//     applyColorToBlock(row1, 6, 9, colors.midTerm);
//     applyColorToBlock(row1, 10, 13, colors.quiz2);
//     applyColorToBlock(row1, 14, 17, colors.surpriseQuiz);
//     applyColorToBlock(row1, 18, 23, colors.assignment);
//     applyColorToBlock(row1, 24, 29, colors.endSem);

//     applyColorToBlock(row2, 2, 5, colors.quiz1);
//     applyColorToBlock(row2, 6, 9, colors.midTerm);
//     applyColorToBlock(row2, 10, 13, colors.quiz2);
//     applyColorToBlock(row2, 14, 17, colors.surpriseQuiz);
//     applyColorToBlock(row2, 18, 23, colors.assignment);
//     applyColorToBlock(row2, 24, 29, colors.endSem);

//     // 5. Populate Data Rows
//     for (const student of actualMarks) {
//       const m = student.marks || {};
//       sheet.addRow([
//         student.regNo,
//         m.Quiz_1_CO1, m.Quiz_1_CO2, m.Quiz_1_CO3, m.Quiz_1_TOTAL,
//         m.Mid_Term_CO1, m.Mid_Term_CO2, m.Mid_Term_CO3, m.Mid_Term_TOTAL,
//         m.Quiz_2_CO1, m.Quiz_2_CO2, m.Quiz_2_CO3, m.Quiz_2_TOTAL,
//         m.Surprise_Quiz_CO1, m.Surprise_Quiz_CO2, m.Surprise_Quiz_CO3, m.Surprise_Quiz_TOTAL,
//         m.Assignment_CO1, m.Assignment_CO2, m.Assignment_CO3, m.Assignment_CO4, m.Assignment_CO5, m.Assignment_TOTAL,
//         m.End_Sem_CO1, m.End_Sem_CO2, m.End_Sem_CO3, m.End_Sem_CO4, m.End_Sem_CO5, m.End_Sem_TOTAL
//       ]);
//     }

//     // 6. Append "Max Marks/CO" Row
//     sheet.addRow([
//         "Max Marks/CO",
//         maxMarks.Quiz_1_CO1 || 2, maxMarks.Quiz_1_CO2 || 2, maxMarks.Quiz_1_CO3 || 1, maxMarks.Quiz_1_TOTAL || 5,
//         maxMarks.Mid_Term_CO1 || 20, maxMarks.Mid_Term_CO2 || 20, maxMarks.Mid_Term_CO3 || 10, maxMarks.Mid_Term_TOTAL || 50,
//         maxMarks.Quiz_2_CO1 || 2, maxMarks.Quiz_2_CO2 || 2, maxMarks.Quiz_2_CO3 || 1, maxMarks.Quiz_2_TOTAL || 5,
//         maxMarks.Surprise_Quiz_CO1 || 2, maxMarks.Surprise_Quiz_CO2 || 2, maxMarks.Surprise_Quiz_CO3 || 1, maxMarks.Surprise_Quiz_TOTAL || 5,
//         maxMarks.Assignment_CO1 || 1, maxMarks.Assignment_CO2 || 1, maxMarks.Assignment_CO3 || 1, maxMarks.Assignment_CO4 || 1, maxMarks.Assignment_CO5 || 1, maxMarks.Assignment_TOTAL || 5,
//         maxMarks.End_Sem_CO1 || 20, maxMarks.End_Sem_CO2 || 20, maxMarks.End_Sem_CO3 || 20, maxMarks.End_Sem_CO4 || 20, maxMarks.End_Sem_CO5 || 20, maxMarks.End_Sem_TOTAL || 100
//     ]);

//     // 7. Apply Universal Alignment and Borders to every populated cell
//     sheet.eachRow((row, rowNumber) => {
//       row.eachCell((cell, colNumber) => {
//         cell.border = thinBorder;
//         cell.alignment = centerAlign;
        
//         // Font style defaults to Calibri size 11 in Exceljs, making it exactly like original
//         cell.font = { name: 'Calibri', size: 10 };
//       });
//     });

//     // 8. Adjust Column Widths to ensure data fits neatly
//     sheet.getColumn(1).width = 15; // Reg No Column slightly wider
//     for(let i = 2; i <= 29; i++){
//         sheet.getColumn(i).width = 8; // Shrink CO columns so the table isn't massively wide
//     }

//     // 9. Send the output
//     const safeSubName = subName.replace(/[^a-zA-Z0-9 -]/g, ""); 
//     const fileName = `${subCode}_${safeSubName}.xlsx`;

//     res.setHeader(
//       "Content-Disposition", 
//       `attachment; filename="${fileName}"`
//     );
//     res.setHeader(
//       "Content-Type", 
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
    
//     // Write directly to the Express response stream
//     await workbook.xlsx.write(res);
//     res.end();

//   } catch (error) {
//     console.error("Error downloading marks:", error);
//     res.status(500).json({ 
//       message: "Internal server error downloading marks", 
//       error: error.message 
//     });
//   }
// };


// module.exports = {
//   processAssessmentFiles,
//   downloadMappedMarks
// };








































// // controllers/marksController.js
// const xlsx = require('xlsx');
// const fs = require('fs');
// const exceljs = require('exceljs');
// const SubjectMarks = require('../models/TempSubjectMarks'); // Ensure this matches your exact model filename

// // -------------------------------------------------------------
// // Helper Functions
// // -------------------------------------------------------------

// const extractValue = (row, possibleNames) => {
//   if (!row) return 0;
//   const rowKeys = Object.keys(row);
//   const matchedKey = rowKeys.find((key) =>
//     possibleNames.some((name) => key.toLowerCase().includes(name.toLowerCase()))
//   );
//   return matchedKey ? parseFloat(row[matchedKey]) || 0 : 0;
// };

// const extractExactMark = (row, exactName) => {
//   if (!row) return 0;
//   const rowKeys = Object.keys(row);
//   const matchedKey = rowKeys.find(key => key.trim().toLowerCase() === exactName.toLowerCase());
//   return matchedKey ? parseFloat(row[matchedKey]) || 0 : 0;
// };

// const extractTextValue = (row, possibleNames) => {
//   if (!row) return "";
//   const rowKeys = Object.keys(row);
//   const matchedKey = rowKeys.find((key) =>
//     possibleNames.some((name) => key.toLowerCase().includes(name.toLowerCase()))
//   );
//   return matchedKey ? String(row[matchedKey]).trim() : "";
// };

// const findHeaderRow = (rawData) => {
//   for (let i = 0; i < Math.min(15, rawData.length); i++) {
//     const row = rawData[i];
//     if (!row) continue;
//     const foundRegKey = row.find((cell) => {
//       if (!cell) return false;
//       const cellStr = cell.toString().toLowerCase().replace(/\s+/g, "");
//       return (cellStr === "regno" || cellStr === "rollno" || cellStr === "registrationno");
//     });
//     if (foundRegKey) return { index: i, key: foundRegKey };
//   }
//   return { index: -1, key: "" };
// };

// const isValidRegNo = (regNo) => {
//   if (!regNo) return false;
//   const lower = regNo.toString().toLowerCase().trim();
  
//   // Ignore common Excel footers, headers, or empty cells
//   if (
//     lower.includes('sikkim') || 
//     lower.includes('subject') || 
//     lower.includes('reg') || 
//     lower.includes('name') || 
//     lower.includes('total') ||
//     lower === ''
//   ) {
//     return false;
//   }
  
//   // Registration numbers should be at least 5 characters long
//   if (lower.length < 5) return false;
  
//   return true;
// };

// // ==============================================================
// // ADVANCED ATTAINMENT-AWARE fillCOs
// // ==============================================================
// const fillCOs = (totalMark, maxMarks) => {
//   let total = parseFloat(totalMark) || 0;
  
//   if (total <= 0) return maxMarks.map(() => 0);
  
//   const totalMax = maxMarks.reduce((sum, max) => sum + max, 0);
  
//   // Safety Cap: Prevent total marks exceeding max allowed
//   if (total > totalMax) total = totalMax;

//   const ATTAINMENT_THRESHOLD = 0.60; // 60% for NBA/OBE attainment
  
//   // Convert to hundreds for perfect integer math (avoids JS floating-point errors)
//   let remainingInt = Math.round(total * 100);
//   const maxMarksInt = maxMarks.map(m => Math.round(m * 100));
//   const totalMaxInt = Math.round(totalMax * 100);
  
//   let resultInt = maxMarks.map(() => 0);

//   // Step 1: Proportional Distribution
//   for (let i = 0; i < maxMarks.length; i++) {
//     let baseShare = (maxMarksInt[i] / totalMaxInt) * (total * 100);
//     let baseMarksInt = Math.floor(baseShare / 100) * 100;
    
//     resultInt[i] = baseMarksInt;
//     remainingInt -= baseMarksInt;
//   }

//   // Step 2: "Attainment-Aware" Leftover Distribution
//   while (remainingInt > 0) {
//     let indices = maxMarks.map((_, i) => i).filter(i => resultInt[i] < maxMarksInt[i]);
//     if (indices.length === 0) break; 

//     indices.sort((a, b) => {
//       let targetA = maxMarksInt[a] * ATTAINMENT_THRESHOLD;
//       let targetB = maxMarksInt[b] * ATTAINMENT_THRESHOLD;
//       let deficitA = targetA - resultInt[a];
//       let deficitB = targetB - resultInt[b];

//       let aNeedsHelp = deficitA > 0;
//       let bNeedsHelp = deficitB > 0;

//       if (aNeedsHelp && !bNeedsHelp) return -1;
//       if (!aNeedsHelp && bNeedsHelp) return 1;
//       if (aNeedsHelp && bNeedsHelp) return deficitA - deficitB; // Closest to threshold gets priority
//       return Math.random() - 0.5; // Natural randomness if attainment is met
//     });

//     let i = indices[0];
    
//     let chunk = remainingInt >= 100 ? 100 : remainingInt;

//     if (resultInt[i] + chunk <= maxMarksInt[i]) {
//       resultInt[i] += chunk;
//       remainingInt -= chunk;
//     } else {
//       let space = maxMarksInt[i] - resultInt[i];
//       resultInt[i] += space;
//       remainingInt -= space;
//     }
//   }

//   // Convert back to standard decimals
//   let finalResult = resultInt.map(val => Math.round(val) / 100);
  
//   // Step 3: Strict Match Failsafe
//   let currentSum = finalResult.reduce((sum, val) => sum + val, 0);
//   currentSum = Math.round(currentSum * 100) / 100;
//   let targetTotal = Math.round(total * 100) / 100;

//   if (currentSum !== targetTotal) {
//     let diff = Math.round((targetTotal - currentSum) * 100) / 100;
    
//     for (let i = 0; i < finalResult.length; i++) {
//       if (diff > 0 && finalResult[i] + diff <= maxMarks[i]) {
//         finalResult[i] = Math.round((finalResult[i] + diff) * 100) / 100;
//         break; 
//       } else if (diff < 0 && finalResult[i] + diff >= 0) {
//         finalResult[i] = Math.round((finalResult[i] + diff) * 100) / 100;
//         break; 
//       }
//     }
//   }

//   return finalResult;
// };

// // -------------------------------------------------------------
// // Main Controller
// // -------------------------------------------------------------

// const processAssessmentFiles = async (req, res) => {
//   try {
//     // 1. Validate both files are present
//     if (!req.files || !req.files['internalMarks'] || !req.files['externalMarks']) {
//       return res.status(400).json({ message: "Both internalMarks and externalMarks files are required." });
//     }

//     // Capture subjectId from req.body alongside academicYear and course
//     const { academicYear, course, subjectId } = req.body;
//     const courseName = course || "BCA";
//     const internalFile = req.files['internalMarks'][0];
//     const externalFile = req.files['externalMarks'][0];

//     if (!academicYear) {
//       fs.unlinkSync(internalFile.path);
//       fs.unlinkSync(externalFile.path);
//       return res.status(400).json({ message: "Academic Year is required." });
//     }

//     const studentMap = {}; 
//     let subCode = "SUBJECT_CODE";
//     let subName = "SUBJECT_NAME";

//     // ==========================================
//     // 2. PROCESS INTERNAL FILE
//     // ==========================================
//     const intWorkbook = xlsx.readFile(internalFile.path);
//     const intSheetName = intWorkbook.SheetNames[0];
//     const intRawData = xlsx.utils.sheet_to_json(intWorkbook.Sheets[intSheetName], { header: 1 });
    
//     const intHeaderInfo = findHeaderRow(intRawData);
//     if (intHeaderInfo.index !== -1) {
//       const intData = xlsx.utils.sheet_to_json(intWorkbook.Sheets[intSheetName], { range: intHeaderInfo.index });
      
//       // Extract Subject Code and Name accurately from the first actual data row
//       if (intData.length > 0) {
//         const firstRow = intData[0];
//         const scKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub code') || key.toLowerCase().includes('subject code'));
//         const snKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub name') || key.toLowerCase().includes('subject name'));
        
//         if (scKey && firstRow[scKey]) subCode = String(firstRow[scKey]).trim();
//         if (snKey && firstRow[snKey]) subName = String(firstRow[snKey]).trim();
//       }

//       for (const row of intData) {
//         const actualRegKey = Object.keys(row).find(key => key.toString().trim() === intHeaderInfo.key.toString().trim());
//         if (!actualRegKey || !row[actualRegKey]) continue;

//         const regNo = String(row[actualRegKey]).trim();
        
//         // Skip if this isn't a valid registration number
//         if (!isValidRegNo(regNo)) continue;

//         const q1Total = extractValue(row, ["quiz1", "quiz 1", "q1"]);
//         const midTotal = extractValue(row, ["mid-sem", "midsem", "mid term", "mid exam"]);
//         const q2Total = extractValue(row, ["quiz2", "quiz 2", "q2"]);
//         const sqTotal = extractValue(row, ["quiz3", "quiz 3", "q3", "surprise"]);
//         const assignTotal = extractValue(row, ["assign", "assignment"]);

//         const [q1_CO1, q1_CO2, q1_CO3] = fillCOs(q1Total, [2, 2, 1]);
//         const [q2_CO1, q2_CO2, q2_CO3] = fillCOs(q2Total, [2, 2, 1]);
//         const [sq_CO1, sq_CO2, sq_CO3] = fillCOs(sqTotal, [2, 2, 1]);
//         const [mid_CO1, mid_CO2, mid_CO3] = fillCOs(midTotal, [20, 20, 10]);
//         const [assign_CO1, assign_CO2, assign_CO3, assign_CO4, assign_CO5] = fillCOs(assignTotal, [1, 1, 1, 1, 1]);

//         studentMap[regNo] = {
//           regNo: regNo,
//           marks: {
//             Quiz_1_CO1: q1_CO1, Quiz_1_CO2: q1_CO2, Quiz_1_CO3: q1_CO3, Quiz_1_TOTAL: q1Total,
//             Mid_Term_CO1: mid_CO1, Mid_Term_CO2: mid_CO2, Mid_Term_CO3: mid_CO3, Mid_Term_TOTAL: midTotal,
//             Quiz_2_CO1: q2_CO1, Quiz_2_CO2: q2_CO2, Quiz_2_CO3: q2_CO3, Quiz_2_TOTAL: q2Total,
//             Surprise_Quiz_CO1: sq_CO1, Surprise_Quiz_CO2: sq_CO2, Surprise_Quiz_CO3: sq_CO3, Surprise_Quiz_TOTAL: sqTotal,
//             Assignment_CO1: assign_CO1, Assignment_CO2: assign_CO2, Assignment_CO3: assign_CO3, Assignment_CO4: assign_CO4, Assignment_CO5: assign_CO5, Assignment_TOTAL: assignTotal,
//             End_Sem_CO1: 0, End_Sem_CO2: 0, End_Sem_CO3: 0, End_Sem_CO4: 0, End_Sem_CO5: 0, End_Sem_TOTAL: 0
//           }
//         };
//       }
//     }

//     // ==========================================
//     // 3. PROCESS EXTERNAL FILE
//     // ==========================================
//     const extWorkbook = xlsx.readFile(externalFile.path);
//     const extSheetName = extWorkbook.SheetNames[0];
//     const extRawData = xlsx.utils.sheet_to_json(extWorkbook.Sheets[extSheetName], { header: 1 });
    
//     const extHeaderInfo = findHeaderRow(extRawData);
//     if (extHeaderInfo.index !== -1) {
//       const extData = xlsx.utils.sheet_to_json(extWorkbook.Sheets[extSheetName], { range: extHeaderInfo.index });

//       // Fallback: If internal file lacked subject code, extract it from external file
//       if (subCode === "SUBJECT_CODE" && extData.length > 0) {
//         const firstRow = extData[0];
//         const scKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub code') || key.toLowerCase().includes('subject code'));
//         const snKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub name') || key.toLowerCase().includes('subject name'));
        
//         if (scKey && firstRow[scKey]) subCode = String(firstRow[scKey]).trim();
//         if (snKey && firstRow[snKey]) subName = String(firstRow[snKey]).trim();
//       }

//       for (const row of extData) {
//         const actualRegKey = Object.keys(row).find(key => key.toString().trim() === extHeaderInfo.key.toString().trim());
//         if (!actualRegKey || !row[actualRegKey]) continue;

//         const regNo = String(row[actualRegKey]).trim();
        
//         if (!isValidRegNo(regNo)) continue;

//         const remarks = extractTextValue(row, ["remarks"]).toUpperCase();
//         const ansBook = extractTextValue(row, ["ans book", "ab/dt/mp"]).toUpperCase();
        
//         // Remove students entirely if Absent or Left
//         if (remarks.includes('LEFT') || remarks.includes('AB') || ansBook.includes('AB') || ansBook === 'ABSENT') {
//           if (studentMap[regNo]) {
//             delete studentMap[regNo];
//           }
//           continue; 
//         }

//         let es_co1 = extractExactMark(row, '1a') + extractExactMark(row, '1b');
//         let es_co2 = extractExactMark(row, '2a') + extractExactMark(row, '2b');
//         let es_co3 = extractExactMark(row, '3a') + extractExactMark(row, '3b');
//         let es_co4 = extractExactMark(row, '4a') + extractExactMark(row, '4b');
//         let es_co5 = extractExactMark(row, '5a') + extractExactMark(row, '5b');
        
//         const es_Total = es_co1 + es_co2 + es_co3 + es_co4 + es_co5;

//         if (!studentMap[regNo]) {
//           studentMap[regNo] = {
//             regNo: regNo,
//             marks: {
//               Quiz_1_CO1: 0, Quiz_1_CO2: 0, Quiz_1_CO3: 0, Quiz_1_TOTAL: 0,
//               Mid_Term_CO1: 0, Mid_Term_CO2: 0, Mid_Term_CO3: 0, Mid_Term_TOTAL: 0,
//               Quiz_2_CO1: 0, Quiz_2_CO2: 0, Quiz_2_CO3: 0, Quiz_2_TOTAL: 0,
//               Surprise_Quiz_CO1: 0, Surprise_Quiz_CO2: 0, Surprise_Quiz_CO3: 0, Surprise_Quiz_TOTAL: 0,
//               Assignment_CO1: 0, Assignment_CO2: 0, Assignment_CO3: 0, Assignment_CO4: 0, Assignment_CO5: 0, Assignment_TOTAL: 0,
//             }
//           };
//         }

//         studentMap[regNo].marks.End_Sem_CO1 = es_co1;
//         studentMap[regNo].marks.End_Sem_CO2 = es_co2;
//         studentMap[regNo].marks.End_Sem_CO3 = es_co3;
//         studentMap[regNo].marks.End_Sem_CO4 = es_co4;
//         studentMap[regNo].marks.End_Sem_CO5 = es_co5;
//         studentMap[regNo].marks.End_Sem_TOTAL = es_Total;
//       }
//     }

//     // ==========================================
//     // 4. SAVE TO MONGODB
//     // ==========================================
//     const parsedStudents = Object.values(studentMap);

//     // Prefer the subjectId from req.body, but fallback to the extracted subCode
//     const queryId = subjectId || subCode;

//     let subjectRecord = await SubjectMarks.findOne({
//       subjectId: queryId,
//       academicYear: academicYear,
//     });

//     if (!subjectRecord) {
//       subjectRecord = new SubjectMarks({
//         academicYear: academicYear,
//         course: courseName,
//         subjectId: queryId,    
//         subjectCode: subCode,  
//         subjectName: subName,  
//       });
//     } else {
//       subjectRecord.subjectCode = subCode;
//       subjectRecord.subjectName = subName; 
//     }

//     subjectRecord.maxMarks = {
//       Quiz_1_CO1: 2, Quiz_1_CO2: 2, Quiz_1_CO3: 1, Quiz_1_TOTAL: 5,
//       Mid_Term_CO1: 20, Mid_Term_CO2: 20, Mid_Term_CO3: 10, Mid_Term_TOTAL: 50,
//       Quiz_2_CO1: 2, Quiz_2_CO2: 2, Quiz_2_CO3: 1, Quiz_2_TOTAL: 5,
//       Surprise_Quiz_CO1: 2, Surprise_Quiz_CO2: 2, Surprise_Quiz_CO3: 1, Surprise_Quiz_TOTAL: 5,
//       Assignment_CO1: 1, Assignment_CO2: 1, Assignment_CO3: 1, Assignment_CO4: 1, Assignment_CO5: 1, Assignment_TOTAL: 5,
//       End_Sem_CO1: 20, End_Sem_CO2: 20, End_Sem_CO3: 20, End_Sem_CO4: 20, End_Sem_CO5: 20, End_Sem_TOTAL: 100
//     };

//     subjectRecord.actualMarks = parsedStudents;
//     subjectRecord.uploadedAt = Date.now();
//     await subjectRecord.save();

//     // ==========================================
//     // 5. GENERATE EXCEL EXPORT
//     // ==========================================
//     const outputData = [];
//     const titleRow = `${subCode} - ${subName} (${academicYear}) Complete Marks Mapping`;
//     outputData.push([titleRow]);
    
//     outputData.push([
//       "Reg No", "Quiz 1", "", "", "", "Mid Term", "", "", "", "Quiz 2", "", "", "", 
//       "Surprise Quiz", "", "", "", "Assignment", "", "", "", "", "", "End Sem", "", "", "", "", "", ""
//     ]);
    
//     outputData.push([
//       "", "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "CO4", "CO5", "Total", "CO1", "CO2", "CO3", "CO4", "CO5", "Total"
//     ]);

//     for (const student of parsedStudents) {
//       const m = student.marks;
//       outputData.push([
//         student.regNo,
//         m.Quiz_1_CO1, m.Quiz_1_CO2, m.Quiz_1_CO3, m.Quiz_1_TOTAL,
//         m.Mid_Term_CO1, m.Mid_Term_CO2, m.Mid_Term_CO3, m.Mid_Term_TOTAL,
//         m.Quiz_2_CO1, m.Quiz_2_CO2, m.Quiz_2_CO3, m.Quiz_2_TOTAL,
//         m.Surprise_Quiz_CO1, m.Surprise_Quiz_CO2, m.Surprise_Quiz_CO3, m.Surprise_Quiz_TOTAL,
//         m.Assignment_CO1, m.Assignment_CO2, m.Assignment_CO3, m.Assignment_CO4, m.Assignment_CO5, m.Assignment_TOTAL,
//         m.End_Sem_CO1, m.End_Sem_CO2, m.End_Sem_CO3, m.End_Sem_CO4, m.End_Sem_CO5, m.End_Sem_TOTAL
//       ]);
//     }

//     const newWb = xlsx.utils.book_new();
//     const newWs = xlsx.utils.aoa_to_sheet(outputData);

//     newWs["!merges"] = [
//       { s: { r: 0, c: 0 }, e: { r: 0, c: 28 } }, 
//       { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },  
//       { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },  
//       { s: { r: 1, c: 5 }, e: { r: 1, c: 8 } },  
//       { s: { r: 1, c: 9 }, e: { r: 1, c: 12 } }, 
//       { s: { r: 1, c: 13 }, e: { r: 1, c: 16 } }, 
//       { s: { r: 1, c: 17 }, e: { r: 1, c: 22 } }, 
//       { s: { r: 1, c: 23 }, e: { r: 1, c: 28 } }, 
//     ];

//     xlsx.utils.book_append_sheet(newWb, newWs, "Combined Mapping");
//     const buffer = xlsx.write(newWb, { type: "buffer", bookType: "xlsx" });

//     // Clean up temporary files
//     fs.unlinkSync(internalFile.path);
//     fs.unlinkSync(externalFile.path);

//     res.setHeader("Content-Disposition", `attachment; filename="${subCode}_Complete_Mapping.xlsx"`);
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     return res.send(buffer);

//   } catch (error) {
//     if (req.files) {
//       if (req.files['internalMarks'] && fs.existsSync(req.files['internalMarks'][0].path)) {
//         fs.unlinkSync(req.files['internalMarks'][0].path);
//       }
//       if (req.files['externalMarks'] && fs.existsSync(req.files['externalMarks'][0].path)) {
//         fs.unlinkSync(req.files['externalMarks'][0].path);
//       }
//     }
//     console.error("Error processing marks files:", error);
//     res.status(500).json({
//       message: "Internal server error processing files",
//       error: error.message,
//     });
//   }
// };

// /**
//  * GET Controller to download the fully mapped internal and external marks
//  * with EXACT styling matching "Java Programming (1).xlsx".
//  * Expects ?subjectId=XXX & academicYear=YYYY in the query string.
//  */
// const downloadMappedMarks = async (req, res) => {
//   try {
//     const { subjectId, academicYear } = req.query;

//     if (!subjectId || !academicYear) {
//       return res.status(400).json({ 
//         message: "subjectId and academicYear are required query parameters." 
//       });
//     }

//     // 1. Fetch the unified data from MongoDB
//     const subjectRecord = await SubjectMarks.findOne({ subjectId, academicYear });

//     if (!subjectRecord) {
//       return res.status(404).json({ 
//         message: "No records found for the specified subject and academic year." 
//       });
//     }

//     const subCode = subjectRecord.subjectCode || subjectRecord.subjectId || "SUBJECT";
//     const subName = subjectRecord.subjectName || "MARKS";
//     const actualMarks = subjectRecord.actualMarks || [];
//     const maxMarks = subjectRecord.maxMarks || {};

//     // 2. Initialize ExcelJS Workbook
//     const workbook = new exceljs.Workbook();
//     const sheet = workbook.addWorksheet("Sheet1");

//     // Helper Objects for Styling
//     const thinBorder = {
//       top: { style: 'thin' },
//       left: { style: 'thin' },
//       bottom: { style: 'thin' },
//       right: { style: 'thin' }
//     };
    
//     const centerAlign = { vertical: 'middle', horizontal: 'center' };

//     // Hex colors matching the original Excel file
//     const colors = {
//       regNo: 'FFD99694',       // Dusty Rose / Peach
//       quiz1: 'FFCCC1DA',       // Lavender / Light Purple
//       midTerm: 'FFC5D9F1',     // Light Blue (Theme 9 Tint 0.8)
//       quiz2: 'FFCCC1DA',       // Lavender / Light Purple
//       surpriseQuiz: 'FFC5D9F1',// Light Blue
//       assignment: 'FFCCC1DA',  // Lavender / Light Purple
//       endSem: 'FFC5D9F1'       // Light Blue
//     };

//     // 3. Build Header Rows
//     const row1 = sheet.addRow([
//       "Reg No", 
//       "Quiz 1", "", "", "", 
//       "Mid Term", "", "", "", 
//       "Quiz 2", "", "", "", 
//       "Surprise Quiz", "", "", "", 
//       "Assignment", "", "", "", "", "", 
//       "End Sem", "", "", "", "", ""
//     ]);

//     const row2 = sheet.addRow([
//       "", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "CO4", "CO5", "Total", 
//       "CO1", "CO2", "CO3", "CO4", "CO5", "Total"
//     ]);

//     // 4. Merge Header Cells
//     sheet.mergeCells('A1:A2'); // Reg No
//     sheet.mergeCells('B1:E1'); // Quiz 1
//     sheet.mergeCells('F1:I1'); // Mid Term
//     sheet.mergeCells('J1:M1'); // Quiz 2
//     sheet.mergeCells('N1:Q1'); // Surprise Quiz
//     sheet.mergeCells('R1:W1'); // Assignment
//     sheet.mergeCells('X1:AC1');// End Sem

//     // Helper function to apply color to a specific block of columns
//     const applyColorToBlock = (rowObj, startCol, endCol, colorHex) => {
//       for (let i = startCol; i <= endCol; i++) {
//         const cell = rowObj.getCell(i);
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: colorHex }
//         };
//       }
//     };

//     // Style Row 1 & Row 2 Colors
//     applyColorToBlock(row1, 1, 1, colors.regNo);
//     applyColorToBlock(row1, 2, 5, colors.quiz1);
//     applyColorToBlock(row1, 6, 9, colors.midTerm);
//     applyColorToBlock(row1, 10, 13, colors.quiz2);
//     applyColorToBlock(row1, 14, 17, colors.surpriseQuiz);
//     applyColorToBlock(row1, 18, 23, colors.assignment);
//     applyColorToBlock(row1, 24, 29, colors.endSem);

//     applyColorToBlock(row2, 2, 5, colors.quiz1);
//     applyColorToBlock(row2, 6, 9, colors.midTerm);
//     applyColorToBlock(row2, 10, 13, colors.quiz2);
//     applyColorToBlock(row2, 14, 17, colors.surpriseQuiz);
//     applyColorToBlock(row2, 18, 23, colors.assignment);
//     applyColorToBlock(row2, 24, 29, colors.endSem);

//     // 5. Populate Data Rows
//     for (const student of actualMarks) {
//       const m = student.marks || {};
//       sheet.addRow([
//         student.regNo,
//         m.Quiz_1_CO1, m.Quiz_1_CO2, m.Quiz_1_CO3, m.Quiz_1_TOTAL,
//         m.Mid_Term_CO1, m.Mid_Term_CO2, m.Mid_Term_CO3, m.Mid_Term_TOTAL,
//         m.Quiz_2_CO1, m.Quiz_2_CO2, m.Quiz_2_CO3, m.Quiz_2_TOTAL,
//         m.Surprise_Quiz_CO1, m.Surprise_Quiz_CO2, m.Surprise_Quiz_CO3, m.Surprise_Quiz_TOTAL,
//         m.Assignment_CO1, m.Assignment_CO2, m.Assignment_CO3, m.Assignment_CO4, m.Assignment_CO5, m.Assignment_TOTAL,
//         m.End_Sem_CO1, m.End_Sem_CO2, m.End_Sem_CO3, m.End_Sem_CO4, m.End_Sem_CO5, m.End_Sem_TOTAL
//       ]);
//     }

//     // 6. Append "Max Marks/CO" Row
//     sheet.addRow([
//         "Max Marks/CO",
//         maxMarks.Quiz_1_CO1 || 2, maxMarks.Quiz_1_CO2 || 2, maxMarks.Quiz_1_CO3 || 1, maxMarks.Quiz_1_TOTAL || 5,
//         maxMarks.Mid_Term_CO1 || 20, maxMarks.Mid_Term_CO2 || 20, maxMarks.Mid_Term_CO3 || 10, maxMarks.Mid_Term_TOTAL || 50,
//         maxMarks.Quiz_2_CO1 || 2, maxMarks.Quiz_2_CO2 || 2, maxMarks.Quiz_2_CO3 || 1, maxMarks.Quiz_2_TOTAL || 5,
//         maxMarks.Surprise_Quiz_CO1 || 2, maxMarks.Surprise_Quiz_CO2 || 2, maxMarks.Surprise_Quiz_CO3 || 1, maxMarks.Surprise_Quiz_TOTAL || 5,
//         maxMarks.Assignment_CO1 || 1, maxMarks.Assignment_CO2 || 1, maxMarks.Assignment_CO3 || 1, maxMarks.Assignment_CO4 || 1, maxMarks.Assignment_CO5 || 1, maxMarks.Assignment_TOTAL || 5,
//         maxMarks.End_Sem_CO1 || 20, maxMarks.End_Sem_CO2 || 20, maxMarks.End_Sem_CO3 || 20, maxMarks.End_Sem_CO4 || 20, maxMarks.End_Sem_CO5 || 20, maxMarks.End_Sem_TOTAL || 100
//     ]);

//     // 7. Apply Universal Alignment and Borders to every populated cell
//     sheet.eachRow((row, rowNumber) => {
//       row.eachCell((cell, colNumber) => {
//         cell.border = thinBorder;
//         cell.alignment = centerAlign;
        
//         // Font style defaults to Calibri size 11 in Exceljs, making it exactly like original
//         cell.font = { name: 'Calibri', size: 10 };
//       });
//     });

//     // 8. Adjust Column Widths to ensure data fits neatly
//     sheet.getColumn(1).width = 15; // Reg No Column slightly wider
//     for(let i = 2; i <= 29; i++){
//         sheet.getColumn(i).width = 8; // Shrink CO columns so the table isn't massively wide
//     }

//     // 9. Send the output
//     const safeSubName = subName.replace(/[^a-zA-Z0-9 -]/g, ""); 
//     const fileName = `${subCode}_${safeSubName}.xlsx`;

//     res.setHeader(
//       "Content-Disposition", 
//       `attachment; filename="${fileName}"`
//     );
//     res.setHeader(
//       "Content-Type", 
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
    
//     // Write directly to the Express response stream
//     await workbook.xlsx.write(res);
//     res.end();

//   } catch (error) {
//     console.error("Error downloading marks:", error);
//     res.status(500).json({ 
//       message: "Internal server error downloading marks", 
//       error: error.message 
//     });
//   }
// };

// module.exports = {
//   processAssessmentFiles,
//   downloadMappedMarks
// };

















//correct code





// // controllers/marksController.js
// const xlsx = require('xlsx');
// const fs = require('fs');
// const exceljs = require('exceljs');
// const SubjectMarks = require('../models/TempSubjectMarks'); 

// // -------------------------------------------------------------
// // Helper Functions
// // -------------------------------------------------------------

// // Safely checks if a cell contains "AB" or "ABSENT", otherwise returns the number
// const parseCell = (val) => {
//   if (val === undefined || val === null || val === "") return 0;
//   const strVal = String(val).trim().toUpperCase();
//   if (strVal === 'AB' || strVal === 'ABSENT') return 'AB';
//   return parseFloat(strVal) || 0;
// };

// const extractValue = (row, possibleNames) => {
//   if (!row) return 0;
//   const rowKeys = Object.keys(row);
//   const matchedKey = rowKeys.find((key) =>
//     possibleNames.some((name) => key.toLowerCase().includes(name.toLowerCase()))
//   );
//   return matchedKey ? parseCell(row[matchedKey]) : 0;
// };

// const extractExactMark = (row, exactName) => {
//   if (!row) return 0;
//   const rowKeys = Object.keys(row);
//   const matchedKey = rowKeys.find(key => key.trim().toLowerCase() === exactName.toLowerCase());
//   return matchedKey ? parseCell(row[matchedKey]) : 0;
// };

// const extractTextValue = (row, possibleNames) => {
//   if (!row) return "";
//   const rowKeys = Object.keys(row);
//   const matchedKey = rowKeys.find((key) =>
//     possibleNames.some((name) => key.toLowerCase().includes(name.toLowerCase()))
//   );
//   return matchedKey ? String(row[matchedKey]).trim() : "";
// };

// const findHeaderRow = (rawData) => {
//   for (let i = 0; i < Math.min(15, rawData.length); i++) {
//     const row = rawData[i];
//     if (!row) continue;
//     const foundRegKey = row.find((cell) => {
//       if (!cell) return false;
//       const cellStr = cell.toString().toLowerCase().replace(/\s+/g, "");
//       return (cellStr === "regno" || cellStr === "rollno" || cellStr === "registrationno");
//     });
//     if (foundRegKey) return { index: i, key: foundRegKey };
//   }
//   return { index: -1, key: "" };
// };

// const isValidRegNo = (regNo) => {
//   if (!regNo) return false;
//   const lower = regNo.toString().toLowerCase().trim();
  
//   if (
//     lower.includes('sikkim') || 
//     lower.includes('subject') || 
//     lower.includes('reg') || 
//     lower.includes('name') || 
//     lower.includes('total') ||
//     lower === ''
//   ) {
//     return false;
//   }
  
//   if (lower.length < 5) return false;
  
//   return true;
// };

// // ==============================================================
// // ADVANCED ATTAINMENT-AWARE fillCOs (WITH ABSENT HANDLING)
// // ==============================================================
// const fillCOs = (totalMark, maxMarks) => {
//   // If the total is explicitly marked Absent, distribute "AB" to all COs
//   if (totalMark === 'AB') {
//     return maxMarks.map(() => 'AB');
//   }

//   let total = parseFloat(totalMark) || 0;
  
//   if (total <= 0) return maxMarks.map(() => 0);
  
//   const totalMax = maxMarks.reduce((sum, max) => sum + max, 0);
//   if (total > totalMax) total = totalMax;

//   const ATTAINMENT_THRESHOLD = 0.60; 
  
//   let remainingInt = Math.round(total * 100);
//   const maxMarksInt = maxMarks.map(m => Math.round(m * 100));
//   const totalMaxInt = Math.round(totalMax * 100);
  
//   let resultInt = maxMarks.map(() => 0);

//   // Step 1: Proportional Distribution
//   for (let i = 0; i < maxMarks.length; i++) {
//     let baseShare = (maxMarksInt[i] / totalMaxInt) * (total * 100);
//     let baseMarksInt = Math.floor(baseShare / 100) * 100;
    
//     resultInt[i] = baseMarksInt;
//     remainingInt -= baseMarksInt;
//   }

//   // Step 2: "Attainment-Aware" Leftover Distribution
//   while (remainingInt > 0) {
//     let indices = maxMarks.map((_, i) => i).filter(i => resultInt[i] < maxMarksInt[i]);
//     if (indices.length === 0) break; 

//     indices.sort((a, b) => {
//       let targetA = maxMarksInt[a] * ATTAINMENT_THRESHOLD;
//       let targetB = maxMarksInt[b] * ATTAINMENT_THRESHOLD;
//       let deficitA = targetA - resultInt[a];
//       let deficitB = targetB - resultInt[b];

//       let aNeedsHelp = deficitA > 0;
//       let bNeedsHelp = deficitB > 0;

//       if (aNeedsHelp && !bNeedsHelp) return -1;
//       if (!aNeedsHelp && bNeedsHelp) return 1;
//       if (aNeedsHelp && bNeedsHelp) return deficitA - deficitB; 
//       return Math.random() - 0.5; 
//     });

//     let i = indices[0];
    
//     let chunk = remainingInt >= 100 ? 100 : remainingInt;

//     if (resultInt[i] + chunk <= maxMarksInt[i]) {
//       resultInt[i] += chunk;
//       remainingInt -= chunk;
//     } else {
//       let space = maxMarksInt[i] - resultInt[i];
//       resultInt[i] += space;
//       remainingInt -= space;
//     }
//   }

//   let finalResult = resultInt.map(val => Math.round(val) / 100);
  
//   // Step 3: Strict Match Failsafe
//   let currentSum = finalResult.reduce((sum, val) => sum + val, 0);
//   currentSum = Math.round(currentSum * 100) / 100;
//   let targetTotal = Math.round(total * 100) / 100;

//   if (currentSum !== targetTotal) {
//     let diff = Math.round((targetTotal - currentSum) * 100) / 100;
    
//     for (let i = 0; i < finalResult.length; i++) {
//       if (diff > 0 && finalResult[i] + diff <= maxMarks[i]) {
//         finalResult[i] = Math.round((finalResult[i] + diff) * 100) / 100;
//         break; 
//       } else if (diff < 0 && finalResult[i] + diff >= 0) {
//         finalResult[i] = Math.round((finalResult[i] + diff) * 100) / 100;
//         break; 
//       }
//     }
//   }

//   return finalResult;
// };

// // -------------------------------------------------------------
// // Main Controller
// // -------------------------------------------------------------

// const processAssessmentFiles = async (req, res) => {
//   try {
//     if (!req.files || !req.files['internalMarks'] || !req.files['externalMarks']) {
//       return res.status(400).json({ message: "Both internalMarks and externalMarks files are required." });
//     }

//     const { academicYear, course, subjectId } = req.body;
//     const courseName = course || "BCA";
//     const internalFile = req.files['internalMarks'][0];
//     const externalFile = req.files['externalMarks'][0];

//     if (!academicYear) {
//       fs.unlinkSync(internalFile.path);
//       fs.unlinkSync(externalFile.path);
//       return res.status(400).json({ message: "Academic Year is required." });
//     }

//     const studentMap = {}; 
//     let subCode = "SUBJECT_CODE";
//     let subName = "SUBJECT_NAME";

//     // ==========================================
//     // 2. PROCESS INTERNAL FILE
//     // ==========================================
//     const intWorkbook = xlsx.readFile(internalFile.path);
//     const intSheetName = intWorkbook.SheetNames[0];
//     const intRawData = xlsx.utils.sheet_to_json(intWorkbook.Sheets[intSheetName], { header: 1 });
    
//     const intHeaderInfo = findHeaderRow(intRawData);
//     if (intHeaderInfo.index !== -1) {
//       const intData = xlsx.utils.sheet_to_json(intWorkbook.Sheets[intSheetName], { range: intHeaderInfo.index });
      
//       if (intData.length > 0) {
//         const firstRow = intData[0];
//         const scKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub code') || key.toLowerCase().includes('subject code'));
//         const snKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub name') || key.toLowerCase().includes('subject name'));
        
//         if (scKey && firstRow[scKey]) subCode = String(firstRow[scKey]).trim();
//         if (snKey && firstRow[snKey]) subName = String(firstRow[snKey]).trim();
//       }

//       for (const row of intData) {
//         const actualRegKey = Object.keys(row).find(key => key.toString().trim() === intHeaderInfo.key.toString().trim());
//         if (!actualRegKey || !row[actualRegKey]) continue;

//         const regNo = String(row[actualRegKey]).trim();
//         if (!isValidRegNo(regNo)) continue;

//         const q1Total = extractValue(row, ["quiz1", "quiz 1", "q1"]);
//         const midTotal = extractValue(row, ["mid-sem", "midsem", "mid term", "mid exam"]);
//         const q2Total = extractValue(row, ["quiz2", "quiz 2", "q2"]);
//         const sqTotal = extractValue(row, ["quiz3", "quiz 3", "q3", "surprise"]);
//         const assignTotal = extractValue(row, ["assign", "assignment"]);

//         const [q1_CO1, q1_CO2, q1_CO3] = fillCOs(q1Total, [2, 2, 1]);
//         const [q2_CO1, q2_CO2, q2_CO3] = fillCOs(q2Total, [2, 2, 1]);
//         const [sq_CO1, sq_CO2, sq_CO3] = fillCOs(sqTotal, [2, 2, 1]);
//         const [mid_CO1, mid_CO2, mid_CO3] = fillCOs(midTotal, [20, 20, 10]);
//         const [assign_CO1, assign_CO2, assign_CO3, assign_CO4, assign_CO5] = fillCOs(assignTotal, [1, 1, 1, 1, 1]);

//         studentMap[regNo] = {
//           regNo: regNo,
//           marks: {
//             Quiz_1_CO1: q1_CO1, Quiz_1_CO2: q1_CO2, Quiz_1_CO3: q1_CO3, Quiz_1_TOTAL: q1Total,
//             Mid_Term_CO1: mid_CO1, Mid_Term_CO2: mid_CO2, Mid_Term_CO3: mid_CO3, Mid_Term_TOTAL: midTotal,
//             Quiz_2_CO1: q2_CO1, Quiz_2_CO2: q2_CO2, Quiz_2_CO3: q2_CO3, Quiz_2_TOTAL: q2Total,
//             Surprise_Quiz_CO1: sq_CO1, Surprise_Quiz_CO2: sq_CO2, Surprise_Quiz_CO3: sq_CO3, Surprise_Quiz_TOTAL: sqTotal,
//             Assignment_CO1: assign_CO1, Assignment_CO2: assign_CO2, Assignment_CO3: assign_CO3, Assignment_CO4: assign_CO4, Assignment_CO5: assign_CO5, Assignment_TOTAL: assignTotal,
//             End_Sem_CO1: 0, End_Sem_CO2: 0, End_Sem_CO3: 0, End_Sem_CO4: 0, End_Sem_CO5: 0, End_Sem_TOTAL: 0
//           }
//         };
//       }
//     }

//     // ==========================================
//     // 3. PROCESS EXTERNAL FILE
//     // ==========================================
//     const extWorkbook = xlsx.readFile(externalFile.path);
//     const extSheetName = extWorkbook.SheetNames[0];
//     const extRawData = xlsx.utils.sheet_to_json(extWorkbook.Sheets[extSheetName], { header: 1 });
    
//     const extHeaderInfo = findHeaderRow(extRawData);
//     if (extHeaderInfo.index !== -1) {
//       const extData = xlsx.utils.sheet_to_json(extWorkbook.Sheets[extSheetName], { range: extHeaderInfo.index });

//       if (subCode === "SUBJECT_CODE" && extData.length > 0) {
//         const firstRow = extData[0];
//         const scKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub code') || key.toLowerCase().includes('subject code'));
//         const snKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub name') || key.toLowerCase().includes('subject name'));
        
//         if (scKey && firstRow[scKey]) subCode = String(firstRow[scKey]).trim();
//         if (snKey && firstRow[snKey]) subName = String(firstRow[snKey]).trim();
//       }

//       for (const row of extData) {
//         const actualRegKey = Object.keys(row).find(key => key.toString().trim() === extHeaderInfo.key.toString().trim());
//         if (!actualRegKey || !row[actualRegKey]) continue;

//         const regNo = String(row[actualRegKey]).trim();
//         if (!isValidRegNo(regNo)) continue;

//         const remarks = extractTextValue(row, ["remarks"]).toUpperCase();
//         const ansBook = extractTextValue(row, ["ans book", "ab/dt/mp"]).toUpperCase();
        
//         if (!studentMap[regNo]) {
//           studentMap[regNo] = {
//             regNo: regNo,
//             marks: {
//               Quiz_1_CO1: 0, Quiz_1_CO2: 0, Quiz_1_CO3: 0, Quiz_1_TOTAL: 0,
//               Mid_Term_CO1: 0, Mid_Term_CO2: 0, Mid_Term_CO3: 0, Mid_Term_TOTAL: 0,
//               Quiz_2_CO1: 0, Quiz_2_CO2: 0, Quiz_2_CO3: 0, Quiz_2_TOTAL: 0,
//               Surprise_Quiz_CO1: 0, Surprise_Quiz_CO2: 0, Surprise_Quiz_CO3: 0, Surprise_Quiz_TOTAL: 0,
//               Assignment_CO1: 0, Assignment_CO2: 0, Assignment_CO3: 0, Assignment_CO4: 0, Assignment_CO5: 0, Assignment_TOTAL: 0,
//             }
//           };
//         }

//         let es_co1, es_co2, es_co3, es_co4, es_co5, es_Total;

//         // If explicitly Absent in external file, assign 'AB' to all final exam fields
//         if (remarks.includes('LEFT') || remarks.includes('AB') || ansBook.includes('AB') || ansBook === 'ABSENT') {
//           es_co1 = 'AB'; es_co2 = 'AB'; es_co3 = 'AB'; es_co4 = 'AB'; es_co5 = 'AB'; es_Total = 'AB';
//         } else {
//           // Helper to safely add values even if a specific question cell was typed as "AB"
//           const safeAdd = (a, b) => (a === 'AB' || b === 'AB') ? 'AB' : a + b;

//           es_co1 = safeAdd(extractExactMark(row, '1a'), extractExactMark(row, '1b'));
//           es_co2 = safeAdd(extractExactMark(row, '2a'), extractExactMark(row, '2b'));
//           es_co3 = safeAdd(extractExactMark(row, '3a'), extractExactMark(row, '3b'));
//           es_co4 = safeAdd(extractExactMark(row, '4a'), extractExactMark(row, '4b'));
//           es_co5 = safeAdd(extractExactMark(row, '5a'), extractExactMark(row, '5b'));
          
//           if ([es_co1, es_co2, es_co3, es_co4, es_co5].includes('AB')) {
//              es_Total = 'AB';
//           } else {
//              es_Total = es_co1 + es_co2 + es_co3 + es_co4 + es_co5;
//           }
//         }

//         studentMap[regNo].marks.End_Sem_CO1 = es_co1;
//         studentMap[regNo].marks.End_Sem_CO2 = es_co2;
//         studentMap[regNo].marks.End_Sem_CO3 = es_co3;
//         studentMap[regNo].marks.End_Sem_CO4 = es_co4;
//         studentMap[regNo].marks.End_Sem_CO5 = es_co5;
//         studentMap[regNo].marks.End_Sem_TOTAL = es_Total;
//       }
//     }

//     // ==========================================
//     // 4. SAVE TO MONGODB
//     // ==========================================
//     const parsedStudents = Object.values(studentMap);
//     const queryId = subjectId || subCode;

//     let subjectRecord = await SubjectMarks.findOne({
//       subjectId: queryId,
//       academicYear: academicYear,
//     });

//     if (!subjectRecord) {
//       subjectRecord = new SubjectMarks({
//         academicYear: academicYear,
//         course: courseName,
//         subjectId: queryId,    
//         subjectCode: subCode,  
//         subjectName: subName,  
//       });
//     } else {
//       subjectRecord.subjectCode = subCode;
//       subjectRecord.subjectName = subName; 
//     }

//     subjectRecord.maxMarks = {
//       Quiz_1_CO1: 2, Quiz_1_CO2: 2, Quiz_1_CO3: 1, Quiz_1_TOTAL: 5,
//       Mid_Term_CO1: 20, Mid_Term_CO2: 20, Mid_Term_CO3: 10, Mid_Term_TOTAL: 50,
//       Quiz_2_CO1: 2, Quiz_2_CO2: 2, Quiz_2_CO3: 1, Quiz_2_TOTAL: 5,
//       Surprise_Quiz_CO1: 2, Surprise_Quiz_CO2: 2, Surprise_Quiz_CO3: 1, Surprise_Quiz_TOTAL: 5,
//       Assignment_CO1: 1, Assignment_CO2: 1, Assignment_CO3: 1, Assignment_CO4: 1, Assignment_CO5: 1, Assignment_TOTAL: 5,
//       End_Sem_CO1: 20, End_Sem_CO2: 20, End_Sem_CO3: 20, End_Sem_CO4: 20, End_Sem_CO5: 20, End_Sem_TOTAL: 100
//     };

//     subjectRecord.actualMarks = parsedStudents;
//     subjectRecord.uploadedAt = Date.now();
//     await subjectRecord.save();

//     // ==========================================
//     // 5. GENERATE EXCEL EXPORT
//     // ==========================================
//     const outputData = [];
//     const titleRow = `${subCode} - ${subName} (${academicYear}) Complete Marks Mapping`;
//     outputData.push([titleRow]);
    
//     outputData.push([
//       "Reg No", "Quiz 1", "", "", "", "Mid Term", "", "", "", "Quiz 2", "", "", "", 
//       "Surprise Quiz", "", "", "", "Assignment", "", "", "", "", "", "End Sem", "", "", "", "", "", ""
//     ]);
    
//     outputData.push([
//       "", "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "CO4", "CO5", "Total", "CO1", "CO2", "CO3", "CO4", "CO5", "Total"
//     ]);

//     for (const student of parsedStudents) {
//       const m = student.marks;
//       outputData.push([
//         student.regNo,
//         m.Quiz_1_CO1, m.Quiz_1_CO2, m.Quiz_1_CO3, m.Quiz_1_TOTAL,
//         m.Mid_Term_CO1, m.Mid_Term_CO2, m.Mid_Term_CO3, m.Mid_Term_TOTAL,
//         m.Quiz_2_CO1, m.Quiz_2_CO2, m.Quiz_2_CO3, m.Quiz_2_TOTAL,
//         m.Surprise_Quiz_CO1, m.Surprise_Quiz_CO2, m.Surprise_Quiz_CO3, m.Surprise_Quiz_TOTAL,
//         m.Assignment_CO1, m.Assignment_CO2, m.Assignment_CO3, m.Assignment_CO4, m.Assignment_CO5, m.Assignment_TOTAL,
//         m.End_Sem_CO1, m.End_Sem_CO2, m.End_Sem_CO3, m.End_Sem_CO4, m.End_Sem_CO5, m.End_Sem_TOTAL
//       ]);
//     }

//     const newWb = xlsx.utils.book_new();
//     const newWs = xlsx.utils.aoa_to_sheet(outputData);

//     newWs["!merges"] = [
//       { s: { r: 0, c: 0 }, e: { r: 0, c: 28 } }, 
//       { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },  
//       { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },  
//       { s: { r: 1, c: 5 }, e: { r: 1, c: 8 } },  
//       { s: { r: 1, c: 9 }, e: { r: 1, c: 12 } }, 
//       { s: { r: 1, c: 13 }, e: { r: 1, c: 16 } }, 
//       { s: { r: 1, c: 17 }, e: { r: 1, c: 22 } }, 
//       { s: { r: 1, c: 23 }, e: { r: 1, c: 28 } }, 
//     ];

//     xlsx.utils.book_append_sheet(newWb, newWs, "Combined Mapping");
//     const buffer = xlsx.write(newWb, { type: "buffer", bookType: "xlsx" });

//     fs.unlinkSync(internalFile.path);
//     fs.unlinkSync(externalFile.path);

//     res.setHeader("Content-Disposition", `attachment; filename="${subCode}_Complete_Mapping.xlsx"`);
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     return res.send(buffer);

//   } catch (error) {
//     if (req.files) {
//       if (req.files['internalMarks'] && fs.existsSync(req.files['internalMarks'][0].path)) {
//         fs.unlinkSync(req.files['internalMarks'][0].path);
//       }
//       if (req.files['externalMarks'] && fs.existsSync(req.files['externalMarks'][0].path)) {
//         fs.unlinkSync(req.files['externalMarks'][0].path);
//       }
//     }
//     console.error("Error processing marks files:", error);
//     res.status(500).json({
//       message: "Internal server error processing files",
//       error: error.message,
//     });
//   }
// };

// /**
//  * GET Controller to download the fully mapped internal and external marks
//  * with EXACT styling matching "Java Programming (1).xlsx".
//  */
// const downloadMappedMarks = async (req, res) => {
//   try {
//     const { subjectId, academicYear } = req.query;

//     if (!subjectId || !academicYear) {
//       return res.status(400).json({ 
//         message: "subjectId and academicYear are required query parameters." 
//       });
//     }

//     const subjectRecord = await SubjectMarks.findOne({ subjectId, academicYear });

//     if (!subjectRecord) {
//       return res.status(404).json({ 
//         message: "No records found for the specified subject and academic year." 
//       });
//     }

//     const subCode = subjectRecord.subjectCode || subjectRecord.subjectId || "SUBJECT";
//     const subName = subjectRecord.subjectName || "MARKS";
//     const actualMarks = subjectRecord.actualMarks || [];
//     const maxMarks = subjectRecord.maxMarks || {};

//     const workbook = new exceljs.Workbook();
//     const sheet = workbook.addWorksheet("Sheet1");

//     const thinBorder = {
//       top: { style: 'thin' },
//       left: { style: 'thin' },
//       bottom: { style: 'thin' },
//       right: { style: 'thin' }
//     };
    
//     const centerAlign = { vertical: 'middle', horizontal: 'center' };

//     const colors = {
//       regNo: 'FFD99694',       
//       quiz1: 'FFCCC1DA',       
//       midTerm: 'FFC5D9F1',     
//       quiz2: 'FFCCC1DA',       
//       surpriseQuiz: 'FFC5D9F1',
//       assignment: 'FFCCC1DA',  
//       endSem: 'FFC5D9F1'       
//     };

//     const row1 = sheet.addRow([
//       "Reg No", 
//       "Quiz 1", "", "", "", 
//       "Mid Term", "", "", "", 
//       "Quiz 2", "", "", "", 
//       "Surprise Quiz", "", "", "", 
//       "Assignment", "", "", "", "", "", 
//       "End Sem", "", "", "", "", ""
//     ]);

//     const row2 = sheet.addRow([
//       "", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "Total", 
//       "CO1", "CO2", "CO3", "CO4", "CO5", "Total", 
//       "CO1", "CO2", "CO3", "CO4", "CO5", "Total"
//     ]);

//     sheet.mergeCells('A1:A2'); 
//     sheet.mergeCells('B1:E1'); 
//     sheet.mergeCells('F1:I1'); 
//     sheet.mergeCells('J1:M1'); 
//     sheet.mergeCells('N1:Q1'); 
//     sheet.mergeCells('R1:W1'); 
//     sheet.mergeCells('X1:AC1');

//     const applyColorToBlock = (rowObj, startCol, endCol, colorHex) => {
//       for (let i = startCol; i <= endCol; i++) {
//         const cell = rowObj.getCell(i);
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: colorHex }
//         };
//       }
//     };

//     applyColorToBlock(row1, 1, 1, colors.regNo);
//     applyColorToBlock(row1, 2, 5, colors.quiz1);
//     applyColorToBlock(row1, 6, 9, colors.midTerm);
//     applyColorToBlock(row1, 10, 13, colors.quiz2);
//     applyColorToBlock(row1, 14, 17, colors.surpriseQuiz);
//     applyColorToBlock(row1, 18, 23, colors.assignment);
//     applyColorToBlock(row1, 24, 29, colors.endSem);

//     applyColorToBlock(row2, 2, 5, colors.quiz1);
//     applyColorToBlock(row2, 6, 9, colors.midTerm);
//     applyColorToBlock(row2, 10, 13, colors.quiz2);
//     applyColorToBlock(row2, 14, 17, colors.surpriseQuiz);
//     applyColorToBlock(row2, 18, 23, colors.assignment);
//     applyColorToBlock(row2, 24, 29, colors.endSem);

//     for (const student of actualMarks) {
//       const m = student.marks || {};
//       sheet.addRow([
//         student.regNo,
//         m.Quiz_1_CO1, m.Quiz_1_CO2, m.Quiz_1_CO3, m.Quiz_1_TOTAL,
//         m.Mid_Term_CO1, m.Mid_Term_CO2, m.Mid_Term_CO3, m.Mid_Term_TOTAL,
//         m.Quiz_2_CO1, m.Quiz_2_CO2, m.Quiz_2_CO3, m.Quiz_2_TOTAL,
//         m.Surprise_Quiz_CO1, m.Surprise_Quiz_CO2, m.Surprise_Quiz_CO3, m.Surprise_Quiz_TOTAL,
//         m.Assignment_CO1, m.Assignment_CO2, m.Assignment_CO3, m.Assignment_CO4, m.Assignment_CO5, m.Assignment_TOTAL,
//         m.End_Sem_CO1, m.End_Sem_CO2, m.End_Sem_CO3, m.End_Sem_CO4, m.End_Sem_CO5, m.End_Sem_TOTAL
//       ]);
//     }

//     sheet.addRow([
//         "Max Marks/CO",
//         maxMarks.Quiz_1_CO1 || 2, maxMarks.Quiz_1_CO2 || 2, maxMarks.Quiz_1_CO3 || 1, maxMarks.Quiz_1_TOTAL || 5,
//         maxMarks.Mid_Term_CO1 || 20, maxMarks.Mid_Term_CO2 || 20, maxMarks.Mid_Term_CO3 || 10, maxMarks.Mid_Term_TOTAL || 50,
//         maxMarks.Quiz_2_CO1 || 2, maxMarks.Quiz_2_CO2 || 2, maxMarks.Quiz_2_CO3 || 1, maxMarks.Quiz_2_TOTAL || 5,
//         maxMarks.Surprise_Quiz_CO1 || 2, maxMarks.Surprise_Quiz_CO2 || 2, maxMarks.Surprise_Quiz_CO3 || 1, maxMarks.Surprise_Quiz_TOTAL || 5,
//         maxMarks.Assignment_CO1 || 1, maxMarks.Assignment_CO2 || 1, maxMarks.Assignment_CO3 || 1, maxMarks.Assignment_CO4 || 1, maxMarks.Assignment_CO5 || 1, maxMarks.Assignment_TOTAL || 5,
//         maxMarks.End_Sem_CO1 || 20, maxMarks.End_Sem_CO2 || 20, maxMarks.End_Sem_CO3 || 20, maxMarks.End_Sem_CO4 || 20, maxMarks.End_Sem_CO5 || 20, maxMarks.End_Sem_TOTAL || 100
//     ]);

//     sheet.eachRow((row, rowNumber) => {
//       row.eachCell((cell, colNumber) => {
//         cell.border = thinBorder;
//         cell.alignment = centerAlign;
//         cell.font = { name: 'Calibri', size: 10 };
//       });
//     });

//     sheet.getColumn(1).width = 15; 
//     for(let i = 2; i <= 29; i++){
//         sheet.getColumn(i).width = 8; 
//     }

//     const safeSubName = subName.replace(/[^a-zA-Z0-9 -]/g, ""); 
//     const fileName = `${subCode}_${safeSubName}.xlsx`;

//     res.setHeader(
//       "Content-Disposition", 
//       `attachment; filename="${fileName}"`
//     );
//     res.setHeader(
//       "Content-Type", 
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
    
//     await workbook.xlsx.write(res);
//     res.end();

//   } catch (error) {
//     console.error("Error downloading marks:", error);
//     res.status(500).json({ 
//       message: "Internal server error downloading marks", 
//       error: error.message 
//     });
//   }
// };

// module.exports = {
//   processAssessmentFiles,
//   downloadMappedMarks
// };







// controllers/marksController.js
const xlsx = require('xlsx');
const fs = require('fs');
const exceljs = require('exceljs');
const SubjectMarks = require('../models/TempSubjectMarks'); 

// -------------------------------------------------------------
// Helper Functions
// -------------------------------------------------------------

const parseCell = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  const strVal = String(val).trim().toUpperCase();
  if (strVal === 'AB' || strVal === 'ABSENT') return 'AB';
  return parseFloat(strVal) || 0;
};

const extractValue = (row, possibleNames) => {
  if (!row) return 0;
  const rowKeys = Object.keys(row);
  const matchedKey = rowKeys.find((key) =>
    possibleNames.some((name) => key.toLowerCase().includes(name.toLowerCase()))
  );
  return matchedKey ? parseCell(row[matchedKey]) : 0;
};

const extractExactMark = (row, exactName) => {
  if (!row) return 0;
  const rowKeys = Object.keys(row);
  const matchedKey = rowKeys.find(key => key.trim().toLowerCase() === exactName.toLowerCase());
  return matchedKey ? parseCell(row[matchedKey]) : 0;
};

const extractTextValue = (row, possibleNames) => {
  if (!row) return "";
  const rowKeys = Object.keys(row);
  const matchedKey = rowKeys.find((key) =>
    possibleNames.some((name) => key.toLowerCase().includes(name.toLowerCase()))
  );
  return matchedKey ? String(row[matchedKey]).trim() : "";
};

const findHeaderRow = (rawData) => {
  for (let i = 0; i < Math.min(15, rawData.length); i++) {
    const row = rawData[i];
    if (!row) continue;
    const foundRegKey = row.find((cell) => {
      if (!cell) return false;
      const cellStr = cell.toString().toLowerCase().replace(/\s+/g, "");
      return (cellStr === "regno" || cellStr === "rollno" || cellStr === "registrationno");
    });
    if (foundRegKey) return { index: i, key: foundRegKey };
  }
  return { index: -1, key: "" };
};

const isValidRegNo = (regNo) => {
  if (!regNo) return false;
  const lower = regNo.toString().toLowerCase().trim();
  
  if (
    lower.includes('sikkim') || 
    lower.includes('subject') || 
    lower.includes('reg') || 
    lower.includes('name') || 
    lower.includes('total') ||
    lower === ''
  ) {
    return false;
  }
  
  if (lower.length < 5) return false;
  
  return true;
};

// ==============================================================
// DIRECT ATTAINMENT PUSH (Maximum 60% Securing)
// ==============================================================
const fillCOs = (totalMark, maxMarks) => {
  if (totalMark === 'AB') return maxMarks.map(() => 'AB');

  let total = parseFloat(totalMark) || 0;
  if (total <= 0) return maxMarks.map(() => 0);
  
  const totalMax = maxMarks.reduce((sum, max) => sum + max, 0);
  if (total > totalMax) total = totalMax;

  const ATTAINMENT_THRESHOLD = 0.60; 
  
  let remainingInt = Math.round(total * 100);
  const maxMarksInt = maxMarks.map(m => Math.round(m * 100));
  
  let resultInt = maxMarks.map(() => 0);

  // Phase 1: The "Attainment Push"
  // We prioritize crossing the 60% threshold for as many COs as mathematically possible.
  // We shuffle the COs so we don't unfairly bias one over the other across the whole class.
  let indices = maxMarks.map((_, i) => i).sort(() => Math.random() - 0.5);

  for (let i of indices) {
    let target = Math.ceil(maxMarksInt[i] * ATTAINMENT_THRESHOLD);
    
    // If the student has enough remaining marks to pass this CO, secure it instantly.
    if (remainingInt >= target) {
      resultInt[i] = target;
      remainingInt -= target;
    }
  }

  // Phase 2: Natural Leftover Distribution
  // Distribute remaining marks randomly in integer chunks (1 mark = 100)
  while (remainingInt > 0) {
    let validIndices = maxMarks.map((_, i) => i).filter(i => resultInt[i] < maxMarksInt[i]);
    if (validIndices.length === 0) break; 
    
    let i = validIndices[Math.floor(Math.random() * validIndices.length)];
    let chunk = remainingInt >= 100 ? 100 : remainingInt;

    if (resultInt[i] + chunk <= maxMarksInt[i]) {
      resultInt[i] += chunk;
      remainingInt -= chunk;
    } else {
      let space = maxMarksInt[i] - resultInt[i];
      resultInt[i] += space;
      remainingInt -= space;
    }
  }

  let finalResult = resultInt.map(val => Math.round(val) / 100);
  
  // Phase 3: Strict Math Failsafe
  let currentSum = finalResult.reduce((sum, val) => sum + val, 0);
  currentSum = Math.round(currentSum * 100) / 100;
  let targetTotal = Math.round(total * 100) / 100;

  if (currentSum !== targetTotal) {
    let diff = Math.round((targetTotal - currentSum) * 100) / 100;
    
    for (let i = 0; i < finalResult.length; i++) {
      if (diff > 0 && finalResult[i] + diff <= maxMarks[i]) {
        finalResult[i] = Math.round((finalResult[i] + diff) * 100) / 100;
        break; 
      } else if (diff < 0 && finalResult[i] + diff >= 0) {
        finalResult[i] = Math.round((finalResult[i] + diff) * 100) / 100;
        break; 
      }
    }
  }

  return finalResult;
};

// -------------------------------------------------------------
// Main Controller
// -------------------------------------------------------------

const processAssessmentFiles = async (req, res) => {
  try {
    if (!req.files || !req.files['internalMarks'] || !req.files['externalMarks']) {
      return res.status(400).json({ message: "Both internalMarks and externalMarks files are required." });
    }

    const { academicYear, course, subjectId } = req.body;
    const courseName = course || "BCA";
    const internalFile = req.files['internalMarks'][0];
    const externalFile = req.files['externalMarks'][0];

    if (!academicYear) {
      fs.unlinkSync(internalFile.path);
      fs.unlinkSync(externalFile.path);
      return res.status(400).json({ message: "Academic Year is required." });
    }

    const studentMap = {}; 
    let subCode = "SUBJECT_CODE";
    let subName = "SUBJECT_NAME";

    // ==========================================
    // 2. PROCESS INTERNAL FILE
    // ==========================================
    const intWorkbook = xlsx.readFile(internalFile.path);
    const intSheetName = intWorkbook.SheetNames[0];
    const intRawData = xlsx.utils.sheet_to_json(intWorkbook.Sheets[intSheetName], { header: 1 });
    
    const intHeaderInfo = findHeaderRow(intRawData);
    if (intHeaderInfo.index !== -1) {
      const intData = xlsx.utils.sheet_to_json(intWorkbook.Sheets[intSheetName], { range: intHeaderInfo.index });
      
      if (intData.length > 0) {
        const firstRow = intData[0];
        const scKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub code') || key.toLowerCase().includes('subject code'));
        const snKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub name') || key.toLowerCase().includes('subject name'));
        
        if (scKey && firstRow[scKey]) subCode = String(firstRow[scKey]).trim();
        if (snKey && firstRow[snKey]) subName = String(firstRow[snKey]).trim();
      }

      for (const row of intData) {
        const actualRegKey = Object.keys(row).find(key => key.toString().trim() === intHeaderInfo.key.toString().trim());
        if (!actualRegKey || !row[actualRegKey]) continue;

        const regNo = String(row[actualRegKey]).trim();
        if (!isValidRegNo(regNo)) continue;

        const q1Total = extractValue(row, ["quiz1", "quiz 1", "q1"]);
        const midTotal = extractValue(row, ["mid-sem", "midsem", "mid term", "mid exam"]);
        const q2Total = extractValue(row, ["quiz2", "quiz 2", "q2"]);
        const sqTotal = extractValue(row, ["quiz3", "quiz 3", "q3", "surprise"]);
        const assignTotal = extractValue(row, ["assign", "assignment"]);

        const [q1_CO1, q1_CO2, q1_CO3] = fillCOs(q1Total, [2, 2, 1]);
        const [q2_CO1, q2_CO2, q2_CO3] = fillCOs(q2Total, [2, 2, 1]);
        const [sq_CO1, sq_CO2, sq_CO3] = fillCOs(sqTotal, [2, 2, 1]);
        const [mid_CO1, mid_CO2, mid_CO3] = fillCOs(midTotal, [20, 20, 10]);
        const [assign_CO1, assign_CO2, assign_CO3, assign_CO4, assign_CO5] = fillCOs(assignTotal, [1, 1, 1, 1, 1]);

        studentMap[regNo] = {
          regNo: regNo,
          marks: {
            Quiz_1_CO1: q1_CO1, Quiz_1_CO2: q1_CO2, Quiz_1_CO3: q1_CO3, Quiz_1_TOTAL: q1Total,
            Mid_Term_CO1: mid_CO1, Mid_Term_CO2: mid_CO2, Mid_Term_CO3: mid_CO3, Mid_Term_TOTAL: midTotal,
            Quiz_2_CO1: q2_CO1, Quiz_2_CO2: q2_CO2, Quiz_2_CO3: q2_CO3, Quiz_2_TOTAL: q2Total,
            Surprise_Quiz_CO1: sq_CO1, Surprise_Quiz_CO2: sq_CO2, Surprise_Quiz_CO3: sq_CO3, Surprise_Quiz_TOTAL: sqTotal,
            Assignment_CO1: assign_CO1, Assignment_CO2: assign_CO2, Assignment_CO3: assign_CO3, Assignment_CO4: assign_CO4, Assignment_CO5: assign_CO5, Assignment_TOTAL: assignTotal,
            End_Sem_CO1: 0, End_Sem_CO2: 0, End_Sem_CO3: 0, End_Sem_CO4: 0, End_Sem_CO5: 0, End_Sem_TOTAL: 0
          }
        };
      }
    }

    // ==========================================
    // 3. PROCESS EXTERNAL FILE
    // ==========================================
    const extWorkbook = xlsx.readFile(externalFile.path);
    const extSheetName = extWorkbook.SheetNames[0];
    const extRawData = xlsx.utils.sheet_to_json(extWorkbook.Sheets[extSheetName], { header: 1 });
    
    const extHeaderInfo = findHeaderRow(extRawData);
    if (extHeaderInfo.index !== -1) {
      const extData = xlsx.utils.sheet_to_json(extWorkbook.Sheets[extSheetName], { range: extHeaderInfo.index });

      if (subCode === "SUBJECT_CODE" && extData.length > 0) {
        const firstRow = extData[0];
        const scKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub code') || key.toLowerCase().includes('subject code'));
        const snKey = Object.keys(firstRow).find(key => key.toLowerCase().includes('sub name') || key.toLowerCase().includes('subject name'));
        
        if (scKey && firstRow[scKey]) subCode = String(firstRow[scKey]).trim();
        if (snKey && firstRow[snKey]) subName = String(firstRow[snKey]).trim();
      }

      for (const row of extData) {
        const actualRegKey = Object.keys(row).find(key => key.toString().trim() === extHeaderInfo.key.toString().trim());
        if (!actualRegKey || !row[actualRegKey]) continue;

        const regNo = String(row[actualRegKey]).trim();
        if (!isValidRegNo(regNo)) continue;

        const remarks = extractTextValue(row, ["remarks"]).toUpperCase();
        const ansBook = extractTextValue(row, ["ans book", "ab/dt/mp"]).toUpperCase();
        
        if (!studentMap[regNo]) {
          studentMap[regNo] = {
            regNo: regNo,
            marks: {
              Quiz_1_CO1: 0, Quiz_1_CO2: 0, Quiz_1_CO3: 0, Quiz_1_TOTAL: 0,
              Mid_Term_CO1: 0, Mid_Term_CO2: 0, Mid_Term_CO3: 0, Mid_Term_TOTAL: 0,
              Quiz_2_CO1: 0, Quiz_2_CO2: 0, Quiz_2_CO3: 0, Quiz_2_TOTAL: 0,
              Surprise_Quiz_CO1: 0, Surprise_Quiz_CO2: 0, Surprise_Quiz_CO3: 0, Surprise_Quiz_TOTAL: 0,
              Assignment_CO1: 0, Assignment_CO2: 0, Assignment_CO3: 0, Assignment_CO4: 0, Assignment_CO5: 0, Assignment_TOTAL: 0,
            }
          };
        }

        let es_co1, es_co2, es_co3, es_co4, es_co5, es_Total;

        if (remarks.includes('LEFT') || remarks.includes('AB') || ansBook.includes('AB') || ansBook === 'ABSENT') {
          es_co1 = 'AB'; es_co2 = 'AB'; es_co3 = 'AB'; es_co4 = 'AB'; es_co5 = 'AB'; es_Total = 'AB';
        } else {
          const safeAdd = (a, b) => (a === 'AB' || b === 'AB') ? 'AB' : a + b;

          es_co1 = safeAdd(extractExactMark(row, '1a'), extractExactMark(row, '1b'));
          es_co2 = safeAdd(extractExactMark(row, '2a'), extractExactMark(row, '2b'));
          es_co3 = safeAdd(extractExactMark(row, '3a'), extractExactMark(row, '3b'));
          es_co4 = safeAdd(extractExactMark(row, '4a'), extractExactMark(row, '4b'));
          es_co5 = safeAdd(extractExactMark(row, '5a'), extractExactMark(row, '5b'));
          
          if ([es_co1, es_co2, es_co3, es_co4, es_co5].includes('AB')) {
             es_Total = 'AB';
          } else {
             es_Total = es_co1 + es_co2 + es_co3 + es_co4 + es_co5;
          }
        }

        studentMap[regNo].marks.End_Sem_CO1 = es_co1;
        studentMap[regNo].marks.End_Sem_CO2 = es_co2;
        studentMap[regNo].marks.End_Sem_CO3 = es_co3;
        studentMap[regNo].marks.End_Sem_CO4 = es_co4;
        studentMap[regNo].marks.End_Sem_CO5 = es_co5;
        studentMap[regNo].marks.End_Sem_TOTAL = es_Total;
      }
    }

    // ==========================================
    // 4. SAVE TO MONGODB
    // ==========================================
    const parsedStudents = Object.values(studentMap);
    const queryId = subjectId || subCode;

    let subjectRecord = await SubjectMarks.findOne({
      subjectId: queryId,
      academicYear: academicYear,
    });

    if (!subjectRecord) {
      subjectRecord = new SubjectMarks({
        academicYear: academicYear,
        course: courseName,
        subjectId: queryId,    
        subjectCode: subCode,  
        subjectName: subName,  
      });
    } else {
      subjectRecord.subjectCode = subCode;
      subjectRecord.subjectName = subName; 
    }

    subjectRecord.maxMarks = {
      Quiz_1_CO1: 2, Quiz_1_CO2: 2, Quiz_1_CO3: 1, Quiz_1_TOTAL: 5,
      Mid_Term_CO1: 20, Mid_Term_CO2: 20, Mid_Term_CO3: 10, Mid_Term_TOTAL: 50,
      Quiz_2_CO1: 2, Quiz_2_CO2: 2, Quiz_2_CO3: 1, Quiz_2_TOTAL: 5,
      Surprise_Quiz_CO1: 2, Surprise_Quiz_CO2: 2, Surprise_Quiz_CO3: 1, Surprise_Quiz_TOTAL: 5,
      Assignment_CO1: 1, Assignment_CO2: 1, Assignment_CO3: 1, Assignment_CO4: 1, Assignment_CO5: 1, Assignment_TOTAL: 5,
      End_Sem_CO1: 20, End_Sem_CO2: 20, End_Sem_CO3: 20, End_Sem_CO4: 20, End_Sem_CO5: 20, End_Sem_TOTAL: 100
    };

    subjectRecord.actualMarks = parsedStudents;
    subjectRecord.uploadedAt = Date.now();
    await subjectRecord.save();

    // ==========================================
    // 5. GENERATE EXCEL EXPORT
    // ==========================================
    const outputData = [];
    const titleRow = `${subCode} - ${subName} (${academicYear}) Complete Marks Mapping`;
    outputData.push([titleRow]);
    
    outputData.push([
      "Reg No", "Quiz 1", "", "", "", "Mid Term", "", "", "", "Quiz 2", "", "", "", 
      "Surprise Quiz", "", "", "", "Assignment", "", "", "", "", "", "End Sem", "", "", "", "", "", ""
    ]);
    
    outputData.push([
      "", "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "Total", 
      "CO1", "CO2", "CO3", "Total", "CO1", "CO2", "CO3", "CO4", "CO5", "Total", "CO1", "CO2", "CO3", "CO4", "CO5", "Total"
    ]);

    for (const student of parsedStudents) {
      const m = student.marks;
      outputData.push([
        student.regNo,
        m.Quiz_1_CO1, m.Quiz_1_CO2, m.Quiz_1_CO3, m.Quiz_1_TOTAL,
        m.Mid_Term_CO1, m.Mid_Term_CO2, m.Mid_Term_CO3, m.Mid_Term_TOTAL,
        m.Quiz_2_CO1, m.Quiz_2_CO2, m.Quiz_2_CO3, m.Quiz_2_TOTAL,
        m.Surprise_Quiz_CO1, m.Surprise_Quiz_CO2, m.Surprise_Quiz_CO3, m.Surprise_Quiz_TOTAL,
        m.Assignment_CO1, m.Assignment_CO2, m.Assignment_CO3, m.Assignment_CO4, m.Assignment_CO5, m.Assignment_TOTAL,
        m.End_Sem_CO1, m.End_Sem_CO2, m.End_Sem_CO3, m.End_Sem_CO4, m.End_Sem_CO5, m.End_Sem_TOTAL
      ]);
    }

    const newWb = xlsx.utils.book_new();
    const newWs = xlsx.utils.aoa_to_sheet(outputData);

    newWs["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 28 } }, 
      { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },  
      { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },  
      { s: { r: 1, c: 5 }, e: { r: 1, c: 8 } },  
      { s: { r: 1, c: 9 }, e: { r: 1, c: 12 } }, 
      { s: { r: 1, c: 13 }, e: { r: 1, c: 16 } }, 
      { s: { r: 1, c: 17 }, e: { r: 1, c: 22 } }, 
      { s: { r: 1, c: 23 }, e: { r: 1, c: 28 } }, 
    ];

    xlsx.utils.book_append_sheet(newWb, newWs, "Combined Mapping");
    const buffer = xlsx.write(newWb, { type: "buffer", bookType: "xlsx" });

    fs.unlinkSync(internalFile.path);
    fs.unlinkSync(externalFile.path);

    res.setHeader("Content-Disposition", `attachment; filename="${subCode}_Complete_Mapping.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.send(buffer);

  } catch (error) {
    if (req.files) {
      if (req.files['internalMarks'] && fs.existsSync(req.files['internalMarks'][0].path)) {
        fs.unlinkSync(req.files['internalMarks'][0].path);
      }
      if (req.files['externalMarks'] && fs.existsSync(req.files['externalMarks'][0].path)) {
        fs.unlinkSync(req.files['externalMarks'][0].path);
      }
    }
    console.error("Error processing marks files:", error);
    res.status(500).json({
      message: "Internal server error processing files",
      error: error.message,
    });
  }
};

/**
 * GET Controller to download the fully mapped internal and external marks
 */
const downloadMappedMarks = async (req, res) => {
  try {
    const { subjectId, academicYear } = req.query;

    if (!subjectId || !academicYear) {
      return res.status(400).json({ 
        message: "subjectId and academicYear are required query parameters." 
      });
    }

    const subjectRecord = await SubjectMarks.findOne({ subjectId, academicYear });

    if (!subjectRecord) {
      return res.status(404).json({ 
        message: "No records found for the specified subject and academic year." 
      });
    }

    const subCode = subjectRecord.subjectCode || subjectRecord.subjectId || "SUBJECT";
    const subName = subjectRecord.subjectName || "MARKS";
    const actualMarks = subjectRecord.actualMarks || [];
    const maxMarks = subjectRecord.maxMarks || {};

    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("Sheet1");

    const thinBorder = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    const centerAlign = { vertical: 'middle', horizontal: 'center' };

    const colors = {
      regNo: 'FFD99694',       
      quiz1: 'FFCCC1DA',       
      midTerm: 'FFC5D9F1',     
      quiz2: 'FFCCC1DA',       
      surpriseQuiz: 'FFC5D9F1',
      assignment: 'FFCCC1DA',  
      endSem: 'FFC5D9F1'       
    };

    const row1 = sheet.addRow([
      "Reg No", 
      "Quiz 1", "", "", "", 
      "Mid Term", "", "", "", 
      "Quiz 2", "", "", "", 
      "Surprise Quiz", "", "", "", 
      "Assignment", "", "", "", "", "", 
      "End Sem", "", "", "", "", ""
    ]);

    const row2 = sheet.addRow([
      "", 
      "CO1", "CO2", "CO3", "Total", 
      "CO1", "CO2", "CO3", "Total", 
      "CO1", "CO2", "CO3", "Total", 
      "CO1", "CO2", "CO3", "Total", 
      "CO1", "CO2", "CO3", "CO4", "CO5", "Total", 
      "CO1", "CO2", "CO3", "CO4", "CO5", "Total"
    ]);

    sheet.mergeCells('A1:A2'); 
    sheet.mergeCells('B1:E1'); 
    sheet.mergeCells('F1:I1'); 
    sheet.mergeCells('J1:M1'); 
    sheet.mergeCells('N1:Q1'); 
    sheet.mergeCells('R1:W1'); 
    sheet.mergeCells('X1:AC1');

    const applyColorToBlock = (rowObj, startCol, endCol, colorHex) => {
      for (let i = startCol; i <= endCol; i++) {
        const cell = rowObj.getCell(i);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colorHex }
        };
      }
    };

    applyColorToBlock(row1, 1, 1, colors.regNo);
    applyColorToBlock(row1, 2, 5, colors.quiz1);
    applyColorToBlock(row1, 6, 9, colors.midTerm);
    applyColorToBlock(row1, 10, 13, colors.quiz2);
    applyColorToBlock(row1, 14, 17, colors.surpriseQuiz);
    applyColorToBlock(row1, 18, 23, colors.assignment);
    applyColorToBlock(row1, 24, 29, colors.endSem);

    applyColorToBlock(row2, 2, 5, colors.quiz1);
    applyColorToBlock(row2, 6, 9, colors.midTerm);
    applyColorToBlock(row2, 10, 13, colors.quiz2);
    applyColorToBlock(row2, 14, 17, colors.surpriseQuiz);
    applyColorToBlock(row2, 18, 23, colors.assignment);
    applyColorToBlock(row2, 24, 29, colors.endSem);

    for (const student of actualMarks) {
      const m = student.marks || {};
      sheet.addRow([
        student.regNo,
        m.Quiz_1_CO1, m.Quiz_1_CO2, m.Quiz_1_CO3, m.Quiz_1_TOTAL,
        m.Mid_Term_CO1, m.Mid_Term_CO2, m.Mid_Term_CO3, m.Mid_Term_TOTAL,
        m.Quiz_2_CO1, m.Quiz_2_CO2, m.Quiz_2_CO3, m.Quiz_2_TOTAL,
        m.Surprise_Quiz_CO1, m.Surprise_Quiz_CO2, m.Surprise_Quiz_CO3, m.Surprise_Quiz_TOTAL,
        m.Assignment_CO1, m.Assignment_CO2, m.Assignment_CO3, m.Assignment_CO4, m.Assignment_CO5, m.Assignment_TOTAL,
        m.End_Sem_CO1, m.End_Sem_CO2, m.End_Sem_CO3, m.End_Sem_CO4, m.End_Sem_CO5, m.End_Sem_TOTAL
      ]);
    }

    sheet.addRow([
        "Max Marks/CO",
        maxMarks.Quiz_1_CO1 || 2, maxMarks.Quiz_1_CO2 || 2, maxMarks.Quiz_1_CO3 || 1, maxMarks.Quiz_1_TOTAL || 5,
        maxMarks.Mid_Term_CO1 || 20, maxMarks.Mid_Term_CO2 || 20, maxMarks.Mid_Term_CO3 || 10, maxMarks.Mid_Term_TOTAL || 50,
        maxMarks.Quiz_2_CO1 || 2, maxMarks.Quiz_2_CO2 || 2, maxMarks.Quiz_2_CO3 || 1, maxMarks.Quiz_2_TOTAL || 5,
        maxMarks.Surprise_Quiz_CO1 || 2, maxMarks.Surprise_Quiz_CO2 || 2, maxMarks.Surprise_Quiz_CO3 || 1, maxMarks.Surprise_Quiz_TOTAL || 5,
        maxMarks.Assignment_CO1 || 1, maxMarks.Assignment_CO2 || 1, maxMarks.Assignment_CO3 || 1, maxMarks.Assignment_CO4 || 1, maxMarks.Assignment_CO5 || 1, maxMarks.Assignment_TOTAL || 5,
        maxMarks.End_Sem_CO1 || 20, maxMarks.End_Sem_CO2 || 20, maxMarks.End_Sem_CO3 || 20, maxMarks.End_Sem_CO4 || 20, maxMarks.End_Sem_CO5 || 20, maxMarks.End_Sem_TOTAL || 100
    ]);

    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.alignment = centerAlign;
        cell.font = { name: 'Calibri', size: 10 };
      });
    });

    sheet.getColumn(1).width = 15; 
    for(let i = 2; i <= 29; i++){
        sheet.getColumn(i).width = 8; 
    }

    const safeSubName = subName.replace(/[^a-zA-Z0-9 -]/g, ""); 
    const fileName = `${subCode}_${safeSubName}.xlsx`;

    res.setHeader(
      "Content-Disposition", 
      `attachment; filename="${fileName}"`
    );
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error downloading marks:", error);
    res.status(500).json({ 
      message: "Internal server error downloading marks", 
      error: error.message 
    });
  }
};

module.exports = {
  processAssessmentFiles,
  downloadMappedMarks
};