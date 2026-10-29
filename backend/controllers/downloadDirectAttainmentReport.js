// const ExcelJS = require('exceljs');
// const DirectPoAttainment = require('../models/directAttainment');

// const handleDownloadDirectPoReport = async (req, res) => {
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

//         // 4.5 Add Main Report Meta Data (Course & Batch)
//         const mainTitleRow = sheet.addRow(['Direct PO Attainment Report']);
//         mainTitleRow.font = { bold: true, size: 16, color: { argb: 'FF000000' } };
//         mainTitleRow.alignment = { horizontal: 'center', vertical: 'middle' };
//         sheet.mergeCells(`A${mainTitleRow.number}:K${mainTitleRow.number}`);

//         const courseRow = sheet.addRow([`Course: ${course}`]);
//         courseRow.font = { bold: true, size: 12 };
//         courseRow.alignment = { horizontal: 'center', vertical: 'middle' };
//         sheet.mergeCells(`A${courseRow.number}:K${courseRow.number}`);

//         const batchRow = sheet.addRow([`Batch / Academic Year: ${academicYear}`]);
//         batchRow.font = { bold: true, size: 12 };
//         batchRow.alignment = { horizontal: 'center', vertical: 'middle' };
//         sheet.mergeCells(`A${batchRow.number}:K${batchRow.number}`);

//         // Add a blank row for spacing before the subjects start
//         sheet.addRows([[], [], []]);

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
//     handleDownloadDirectPoReport
// };








const puppeteer = require('puppeteer');
const ejs = require('ejs');
const ExcelJS = require('exceljs');
const DirectPoAttainment = require('../models/directAttainment');

const handleDownloadDirectPoReport = async (req, res) => {
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
        const sheet = workbook.addWorksheet('Direct Attainment');

        // 4. Define Standard Columns (Expanded for PSOs)
        sheet.columns = [
            { width: 20 }, // A: Course
            { width: 8 },  // B: CO
            { width: 16 }, // C: Attainment Level
            { width: 8 },  // D: PO1
            { width: 8 },  // E: PO2
            { width: 8 },  // F: PO3
            { width: 8 },  // G: PO4
            { width: 8 },  // H: PO5
            { width: 8 },  // I: PO6
            { width: 8 },  // J: PO7
            { width: 8 },  // K: PO8
            { width: 8 },  // L: PSO1
            { width: 8 },  // M: PSO2
            { width: 8 }   // N: PSO3
        ];

        // 4.5 Add Main Report Meta Data (Course & Batch)
        // Note: Merging A to N to cover all 14 columns
        const mainTitleRow = sheet.addRow(['Direct PO & PSO Attainment Report']);
        mainTitleRow.font = { bold: true, size: 16, color: { argb: 'FF000000' } };
        mainTitleRow.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${mainTitleRow.number}:N${mainTitleRow.number}`);

        const courseRow = sheet.addRow([`Course: ${course}`]);
        courseRow.font = { bold: true, size: 12 };
        courseRow.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${courseRow.number}:N${courseRow.number}`);

        const batchRow = sheet.addRow([`Batch / Academic Year: ${academicYear}`]);
        batchRow.font = { bold: true, size: 12 };
        batchRow.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${batchRow.number}:N${batchRow.number}`);

        // Add a blank row for spacing before the subjects start
        sheet.addRows([[], [], []]);

        // 5. Populate Data
        report.subjects.forEach(subject => {
            // --- Subject Title Row ---
            const titleRow = sheet.addRow([`${subject.subjectId} - ${subject.subjectName || 'Unknown Subject'}`]);
            titleRow.font = { bold: true, size: 14 };
            titleRow.alignment = { horizontal: 'center' };
            sheet.mergeCells(`A${titleRow.number}:N${titleRow.number}`);

            // --- Header Row ---
            const headerRow = sheet.addRow([
                'Course', 'CO', 'Attainment Level', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PSO1', 'PSO2', 'PSO3'
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
                    row.PO5 ?? '', row.PO6 ?? '', row.PO7 ?? '', row.PO8 ?? '',
                    row.PSO1 ?? '', row.PSO2 ?? '', row.PSO3 ?? ''
                ]);
            });

            const lastDataRow = sheet.rowCount;

            // Merge the 'Course' column cells dynamically for better visual grouping
            if (lastDataRow > firstDataRow) {
                sheet.mergeCells(firstDataRow, 1, lastDataRow, 1);
            }
            sheet.getCell(`A${firstDataRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

            // --- Direct Attainment Summary Row ---
            // Checks for both the new string ('Direct Attainment') and legacy strings ('Direct PO Attainment')
            const directPoRow = subject.tableData.find(row => 
                row.course === 'Direct Attainment' || row.course === 'Direct PO Attainment'
            );
            
            if (directPoRow) {
                const summaryRow = sheet.addRow([
                    'Direct Attainment', '', '',
                    directPoRow.PO1 ?? '', directPoRow.PO2 ?? '', directPoRow.PO3 ?? '', directPoRow.PO4 ?? '',
                    directPoRow.PO5 ?? '', directPoRow.PO6 ?? '', directPoRow.PO7 ?? '', directPoRow.PO8 ?? '',
                    directPoRow.PSO1 ?? '', directPoRow.PSO2 ?? '', directPoRow.PSO3 ?? ''
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
        const fileName = `Direct_Attainment_${course}_${academicYear}.xlsx`;

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




/**
 * @desc    Download Direct Attainment Report in PDF Format (Using Puppeteer & EJS)
 * @route   POST or GET /api/copo/download-direct-pdf
 */

const handleDownloadDirectPoReportPDF = async (req, res) => {
    let browser = null;

    try {
        const course = req.body?.course || req.query?.course;
        const academicYear = req.body?.academicYear || req.query?.academicYear;

        // 1. Validate Input
        if (!course || !academicYear) {
            return res.status(400).json({ success: false, message: 'Course and Academic Year are required' });
        }

        // 2. Fetch the report from the database
        const report = await DirectPoAttainment.findOne({ course, academicYear }).lean();

        if (!report || !report.subjects || report.subjects.length === 0) {
            return res.status(404).json({ success: false, message: 'Report data not found for the specified criteria' });
        }

        // 3. Define the HTML Template for the PDF using EJS syntax
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #333; margin: 0; }
                h1 { text-align: center; margin-bottom: 5px; font-size: 18px; }
                .subtitle { text-align: center; margin-bottom: 20px; font-size: 12px; color: #555; }
                .subject-section { page-break-inside: avoid; margin-bottom: 30px; }
                h2 { font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed; }
                th, td { border: 1px solid #ddd; padding: 6px; word-wrap: break-word; }
                th { background-color: #f4f4f4; font-weight: bold; font-size: 11px; text-align: center; }
                .summary-row { font-weight: bold; background-color: #f9f9f9; }
                .summary-row td { border-top: 2px solid #666; }
                .text-center { text-align: center; }
                .text-right { text-align: right; padding-right: 15px; }
            </style>
        </head>
        <body>
            <h1>Direct PO & PSO Attainment Report</h1>
            <div class="subtitle">Course: <strong><%= course %></strong> | Batch / Academic Year: <strong><%= academicYear %></strong></div>

            <% report.subjects.forEach(function(subject) { %>
                <div class="subject-section">
                    <h2><%= subject.subjectId %> - <%= subject.subjectName || 'Unknown Subject' %></h2>
                    <table>
                        <!-- Strict column sizing prevents shifted calculations in PDF -->
                        <colgroup>
                            <col style="width: 14%;">
                            <col style="width: 8%;">
                            <col style="width: 12%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                            <col style="width: 6%;">
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>CO</th>
                                <th>Level</th>
                                <th>PO1</th>
                                <th>PO2</th>
                                <th>PO3</th>
                                <th>PO4</th>
                                <th>PO5</th>
                                <th>PO6</th>
                                <th>PO7</th>
                                <th>PO8</th>
                                <th>PSO1</th>
                                <th>PSO2</th>
                                <th>PSO3</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% subject.tableData.forEach(function(row, index) { 
                                const isSummary = row.course === 'Direct Attainment' || row.course === 'Direct PO Attainment';
                                const printCourse = index === 0 ? subject.subjectId : (isSummary ? 'Direct Attainment' : '');
                            %>
                                <tr class="<%= isSummary ? 'summary-row' : '' %>">
                                    
                                    <!-- Clean separation of Summary vs Normal row prevents missing cells -->
                                    <% if (isSummary) { %>
                                        <td class="text-right" colspan="3"><%= printCourse %></td>
                                    <% } else { %>
                                        <td class="text-center"><%= printCourse %></td>
                                        <td class="text-center"><%= row.co || '' %></td>
                                        <td class="text-center"><%= (row.attainmentLevel === null || row.attainmentLevel === undefined || row.attainmentLevel === '') ? '-' : row.attainmentLevel %></td>
                                    <% } %>

                                    <!-- Standard 11 Calculation Columns -->
                                    <td class="text-center"><%= (row.PO1 === null || row.PO1 === undefined || row.PO1 === '') ? '-' : row.PO1 %></td>
                                    <td class="text-center"><%= (row.PO2 === null || row.PO2 === undefined || row.PO2 === '') ? '-' : row.PO2 %></td>
                                    <td class="text-center"><%= (row.PO3 === null || row.PO3 === undefined || row.PO3 === '') ? '-' : row.PO3 %></td>
                                    <td class="text-center"><%= (row.PO4 === null || row.PO4 === undefined || row.PO4 === '') ? '-' : row.PO4 %></td>
                                    <td class="text-center"><%= (row.PO5 === null || row.PO5 === undefined || row.PO5 === '') ? '-' : row.PO5 %></td>
                                    <td class="text-center"><%= (row.PO6 === null || row.PO6 === undefined || row.PO6 === '') ? '-' : row.PO6 %></td>
                                    <td class="text-center"><%= (row.PO7 === null || row.PO7 === undefined || row.PO7 === '') ? '-' : row.PO7 %></td>
                                    <td class="text-center"><%= (row.PO8 === null || row.PO8 === undefined || row.PO8 === '') ? '-' : row.PO8 %></td>
                                    <td class="text-center"><%= (row.PSO1 === null || row.PSO1 === undefined || row.PSO1 === '') ? '-' : row.PSO1 %></td>
                                    <td class="text-center"><%= (row.PSO2 === null || row.PSO2 === undefined || row.PSO2 === '') ? '-' : row.PSO2 %></td>
                                    <td class="text-center"><%= (row.PSO3 === null || row.PSO3 === undefined || row.PSO3 === '') ? '-' : row.PSO3 %></td>
                                </tr>
                            <% }); %>
                        </tbody>
                    </table>
                </div>
            <% }); %>
        </body>
        </html>
        `;

        // 4. Render the HTML using EJS
        const compiledHtml = ejs.render(htmlTemplate, { course, academicYear, report });

        // 5. Launch Puppeteer to generate the PDF
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });

        const page = await browser.newPage();
        
        // Load the HTML content directly into memory
        await page.setContent(compiledHtml, { waitUntil: 'networkidle0' });

        // Generate the PDF Buffer in Landscape mode
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true, 
            printBackground: true,
            // Adjusted margins to utilize empty space
            margin: { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' },
            // Removed header and footer completely
            displayHeaderFooter: false
        });

        // 6. Send the PDF to the client
        const fileName = `Direct_Attainment_${course}_${academicYear}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        return res.end(pdfBuffer);

    } catch (error) {
        console.error('Download PDF Report Error (Puppeteer):', error);

        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: 'Internal Server Error while generating PDF file.' });
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};


module.exports = {
    handleDownloadDirectPoReport,
    handleDownloadDirectPoReportPDF,
};