// const ExcelJS = require('exceljs');
// const CalculatedLabMark = require('../models/calculatedLabMarks'); 
// const FinalLabAttainment = require('../models/finalLabAttainment');
// const LabPoAttainment = require('../models/calculatedLabPo'); 

// // ============================================================================
// // Download Complete Lab Attainment Excel Report (Using exceljs)
// // ============================================================================
// async function handleDownloadLabReport(req, res) {
//     try {
//         const { subjectId, academicYear, course } = req.query;

//         // 1. INPUT SANITIZATION
//         if (!subjectId || !academicYear || !course) {
//             return res.status(400).json({ success: false, message: "subjectId, academicYear, and course are required." });
//         }

//         const cleanSubjectId = subjectId.trim().toUpperCase();
//         const cleanCourse = course.trim().toUpperCase();
//         let cleanYear = academicYear.trim();
//         if (cleanYear.includes('-')) {
//             cleanYear = cleanYear.split('-')[1].trim();
//         }

//         // 2. FETCH DATA IN PARALLEL
//         const [calcData, finalData, poData] = await Promise.all([
//             CalculatedLabMark.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
//             FinalLabAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
//             LabPoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
//         ]);

//         if (!calcData) {
//             return res.status(404).json({ success: false, message: "No lab data found to download for these parameters." });
//         }

//         // 3. INITIALIZE WORKBOOK
//         const workbook = new ExcelJS.Workbook();
//         workbook.creator = 'Lab Attainment System';

//         // Helper maps for colors (Lavender & Light Blue)
//         const alternatingColors = ['FFCCC1DA', 'FFC5D9F1']; 
//         const parentColorMap = {};
//         let colorToggle = 0;
//         const marksKeys = calcData.maxMarks ? Object.keys(calcData.maxMarks) : [];

//         // Build a map of Lab Names to their designated alternating color
//         marksKeys.forEach(key => {
//             const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
//             if (!parentColorMap[rawParent]) {
//                 parentColorMap[rawParent] = alternatingColors[colorToggle % 2];
//                 colorToggle++;
//             }
//         });

//         // ==========================================================
//         // SHEET 1: Calculated Lab Marks & Report
//         // ==========================================================
//         const ws1 = workbook.addWorksheet('CO Attainment');

//         const row1 = ["Reg No"];
//         const row2 = [""]; 
//         const merges = [];
        
//         let currentParent = null;
//         let mergeStartCol = 2; // ExcelJS columns are 1-indexed.
//         let currentCol = 2;

//         marksKeys.forEach((key) => {
//             const lastUnderscore = key.lastIndexOf('_');
//             let rawParent = key;
//             let subName = "";
            
//             if (lastUnderscore !== -1) {
//                 rawParent = key.substring(0, lastUnderscore); 
//                 subName = key.substring(lastUnderscore + 1);  
//             }

//             const parentDisplay = rawParent.replace(/_/g, ' '); 
            
//             if (parentDisplay !== currentParent) {
//                 if (currentParent !== null && (currentCol - 1 > mergeStartCol)) {
//                     merges.push([1, mergeStartCol, 1, currentCol - 1]); 
//                 }
//                 row1.push(parentDisplay);
//                 currentParent = parentDisplay;
//                 mergeStartCol = currentCol;
//             } else {
//                 row1.push(""); 
//             }
            
//             row2.push(subName);
//             currentCol++;
//         });
        
//         if (currentParent !== null && (currentCol - 1 > mergeStartCol)) {
//             merges.push([1, mergeStartCol, 1, currentCol - 1]);
//         }
        
//         merges.push([1, 1, 2, 1]); 

//         ws1.addRow(row1);
//         ws1.addRow(row2);

//         merges.forEach(m => ws1.mergeCells(m[0], m[1], m[2], m[3]));

//         // Student Rows
//         if (calcData.actualMarks && calcData.actualMarks.length > 0) {
//             calcData.actualMarks.forEach(student => {
//                 const row = [student.regNo];
//                 marksKeys.forEach(key => row.push(student.marks?.[key] ?? "-"));
//                 ws1.addRow(row);
//             });
//         }

//         // Attainment Bottom Rows
//         const maxMarksRow = ["Max Marks"];
//         const targetRow = ["Target Marks"];
//         const aboveTargetRow = ["Students Above Target"];
//         const percentRow = ["Attainment %"];
//         const levelRow = ["Attainment Level"];

//         marksKeys.forEach(key => {
//             const rd = calcData.reportData?.[key] || {};
//             maxMarksRow.push(rd.maxMarks ?? 0);
//             targetRow.push(rd.maxMarks ? parseFloat((rd.maxMarks * 0.6).toFixed(2)) : 0);
//             aboveTargetRow.push(rd.studentsAboveTarget ?? 0);
//             percentRow.push(rd.attainmentPercent ?? 0);
//             levelRow.push(rd.attainmentLevel ?? 0);
//         });

//         ws1.addRow(maxMarksRow);
//         ws1.addRow(targetRow);
//         ws1.addRow(aboveTargetRow);
//         ws1.addRow(percentRow);
//         ws1.addRow(levelRow);

//         // ==========================================================
//         // SHEET 2: Final CO Attainment
//         // ==========================================================
//         let ws2 = null;
//         if (finalData && finalData.attainmentTable) {
//             ws2 = workbook.addWorksheet('Final CO Attainment');
//             const coKeys = Object.keys(finalData.attainmentTable).sort();
            
//             if (coKeys.length > 0) {
//                 const dynamicExams = new Set();
//                 coKeys.forEach(co => {
//                     Object.keys(finalData.attainmentTable[co]).forEach(k => {
//                         if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
//                     });
//                 });
//                 const examHeaders = Array.from(dynamicExams);

//                 ws2.addRow(["CO's", ...examHeaders, "Internal Average", "End Sem (External)", "Grand Total"]);

//                 coKeys.forEach(co => {
//                     const row = [co];
//                     const coInfo = finalData.attainmentTable[co];
                    
//                     examHeaders.forEach(exam => row.push(coInfo[exam] ?? "-"));
                    
//                     row.push(coInfo.internalAvg ?? 0);
//                     row.push(coInfo.externalLevel ?? 0);
//                     row.push(coInfo.grandTotal ?? 0);
//                     ws2.addRow(row);
//                 });

//                 // Add bottom merged row
//                 const lastRowIndex = ws2.rowCount + 1;
//                 const totalCols = examHeaders.length + 4; 
//                 const finalRow = new Array(totalCols).fill("");
                
//                 finalRow[0] = "Final CO Attainment"; 
//                 finalRow[totalCols - 1] = finalData.finalSubjectAttainment ?? 0;
                
//                 ws2.addRow(finalRow);
//                 ws2.mergeCells(lastRowIndex, 1, lastRowIndex, totalCols - 1);
//             }
//         }

//         // ==========================================================
//         // SHEET 3: Lab PO Attainment
//         // ==========================================================
//         let ws3 = null;
//         if (poData && poData.mappingData) {
//             ws3 = workbook.addWorksheet('PO Attainment');
//             ws3.addRow(["CO / PO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8"]);

//             for (let i = 1; i <= 5; i++) {
//                 const co = `CO${i}`;
//                 const row = [co];
//                 for (let j = 1; j <= 8; j++) row.push(poData.mappingData[co]?.[`PO${j}`] || "-");
//                 ws3.addRow(row);
//             }

//             ws3.addRow([]); 
//             const avgRow = ["Average CO"];
//             for (let j = 1; j <= 8; j++) avgRow.push(poData.averageCo?.[`PO${j}`] ?? "-");
//             ws3.addRow(avgRow);

//             const poRow = ["PO Attainment"];
//             for (let j = 1; j <= 8; j++) poRow.push(poData.poAttainment?.[`PO${j}`] ?? "-");
//             ws3.addRow(poRow);
//         }

//         // ==========================================================
//         // GLOBAL STYLING & AUTO-FIT HELPER (ExcelJS)
//         // ==========================================================
//         function applyStylesAndAutoFit(worksheet, sheetType) {
//             if (!worksheet) return;

//             worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//                 row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
//                     // Center all content
//                     cell.alignment = { vertical: 'middle', horizontal: 'center' };

//                     // Add Borders
//                     cell.border = {
//                         top: { style: 'thin' }, left: { style: 'thin' },
//                         bottom: { style: 'thin' }, right: { style: 'thin' }
//                     };

//                     // ==============================================
//                     // STYLE RULES FOR SHEET 1 (CO ATTAINMENT)
//                     // ==============================================
//                     if (sheetType === 'LAB') {
//                         if (rowNumber <= 2) {
//                             cell.font = { bold: true };
//                             if (colNumber === 1) {
//                                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD99694' } }; 
//                             } else {
//                                 const keyIndex = colNumber - 2;
//                                 if (marksKeys[keyIndex]) {
//                                     const key = marksKeys[keyIndex];
//                                     const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
//                                     const color = parentColorMap[rawParent] || 'FFCCC1DA';
//                                     cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }; 
//                                 }
//                             }
//                         } else if (colNumber === 1 && rowNumber > 2) {
//                             const labels = ["Max Marks", "Target Marks", "Students Above Target", "Attainment %", "Attainment Level"];
//                             if (labels.includes(cell.value?.toString())) cell.font = { bold: true };
//                         }
//                     } 
                    
//                     // ==============================================
//                     // STYLE RULES FOR SHEET 2 (FINAL CO ATTAINMENT)
//                     // ==============================================
//                     else if (sheetType === 'FINAL_CO') {
//                         if (rowNumber === 1) {
//                             cell.font = { bold: true };
//                             const headerText = cell.value?.toString() || "";

//                             if (colNumber === 1) {
//                                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD99694' } };
//                             } else if (parentColorMap[headerText]) {
//                                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: parentColorMap[headerText] } };
//                             } else {
//                                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
//                             }
//                         } else if (rowNumber === worksheet.rowCount) {
//                             cell.font = { bold: true };
//                             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBEBEB' } }; 
//                         }
//                     }
                    
//                     // ==============================================
//                     // STYLE RULES FOR SHEET 3 (PO ATTAINMENT)
//                     // ==============================================
//                     else if (sheetType === 'PO' && rowNumber === 1) {
//                         cell.font = { bold: true };
//                         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }; 
//                     }
//                 });
//             });

//             // 🌟 FIX: Tighter Auto-Fit Column Widths 🌟
//             worksheet.columns.forEach(column => {
//                 let maxLen = 0;
//                 column.eachCell({ includeEmpty: true }, cell => {
//                     // Skip merged cells (like the Final row) so they don't artificially blow up column width
//                     if (cell.isMerged) return; 
                    
//                     const text = cell.value ? cell.value.toString().trim() : '';
//                     if (text.length > maxLen) maxLen = text.length;
//                 });
                
//                 // Reduced padding (+ 1.5 instead of + 4) for a much tighter fit
//                 column.width = Math.min(maxLen + 1.5, 35); 
//             });
//         }

//         applyStylesAndAutoFit(ws1, 'LAB');
//         applyStylesAndAutoFit(ws2, 'FINAL_CO');
//         applyStylesAndAutoFit(ws3, 'PO');

//         // 4. STREAM TO RESPONSE
//         const fileName = `Lab_Attainment_${cleanSubjectId}_${cleanYear}.xlsx`;
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

//         await workbook.xlsx.write(res);
//         return res.end();

//     } catch (error) {
//         console.error("Excel Download Error:", error.message);
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: "Error generating Excel download.", error: error.message });
//         }
//     }
// }

// module.exports = {
//     handleDownloadLabReport
// };



const ExcelJS = require('exceljs');
const CalculatedLabMark = require('../models/calculatedLabMarks'); 
const FinalLabAttainment = require('../models/finalLabAttainment');
const LabPoAttainment = require('../models/calculatedLabPo'); 

// ============================================================================
// Download Complete Lab Attainment Excel Report (Using exceljs)
// ============================================================================
async function handleDownloadLabReport(req, res) {
    try {
        const { subjectId, academicYear, course } = req.query;

        // 1. INPUT SANITIZATION
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ success: false, message: "subjectId, academicYear, and course are required." });
        }

        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        let cleanYear = academicYear.trim();
        if (cleanYear.includes('-')) {
            cleanYear = cleanYear.split('-')[1].trim();
        }

        // 2. FETCH DATA IN PARALLEL
        const [calcData, finalData, poData] = await Promise.all([
            CalculatedLabMark.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
            FinalLabAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
            LabPoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
        ]);

        if (!calcData) {
            return res.status(404).json({ success: false, message: "No lab data found to download for these parameters." });
        }

        // 3. INITIALIZE WORKBOOK
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Lab Attainment System';

        // Helper maps for colors (Lavender & Light Blue)
        const alternatingColors = ['FFCCC1DA', 'FFC5D9F1']; 
        const parentColorMap = {};
        let colorToggle = 0;
        const marksKeys = calcData.maxMarks ? Object.keys(calcData.maxMarks) : [];

        // Build a map of Lab Names to their designated alternating color
        marksKeys.forEach(key => {
            const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
            if (!parentColorMap[rawParent]) {
                parentColorMap[rawParent] = alternatingColors[colorToggle % 2];
                colorToggle++;
            }
        });

        // ==========================================================
        // SHEET 1: Calculated Lab Marks & Report
        // ==========================================================
        const ws1 = workbook.addWorksheet('CO Attainment');

        const row1 = ["Reg No"];
        const row2 = [""]; 
        const merges = [];
        
        let currentParent = null;
        let mergeStartCol = 2; // ExcelJS columns are 1-indexed.
        let currentCol = 2;

        marksKeys.forEach((key) => {
            const lastUnderscore = key.lastIndexOf('_');
            let rawParent = key;
            let subName = "";
            
            if (lastUnderscore !== -1) {
                rawParent = key.substring(0, lastUnderscore); 
                subName = key.substring(lastUnderscore + 1);  
            }

            const parentDisplay = rawParent.replace(/_/g, ' '); 
            
            if (parentDisplay !== currentParent) {
                if (currentParent !== null && (currentCol - 1 > mergeStartCol)) {
                    merges.push([1, mergeStartCol, 1, currentCol - 1]); 
                }
                row1.push(parentDisplay);
                currentParent = parentDisplay;
                mergeStartCol = currentCol;
            } else {
                row1.push(""); 
            }
            
            row2.push(subName);
            currentCol++;
        });
        
        if (currentParent !== null && (currentCol - 1 > mergeStartCol)) {
            merges.push([1, mergeStartCol, 1, currentCol - 1]);
        }
        
        merges.push([1, 1, 2, 1]); 

        ws1.addRow(row1);
        ws1.addRow(row2);

        merges.forEach(m => ws1.mergeCells(m[0], m[1], m[2], m[3]));

        // Student Rows
        if (calcData.actualMarks && calcData.actualMarks.length > 0) {
            calcData.actualMarks.forEach(student => {
                const row = [student.regNo];
                marksKeys.forEach(key => row.push(student.marks?.[key] ?? "-"));
                ws1.addRow(row);
            });
        }

        // Attainment Bottom Rows
        const maxMarksRow = ["Max Marks"];
        const targetRow = ["Target Marks"];
        const aboveTargetRow = ["Students Above Target"];
        const percentRow = ["Attainment %"];
        const levelRow = ["Attainment Level"];

        marksKeys.forEach(key => {
            const rd = calcData.reportData?.[key] || {};
            maxMarksRow.push(rd.maxMarks ?? 0);
            targetRow.push(rd.maxMarks ? parseFloat((rd.maxMarks * 0.6).toFixed(2)) : 0);
            aboveTargetRow.push(rd.studentsAboveTarget ?? 0);
            percentRow.push(rd.attainmentPercent ?? 0);
            levelRow.push(rd.attainmentLevel ?? 0);
        });

        ws1.addRow(maxMarksRow);
        ws1.addRow(targetRow);
        ws1.addRow(aboveTargetRow);
        ws1.addRow(percentRow);
        ws1.addRow(levelRow);

        // ==========================================================
        // SHEET 2: Final CO Attainment
        // ==========================================================
        let ws2 = null;
        if (finalData && finalData.attainmentTable) {
            ws2 = workbook.addWorksheet('Final CO Attainment');
            const coKeys = Object.keys(finalData.attainmentTable).sort();
            
            if (coKeys.length > 0) {
                const dynamicExams = new Set();
                coKeys.forEach(co => {
                    Object.keys(finalData.attainmentTable[co]).forEach(k => {
                        if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
                    });
                });
                const examHeaders = Array.from(dynamicExams);

                ws2.addRow(["CO's", ...examHeaders, "Internal Average", "End Sem (External)", "Grand Total"]);

                coKeys.forEach(co => {
                    const row = [co];
                    const coInfo = finalData.attainmentTable[co];
                    
                    examHeaders.forEach(exam => row.push(coInfo[exam] ?? "-"));
                    
                    row.push(coInfo.internalAvg ?? 0);
                    row.push(coInfo.externalLevel ?? 0);
                    row.push(coInfo.grandTotal ?? 0);
                    ws2.addRow(row);
                });

                // Add bottom merged row
                const lastRowIndex = ws2.rowCount + 1;
                const totalCols = examHeaders.length + 4; 
                const finalRow = new Array(totalCols).fill("");
                
                finalRow[0] = "Final CO Attainment"; 
                finalRow[totalCols - 1] = finalData.finalSubjectAttainment ?? 0;
                
                ws2.addRow(finalRow);
                ws2.mergeCells(lastRowIndex, 1, lastRowIndex, totalCols - 1);
            }
        }

        // ==========================================================
        // SHEET 3: Lab PO Attainment
        // ==========================================================
        let ws3 = null;
        if (poData && poData.mappingData) {
            ws3 = workbook.addWorksheet('PO Attainment');
            ws3.addRow(["CO's", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8"]);

            for (let i = 1; i <= 5; i++) {
                const co = `CO${i}`;
                const row = [co];
                for (let j = 1; j <= 8; j++) row.push(poData.mappingData[co]?.[`PO${j}`] || "-");
                ws3.addRow(row);
            }

            // Average Row
            const avgRow = ["Average"];
            for (let j = 1; j <= 8; j++) avgRow.push(poData.averageCo?.[`PO${j}`] ?? "-");
            ws3.addRow(avgRow);

            // Final Subject Attainment Row (Merged across POs)
            const subjectAttainmentVal = poData.finalSubjectAttainment ?? finalData?.finalSubjectAttainment ?? 0;
            const finalSubRow = ["Final Subject Attainment", subjectAttainmentVal, "", "", "", "", "", "", ""];
            ws3.addRow(finalSubRow);
            
            const finalSubRowIndex = ws3.rowCount;
            ws3.mergeCells(finalSubRowIndex, 2, finalSubRowIndex, 9); // Merges Col B to I (PO1 to PO8)

            // Final PO Attainment Row
            const poRow = ["Final PO Attainment"];
            for (let j = 1; j <= 8; j++) poRow.push(poData.poAttainment?.[`PO${j}`] ?? "-");
            ws3.addRow(poRow);
        }

        // ==========================================================
        // GLOBAL STYLING & AUTO-FIT HELPER (ExcelJS)
        // ==========================================================
        function applyStylesAndAutoFit(worksheet, sheetType) {
            if (!worksheet) return;

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                    // Center all content
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };

                    // Add Borders
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    };

                    // ==============================================
                    // STYLE RULES FOR SHEET 1 (CO ATTAINMENT)
                    // ==============================================
                    if (sheetType === 'LAB') {
                        if (rowNumber <= 2) {
                            cell.font = { bold: true };
                            if (colNumber === 1) {
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD99694' } }; 
                            } else {
                                const keyIndex = colNumber - 2;
                                if (marksKeys[keyIndex]) {
                                    const key = marksKeys[keyIndex];
                                    const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
                                    const color = parentColorMap[rawParent] || 'FFCCC1DA';
                                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }; 
                                }
                            }
                        } else if (colNumber === 1 && rowNumber > 2) {
                            const labels = ["Max Marks", "Target Marks", "Students Above Target", "Attainment %", "Attainment Level"];
                            if (labels.includes(cell.value?.toString())) cell.font = { bold: true };
                        }
                    } 
                    
                    // ==============================================
                    // STYLE RULES FOR SHEET 2 (FINAL CO ATTAINMENT)
                    // ==============================================
                    else if (sheetType === 'FINAL_CO') {
                        if (rowNumber === 1) {
                            cell.font = { bold: true };
                            const headerText = cell.value?.toString() || "";

                            if (colNumber === 1) {
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD99694' } };
                            } else if (parentColorMap[headerText]) {
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: parentColorMap[headerText] } };
                            } else {
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
                            }
                        } else if (rowNumber === worksheet.rowCount) {
                            cell.font = { bold: true };
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBEBEB' } }; 
                        }
                    }
                    
                    // ==============================================
                    // STYLE RULES FOR SHEET 3 (PO ATTAINMENT)
                    // ==============================================
                    else if (sheetType === 'PO') {
                        if (rowNumber === 1) {
                            cell.font = { bold: true };
                            if (colNumber === 1) {
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD99694' } }; // Pink for "CO's"
                            } else {
                                // 🌟 ADDED: Alternating Colors for PO Headings (Lavender & Light Blue)
                                const poColor = alternatingColors[(colNumber - 2) % 2];
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: poColor } }; 
                            }
                        } else if (rowNumber === worksheet.rowCount - 2) {
                            // "Average" row formatting
                            cell.font = { bold: true };
                        } else if (rowNumber >= worksheet.rowCount - 1) {
                            // "Final Subject Attainment" & "Final PO Attainment" rows
                            cell.font = { bold: true };
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBEBEB' } }; 
                        }
                    }
                });
            });

            // Tighter Auto-Fit Column Widths 
            worksheet.columns.forEach(column => {
                let maxLen = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    // Skip merged cells so they don't artificially blow up column width
                    if (cell.isMerged) return; 
                    
                    const text = cell.value ? cell.value.toString().trim() : '';
                    if (text.length > maxLen) maxLen = text.length;
                });
                
                // Reduced padding (+ 1.5) for a much tighter fit
                column.width = Math.min(maxLen + 1.5, 35); 
            });
        }

        applyStylesAndAutoFit(ws1, 'LAB');
        applyStylesAndAutoFit(ws2, 'FINAL_CO');
        applyStylesAndAutoFit(ws3, 'PO');

        // 4. STREAM TO RESPONSE
        const fileName = `Lab_Attainment_${cleanSubjectId}_${cleanYear}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        await workbook.xlsx.write(res);
        return res.end();

    } catch (error) {
        console.error("Excel Download Error:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error generating Excel download.", error: error.message });
        }
    }
}













async function handleDownloadCOAttainment(req, res) {

    try {
        const { subjectId, academicYear, course } = req.query;

        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ success: false, message: "subjectId, academicYear, and course are required." });
        }

        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        let cleanYear = academicYear.trim();
        if (cleanYear.includes('-')) {
            cleanYear = cleanYear.split('-')[1].trim();
        }

        // Fetch ONLY CalculatedLabMark data
        const calcData = await CalculatedLabMark.findOne({ 
            subjectId: cleanSubjectId, 
            course: cleanCourse, 
            academicYear: cleanYear 
        }).lean();

        if (!calcData) {
            return res.status(404).json({ success: false, message: "No CO attainment data found to download for these parameters." });
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Lab Attainment System';

        const alternatingColors = ['FFCCC1DA', 'FFC5D9F1']; 
        const parentColorMap = {};
        let colorToggle = 0;
        const marksKeys = calcData.maxMarks ? Object.keys(calcData.maxMarks) : [];

        marksKeys.forEach(key => {
            const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
            if (!parentColorMap[rawParent]) {
                parentColorMap[rawParent] = alternatingColors[colorToggle % 2];
                colorToggle++;
            }
        });

        const ws1 = workbook.addWorksheet('CO Attainment');

        const row1 = ["Reg No"];
        const row2 = [""]; 
        const merges = [];
        
        let currentParent = null;
        let mergeStartCol = 2; 
        let currentCol = 2;

        marksKeys.forEach((key) => {
            const lastUnderscore = key.lastIndexOf('_');
            let rawParent = key;
            let subName = "";
            
            if (lastUnderscore !== -1) {
                rawParent = key.substring(0, lastUnderscore); 
                subName = key.substring(lastUnderscore + 1);  
            }

            const parentDisplay = rawParent.replace(/_/g, ' '); 
            
            if (parentDisplay !== currentParent) {
                if (currentParent !== null && (currentCol - 1 > mergeStartCol)) {
                    merges.push([1, mergeStartCol, 1, currentCol - 1]); 
                }
                row1.push(parentDisplay);
                currentParent = parentDisplay;
                mergeStartCol = currentCol;
            } else {
                row1.push(""); 
            }
            
            row2.push(subName);
            currentCol++;
        });
        
        if (currentParent !== null && (currentCol - 1 > mergeStartCol)) {
            merges.push([1, mergeStartCol, 1, currentCol - 1]);
        }
        
        merges.push([1, 1, 2, 1]); 

        ws1.addRow(row1);
        ws1.addRow(row2);

        merges.forEach(m => ws1.mergeCells(m[0], m[1], m[2], m[3]));

        if (calcData.actualMarks && calcData.actualMarks.length > 0) {
            calcData.actualMarks.forEach(student => {
                const row = [student.regNo];
                marksKeys.forEach(key => row.push(student.marks?.[key] ?? "-"));
                ws1.addRow(row);
            });
        }

        const maxMarksRow = ["Max Marks"];
        const targetRow = ["Target Marks"];
        const aboveTargetRow = ["Students Above Target"];
        const percentRow = ["Attainment %"];
        const levelRow = ["Attainment Level"];

        marksKeys.forEach(key => {
            const rd = calcData.reportData?.[key] || {};
            maxMarksRow.push(rd.maxMarks ?? 0);
            targetRow.push(rd.maxMarks ? parseFloat((rd.maxMarks * 0.6).toFixed(2)) : 0);
            aboveTargetRow.push(rd.studentsAboveTarget ?? 0);
            percentRow.push(rd.attainmentPercent ?? 0);
            levelRow.push(rd.attainmentLevel ?? 0);
        });

        ws1.addRow(maxMarksRow);
        ws1.addRow(targetRow);
        ws1.addRow(aboveTargetRow);
        ws1.addRow(percentRow);
        ws1.addRow(levelRow);

        function applyStylesAndAutoFit(worksheet) {
            if (!worksheet) return;

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    };

                    if (rowNumber <= 2) {
                        cell.font = { bold: true };
                        if (colNumber === 1) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD99694' } }; 
                        } else {
                            const keyIndex = colNumber - 2;
                            if (marksKeys[keyIndex]) {
                                const key = marksKeys[keyIndex];
                                const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
                                const color = parentColorMap[rawParent] || 'FFCCC1DA';
                                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }; 
                            }
                        }
                    } else if (colNumber === 1 && rowNumber > 2) {
                        const labels = ["Max Marks", "Target Marks", "Students Above Target", "Attainment %", "Attainment Level"];
                        if (labels.includes(cell.value?.toString())) cell.font = { bold: true };
                    }
                });
            });

            worksheet.columns.forEach(column => {
                let maxLen = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    if (cell.isMerged) return; 
                    
                    const text = cell.value ? cell.value.toString().trim() : '';
                    if (text.length > maxLen) maxLen = text.length;
                });
                
                column.width = Math.min(maxLen + 1.5, 35); 
            });
        }

        applyStylesAndAutoFit(ws1);

        const fileName = `CO_Attainment_${cleanSubjectId}_${cleanYear}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        await workbook.xlsx.write(res);
        return res.end();

    } catch (error) {
        console.error("CO Attainment Excel Download Error:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error generating CO Attainment download.", error: error.message });
        }
    }
}









async function handleDownloadFinalCOAttainment(req, res) {
    try {
        const { subjectId, academicYear, course } = req.query;

        // 1. INPUT SANITIZATION
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ success: false, message: "subjectId, academicYear, and course are required." });
        }

        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        let cleanYear = academicYear.trim();
        if (cleanYear.includes('-')) {
            cleanYear = cleanYear.split('-')[1].trim();
        }

        // 2. FETCH DATA IN PARALLEL 
        // (We fetch CalculatedLabMark just to keep the alternating color logic perfectly synced)
        const [calcData, finalData] = await Promise.all([
            CalculatedLabMark.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
            FinalLabAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
        ]);

        if (!finalData || !finalData.attainmentTable) {
            return res.status(404).json({ success: false, message: "No Final CO attainment data found to download for these parameters." });
        }

        // 3. INITIALIZE WORKBOOK
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Lab Attainment System';

        // Helper maps for alternating colors (Lavender & Light Blue)
        const alternatingColors = ['FFCCC1DA', 'FFC5D9F1']; 
        const parentColorMap = {};
        let colorToggle = 0;
        const marksKeys = calcData?.maxMarks ? Object.keys(calcData.maxMarks) : [];

        // Build a map of Lab Names to their designated alternating color
        marksKeys.forEach(key => {
            const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
            if (!parentColorMap[rawParent]) {
                parentColorMap[rawParent] = alternatingColors[colorToggle % 2];
                colorToggle++;
            }
        });

        // ==========================================================
        // SHEET: Final CO Attainment
        // ==========================================================
        const ws = workbook.addWorksheet('Final CO Attainment');
        const coKeys = Object.keys(finalData.attainmentTable).sort();
        
        let examHeaders = [];
        if (coKeys.length > 0) {
            const dynamicExams = new Set();
            coKeys.forEach(co => {
                Object.keys(finalData.attainmentTable[co]).forEach(k => {
                    if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
                });
            });
            examHeaders = Array.from(dynamicExams);

            ws.addRow(["CO's", ...examHeaders, "Internal Average", "End Sem (External)", "Grand Total"]);

            coKeys.forEach(co => {
                const row = [co];
                const coInfo = finalData.attainmentTable[co];
                
                examHeaders.forEach(exam => row.push(coInfo[exam] ?? "-"));
                
                row.push(coInfo.internalAvg ?? 0);
                row.push(coInfo.externalLevel ?? 0);
                row.push(coInfo.grandTotal ?? 0);
                ws.addRow(row);
            });

            // Add bottom merged row
            const lastRowIndex = ws.rowCount + 1;
            const totalCols = examHeaders.length + 4; 
            const finalRow = new Array(totalCols).fill("");
            
            finalRow[0] = "Final CO Attainment"; 
            finalRow[totalCols - 1] = finalData.finalSubjectAttainment ?? 0;
            
            ws.addRow(finalRow);
            ws.mergeCells(lastRowIndex, 1, lastRowIndex, totalCols - 1);
        }

        // ==========================================================
        // GLOBAL STYLING & AUTO-FIT HELPER (ExcelJS)
        // ==========================================================
        function applyStylesAndAutoFit(worksheet) {
            if (!worksheet) return;

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                    // Center all content
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };

                    // Add Borders
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    };

                    // ==============================================
                    // STYLE RULES FOR FINAL CO ATTAINMENT
                    // ==============================================
                    if (rowNumber === 1) {
                        cell.font = { bold: true };
                        const headerText = cell.value?.toString() || "";

                        if (colNumber === 1) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD99694' } }; // Pink for CO's
                        } else if (parentColorMap[headerText]) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: parentColorMap[headerText] } }; // Match parent color
                        } else {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }; // Gray for totals
                        }
                    } else if (rowNumber === worksheet.rowCount) {
                        cell.font = { bold: true };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBEBEB' } }; // Light gray for final row
                    }
                });
            });

            // Tighter Auto-Fit Column Widths 
            worksheet.columns.forEach(column => {
                let maxLen = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    if (cell.isMerged) return; 
                    
                    const text = cell.value ? cell.value.toString().trim() : '';
                    if (text.length > maxLen) maxLen = text.length;
                });
                
                column.width = Math.min(maxLen + 1.5, 35); 
            });
        }

        applyStylesAndAutoFit(ws);

        // 4. STREAM TO RESPONSE
        const fileName = `Final_CO_Attainment_${cleanSubjectId}_${cleanYear}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        await workbook.xlsx.write(res);
        return res.end();

    } catch (error) {
        console.error("Final CO Attainment Excel Download Error:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error generating Final CO Attainment download.", error: error.message });
        }
    }
}










async function handleDownloadPOAttainment(req, res) {
    try {
        const { subjectId, academicYear, course } = req.query;

        // 1. INPUT SANITIZATION
        if (!subjectId || !academicYear || !course) {
            return res.status(400).json({ success: false, message: "subjectId, academicYear, and course are required." });
        }

        const cleanSubjectId = subjectId.trim().toUpperCase();
        const cleanCourse = course.trim().toUpperCase();
        let cleanYear = academicYear.trim();
        if (cleanYear.includes('-')) {
            cleanYear = cleanYear.split('-')[1].trim();
        }

        // 2. FETCH DATA IN PARALLEL 
        const [finalData, poData] = await Promise.all([
            FinalLabAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
            LabPoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
        ]);

        if (!poData || !poData.mappingData) {
            return res.status(404).json({ success: false, message: "No PO attainment data found to download for these parameters." });
        }

        // 3. INITIALIZE WORKBOOK
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Lab Attainment System';
        const alternatingColors = ['FFCCC1DA', 'FFC5D9F1']; // Lavender, Light Blue

        // ==========================================================
        // SHEET: PO Attainment
        // ==========================================================
        const ws = workbook.addWorksheet('PO Attainment');
        
        // Header
        ws.addRow(["CO's", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8"]);

        // CO Mapping Rows (CO1 to CO5)
        for (let i = 1; i <= 5; i++) {
            const co = `CO${i}`;
            const row = [co];
            for (let j = 1; j <= 8; j++) {
                row.push(poData.mappingData[co]?.[`PO${j}`] || "-");
            }
            ws.addRow(row);
        }

        // Average Row
        const avgRow = ["Average"];
        for (let j = 1; j <= 8; j++) {
            avgRow.push(poData.averageCo?.[`PO${j}`] ?? "-");
        }
        ws.addRow(avgRow);

        // Final Subject Attainment Row (Merged across PO1 to PO8)
        const subjectAttainmentVal = poData.finalSubjectAttainment ?? finalData?.finalSubjectAttainment ?? 0;
        const finalSubRow = ["Final Subject Attainment", subjectAttainmentVal, "", "", "", "", "", "", ""];
        ws.addRow(finalSubRow);
        
        const finalSubRowIndex = ws.rowCount;
        ws.mergeCells(finalSubRowIndex, 2, finalSubRowIndex, 9); // Merges Col B to I

        // Final PO Attainment Row
        const poRow = ["Final PO Attainment"];
        for (let j = 1; j <= 8; j++) {
            poRow.push(poData.poAttainment?.[`PO${j}`] ?? "-");
        }
        ws.addRow(poRow);

        // ==========================================================
        // GLOBAL STYLING & AUTO-FIT HELPER (ExcelJS)
        // ==========================================================
        function applyStylesAndAutoFit(worksheet) {
            if (!worksheet) return;

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                    // Center all content
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };

                    // Add Borders
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    };

                    // ==============================================
                    // STYLE RULES FOR PO ATTAINMENT
                    // ==============================================
                    if (rowNumber === 1) {
                        cell.font = { bold: true };
                        if (colNumber === 1) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD99694' } }; // Pink for "CO's"
                        } else {
                            // Alternating Colors for PO Headings (Lavender & Light Blue)
                            const poColor = alternatingColors[(colNumber - 2) % 2];
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: poColor } }; 
                        }
                    } else if (rowNumber === worksheet.rowCount - 2) {
                        // "Average" row formatting
                        cell.font = { bold: true };
                    } else if (rowNumber >= worksheet.rowCount - 1) {
                        // "Final Subject Attainment" & "Final PO Attainment" rows
                        cell.font = { bold: true };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBEBEB' } }; // Light Gray
                    }
                });
            });

            // Tighter Auto-Fit Column Widths 
            worksheet.columns.forEach(column => {
                let maxLen = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    if (cell.isMerged) return; // Skip merged cells so they don't blow up column width
                    
                    const text = cell.value ? cell.value.toString().trim() : '';
                    if (text.length > maxLen) maxLen = text.length;
                });
                
                column.width = Math.min(maxLen + 1.5, 35); 
            });
        }

        applyStylesAndAutoFit(ws);

        // 4. STREAM TO RESPONSE
        const fileName = `PO_Attainment_${cleanSubjectId}_${cleanYear}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        await workbook.xlsx.write(res);
        return res.end();

    } catch (error) {
        console.error("PO Attainment Excel Download Error:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error generating PO Attainment download.", error: error.message });
        }
    }
}

module.exports = {
    handleDownloadLabReport,
    handleDownloadCOAttainment,
    handleDownloadFinalCOAttainment,
    handleDownloadPOAttainment
}