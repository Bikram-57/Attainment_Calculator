const ExcelJS = require('exceljs');

// Models
const calculatedMarks = require("../models/calculatedMarks");
const FinalCoAttainment = require("../models/finalAttainment");
const directPoAttainment = require("../models/calculatedPo");

// ============================================================================
// SHARED CONSTANTS & HELPERS
// ============================================================================
const STYLES = {
    center: { horizontal: 'center', vertical: 'middle' },
    right: { horizontal: 'right', vertical: 'middle', indent: 2 },
    bold: { bold: true },
    borderBlack: {
        top: { style: 'thin', color: { argb: 'FF000000' } }, 
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } }, 
        right: { style: 'thin', color: { argb: 'FF000000' } }
    }
};

// Colors based on CA509A1.xlsx
const COMPONENT_COLORS = ['FFCCC1DA', 'FFC5D9F1']; // Alternating Purple and Blue
const REG_NO_COLOR = 'FFD99694'; // Peach/Red

// Helper: Format values safely (keeps 0s, replaces null/undefined with '-')
const formatVal = (val) => (val !== undefined && val !== null && val !== '') ? val : '-';

// Helper: Apply uniform styles to an entire Excel row
const styleRow = (row, { height = 25, alignment = STYLES.center, font = null, fillArgb = null, border = STYLES.borderBlack }) => {
    if (height) row.height = height;
    row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = alignment;
        cell.border = border;
        if (font) cell.font = font;
        if (fillArgb) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
    });
};

// Helper: Send Excel file directly to browser memory
const streamExcelToBrowser = async (res, workbook, fileName) => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    await workbook.xlsx.write(res);
    res.end();
};

// ============================================================================
// 1. Download Master Report (All 3 Sheets)
// ============================================================================
async function handleDownloadReport(req, res) {
    try {
        const { subjectId, course, academicYear } = req.query;

        if (!subjectId || !course || !academicYear) {
            return res.status(400).json({ message: "Missing subjectId, course, or academicYear" });
        }

        const safeYear = academicYear.replace(/\//g, '-');
        const fileName = `Report_${subjectId}_${safeYear}.xlsx`;

        // PARALLEL FETCH: Fetch all documents simultaneously
        const [marksDoc, coDoc, poDoc] = await Promise.all([
            calculatedMarks.findOne({ subjectId, course, academicYear }).lean(),
            FinalCoAttainment.findOne({ subjectId, course, academicYear }).lean(),
            directPoAttainment.findOne({ subjectId, course, academicYear }).lean()
        ]);

        if (!marksDoc?.actualMarks?.length) {
            return res.status(404).json({ message: "No marks data found for this subject and year." });
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'System';

        // ---------------------------------------------------------
        // SHEET 1: CALCULATED MARKS & ATTAINMENT
        // ---------------------------------------------------------
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

        const headerRow1 = sheet1.addRow(row1);
        const headerRow2 = sheet1.addRow(row2);
        sheet1.mergeCells(1, 1, 2, 1);
        
        // Apply "Reg No" Color & Black Border
        headerRow1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: REG_NO_COLOR } };
        headerRow2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: REG_NO_COLOR } };
        headerRow1.getCell(1).border = STYLES.borderBlack;
        headerRow2.getCell(1).border = STYLES.borderBlack;

        let currentCol = 2;
        orderedComponents.forEach((comp, index) => {
            const numCols = componentMap[comp].length + 1;
            sheet1.mergeCells(1, currentCol, 1, currentCol + numCols - 1);
            
            // Alternate colors based on index for the component and its COs
            const compColor = COMPONENT_COLORS[index % COMPONENT_COLORS.length];
            
            for (let c = 0; c < numCols; c++) {
                const targetCol = currentCol + c;
                const cellR1 = headerRow1.getCell(targetCol);
                const cellR2 = headerRow2.getCell(targetCol);
                
                cellR1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: compColor } };
                cellR2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: compColor } };
                
                cellR1.border = STYLES.borderBlack;
                cellR2.border = STYLES.borderBlack;
            }
            
            currentCol += numCols;
        });

        headerRow1.alignment = STYLES.center;
        headerRow1.font = STYLES.bold;
        headerRow2.alignment = STYLES.center;
        headerRow2.font = STYLES.bold;

        // Apply student rows with black borders
        marksDoc.actualMarks.forEach(({ regNo, marks: m }) => {
            const rowData = [regNo];
            orderedComponents.forEach(comp => {
                componentMap[comp].forEach(co => rowData.push(formatVal(m[`${comp}_${co}`])));
                rowData.push(formatVal(m[`${comp}_TOTAL`]));
            });
            
            const newRow = sheet1.addRow(rowData);
            newRow.eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = STYLES.center;
                cell.border = STYLES.borderBlack;
            });
        });

        // Apply calculation rows with black borders
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

        calcRowsData.forEach(rowData => {
            const newRow = sheet1.addRow(rowData);
            newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                cell.alignment = STYLES.center;
                cell.border = STYLES.borderBlack;
                if (colNumber === 1) {
                     cell.font = STYLES.bold;
                }
            });
        });

        // ---------------------------------------------------------
        // SHEET 2: FINAL CO ATTAINMENT
        // ---------------------------------------------------------
        if (coDoc?.attainmentTable) {
            const sheet2 = workbook.addWorksheet('Final CO Attainment');
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

            styleRow(sheet2.getRow(1), { height: 30, font: STYLES.bold, fillArgb: 'FFF2F2F2' });

            const coRowsData = Object.entries(coDoc.attainmentTable).map(([coName, coData]) => ({
                coId: coName,
                ...Object.fromEntries(Object.keys(coData).map(k => [k, formatVal(coData[k])]))
            }));

            sheet2.addRows(coRowsData).forEach(row => styleRow(row, { height: 25 }));

            let finalAttainmentValue = coDoc.finalSubjectAttainment;
            if (finalAttainmentValue === undefined) {
                let sumGrandTotal = 0, countGrandTotal = 0;
                Object.values(coDoc.attainmentTable).forEach(co => {
                    if (typeof co.grandTotal === 'number') { sumGrandTotal += co.grandTotal; countGrandTotal++; }
                });
                finalAttainmentValue = countGrandTotal > 0 ? parseFloat((sumGrandTotal / countGrandTotal).toFixed(2)) : undefined;
            }

            const finalRow = sheet2.addRow(['Final CO Attainment', '', '', '', '', '', '', '', formatVal(finalAttainmentValue)]);
            sheet2.mergeCells(finalRow.number, 1, finalRow.number, 8);
            styleRow(finalRow, { height: 30, font: STYLES.bold, fillArgb: 'FFE6E6E6' });
            finalRow.getCell(1).alignment = STYLES.right;
            finalRow.getCell(9).alignment = STYLES.center;
        }

        // ---------------------------------------------------------
        // SHEET 3: FINAL PO ATTAINMENT
        // ---------------------------------------------------------
        if (poDoc?.mappingData && poDoc?.averageCo) {
            const sheet3 = workbook.addWorksheet('Final PO Attainment');
            const poKeys = Object.keys(poDoc.averageCo).sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
                const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
                return textA === textB ? numA - numB : textA.localeCompare(textB);
            });

            sheet3.columns = [{ header: "CO's", key: 'coId', width: 15 }, ...poKeys.map(po => ({ header: po.toUpperCase(), key: po, width: 12 }))];
            styleRow(sheet3.getRow(1), { height: 30, font: STYLES.bold, fillArgb: 'FFF2F2F2' });

            const mappingRowsData = Object.keys(poDoc.mappingData).map(co => ({
                coId: co,
                ...Object.fromEntries(poKeys.map(po => [po, formatVal(poDoc.mappingData[co][po])]))
            }));

            sheet3.addRows(mappingRowsData).forEach(row => styleRow(row, { height: 25 }));

            const avgRowData = { coId: 'Average', ...Object.fromEntries(poKeys.map(po => [po, formatVal(poDoc.averageCo[po])])) };
            styleRow(sheet3.addRow(avgRowData), { height: 25, font: STYLES.bold, fillArgb: 'FFF9F9F9' });

            const fsaRow = sheet3.addRow(['Final Subject Attainment', formatVal(poDoc.finalSubjectAttainment)]);
            sheet3.mergeCells(fsaRow.number, 2, fsaRow.number, poKeys.length + 1);
            styleRow(fsaRow, { height: 30, font: STYLES.bold, fillArgb: 'FFEAEAEA' });

            const poAttnData = poDoc.poAttainment || poDoc.poAttainments || {};
            const poAttnRowData = { coId: 'Final PO Attainment' };
            poKeys.forEach(po => {
                let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
                poAttnRowData[po] = formatVal(val);
            });
            styleRow(sheet3.addRow(poAttnRowData), { height: 30, font: STYLES.bold, fillArgb: 'FFE0E0E0' });
        }

        // --- STREAM DIRECTLY TO BROWSER ---
        await streamExcelToBrowser(res, workbook, fileName);

    } catch (error) {
        console.error('Error generating report:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Internal server error while generating report.' });
    }
}





// ============================================================================
// 2. Download Calculated Marks ONLY
// ============================================================================
async function handleDownloadCalculatedMarks(req, res) {
    try {
        const { subjectId, course, academicYear } = req.query;
        if (!subjectId || !course || !academicYear) {
            return res.status(400).json({ message: "Missing subjectId, course, or academicYear" });
        }

        const safeYear = academicYear.replace(/\//g, '-');
        const fileName = `CalculatedMarks_${subjectId}_${safeYear}.xlsx`;

        // Used findOne() instead of find() to get the object directly
        const marksDoc = await calculatedMarks.findOne({ subjectId, course, academicYear }).lean();
        
        if (!marksDoc?.actualMarks?.length) {
            return res.status(404).json({ message: "No marks data found." });
        }

        const workbook = new ExcelJS.Workbook();
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

        const headerRow1 = sheet1.addRow(row1);
        const headerRow2 = sheet1.addRow(row2);
        sheet1.mergeCells(1, 1, 2, 1);
        
        // Apply "Reg No" Color & Black Border
        headerRow1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: REG_NO_COLOR } };
        headerRow2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: REG_NO_COLOR } };
        headerRow1.getCell(1).border = STYLES.borderBlack;
        headerRow2.getCell(1).border = STYLES.borderBlack;

        let currentCol = 2;
        orderedComponents.forEach((comp, index) => {
            const numCols = componentMap[comp].length + 1;
            sheet1.mergeCells(1, currentCol, 1, currentCol + numCols - 1);
            
            // Alternate colors based on index for the component and its COs
            const compColor = COMPONENT_COLORS[index % COMPONENT_COLORS.length];
            
            for (let c = 0; c < numCols; c++) {
                const targetCol = currentCol + c;
                const cellR1 = headerRow1.getCell(targetCol);
                const cellR2 = headerRow2.getCell(targetCol);
                
                cellR1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: compColor } };
                cellR2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: compColor } };
                
                cellR1.border = STYLES.borderBlack;
                cellR2.border = STYLES.borderBlack;
            }
            
            currentCol += numCols;
        });

        headerRow1.alignment = STYLES.center;
        headerRow1.font = STYLES.bold;
        headerRow2.alignment = STYLES.center;
        headerRow2.font = STYLES.bold;

        // Apply student rows with black borders
        marksDoc.actualMarks.forEach(({ regNo, marks: m }) => {
            const rowData = [regNo];
            orderedComponents.forEach(comp => {
                componentMap[comp].forEach(co => rowData.push(formatVal(m[`${comp}_${co}`])));
                rowData.push(formatVal(m[`${comp}_TOTAL`]));
            });
            
            const newRow = sheet1.addRow(rowData);
            newRow.eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = STYLES.center;
                cell.border = STYLES.borderBlack;
            });
        });

        // Apply calculation rows with black borders
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

        calcRowsData.forEach(rowData => {
            const newRow = sheet1.addRow(rowData);
            newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                cell.alignment = STYLES.center;
                cell.border = STYLES.borderBlack;
                if (colNumber === 1) {
                     cell.font = STYLES.bold;
                }
            });
        });

        // --- STREAM DIRECTLY TO BROWSER ---
        await streamExcelToBrowser(res, workbook, fileName);

    } catch (error) {
        console.error('Error generating calculated marks:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Internal server error while generating calculated marks.' });
    }
}


// ============================================================================
// 3. Download Final CO Attainment ONLY
// ============================================================================
async function handleDownloadFinalCoAttainment(req, res) {
    try {
        const { subjectId, course, academicYear } = req.query;
        if (!subjectId || !course || !academicYear) return res.status(400).json({ message: "Missing subjectId, course, or academicYear" });

        const safeYear = academicYear.replace(/\//g, '-');
        const fileName = `Final_CO_Attainment_${subjectId}_${safeYear}.xlsx`;

        const firstDoc = await FinalCoAttainment.findOne({ subjectId, course, academicYear }).lean();
        if (!firstDoc?.attainmentTable) return res.status(404).json({ message: "No CO Attainment data found." });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Final CO Attainment');

        sheet.columns = [
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

        styleRow(sheet.getRow(1), { height: 30, font: STYLES.bold, fillArgb: 'FFF2F2F2', border: STYLES.borderDark });

        const coRowsData = Object.entries(firstDoc.attainmentTable).map(([coName, coData]) => ({
            coId: coName,
            ...Object.fromEntries(Object.keys(coData).map(k => [k, formatVal(coData[k])]))
        }));

        sheet.addRows(coRowsData).forEach(row => styleRow(row, { height: 25, border: STYLES.borderLight }));

        let finalAttainmentValue = firstDoc.finalSubjectAttainment;
        if (finalAttainmentValue === undefined) {
            let sumGrandTotal = 0, countGrandTotal = 0;
            Object.values(firstDoc.attainmentTable).forEach(co => {
                if (typeof co.grandTotal === 'number') { sumGrandTotal += co.grandTotal; countGrandTotal++; }
            });
            finalAttainmentValue = countGrandTotal > 0 ? parseFloat((sumGrandTotal / countGrandTotal).toFixed(2)) : undefined;
        }

        const finalRow = sheet.addRow(['Final CO Attainment', '', '', '', '', '', '', '', formatVal(finalAttainmentValue)]);
        sheet.mergeCells(finalRow.number, 1, finalRow.number, 8);
        styleRow(finalRow, { height: 30, font: STYLES.bold, fillArgb: 'FFE6E6E6', border: STYLES.borderDark });
        finalRow.getCell(1).alignment = STYLES.right;
        finalRow.getCell(9).alignment = STYLES.center;

        // --- STREAM DIRECTLY TO BROWSER ---
        await streamExcelToBrowser(res, workbook, fileName);

    } catch (error) {
        console.error('Error generating CO attainment report:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Internal server error while generating report.' });
    }
}

// ============================================================================
// 4. Download PO Attainment ONLY
// ============================================================================
async function handleDownloadPoAttainment(req, res) {
    try {
        const { subjectId, course, academicYear } = req.query;
        if (!subjectId || !course || !academicYear) return res.status(400).json({ message: "Missing parameters" });

        const safeYear = academicYear.replace(/\//g, '-');
        const fileName = `Final_PO_Attainment_${subjectId}_${safeYear}.xlsx`;

        const firstPoDoc = await directPoAttainment.findOne({ subjectId, course, academicYear }).lean();
        if (!firstPoDoc?.mappingData || !firstPoDoc?.averageCo) return res.status(404).json({ message: "No PO Attainment data found." });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Final PO Attainment');

        const poKeys = Object.keys(firstPoDoc.averageCo).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
            const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
            return textA === textB ? numA - numB : textA.localeCompare(textB);
        });

        sheet.columns = [{ header: "CO's", key: 'coId', width: 15 }, ...poKeys.map(po => ({ header: po.toUpperCase(), key: po, width: 12 }))];
        styleRow(sheet.getRow(1), { height: 30, font: STYLES.bold, fillArgb: 'FFF2F2F2', border: STYLES.borderDark });

        const mappingRowsData = Object.keys(firstPoDoc.mappingData).map(co => ({
            coId: co,
            ...Object.fromEntries(poKeys.map(po => [po, formatVal(firstPoDoc.mappingData[co][po])]))
        }));

        sheet.addRows(mappingRowsData).forEach(row => styleRow(row, { height: 25, border: STYLES.borderLight }));

        const avgRowData = { coId: 'Average', ...Object.fromEntries(poKeys.map(po => [po, formatVal(firstPoDoc.averageCo[po])])) };
        styleRow(sheet.addRow(avgRowData), { height: 25, font: STYLES.bold, fillArgb: 'FFF9F9F9', border: STYLES.borderDark });

        const fsaRow = sheet.addRow(['Final Subject Attainment', formatVal(firstPoDoc.finalSubjectAttainment)]);
        sheet.mergeCells(fsaRow.number, 2, fsaRow.number, poKeys.length + 1);
        styleRow(fsaRow, { height: 30, font: STYLES.bold, fillArgb: 'FFEAEAEA', border: STYLES.borderDark });

        const poAttnData = firstPoDoc.poAttainment || firstPoDoc.poAttainments || {};
        const poAttnRowData = { coId: 'Final PO Attainment' };
        poKeys.forEach(po => {
            let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
            poAttnRowData[po] = formatVal(val);
        });
        styleRow(sheet.addRow(poAttnRowData), { height: 30, font: STYLES.bold, fillArgb: 'FFE0E0E0', border: STYLES.borderFinal });

        // --- STREAM DIRECTLY TO BROWSER ---
        await streamExcelToBrowser(res, workbook, fileName);

    } catch (error) {
        console.error('Error generating PO attainment report:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Internal server error while generating report.' });
    }
}

module.exports = {
    handleDownloadReport,
    handleDownloadCalculatedMarks,
    handleDownloadFinalCoAttainment,
    handleDownloadPoAttainment,
};