const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Models
const calculatedMarks = require("../models/calculatedMarks");
const FinalCoAttainment = require("../models/finalAttainment");
const directPoAttainment = require("../models/calculatedPo");

// --- SHARED CONSTANTS & HELPERS FOR OPTIMIZATION ---
const STYLES = {
  center: { horizontal: 'center', vertical: 'middle' },
  right: { horizontal: 'right', vertical: 'middle', indent: 2 },
  bold: { bold: true },
  borderLight: {
    top: { style: 'thin', color: { argb: 'FFDDDDDD' } }, left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } }, right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
  },
  borderDark: {
    top: { style: 'thin', color: { argb: 'FFCCCCCC' } }, left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }, right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
  },
  borderFinal: {
    top: { style: 'thin', color: { argb: 'FFAAAAAA' } }, left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
    bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } }, right: { style: 'thin', color: { argb: 'FFAAAAAA' } }
  }
};

// Helper to safely format missing/empty values while keeping 0s
const formatVal = (val) => (val !== undefined && val !== null && val !== '') ? val : '-';

// Helper to apply uniform styles to a row
const styleRow = (row, { height = 25, alignment = STYLES.center, font = null, fillArgb = null, border = STYLES.borderLight }) => {
  if (height) row.height = height;
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.alignment = alignment;
    cell.border = border;
    if (font) cell.font = font;
    if (fillArgb) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
  });
};

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

    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    // Uncomment for production caching
    
    if (fs.existsSync(filePath)) {
      console.log('Serving existing Excel file from cache...');
      return res.download(filePath, fileName); 
    }
    

    console.log(`\n--- Fetching Data for ${subjectId} | ${course} | ${academicYear} ---`);

    const [marksResponse, coDocs, poDocs] = await Promise.all([
      calculatedMarks.find({ subjectId, course, academicYear }).lean(),
      FinalCoAttainment.find({ subjectId, course, academicYear }).lean(),
      directPoAttainment.find({ subjectId, course, academicYear }).lean()
    ]);

    const marksDoc = Array.isArray(marksResponse) ? marksResponse[0] : marksResponse;
    if (!marksDoc?.actualMarks?.length) {
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

    Object.keys(sampleMarks).forEach(key => {
      if (key.endsWith('_TOTAL')) return; 
      const match = key.match(/(.*)_(CO\d+)/); 
      if (match) {
        const [, compName, coName] = match;
        if (!componentMap[compName]) {
          componentMap[compName] = [];
          orderedComponents.push(compName);
        }
        componentMap[compName].push(coName);
      }
    });

    orderedComponents.forEach(comp => componentMap[comp].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))));

    const row1 = ['Reg No'], row2 = [''];
    orderedComponents.forEach(comp => {
      const cos = componentMap[comp];
      row1.push(comp.replace(/_/g, ' '), ...Array(cos.length).fill(''));
      row2.push(...cos, 'Total');
    });

    sheet1.addRow(row1);
    sheet1.addRow(row2);

    sheet1.mergeCells(1, 1, 2, 1); 
    let currentCol = 2; 
    orderedComponents.forEach(comp => {
      const numCols = componentMap[comp].length + 1;
      sheet1.mergeCells(1, currentCol, 1, currentCol + numCols - 1);
      currentCol += numCols; 
    });

    sheet1.getRow(1).alignment = STYLES.center;
    sheet1.getRow(1).font = STYLES.bold;
    sheet1.getRow(2).alignment = STYLES.center;
    sheet1.getRow(2).font = STYLES.bold;

    const studentRows = marksDoc.actualMarks.map(({ regNo, marks: m }) => {
      const row = [regNo];
      orderedComponents.forEach(comp => {
        componentMap[comp].forEach(co => row.push(formatVal(m[`${comp}_${co}`])));
        row.push(formatVal(m[`${comp}_TOTAL`]));
      });
      return row;
    });
    sheet1.addRows(studentRows);

    const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
    const calcRowsData = Array.from({ length: 5 }, (_, i) => [calcLabels[i]]);

    orderedComponents.forEach(comp => {
      [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
        const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
        const calc = marksDoc.reportData[key] || {};
        calcRowsData[0].push(formatVal(calc.maxMarks));
        calcRowsData[1].push(formatVal(calc.targetMarks));
        calcRowsData[2].push(formatVal(calc.studentsAboveTarget));
        calcRowsData[3].push(formatVal(calc.attainmentPercent));
        calcRowsData[4].push(formatVal(calc.attainmentLevel));
      });
    });

    sheet1.addRows(calcRowsData);

    // ==========================================
    // SHEET 2: FINAL CO ATTAINMENT
    // ==========================================
    if (coDocs?.length > 0 && coDocs[0].attainmentTable) {
      console.log(`Formatting Sheet 2: Final CO Attainment...`);
      const sheet2 = workbook.addWorksheet('Final CO Attainment');
      const firstDoc = coDocs[0];

      sheet2.columns = [
        { header: "CO's", key: 'coId', width: 10 },
        { header: "Quiz 1", key: 'Quiz_1', width: 12 },
        { header: "Sessional 1", key: 'Mid_Term', width: 15 },
        { header: "Quiz 2", key: 'Quiz_2', width: 12 },
        { header: "Sessional 2", key: 'Surprise_Quiz', width: 15 },
        { header: "Assignment", key: 'Assignment', width: 15 },
        { header: "End Sem", key: 'externalLevel', width: 15 },
        { header: "Total Avg Int", key: 'internalAvg', width: 18 },
        { header: "Grand Total (50% int + 50% End term)", key: 'grandTotal', width: 40 }
      ];

      styleRow(sheet2.getRow(1), { height: 30, font: STYLES.bold, fillArgb: 'FFF2F2F2', border: STYLES.borderDark });

      const coRowsData = Object.entries(firstDoc.attainmentTable).map(([coName, coData]) => ({
        coId: coName,
        ...Object.fromEntries(Object.keys(coData).map(k => [k, formatVal(coData[k])]))
      }));

      const dataRows = sheet2.addRows(coRowsData);
      dataRows.forEach(row => styleRow(row, { height: 25, border: STYLES.borderLight }));

      const finalRow = sheet2.addRow(['Final CO Attainment', formatVal(firstDoc.finalSubjectAttainment)]);
      sheet2.mergeCells(finalRow.number, 1, finalRow.number, 8);
      
      finalRow.getCell(1).alignment = STYLES.right;
      finalRow.getCell(9).alignment = STYLES.center;
      styleRow(finalRow, { height: 30, font: STYLES.bold, fillArgb: 'FFE6E6E6', border: STYLES.borderDark });
      finalRow.getCell(1).alignment = STYLES.right; // Reapply after loop overrides it
    }

    // ==========================================
    // SHEET 3: FINAL PO ATTAINMENT
    // ==========================================
    if (poDocs?.length > 0 && poDocs[0].mappingData && poDocs[0].averageCo) {
      console.log(`Formatting Sheet 3: Final PO Attainment...`);
      const sheet3 = workbook.addWorksheet('Final PO Attainment');
      const firstPoDoc = poDocs[0];

      const poKeys = Object.keys(firstPoDoc.averageCo).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
        const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
        return textA === textB ? numA - numB : textA.localeCompare(textB);
      });

      sheet3.columns = [{ header: "CO's", key: 'coId', width: 15 }, ...poKeys.map(po => ({ header: po.toUpperCase(), key: po, width: 12 }))];
      styleRow(sheet3.getRow(1), { height: 30, font: STYLES.bold, fillArgb: 'FFF2F2F2', border: STYLES.borderDark });

      const mappingRowsData = Object.keys(firstPoDoc.mappingData).map(co => ({
        coId: co,
        ...Object.fromEntries(poKeys.map(po => [po, formatVal(firstPoDoc.mappingData[co][po])]))
      }));

      sheet3.addRows(mappingRowsData).forEach(row => styleRow(row, { height: 25, border: STYLES.borderLight }));

      // Summary 1: Average CO
      const avgRowData = { coId: 'Average', ...Object.fromEntries(poKeys.map(po => [po, formatVal(firstPoDoc.averageCo[po])])) };
      styleRow(sheet3.addRow(avgRowData), { height: 25, font: STYLES.bold, fillArgb: 'FFF9F9F9', border: STYLES.borderDark });

      // Summary 2: Final Subject Attainment
      const fsaRow = sheet3.addRow(['Final Subject Attainment', formatVal(firstPoDoc.finalSubjectAttainment)]);
      sheet3.mergeCells(fsaRow.number, 2, fsaRow.number, poKeys.length + 1);
      styleRow(fsaRow, { height: 30, font: STYLES.bold, fillArgb: 'FFEAEAEA', border: STYLES.borderDark });

      // Summary 3: Final PO Attainment
      const poAttnData = firstPoDoc.poAttainment || firstPoDoc.poAttainments || {};
      const poAttnRowData = { coId: 'Final PO Attainment' };
      poKeys.forEach(po => {
        let val = poAttnData[po];
        if (val === undefined) {
          const lowerKey = Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase());
          if (lowerKey) val = poAttnData[lowerKey];
        }
        poAttnRowData[po] = formatVal(val);
      });
      
      styleRow(sheet3.addRow(poAttnRowData), { height: 30, font: STYLES.bold, fillArgb: 'FFE0E0E0', border: STYLES.borderFinal });
    }

    // --- SAVE AND SEND ---
    await workbook.xlsx.writeFile(filePath);
    console.log(' Excel File Generated Successfully!');
    res.download(filePath, fileName);

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Internal server error while generating report.' });
  }
}

async function handleDownloadCalculatedMarks(req, res) {
  
}

module.exports = { handleDownloadReport };