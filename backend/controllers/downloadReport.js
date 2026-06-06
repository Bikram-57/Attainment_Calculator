const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Make sure all three models are imported at the top
const calculatedMarks = require("../models/calculatedMarks");
const FinalCoAttainment = require("../models/finalAttainment");
const directPoAttainment = require("../models/directPoAttainment");

// exports.downloadReport = async (req, res) => {
    async function handleDownloadReport(req, res) {



try {
    const { subjectId, course, academicYear } = req.query;

    if (!subjectId || !course || !academicYear) {
      return res.status(400).json({ message: "Missing subjectId, course, or academicYear" });
    }

    const reportsDir = path.join(__dirname, '..', 'downloads', 'reports'); 
    const safeYear = academicYear.replace(/\//g, '-');
    const fileName = `Report_${subjectId}_${safeYear}.xlsx`;
    const filePath = path.join(reportsDir, fileName);

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 🚨 Cache is disabled for testing. 
    // Uncomment this block once you confirm the Excel file looks perfect!
    /*
    if (fs.existsSync(filePath)) {
      console.log('Serving existing Excel file from cache...');
      return res.download(filePath, fileName); 
    }
    */

    console.log(`\n--- Fetching Data for ${subjectId} | ${course} | ${academicYear} ---`);

    // 1. Fetch data from DB
    const [marksResponse, coDocs, poDocs] = await Promise.all([
      calculatedMarks.find({ subjectId, course, academicYear }).lean(),
      FinalCoAttainment.find({ subjectId, course, academicYear }).lean(),
      directPoAttainment.find({ subjectId, course, academicYear }).lean()
    ]);

    // Safety check for Array vs Object
    const marksDoc = Array.isArray(marksResponse) ? marksResponse[0] : marksResponse;

    if (!marksDoc || !marksDoc.actualMarks || marksDoc.actualMarks.length === 0) {
      return res.status(404).json({ message: "No marks data found for this subject and year." });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'System';

    // ==========================================
    // SHEET 1: CALCULATED MARKS & ATTAINMENT
    // ==========================================
    const sheet1 = workbook.addWorksheet('Calculated Marks');

    const sampleMarks = marksDoc.actualMarks[0].marks;
    const componentMap = {}; 
    const orderedComponents = []; 

    // Extract dynamic headers
    Object.keys(sampleMarks).forEach(key => {
      if (key.endsWith('_TOTAL')) return; 
      const match = key.match(/(.*)_(CO\d+)/); 
      if (match) {
        const componentName = match[1];
        const coName = match[2];

        if (!componentMap[componentName]) {
          componentMap[componentName] = [];
          orderedComponents.push(componentName);
        }
        componentMap[componentName].push(coName);
      }
    });

    // Sort COs numerically
    orderedComponents.forEach(comp => {
      componentMap[comp].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));
    });

    // Build Rows 1 and 2
    const row1 = ['Reg No'];
    const row2 = [''];

    orderedComponents.forEach(comp => {
      const cos = componentMap[comp];
      const numCols = cos.length + 1; 
      const formattedName = comp.replace(/_/g, ' ');

      row1.push(formattedName);
      for (let i = 0; i < numCols - 1; i++) {
        row1.push('');
      }
      row2.push(...cos, 'Total');
    });

    sheet1.addRow(row1);
    sheet1.addRow(row2);

    // Merge Cells Dynamically
    sheet1.mergeCells(1, 1, 2, 1); 
    let currentCol = 2; 
    orderedComponents.forEach(comp => {
      const numCols = componentMap[comp].length + 1;
      sheet1.mergeCells(1, currentCol, 1, currentCol + numCols - 1);
      currentCol += numCols; 
    });

    // Format Headers
    sheet1.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet1.getRow(1).font = { bold: true };
    sheet1.getRow(2).alignment = { horizontal: 'center' };
    sheet1.getRow(2).font = { bold: true };

    // --- MAP STUDENT ROWS ---
    const studentRows = marksDoc.actualMarks.map(student => {
      const m = student.marks;
      const row = [student.regNo];

      orderedComponents.forEach(comp => {
        componentMap[comp].forEach(co => {
          row.push(m[`${comp}_${co}`] !== undefined ? m[`${comp}_${co}`] : '-'); 
        });
        row.push(m[`${comp}_TOTAL`] !== undefined ? m[`${comp}_TOTAL`] : '-');
      });

      return row;
    });

    sheet1.addRows(studentRows);

    // --- APPEND CALCULATED DATA (reportData) ---
    // sheet1.addRow([]); // Blank row for spacing

    const maxMarksRow = ['Max Marks'];
    const targetMarksRow = ['Target Marks'];
    const aboveTargetRow = ['Students Above Target'];
    const attainmentPercentRow = ['Attainment %'];
    const attainmentLevelRow = ['Attainment Level'];

    orderedComponents.forEach(comp => {
      componentMap[comp].forEach(co => {
        const key = `${comp}_${co}`;
        const calc = marksDoc.reportData[key] || {};
        
        maxMarksRow.push(calc.maxMarks !== undefined ? calc.maxMarks : '-');
        targetMarksRow.push(calc.targetMarks !== undefined ? calc.targetMarks : '-');
        aboveTargetRow.push(calc.studentsAboveTarget !== undefined ? calc.studentsAboveTarget : '-');
        attainmentPercentRow.push(calc.attainmentPercent !== undefined ? calc.attainmentPercent : '-');
        attainmentLevelRow.push(calc.attainmentLevel !== undefined ? calc.attainmentLevel : '-');
      });

      const totalKey = `${comp}_TOTAL`;
      const calcTotal = marksDoc.reportData[totalKey] || {};
      
      maxMarksRow.push(calcTotal.maxMarks !== undefined ? calcTotal.maxMarks : '-');
      targetMarksRow.push(calcTotal.targetMarks !== undefined ? calcTotal.targetMarks : '-');
      aboveTargetRow.push(calcTotal.studentsAboveTarget !== undefined ? calcTotal.studentsAboveTarget : '-');
      attainmentPercentRow.push(calcTotal.attainmentPercent !== undefined ? calcTotal.attainmentPercent : '-');
      attainmentLevelRow.push(calcTotal.attainmentLevel !== undefined ? calcTotal.attainmentLevel : '-');
    });

    const calcRows = sheet1.addRows([
      maxMarksRow, targetMarksRow, aboveTargetRow, attainmentPercentRow, attainmentLevelRow
    ]);

    // Format the calculation rows (Bold + Light Gray Background)
    // calcRows.forEach(row => {
    //   row.font = { bold: true };
    // //   row.font = { true };
    //   row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    // });

    // ==========================================
    // SHEET 2: FINAL CO ATTAINMENT
    // ==========================================
    if (coDocs && coDocs.length > 0) {
      const sheet2 = workbook.addWorksheet('Final CO Attainment');
      const excludedKeys = ['_id', '__v', 'subjectId', 'course', 'academicYear', 'createdAt', 'updatedAt'];
      const coKeys = Object.keys(coDocs[0]).filter(key => !excludedKeys.includes(key));

      sheet2.columns = coKeys.map(key => {
        const formattedHeader = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return { header: formattedHeader, key: key, width: 20 };
      });

      sheet2.getRow(1).font = { bold: true };
      sheet2.addRows(coDocs);
    }

    // ==========================================
    // SHEET 3: FINAL PO ATTAINMENT
    // ==========================================
    if (poDocs && poDocs.length > 0) {
      const sheet3 = workbook.addWorksheet('Final PO Attainment');
      const excludedKeys = ['_id', '__v', 'subjectId', 'course', 'academicYear', 'createdAt', 'updatedAt'];
      const poKeys = Object.keys(poDocs[0]).filter(key => !excludedKeys.includes(key));

      sheet3.columns = poKeys.map(key => {
        return { header: key.toUpperCase(), key: key, width: 15 };
      });

      sheet3.getRow(1).font = { bold: true };
      sheet3.addRows(poDocs);
    }

    // --- SAVE AND SEND ---
    await workbook.xlsx.writeFile(filePath);
    console.log('Excel File Generated Successfully!');
    res.download(filePath, fileName);

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Internal server error while generating report.' });
  }
};


module.exports = {
     handleDownloadReport,
}



































//   try {
//     const { subjectId, course, academicYear } = req.query;

//     if (!subjectId || !course || !academicYear) {
//       return res.status(400).json({ message: "Missing subjectId, course, or academicYear" });
//     }

//     const reportsDir = path.join(__dirname, '..', 'downloads', 'reports'); 
//     const safeYear = academicYear.replace(/\//g, '-');
//     const fileName = `Report_${subjectId}_${safeYear}.xlsx`;
//     const filePath = path.join(reportsDir, fileName);

//     if (!fs.existsSync(reportsDir)) {
//       fs.mkdirSync(reportsDir, { recursive: true });
//     }

//     // 🚨 TEMPORARILY DISABLED CACHE FOR TESTING 🚨
//     // This forces the server to build a brand new file every single time
//     // We will turn this back on once you confirm the data is perfect!
//     /*
//     if (fs.existsSync(filePath)) {
//       console.log('Serving existing Excel file from cache...');
//       return res.download(filePath, fileName); 
//     }
//     */

//     console.log(`\n--- Fetching Data for ${subjectId} | ${course} | ${academicYear} ---`);

//     // 1. Fetch data from DB
//     const [marksResponse, coDocs, poDocs] = await Promise.all([
//       calculatedMarks.find({ subjectId, course, academicYear }).lean(),
//       FinalCoAttainment.find({ subjectId, course, academicYear }).lean(),
//       directPoAttainment.find({ subjectId, course, academicYear }).lean()
//     ]);

//     // 2. SAFETY CHECK: Extract the single document (handles if DB returns Array or Object)
//     const marksDoc = Array.isArray(marksResponse) ? marksResponse[0] : marksResponse;

//     if (!marksDoc || !marksDoc.actualMarks || marksDoc.actualMarks.length === 0) {
//       console.log("❌ ERROR: marksDoc or actualMarks is missing/empty!");
//       return res.status(404).json({ message: "No marks data found for this subject and year." });
//     }

//     console.log(`✅ Found Marks Data! Students count: ${marksDoc.actualMarks.length}`);

//     const workbook = new ExcelJS.Workbook();
//     workbook.creator = 'System';

//     // ==========================================
//     // SHEET 1: CALCULATED MARKS (100% Dynamic)
//     // ==========================================
//     const sheet1 = workbook.addWorksheet('Calculated Marks');

//     const sampleMarks = marksDoc.actualMarks[0].marks;
//     const componentMap = {}; 
//     const orderedComponents = []; 

//     // Extract dynamic headers from the database keys
//     Object.keys(sampleMarks).forEach(key => {
//       if (key.endsWith('_TOTAL')) return; 
//       const match = key.match(/(.*)_(CO\d+)/); 
//       if (match) {
//         const componentName = match[1];
//         const coName = match[2];

//         if (!componentMap[componentName]) {
//           componentMap[componentName] = [];
//           orderedComponents.push(componentName);
//         }
//         componentMap[componentName].push(coName);
//       }
//     });

//     // Sort COs numerically (CO1, CO2, CO3...)
//     orderedComponents.forEach(comp => {
//       componentMap[comp].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));
//     });

//     // Build Rows 1 and 2
//     const row1 = ['Reg No'];
//     const row2 = [''];

//     orderedComponents.forEach(comp => {
//       const cos = componentMap[comp];
//       const numCols = cos.length + 1; 
//       const formattedName = comp.replace(/_/g, ' ');

//       row1.push(formattedName);
//       for (let i = 0; i < numCols - 1; i++) {
//         row1.push('');
//       }
//       row2.push(...cos, 'Total');
//     });

//     sheet1.addRow(row1);
//     sheet1.addRow(row2);

//     // Merge Cells Dynamically
//     sheet1.mergeCells(1, 1, 2, 1); 
//     let currentCol = 2; 
//     orderedComponents.forEach(comp => {
//       const numCols = componentMap[comp].length + 1;
//       sheet1.mergeCells(1, currentCol, 1, currentCol + numCols - 1);
//       currentCol += numCols; 
//     });

//     // Format Headers
//     sheet1.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
//     sheet1.getRow(1).font = { bold: true };
//     sheet1.getRow(2).alignment = { horizontal: 'center' };
//     sheet1.getRow(2).font = { bold: true };

//     // Map Student Marks dynamically
//     const studentRows = marksDoc.actualMarks.map(student => {
//       const m = student.marks;
//       const row = [student.regNo];

//       orderedComponents.forEach(comp => {
//         componentMap[comp].forEach(co => {
//           // If the mark is 0 or undefined, ensure it prints correctly
//           row.push(m[`${comp}_${co}`] !== undefined ? m[`${comp}_${co}`] : '-'); 
//         });
//         row.push(m[`${comp}_TOTAL`] !== undefined ? m[`${comp}_TOTAL`] : '-');
//       });

//       return row;
//     });

//     sheet1.addRows(studentRows);


//     // ==========================================
//     // SHEET 2: FINAL CO ATTAINMENT
//     // ==========================================
//     if (coDocs && coDocs.length > 0) {
//       console.log(`✅ Found CO Data! Generating Sheet 2...`);
//       const sheet2 = workbook.addWorksheet('Final CO Attainment');
//       const excludedKeys = ['_id', '__v', 'subjectId', 'course', 'academicYear', 'createdAt', 'updatedAt'];
//       const coKeys = Object.keys(coDocs[0]).filter(key => !excludedKeys.includes(key));

//       sheet2.columns = coKeys.map(key => {
//         const formattedHeader = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
//         return { header: formattedHeader, key: key, width: 20 };
//       });

//       sheet2.getRow(1).font = { bold: true };
//       sheet2.addRows(coDocs);
//     }

//     // ==========================================
//     // SHEET 3: FINAL PO ATTAINMENT
//     // ==========================================
//     if (poDocs && poDocs.length > 0) {
//       console.log(`✅ Found PO Data! Generating Sheet 3...`);
//       const sheet3 = workbook.addWorksheet('Final PO Attainment');
//       const excludedKeys = ['_id', '__v', 'subjectId', 'course', 'academicYear', 'createdAt', 'updatedAt'];
//       const poKeys = Object.keys(poDocs[0]).filter(key => !excludedKeys.includes(key));

//       sheet3.columns = poKeys.map(key => {
//         return { header: key.toUpperCase(), key: key, width: 15 };
//       });

//       sheet3.getRow(1).font = { bold: true };
//       sheet3.addRows(poDocs);
//     }

//     // --- SAVE AND SEND ---
//     await workbook.xlsx.writeFile(filePath);
//     console.log('🚀 Excel File Generated Successfully!');
//     res.download(filePath, fileName);

//   } catch (error) {
//     console.error('Error generating report:', error);
//     res.status(500).json({ message: 'Internal server error while generating report.' });
//   }
// };

// module.exports = {
//     handleDownloadReport,
// }