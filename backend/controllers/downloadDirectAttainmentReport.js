const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const DirectPoAttainment = require('../models/directAttainment');

const downloadDirectPoReport = async (req, res) => {
    try {

        const { course, academicYear } = req.body;

        if (!course || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'Course and Academic Year are required'
            });
        }

        // Fetch report
        const report = await DirectPoAttainment.findOne({
            course,
            academicYear
        }).lean();

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Create download folder
        const reportFolder = path.join(
            process.cwd(),
            'downloads',
            'Direct_Attainment_Download'
        );

        if (!fs.existsSync(reportFolder)) {
            fs.mkdirSync(reportFolder, {
                recursive: true
            });
        }

        const fileName =
            `Direct_PO_${course}_${academicYear}.xlsx`;

        const filePath = path.join(
            reportFolder,
            fileName
        );

        // Return existing file if present
        if (fs.existsSync(filePath)) {

            console.log(
                `Using existing file: ${fileName}`
            );

            return res.download(
                filePath,
                fileName
            );
        }

        const workbook = new ExcelJS.Workbook();

        workbook.creator =
            'Attainment Calculator';

        workbook.created = new Date();

        const sheet = workbook.addWorksheet(
            'Direct PO Attainment'
        );

        // Fixed widths
        sheet.columns = [
            { width: 20 }, // Course
            { width: 8 },  // CO
            { width: 16 }, // Attainment
            { width: 8 },  // PO1
            { width: 8 },  // PO2
            { width: 8 },  // PO3
            { width: 8 },  // PO4
            { width: 8 },  // PO5
            { width: 8 },  // PO6
            { width: 8 },  // PO7
            { width: 8 }   // PO8
        ];

        report.subjects.forEach(subject => {

            // Subject Heading
            const titleRow = sheet.addRow([
                `${subject.subjectId} - ${subject.subjectName || 'Unknown Subject'}`
            ]);

            titleRow.font = {
                bold: true,
                size: 14
            };

            titleRow.alignment = {
                horizontal: 'center'
            };

            sheet.mergeCells(
                `A${titleRow.number}:K${titleRow.number}`
            );

            // Header Row
            const headerRow = sheet.addRow([
                'Course',
                'CO',
                'Attainment Level',
                'PO1',
                'PO2',
                'PO3',
                'PO4',
                'PO5',
                'PO6',
                'PO7',
                'PO8'
            ]);

            headerRow.font = {
                bold: true
            };

            headerRow.alignment = {
                horizontal: 'center',
                vertical: 'middle'
            };

            // Get CO rows only
            const coRows = subject.tableData.filter(
                row => row.co
            );

            const firstDataRow =
                sheet.rowCount + 1;

            // Add CO rows
            coRows.forEach((row, index) => {

                sheet.addRow([
                    index === 0
                        ? subject.subjectId
                        : '',
                    row.co,
                    row.attainmentLevel,
                    row.PO1 ?? '',
                    row.PO2 ?? '',
                    row.PO3 ?? '',
                    row.PO4 ?? '',
                    row.PO5 ?? '',
                    row.PO6 ?? '',
                    row.PO7 ?? '',
                    row.PO8 ?? ''
                ]);
            });

            const lastDataRow =
                sheet.rowCount;

            // Merge Course Column
            if (
                lastDataRow >
                firstDataRow
            ) {
                sheet.mergeCells(
                    firstDataRow,
                    1,
                    lastDataRow,
                    1
                );
            }

            // Center merged cell
            sheet.getCell(
                `A${firstDataRow}`
            ).alignment = {
                horizontal: 'center',
                vertical: 'middle'
            };

            // Direct PO Row
            const directPoRow =
                subject.tableData.find(
                    row =>
                        row.course ===
                        'Direct PO Attainment'
                );

            if (directPoRow) {

                sheet.addRow([
                    'Direct PO Attainment',
                    '',
                    '',
                    directPoRow.PO1 ?? '',
                    directPoRow.PO2 ?? '',
                    directPoRow.PO3 ?? '',
                    directPoRow.PO4 ?? '',
                    directPoRow.PO5 ?? '',
                    directPoRow.PO6 ?? '',
                    directPoRow.PO7 ?? '',
                    directPoRow.PO8 ?? ''
                ]);
            }

            // Empty rows between subjects
            sheet.addRow([]);
            sheet.addRow([]);
        });

        // Apply borders and alignment
        sheet.eachRow(row => {

            row.eachCell(cell => {

                cell.alignment = {
                    horizontal: 'center',
                    vertical: 'middle'
                };

                cell.border = {
                    top: {
                        style: 'thin'
                    },
                    left: {
                        style: 'thin'
                    },
                    bottom: {
                        style: 'thin'
                    },
                    right: {
                        style: 'thin'
                    }
                };
            });
        });

        // Save workbook
        await workbook.xlsx.writeFile(
            filePath
        );

        console.log(
            `Report Generated: ${filePath}`
        );

        return res.download(
            filePath,
            fileName
        );

    } catch (error) {

        console.error(
            'Download Report Error:',
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    downloadDirectPoReport
};