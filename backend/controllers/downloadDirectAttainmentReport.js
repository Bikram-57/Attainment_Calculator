// const ExcelJS = require('exceljs');
// const DirectPoAttainment = require('../models/directAttainment');

// const downloadDirectPoReport = async (req, res) => {
//     try {
//         const { course, academicYear } = req.body;

//         // 1. Validate Input
//         if (!course || !academicYear) {
//             return res.status(400).json({ success: false, message: 'Course and Academic Year are required' });
//         }

//         // 2. Fetch the report from the database (.lean() ensures fast reads)
//         const report = await DirectPoAttainment.findOne({ course, academicYear }).lean();

//         if (!report || !report.subjects || report.subjects.length === 0) {
//             return res.status(404).json({ success: false, message: 'Report data not found for the specified criteria' });
//         }

//         // 3. Initialize Excel Workbook
//         const workbook = new ExcelJS.Workbook();
//         workbook.creator = 'Attainment Calculator';
//         workbook.created = new Date();
//         const sheet = workbook.addWorksheet('Direct PO Attainment');

//         // 4. Define Standard Columns
//         sheet.columns = [
//             { width: 20 }, // A: Course
//             { width: 8 },  // B: CO
//             { width: 16 }, // C: Attainment
//             { width: 8 },  // D: PO1
//             { width: 8 },  // E: PO2
//             { width: 8 },  // F: PO3
//             { width: 8 },  // G: PO4
//             { width: 8 },  // H: PO5
//             { width: 8 },  // I: PO6
//             { width: 8 },  // J: PO7
//             { width: 8 }   // K: PO8
//         ];

//         // 5. Populate Data
//         report.subjects.forEach(subject => {
//             // --- Subject Title Row ---
//             const titleRow = sheet.addRow([`${subject.subjectId} - ${subject.subjectName || 'Unknown Subject'}`]);
//             titleRow.font = { bold: true, size: 14 };
//             titleRow.alignment = { horizontal: 'center' };
//             sheet.mergeCells(`A${titleRow.number}:K${titleRow.number}`);

//             // --- Header Row ---
//             const headerRow = sheet.addRow([
//                 'Course', 'CO', 'Attainment Level', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8'
//             ]);
//             headerRow.font = { bold: true };
//             headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

//             // Find rows containing actual CO data
//             const coRows = subject.tableData.filter(row => row.co);
//             const firstDataRow = sheet.rowCount + 1;

//             // --- Data Rows ---
//             coRows.forEach((row, index) => {
//                 sheet.addRow([
//                     index === 0 ? subject.subjectId : '', // Only print Subject ID on the first row
//                     row.co,
//                     row.attainmentLevel,
//                     row.PO1 ?? '', row.PO2 ?? '', row.PO3 ?? '', row.PO4 ?? '',
//                     row.PO5 ?? '', row.PO6 ?? '', row.PO7 ?? '', row.PO8 ?? ''
//                 ]);
//             });

//             const lastDataRow = sheet.rowCount;

//             // Merge the 'Course' column cells dynamically for better visual grouping
//             if (lastDataRow > firstDataRow) {
//                 sheet.mergeCells(firstDataRow, 1, lastDataRow, 1);
//             }
//             sheet.getCell(`A${firstDataRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

//             // --- Direct PO Summary Row ---
//             const directPoRow = subject.tableData.find(row => row.course === 'Direct PO Attainment');
//             if (directPoRow) {
//                 const summaryRow = sheet.addRow([
//                     'Direct PO Attainment', '', '',
//                     directPoRow.PO1 ?? '', directPoRow.PO2 ?? '', directPoRow.PO3 ?? '', directPoRow.PO4 ?? '',
//                     directPoRow.PO5 ?? '', directPoRow.PO6 ?? '', directPoRow.PO7 ?? '', directPoRow.PO8 ?? ''
//                 ]);

//                 // Merge the first three columns for the summary label
//                 sheet.mergeCells(`A${summaryRow.number}:C${summaryRow.number}`);
//                 summaryRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
//                 summaryRow.font = { bold: true };
//             }

//             // Add visual spacing between subjects
//             sheet.addRow([]);
//             sheet.addRow([]);
//         });

//         // 6. Apply Borders & Formatting Globally
//         sheet.eachRow(row => {
//             row.eachCell(cell => {
//                 // Skip empty spacing rows
//                 if (cell.value === null || cell.value === undefined || cell.value === '') {
//                     // We only apply borders if the row actually contains data
//                     if (!row.hasValues) return; 
//                 }

//                 cell.alignment = { horizontal: 'center', vertical: 'middle', ...cell.alignment };
//                 cell.border = {
//                     top: { style: 'thin' },
//                     left: { style: 'thin' },
//                     bottom: { style: 'thin' },
//                     right: { style: 'thin' }
//                 };
//             });
//         });

//         // 7. Stream the File Directly to the Client (No Disk I/O!)
//         const fileName = `Direct_PO_${course}_${academicYear}.xlsx`;

//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

//         // Write directly to the response object
//         await workbook.xlsx.write(res);

//         // Terminate the connection safely
//         res.end();

//     } catch (error) {
//         console.error('Download Report Error:', error);

//         // Prevent crashing if headers were already sent during stream failure
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, error: 'Internal Server Error while generating Excel file.' });
//         }
//     }
// };

// module.exports = {
//     downloadDirectPoReport
// };















const ExcelJS = require('exceljs');
const DirectPoAttainment = require('../models/directAttainment');

const downloadDirectPoReport = async (req, res) => {
    try {
        const { course, academicYear } = req.body;

        // 1. Validate Input
        if (!course || !academicYear) {
            return res.status(400).json({ success: false, message: 'Course and Academic Year are required' });
        }

        // 2. Fetch the report from the database (.lean() ensures fast reads)
        const report = await DirectPoAttainment.findOne({ course, academicYear }).lean();

        if (!report || !report.subjects || report.subjects.length === 0) {
            return res.status(404).json({ success: false, message: 'Report data not found for the specified criteria' });
        }

        // 3. Initialize Excel Workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Attainment Calculator';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Direct PO Attainment');

        // 4. Define Standard Columns
        sheet.columns = [
            { width: 20 }, // A: Course
            { width: 8 },  // B: CO
            { width: 16 }, // C: Attainment
            { width: 8 },  // D: PO1
            { width: 8 },  // E: PO2
            { width: 8 },  // F: PO3
            { width: 8 },  // G: PO4
            { width: 8 },  // H: PO5
            { width: 8 },  // I: PO6
            { width: 8 },  // J: PO7
            { width: 8 }   // K: PO8
        ];

        // 4.5 Add Main Report Meta Data (Course & Batch)
        const mainTitleRow = sheet.addRow(['Direct PO Attainment Report']);
        mainTitleRow.font = { bold: true, size: 16, color: { argb: 'FF000000' } };
        mainTitleRow.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${mainTitleRow.number}:K${mainTitleRow.number}`);

        const courseRow = sheet.addRow([`Course: ${course}`]);
        courseRow.font = { bold: true, size: 12 };
        courseRow.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${courseRow.number}:K${courseRow.number}`);

        const batchRow = sheet.addRow([`Batch / Academic Year: ${academicYear}`]);
        batchRow.font = { bold: true, size: 12 };
        batchRow.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${batchRow.number}:K${batchRow.number}`);

        // Add a blank row for spacing before the subjects start
        sheet.addRows([[], [], []]);

        // 5. Populate Data
        report.subjects.forEach(subject => {
            // --- Subject Title Row ---
            const titleRow = sheet.addRow([`${subject.subjectId} - ${subject.subjectName || 'Unknown Subject'}`]);
            titleRow.font = { bold: true, size: 14 };
            titleRow.alignment = { horizontal: 'center' };
            sheet.mergeCells(`A${titleRow.number}:K${titleRow.number}`);

            // --- Header Row ---
            const headerRow = sheet.addRow([
                'Course', 'CO', 'Attainment Level', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8'
            ]);
            headerRow.font = { bold: true };
            headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

            // Find rows containing actual CO data
            const coRows = subject.tableData.filter(row => row.co);
            const firstDataRow = sheet.rowCount + 1;

            // --- Data Rows ---
            coRows.forEach((row, index) => {
                sheet.addRow([
                    index === 0 ? subject.subjectId : '', // Only print Subject ID on the first row
                    row.co,
                    row.attainmentLevel,
                    row.PO1 ?? '', row.PO2 ?? '', row.PO3 ?? '', row.PO4 ?? '',
                    row.PO5 ?? '', row.PO6 ?? '', row.PO7 ?? '', row.PO8 ?? ''
                ]);
            });

            const lastDataRow = sheet.rowCount;

            // Merge the 'Course' column cells dynamically for better visual grouping
            if (lastDataRow > firstDataRow) {
                sheet.mergeCells(firstDataRow, 1, lastDataRow, 1);
            }
            sheet.getCell(`A${firstDataRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

            // --- Direct PO Summary Row ---
            const directPoRow = subject.tableData.find(row => row.course === 'Direct PO Attainment');
            if (directPoRow) {
                const summaryRow = sheet.addRow([
                    'Direct PO Attainment', '', '',
                    directPoRow.PO1 ?? '', directPoRow.PO2 ?? '', directPoRow.PO3 ?? '', directPoRow.PO4 ?? '',
                    directPoRow.PO5 ?? '', directPoRow.PO6 ?? '', directPoRow.PO7 ?? '', directPoRow.PO8 ?? ''
                ]);

                // Merge the first three columns for the summary label
                sheet.mergeCells(`A${summaryRow.number}:C${summaryRow.number}`);
                summaryRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
                summaryRow.font = { bold: true };
            }

            // Add visual spacing between subjects
            sheet.addRow([]);
            sheet.addRow([]);
        });

        // 6. Apply Borders & Formatting Globally
        sheet.eachRow(row => {
            row.eachCell(cell => {
                // Skip empty spacing rows
                if (cell.value === null || cell.value === undefined || cell.value === '') {
                    // We only apply borders if the row actually contains data
                    if (!row.hasValues) return;
                }

                cell.alignment = { horizontal: 'center', vertical: 'middle', ...cell.alignment };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // 7. Stream the File Directly to the Client (No Disk I/O!)
        const fileName = `Direct_PO_${course}_${academicYear}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Write directly to the response object
        await workbook.xlsx.write(res);

        // Terminate the connection safely
        res.end();

    } catch (error) {
        console.error('Download Report Error:', error);

        // Prevent crashing if headers were already sent during stream failure
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: 'Internal Server Error while generating Excel file.' });
        }
    }
};

module.exports = {
    downloadDirectPoReport
};









// const ExcelJS = require('exceljs');
// const fs = require('fs');
// const path = require('path');

// const DirectPoAttainment = require('../models/directAttainment');

// const downloadDirectPoReport = async (req, res) => {
//     try {

//         const { course, academicYear } = req.body;

//         if (!course || !academicYear) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Course and Academic Year are required'
//             });
//         }

//         // Fetch report
//         const report = await DirectPoAttainment.findOne({
//             course,
//             academicYear
//         }).lean();

//         if (!report) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Report not found'
//             });
//         }

//         // Create download folder
//         const reportFolder = path.join(
//             process.cwd(),
//             'downloads',
//             'Direct_Attainment_Download'
//         );

//         if (!fs.existsSync(reportFolder)) {
//             fs.mkdirSync(reportFolder, {
//                 recursive: true
//             });
//         }

//         const fileName =
//             `Direct_PO_${course}_${academicYear}.xlsx`;

//         const filePath = path.join(
//             reportFolder,
//             fileName
//         );

//         // Return existing file if present
//         if (fs.existsSync(filePath)) {

//             console.log(
//                 `Using existing file: ${fileName}`
//             );

//             return res.download(
//                 filePath,
//                 fileName
//             );
//         }

//         const workbook = new ExcelJS.Workbook();

//         workbook.creator =
//             'Attainment Calculator';

//         workbook.created = new Date();

//         const sheet = workbook.addWorksheet(
//             'Direct PO Attainment'
//         );

//         // Fixed widths
//         sheet.columns = [
//             { width: 20 }, // Course
//             { width: 8 },  // CO
//             { width: 16 }, // Attainment
//             { width: 8 },  // PO1
//             { width: 8 },  // PO2
//             { width: 8 },  // PO3
//             { width: 8 },  // PO4
//             { width: 8 },  // PO5
//             { width: 8 },  // PO6
//             { width: 8 },  // PO7
//             { width: 8 }   // PO8
//         ];

//         report.subjects.forEach(subject => {

//             // Subject Heading
//             const titleRow = sheet.addRow([
//                 `${subject.subjectId} - ${subject.subjectName || 'Unknown Subject'}`
//             ]);

//             titleRow.font = {
//                 bold: true,
//                 size: 14
//             };

//             titleRow.alignment = {
//                 horizontal: 'center'
//             };

//             sheet.mergeCells(
//                 `A${titleRow.number}:K${titleRow.number}`
//             );

//             // Header Row
//             const headerRow = sheet.addRow([
//                 'Course',
//                 'CO',
//                 'Attainment Level',
//                 'PO1',
//                 'PO2',
//                 'PO3',
//                 'PO4',
//                 'PO5',
//                 'PO6',
//                 'PO7',
//                 'PO8'
//             ]);

//             headerRow.font = {
//                 bold: true
//             };

//             headerRow.alignment = {
//                 horizontal: 'center',
//                 vertical: 'middle'
//             };

//             // Get CO rows only
//             const coRows = subject.tableData.filter(
//                 row => row.co
//             );

//             const firstDataRow =
//                 sheet.rowCount + 1;

//             // Add CO rows
//             coRows.forEach((row, index) => {

//                 sheet.addRow([
//                     index === 0
//                         ? subject.subjectId
//                         : '',
//                     row.co,
//                     row.attainmentLevel,
//                     row.PO1 ?? '',
//                     row.PO2 ?? '',
//                     row.PO3 ?? '',
//                     row.PO4 ?? '',
//                     row.PO5 ?? '',
//                     row.PO6 ?? '',
//                     row.PO7 ?? '',
//                     row.PO8 ?? ''
//                 ]);
//             });

//             const lastDataRow =
//                 sheet.rowCount;

//             // Merge Course Column
//             if (
//                 lastDataRow >
//                 firstDataRow
//             ) {
//                 sheet.mergeCells(
//                     firstDataRow,
//                     1,
//                     lastDataRow,
//                     1
//                 );
//             }

//             // Center merged cell
//             sheet.getCell(
//                 `A${firstDataRow}`
//             ).alignment = {
//                 horizontal: 'center',
//                 vertical: 'middle'
//             };

//             // Direct PO Row
//             const directPoRow =
//                 subject.tableData.find(
//                     row =>
//                         row.course ===
//                         'Direct PO Attainment'
//                 );

//             if (directPoRow) {

//                 sheet.addRow([
//                     'Direct PO Attainment',
//                     '',
//                     '',
//                     directPoRow.PO1 ?? '',
//                     directPoRow.PO2 ?? '',
//                     directPoRow.PO3 ?? '',
//                     directPoRow.PO4 ?? '',
//                     directPoRow.PO5 ?? '',
//                     directPoRow.PO6 ?? '',
//                     directPoRow.PO7 ?? '',
//                     directPoRow.PO8 ?? ''
//                 ]);
//             }

//             // Empty rows between subjects
//             sheet.addRow([]);
//             sheet.addRow([]);
//         });

//         // Apply borders and alignment
//         sheet.eachRow(row => {

//             row.eachCell(cell => {

//                 cell.alignment = {
//                     horizontal: 'center',
//                     vertical: 'middle'
//                 };

//                 cell.border = {
//                     top: {
//                         style: 'thin'
//                     },
//                     left: {
//                         style: 'thin'
//                     },
//                     bottom: {
//                         style: 'thin'
//                     },
//                     right: {
//                         style: 'thin'
//                     }
//                 };
//             });
//         });

//         // Save workbook
//         await workbook.xlsx.writeFile(
//             filePath
//         );

//         console.log(
//             `Report Generated: ${filePath}`
//         );

//         return res.download(
//             filePath,
//             fileName
//         );

//     } catch (error) {

//         console.error(
//             'Download Report Error:',
//             error
//         );

//         return res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// };

// module.exports = {
//     downloadDirectPoReport
// };