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

        // Create Folder
        const reportFolder = path.join(
            process.cwd(),
            'downloads',
            'direct-po-reports'
        );

        if (!fs.existsSync(reportFolder)) {
            fs.mkdirSync(reportFolder, {
                recursive: true
            });
        }

        // Timestamp
        const now = new Date();

        const timestamp =
            now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            '_' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');

        const fileName =
            `Direct_PO_${course}_${academicYear}_${timestamp}.xlsx`;

        const filePath = path.join(
            reportFolder,
            fileName
        );

        const workbook = new ExcelJS.Workbook();

        workbook.creator = 'Attainment Calculator';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet(
            'Direct PO Attainment'
        );

        report.subjects.forEach(subject => {

            // Subject Title
            const titleRow = sheet.addRow([
                `${subject.subjectId} - ${subject.subjectName}`
            ]);

            titleRow.font = {
                bold: true,
                size: 14
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

            // Data Rows
            subject.tableData.forEach(row => {

                sheet.addRow([
                    row.course,
                    row.co,
                    row.attainmentLevel,
                    row.PO1,
                    row.PO2,
                    row.PO3,
                    row.PO4,
                    row.PO5,
                    row.PO6,
                    row.PO7,
                    row.PO8
                ]);
            });

            // Blank Lines Between Subjects
            sheet.addRow([]);
            sheet.addRow([]);
        });

        // Auto Column Width
        sheet.columns.forEach(column => {

            let maxLength = 15;

            column.eachCell(
                { includeEmpty: true },
                cell => {

                    const value = cell.value
                        ? cell.value.toString()
                        : '';

                    maxLength = Math.max(
                        maxLength,
                        value.length
                    );
                }
            );

            column.width = maxLength + 3;
        });

        // Save File
        await workbook.xlsx.writeFile(
            filePath
        );

        console.log(
            `Report Saved: ${filePath}`
        );

        // Download File
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