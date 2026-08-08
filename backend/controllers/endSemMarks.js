const ExcelJS = require('exceljs');
const xlsx = require('xlsx');
const fs = require('fs');
// Adjust the path below to wherever your model is saved
const Attainment = require('../models/endSemMarks'); 

const processEndSemMarks = async (req, res) => {
  try {
    // 1. Check for the uploaded file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // 2. Extract only academicYear from req.body (customMaxMarks removed)
    const { academicYear } = req.body; 

    // 3. Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if (data.length < 2) {
      return res.status(400).json({ message: 'Invalid or empty Excel file.' });
    }

    // 4. Find dynamic column indices from the header row (index 0)
    const headers = data[0]; 
    const getIndex = (name) => headers.findIndex(
      (h) => h && h.toString().trim().toLowerCase() === name.toLowerCase()
    );

    const idxRegNo = getIndex('Regno') !== -1 ? getIndex('Regno') : 0;
    const idxSubCode = getIndex('Sub Code');
    const idxSubName = getIndex('Sub Name');
    const idxRemarks = getIndex('Remarks');
    const idxAnsBook = getIndex('Ans Book No (AB/DT/MP)');
    
    const idx1a = getIndex('1a'), idx1b = getIndex('1b');
    const idx2a = getIndex('2a'), idx2b = getIndex('2b');
    const idx3a = getIndex('3a'), idx3b = getIndex('3b');
    const idx4a = getIndex('4a'), idx4b = getIndex('4b');
    const idx5a = getIndex('5a'), idx5b = getIndex('5b');

    // Extract Subject Details
    const firstRow = data[1];
    const subCode = (idxSubCode !== -1 && firstRow[idxSubCode]) ? firstRow[idxSubCode].toString().trim() : 'SUBJECT_CODE';
    const subName = (idxSubName !== -1 && firstRow[idxSubName]) ? firstRow[idxSubName].toString().trim() : 'SUBJECT_NAME';

    // 5. Initialize arrays for both Excel output and Database saving
    const outputData = [];
    const studentDBRecords = [];
    
    // Set up Excel Headers
    const titleRow = academicYear ? `${subCode} - ${subName} (${academicYear})` : `${subCode} - ${subName}`;
    outputData.push([titleRow]);
    outputData.push(['Reg No', 'End Sem', '', '', '', '', '']);
    outputData.push(['', 'CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'Total']);

    // 6. Loop through students
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[idxRegNo]) continue;

      const regNo = row[idxRegNo].toString();
      
      // Calculate sums strictly using parts a & b
      let co1 = (row[idx1a] || 0) + (row[idx1b] || 0);
      let co2 = (row[idx2a] || 0) + (row[idx2b] || 0);
      let co3 = (row[idx3a] || 0) + (row[idx3b] || 0);
      let co4 = (row[idx4a] || 0) + (row[idx4b] || 0);
      let co5 = (row[idx5a] || 0) + (row[idx5b] || 0);
      let total = co1 + co2 + co3 + co4 + co5;

      const remarks = idxRemarks !== -1 ? row[idxRemarks] : '';
      const ansBook = idxAnsBook !== -1 ? row[idxAnsBook] : '';

      // Handle absent students
      if (remarks === 'LEFT' || ansBook === 'AB') {
        co1 = 0; co2 = 0; co3 = 0; co4 = 0; co5 = 0; total = 0;
      }

      // Add to Excel output array
      outputData.push([regNo, co1, co2, co3, co4, co5, total]);

      // Add to MongoDB records array
      studentDBRecords.push({
        regNo,
        co1,
        co2,
        co3,
        co4,
        co5,
        total
      });
    }

    // 7. Finish Excel data by appending Max Marks statically (20 per CO, Total 100)
    outputData.push(['Max Marks/CO', 20, 20, 20, 20, 20, 100]);

    // 8. Save everything to MongoDB
    const newAttainmentRecord = new Attainment({
      subjectCode: subCode,
      subjectName: subName,
      academicYear: academicYear || '', 
      maxMarksPerCO: 20, // Statically set to 20 here as well
      students: studentDBRecords
    });
    
    await newAttainmentRecord.save();

    // 9. Generate and send the Excel file
    const newWb = xlsx.utils.book_new();
    const newWs = xlsx.utils.aoa_to_sheet(outputData);

    newWs['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, 
      { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } }, 
      { s: { r: 1, c: 1 }, e: { r: 1, c: 6 } }  
    ];

    xlsx.utils.book_append_sheet(newWb, newWs, 'Mapped Outcomes');
    const buffer = xlsx.write(newWb, { type: 'buffer', bookType: 'xlsx' });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.setHeader('Content-Disposition', `attachment; filename="${subCode}_Attainment_Mapped.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);

  } catch (error) {
    // Delete file if the process fails midway
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error generating attainment file:', error);
    res.status(500).json({ message: 'Internal server error processing attainment data', error: error.message });
  }
};




const downloadAttainmentData = async (req, res) => {
  try {
    const { subjectCode } = req.params;

    // Fetch the stored data from MongoDB
    const attainmentRecord = await Attainment.findOne({ subjectCode: subjectCode });

    if (!attainmentRecord) {
      return res.status(404).json({ message: 'Attainment data not found for this subject.' });
    }

    // Initialize a new ExcelJS Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('End Sem Marks');

    // Define column widths for better spacing
    worksheet.columns = [
      { width: 15 }, // A: Reg No
      { width: 10 }, // B: CO1
      { width: 10 }, // C: CO2
      { width: 10 }, // D: CO3
      { width: 10 }, // E: CO4
      { width: 10 }, // F: CO5
      { width: 12 }  // G: Total
    ];

    // 1. Add Data Rows
    worksheet.addRow(['Reg No', 'End Sem', '', '', '', '', '']);
    worksheet.addRow(['', 'CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'Total']);

    // Loop through the embedded students array
    attainmentRecord.students.forEach((student) => {
      worksheet.addRow([
        student.regNo,
        student.co1,
        student.co2,
        student.co3,
        student.co4,
        student.co5,
        student.total
      ]);
    });

    // Append the Max Marks row at the bottom
    const max = attainmentRecord.maxMarksPerCO || 20;
    worksheet.addRow(['Max Marks/CO', max, max, max, max, max, max * 5]);

    // 2. Apply Merges
    worksheet.mergeCells('A1:A2'); // Merge 'Reg No' vertically
    worksheet.mergeCells('B1:G1'); // Merge 'End Sem' horizontally

    // 3. Styling: Borders and Alignment
    const thinBorder = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    const centerAlignment = { 
      vertical: 'middle', 
      horizontal: 'center', 
      wrapText: true 
    };

    // Apply borders and centering to every populated cell
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.alignment = centerAlignment;
      });
    });

    // 4. Styling: Background Colors
    // Reg No (A1) - Pale Red/Rose
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD99694' } 
    };

    // End Sem (B1) - Pale Green
    worksheet.getCell('B1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEBF1DE' } 
    };

    // CO1 to Total headers (B2 to G2) - Pale Yellow
    const yellowCells = ['B2', 'C2', 'D2', 'E2', 'F2', 'G2'];
    yellowCells.forEach(cellRef => {
      worksheet.getCell(cellRef).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFCC' }
      };
    });

    // Max Marks header (Bottom Left Cell) - Pale Orange
    const lastRowNumber = worksheet.rowCount;
    worksheet.getCell(`A${lastRowNumber}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFCD5B4' }
    };

    // 5. Send File to Client
    res.setHeader('Content-Disposition', `attachment; filename="${subjectCode}_Attainment.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Write directly to the response stream
    await workbook.xlsx.write(res);
    return res.end();

  } catch (error) {
    console.error('Error generating attainment file:', error);
    res.status(500).json({ message: 'Internal server error while generating file', error: error.message });
  }
};

module.exports = {
  processEndSemMarks,
  downloadAttainmentData
};