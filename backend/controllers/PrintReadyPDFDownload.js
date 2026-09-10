// // const puppeteer = require('puppeteer');

// // // Models
// // const calculatedMarks = require("../models/calculatedMarks");
// // const FinalCoAttainment = require("../models/finalAttainment");
// // const PoAttainment = require("../models/calculatedPo"); // Updated to correct model

// // // Helper: Format values safely
// // const formatVal = (val) => (val !== undefined && val !== null && val !== '') ? val : '-';

// // // ============================================================================
// // // Download Master Report as PDF
// // // ============================================================================
// // async function handleDownloadPdfReport(req, res) {
// //     try {
// //         const { subjectId, course, academicYear } = req.query;

// //         if (!subjectId || !course || !academicYear) {
// //             return res.status(400).json({ message: "Missing subjectId, course, or academicYear" });
// //         }

// //         const safeYear = academicYear.replace(/\//g, '-');
// //         const fileName = `Report_${subjectId}_${safeYear}.pdf`;

// //         // 1. FETCH DATA
// //         const [marksDoc, coDoc, poDoc] = await Promise.all([
// //             calculatedMarks.findOne({ subjectId, course, academicYear }).lean(),
// //             FinalCoAttainment.findOne({ subjectId, course, academicYear }).lean(),
// //             PoAttainment.findOne({ subjectId, course, academicYear }).lean() // Updated database query
// //         ]);

// //         if (!marksDoc?.actualMarks?.length) {
// //             return res.status(404).json({ message: "No marks data found for this subject and year." });
// //         }

// //         // 2. PREPARE DYNAMIC DATA MAPPINGS
// //         const sampleMarks = marksDoc.actualMarks[0].marks;
// //         const componentMap = {};
// //         const orderedComponents = [];

// //         Object.keys(sampleMarks).forEach(key => {
// //             if (key.endsWith('_TOTAL')) return;
// //             const match = key.match(/(.*)_(CO\d+)/);
// //             if (match) {
// //                 const [, compName, coName] = match;
// //                 if (!componentMap[compName]) {
// //                     componentMap[compName] = [];
// //                     orderedComponents.push(compName);
// //                 }
// //                 componentMap[compName].push(coName);
// //             }
// //         });

// //         orderedComponents.forEach(comp => componentMap[comp].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))));

// //         // 3. BUILD HTML CONTENT
// //         let htmlContent = `
// //         <!DOCTYPE html>
// //         <html>
// //         <head>
// //             <style>
// //                 body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 0; }
// //                 h2 { text-align: center; font-size: 16px; margin-bottom: 5px; }
// //                 h3 { text-align: left; font-size: 14px; margin-top: 20px; margin-bottom: 10px; color: #333; }
// //                 table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
// //                 tr { page-break-inside: avoid; page-break-after: auto; }
// //                 th, td { border: 1px solid black; padding: 4px; text-align: center; }
// //                 .page-break { page-break-before: always; }
                
// //                 /* Colors matching your Excel styles */
// //                 .bg-reg { background-color: #D99694; font-weight: bold; }
// //                 .bg-comp-0 { background-color: #CCC1DA; font-weight: bold; }
// //                 .bg-comp-1 { background-color: #C5D9F1; font-weight: bold; }
// //                 .bg-header-gray { background-color: #F2F2F2; font-weight: bold; }
// //                 .bg-footer-gray { background-color: #E6E6E6; font-weight: bold; }
// //                 .text-right { text-align: right; padding-right: 10px; }
// //             </style>
// //         </head>
// //         <body>
// //             <h2>Attainment Report: ${subjectId} (${safeYear})</h2>
            
// //             <!-- SECTION 1: CALCULATED MARKS -->
// //             <h3>1. Calculated Marks & Attainment</h3>
// //             <table>
// //                 <thead>
// //                     <tr>
// //                         <th rowspan="2" class="bg-reg">Reg No</th>`;
        
// //         // Headers Row 1 (Components)
// //         orderedComponents.forEach((comp, index) => {
// //             const colspan = componentMap[comp].length + 1;
// //             const bgClass = `bg-comp-${index % 2}`;
// //             htmlContent += `<th colspan="${colspan}" class="${bgClass}">${comp.replace(/_/g, ' ')}</th>`;
// //         });
        
// //         htmlContent += `</tr><tr>`;
        
// //         // Headers Row 2 (COs & Totals)
// //         orderedComponents.forEach((comp, index) => {
// //             const bgClass = `bg-comp-${index % 2}`;
// //             componentMap[comp].forEach(co => {
// //                 htmlContent += `<th class="${bgClass}">${co}</th>`;
// //             });
// //             htmlContent += `<th class="${bgClass}">Total</th>`;
// //         });
        
// //         htmlContent += `</tr></thead><tbody>`;

// //         // Student Marks Rows
// //         marksDoc.actualMarks.forEach(({ regNo, marks: m }) => {
// //             htmlContent += `<tr><td><b>${regNo}</b></td>`;
// //             orderedComponents.forEach(comp => {
// //                 componentMap[comp].forEach(co => {
// //                     htmlContent += `<td>${formatVal(m[`${comp}_${co}`])}</td>`;
// //                 });
// //                 htmlContent += `<td>${formatVal(m[`${comp}_TOTAL`])}</td>`;
// //             });
// //             htmlContent += `</tr>`;
// //         });

// //         // Calculation Rows (Max, Target, Attainment, etc.)
// //         const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
// //         calcLabels.forEach((label, i) => {
// //             htmlContent += `<tr><td style="font-weight: bold;">${label}</td>`;
// //             orderedComponents.forEach(comp => {
// //                 [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
// //                     const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
// //                     const calc = marksDoc.reportData[key] || {};
                    
// //                     let val = '-';
// //                     if (i === 0) val = formatVal(calc.maxMarks);
// //                     if (i === 1) val = formatVal(calc.targetMarks);
// //                     if (i === 2) val = formatVal(calc.studentsAboveTarget);
// //                     if (i === 3) val = formatVal(calc.attainmentPercent);
// //                     if (i === 4) val = formatVal(calc.attainmentLevel);
                    
// //                     htmlContent += `<td>${val}</td>`;
// //                 });
// //             });
// //             htmlContent += `</tr>`;
// //         });
        
// //         htmlContent += `</tbody></table>`;

// //         // SECTION 2: FINAL CO ATTAINMENT
// //         if (coDoc?.attainmentTable) {
// //             htmlContent += `<div class="page-break"></div>
// //                             <h3>2. Final CO Attainment</h3>
// //                             <table>
// //                                 <thead>
// //                                     <tr class="bg-header-gray">
// //                                         <th>CO's</th>
// //                                         <th>Quiz 1</th>
// //                                         <th>Sessional 1</th>
// //                                         <th>Quiz 2</th>
// //                                         <th>Sessional 2</th>
// //                                         <th>Assignment</th>
// //                                         <th>End Sem</th>
// //                                         <th>Total Avg Int</th>
// //                                         <th>Grand Total (50% int + 50% End term)</th>
// //                                     </tr>
// //                                 </thead>
// //                                 <tbody>`;
                                
// //             Object.entries(coDoc.attainmentTable).forEach(([coName, coData]) => {
// //                 htmlContent += `<tr>
// //                     <td><b>${coName}</b></td>
// //                     <td>${formatVal(coData.Quiz_1)}</td>
// //                     <td>${formatVal(coData.Mid_Term)}</td>
// //                     <td>${formatVal(coData.Quiz_2)}</td>
// //                     <td>${formatVal(coData.Surprise_Quiz)}</td>
// //                     <td>${formatVal(coData.Assignment)}</td>
// //                     <td>${formatVal(coData.externalLevel)}</td>
// //                     <td>${formatVal(coData.internalAvg)}</td>
// //                     <td>${formatVal(coData.grandTotal)}</td>
// //                 </tr>`;
// //             });

// //             // Calculate Final CO Attainment Average if missing
// //             let finalAttainmentValue = coDoc.finalSubjectAttainment;
// //             if (finalAttainmentValue === undefined) {
// //                 let sumGrandTotal = 0, countGrandTotal = 0;
// //                 Object.values(coDoc.attainmentTable).forEach(co => {
// //                     if (typeof co.grandTotal === 'number') { sumGrandTotal += co.grandTotal; countGrandTotal++; }
// //                 });
// //                 finalAttainmentValue = countGrandTotal > 0 ? parseFloat((sumGrandTotal / countGrandTotal).toFixed(2)) : undefined;
// //             }

// //             htmlContent += `<tr class="bg-footer-gray">
// //                                 <td colspan="8" class="text-right">Final CO Attainment</td>
// //                                 <td>${formatVal(finalAttainmentValue)}</td>
// //                             </tr>
// //                         </tbody>
// //                     </table>`;
// //         }

// //         // SECTION 3: FINAL PO ATTAINMENT
// //         if (poDoc?.mappingData && poDoc?.averageCo) {
// //             const poKeys = Object.keys(poDoc.averageCo).sort((a, b) => {
// //                 const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
// //                 const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
// //                 return textA === textB ? numA - numB : textA.localeCompare(textB);
// //             });

// //             // Replaced page-break with <br> to keep on the same page as Section 2
// //             htmlContent += `<br>
// //                             <h3>3. Final PO Attainment</h3>
// //                             <table>
// //                                 <thead>
// //                                     <tr class="bg-header-gray">
// //                                         <th>CO's</th>`;
            
// //             poKeys.forEach(po => htmlContent += `<th>${po.toUpperCase()}</th>`);
            
// //             htmlContent += `</tr></thead><tbody>`;

// //             // Mapping Rows
// //             Object.keys(poDoc.mappingData).forEach(co => {
// //                 htmlContent += `<tr><td><b>${co}</b></td>`;
// //                 poKeys.forEach(po => htmlContent += `<td>${formatVal(poDoc.mappingData[co][po])}</td>`);
// //                 htmlContent += `</tr>`;
// //             });

// //             // Average CO Row
// //             htmlContent += `<tr style="background-color: #F9F9F9; font-weight: bold;">
// //                                 <td>Average</td>`;
// //             poKeys.forEach(po => htmlContent += `<td>${formatVal(poDoc.averageCo[po])}</td>`);
// //             htmlContent += `</tr>`;

// //             // Final Subject Attainment Row
// //             htmlContent += `<tr class="bg-footer-gray">
// //                                 <td>Final Subject Attainment</td>
// //                                 <td colspan="${poKeys.length}">${formatVal(poDoc.finalSubjectAttainment)}</td>
// //                             </tr>`;

// //             // PO Attainment Row
// //             const poAttnData = poDoc.poAttainment || poDoc.poAttainments || {};
// //             htmlContent += `<tr style="background-color: #E0E0E0; font-weight: bold;">
// //                                 <td>Final PO Attainment</td>`;
            
// //             poKeys.forEach(po => {
// //                 let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
// //                 htmlContent += `<td>${formatVal(val)}</td>`;
// //             });

// //             htmlContent += `</tr></tbody></table>`;
// //         }

// //         htmlContent += `</body></html>`;

// //         // 4. GENERATE PDF VIA PUPPETEER
// //         const browser = await puppeteer.launch({ 
// //             headless: 'new',
// //             args: ['--no-sandbox', '--disable-setuid-sandbox'] // Recommended for server environments
// //         });
        
// //         const page = await browser.newPage();
// //         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

// //         const pdfBuffer = await page.pdf({
// //             format: 'A4',
// //             landscape: true, // Landscape works best for wide data tables
// //             margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
// //             printBackground: true // Ensures the alternating table header colors show up
// //         });

// //         await browser.close();

// //         // 5. STREAM PDF TO BROWSER
// //         res.setHeader('Content-Type', 'application/pdf');
// //         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
// //         res.send(pdfBuffer);

// //     } catch (error) {
// //         console.error('Error generating PDF report:', error);
// //         if (!res.headersSent) res.status(500).json({ message: 'Internal server error while generating PDF report.' });
// //     }
// // }

// // module.exports = {
// //     handleDownloadPdfReport
// // };



// const puppeteer = require('puppeteer');

// // Models
// const calculatedMarks = require("../models/calculatedMarks");
// const FinalCoAttainment = require("../models/finalAttainment");
// const PoAttainment = require("../models/calculatedPo"); // Updated to correct model

// // Helper: Format values safely
// const formatVal = (val) => (val !== undefined && val !== null && val !== '') ? val : '-';

// // Shared HTML Base Template for consistent styling in individual reports
// const getBaseHtml = (title, tableHtml) => `
// <!DOCTYPE html>
// <html>
// <head>
//     <style>
//         body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 0; }
//         h2 { text-align: center; font-size: 16px; margin-bottom: 20px; }
//         table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
//         tr { page-break-inside: avoid; page-break-after: auto; }
//         th, td { border: 1px solid black; padding: 5px; text-align: center; }
        
//         /* Excel matching styles */
//         .bg-reg { background-color: #D99694; font-weight: bold; }
//         .bg-comp-0 { background-color: #CCC1DA; font-weight: bold; }
//         .bg-comp-1 { background-color: #C5D9F1; font-weight: bold; }
//         .bg-header-gray { background-color: #F2F2F2; font-weight: bold; }
//         .bg-footer-gray { background-color: #E6E6E6; font-weight: bold; }
//         .text-right { text-align: right; padding-right: 10px; }
//     </style>
// </head>
// <body>
//     <h2>${title}</h2>
//     ${tableHtml}
// </body>
// </html>
// `;

// // ============================================================================
// // 1. Download Master Report as PDF
// // ============================================================================
// async function handleDownloadPdfReport(req, res) {
//     try {
//         const { subjectId, course, academicYear } = req.query;

//         if (!subjectId || !course || !academicYear) {
//             return res.status(400).json({ message: "Missing subjectId, course, or academicYear" });
//         }

//         const safeYear = academicYear.replace(/\//g, '-');
//         const fileName = `Report_${subjectId}_${safeYear}.pdf`;

//         // 1. FETCH DATA
//         const [marksDoc, coDoc, poDoc] = await Promise.all([
//             calculatedMarks.findOne({ subjectId, course, academicYear }).lean(),
//             FinalCoAttainment.findOne({ subjectId, course, academicYear }).lean(),
//             PoAttainment.findOne({ subjectId, course, academicYear }).lean() // Updated database query
//         ]);

//         if (!marksDoc?.actualMarks?.length) {
//             return res.status(404).json({ message: "No marks data found for this subject and year." });
//         }

//         // 2. PREPARE DYNAMIC DATA MAPPINGS
//         const sampleMarks = marksDoc.actualMarks[0].marks;
//         const componentMap = {};
//         const orderedComponents = [];

//         Object.keys(sampleMarks).forEach(key => {
//             if (key.endsWith('_TOTAL')) return;
//             const match = key.match(/(.*)_(CO\d+)/);
//             if (match) {
//                 const [, compName, coName] = match;
//                 if (!componentMap[compName]) {
//                     componentMap[compName] = [];
//                     orderedComponents.push(compName);
//                 }
//                 componentMap[compName].push(coName);
//             }
//         });

//         orderedComponents.forEach(comp => componentMap[comp].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))));

//         // 3. BUILD HTML CONTENT
//         let htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <style>
//                 body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 0; }
//                 h2 { text-align: center; font-size: 16px; margin-bottom: 5px; }
//                 h3 { text-align: left; font-size: 14px; margin-top: 20px; margin-bottom: 10px; color: #333; }
//                 table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
//                 tr { page-break-inside: avoid; page-break-after: auto; }
//                 th, td { border: 1px solid black; padding: 4px; text-align: center; }
//                 .page-break { page-break-before: always; }
                
//                 /* Colors matching your Excel styles */
//                 .bg-reg { background-color: #D99694; font-weight: bold; }
//                 .bg-comp-0 { background-color: #CCC1DA; font-weight: bold; }
//                 .bg-comp-1 { background-color: #C5D9F1; font-weight: bold; }
//                 .bg-header-gray { background-color: #F2F2F2; font-weight: bold; }
//                 .bg-footer-gray { background-color: #E6E6E6; font-weight: bold; }
//                 .text-right { text-align: right; padding-right: 10px; }
//             </style>
//         </head>
//         <body>
//             <h2>Attainment Report: ${subjectId} (${safeYear})</h2>
            
//             <!-- SECTION 1: CALCULATED MARKS -->
//             <h3>1. Calculated Marks & Attainment</h3>
//             <table>
//                 <thead>
//                     <tr>
//                         <th rowspan="2" class="bg-reg">Reg No</th>`;
        
//         // Headers Row 1 (Components)
//         orderedComponents.forEach((comp, index) => {
//             const colspan = componentMap[comp].length + 1;
//             const bgClass = `bg-comp-${index % 2}`;
//             htmlContent += `<th colspan="${colspan}" class="${bgClass}">${comp.replace(/_/g, ' ')}</th>`;
//         });
        
//         htmlContent += `</tr><tr>`;
        
//         // Headers Row 2 (COs & Totals)
//         orderedComponents.forEach((comp, index) => {
//             const bgClass = `bg-comp-${index % 2}`;
//             componentMap[comp].forEach(co => {
//                 htmlContent += `<th class="${bgClass}">${co}</th>`;
//             });
//             htmlContent += `<th class="${bgClass}">Total</th>`;
//         });
        
//         htmlContent += `</tr></thead><tbody>`;

//         // Student Marks Rows
//         marksDoc.actualMarks.forEach(({ regNo, marks: m }) => {
//             htmlContent += `<tr><td><b>${regNo}</b></td>`;
//             orderedComponents.forEach(comp => {
//                 componentMap[comp].forEach(co => {
//                     htmlContent += `<td>${formatVal(m[`${comp}_${co}`])}</td>`;
//                 });
//                 htmlContent += `<td>${formatVal(m[`${comp}_TOTAL`])}</td>`;
//             });
//             htmlContent += `</tr>`;
//         });

//         // Calculation Rows (Max, Target, Attainment, etc.)
//         const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
//         calcLabels.forEach((label, i) => {
//             htmlContent += `<tr><td style="font-weight: bold;">${label}</td>`;
//             orderedComponents.forEach(comp => {
//                 [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
//                     const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
//                     const calc = marksDoc.reportData[key] || {};
                    
//                     let val = '-';
//                     if (i === 0) val = formatVal(calc.maxMarks);
//                     if (i === 1) val = formatVal(calc.targetMarks);
//                     if (i === 2) val = formatVal(calc.studentsAboveTarget);
//                     if (i === 3) val = formatVal(calc.attainmentPercent);
//                     if (i === 4) val = formatVal(calc.attainmentLevel);
                    
//                     htmlContent += `<td>${val}</td>`;
//                 });
//             });
//             htmlContent += `</tr>`;
//         });
        
//         htmlContent += `</tbody></table>`;

//         // SECTION 2: FINAL CO ATTAINMENT
//         if (coDoc?.attainmentTable) {
//             htmlContent += `<div class="page-break"></div>
//                             <h3>2. Final CO Attainment</h3>
//                             <table>
//                                 <thead>
//                                     <tr class="bg-header-gray">
//                                         <th>CO's</th>
//                                         <th>Quiz 1</th>
//                                         <th>Sessional 1</th>
//                                         <th>Quiz 2</th>
//                                         <th>Sessional 2</th>
//                                         <th>Assignment</th>
//                                         <th>End Sem</th>
//                                         <th>Total Avg Int</th>
//                                         <th>Grand Total (50% int + 50% End term)</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>`;
                                
//             Object.entries(coDoc.attainmentTable).forEach(([coName, coData]) => {
//                 htmlContent += `<tr>
//                     <td><b>${coName}</b></td>
//                     <td>${formatVal(coData.Quiz_1)}</td>
//                     <td>${formatVal(coData.Mid_Term)}</td>
//                     <td>${formatVal(coData.Quiz_2)}</td>
//                     <td>${formatVal(coData.Surprise_Quiz)}</td>
//                     <td>${formatVal(coData.Assignment)}</td>
//                     <td>${formatVal(coData.externalLevel)}</td>
//                     <td>${formatVal(coData.internalAvg)}</td>
//                     <td>${formatVal(coData.grandTotal)}</td>
//                 </tr>`;
//             });

//             // Calculate Final CO Attainment Average if missing
//             let finalAttainmentValue = coDoc.finalSubjectAttainment;
//             if (finalAttainmentValue === undefined) {
//                 let sumGrandTotal = 0, countGrandTotal = 0;
//                 Object.values(coDoc.attainmentTable).forEach(co => {
//                     if (typeof co.grandTotal === 'number') { sumGrandTotal += co.grandTotal; countGrandTotal++; }
//                 });
//                 finalAttainmentValue = countGrandTotal > 0 ? parseFloat((sumGrandTotal / countGrandTotal).toFixed(2)) : undefined;
//             }

//             htmlContent += `<tr class="bg-footer-gray">
//                                 <td colspan="8" class="text-right">Final CO Attainment</td>
//                                 <td>${formatVal(finalAttainmentValue)}</td>
//                             </tr>
//                         </tbody>
//                     </table>`;
//         }

//         // SECTION 3: FINAL PO ATTAINMENT
//         if (poDoc?.mappingData && poDoc?.averageCo) {
//             const poKeys = Object.keys(poDoc.averageCo).sort((a, b) => {
//                 const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
//                 const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
//                 return textA === textB ? numA - numB : textA.localeCompare(textB);
//             });

//             // Replaced page-break with <br> to keep on the same page as Section 2
//             htmlContent += `<br>
//                             <h3>3. Final PO Attainment</h3>
//                             <table>
//                                 <thead>
//                                     <tr class="bg-header-gray">
//                                         <th>CO's</th>`;
            
//             poKeys.forEach(po => htmlContent += `<th>${po.toUpperCase()}</th>`);
            
//             htmlContent += `</tr></thead><tbody>`;

//             // Mapping Rows
//             Object.keys(poDoc.mappingData).forEach(co => {
//                 htmlContent += `<tr><td><b>${co}</b></td>`;
//                 poKeys.forEach(po => htmlContent += `<td>${formatVal(poDoc.mappingData[co][po])}</td>`);
//                 htmlContent += `</tr>`;
//             });

//             // Average CO Row
//             htmlContent += `<tr style="background-color: #F9F9F9; font-weight: bold;">
//                                 <td>Average</td>`;
//             poKeys.forEach(po => htmlContent += `<td>${formatVal(poDoc.averageCo[po])}</td>`);
//             htmlContent += `</tr>`;

//             // Final Subject Attainment Row
//             htmlContent += `<tr class="bg-footer-gray">
//                                 <td>Final Subject Attainment</td>
//                                 <td colspan="${poKeys.length}">${formatVal(poDoc.finalSubjectAttainment)}</td>
//                             </tr>`;

//             // PO Attainment Row
//             const poAttnData = poDoc.poAttainment || poDoc.poAttainments || {};
//             htmlContent += `<tr style="background-color: #E0E0E0; font-weight: bold;">
//                                 <td>Final PO Attainment</td>`;
            
//             poKeys.forEach(po => {
//                 let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
//                 htmlContent += `<td>${formatVal(val)}</td>`;
//             });

//             htmlContent += `</tr></tbody></table>`;
//         }

//         htmlContent += `</body></html>`;

//         // 4. GENERATE PDF VIA PUPPETEER
//         const browser = await puppeteer.launch({ 
//             headless: 'new',
//             args: ['--no-sandbox', '--disable-setuid-sandbox'] // Recommended for server environments
//         });
        
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             landscape: true, // Landscape works best for wide data tables
//             margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
//             printBackground: true // Ensures the alternating table header colors show up
//         });

//         await browser.close();

//         // 5. STREAM PDF TO BROWSER
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('Error generating PDF report:', error);
//         if (!res.headersSent) res.status(500).json({ message: 'Internal server error while generating PDF report.' });
//     }
// }

// // ============================================================================
// // 2. Download Calculated Marks ONLY (PDF)
// // ============================================================================
// async function handleDownloadCalculatedMarksPdf(req, res) {
//     try {
//         const { subjectId, course, academicYear } = req.query;
//         if (!subjectId || !course || !academicYear) {
//             return res.status(400).json({ message: "Missing parameters" });
//         }

//         const safeYear = academicYear.replace(/\//g, '-');
//         const fileName = `CalculatedMarks_${subjectId}_${safeYear}.pdf`;

//         const marksDoc = await calculatedMarks.findOne({ subjectId, course, academicYear }).lean();
        
//         if (!marksDoc?.actualMarks?.length) {
//             return res.status(404).json({ message: "No marks data found." });
//         }

//         const sampleMarks = marksDoc.actualMarks[0].marks;
//         const componentMap = {};
//         const orderedComponents = [];

//         Object.keys(sampleMarks).forEach(key => {
//             if (key.endsWith('_TOTAL')) return;
//             const match = key.match(/(.*)_(CO\d+)/);
//             if (match) {
//                 const [, compName, coName] = match;
//                 if (!componentMap[compName]) { 
//                     componentMap[compName] = []; 
//                     orderedComponents.push(compName); 
//                 }
//                 componentMap[compName].push(coName);
//             }
//         });

//         orderedComponents.forEach(comp => componentMap[comp].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))));

//         let tableHtml = `<table><thead><tr><th rowspan="2" class="bg-reg">Reg No</th>`;
        
//         orderedComponents.forEach((comp, index) => {
//             const colspan = componentMap[comp].length + 1;
//             tableHtml += `<th colspan="${colspan}" class="bg-comp-${index % 2}">${comp.replace(/_/g, ' ')}</th>`;
//         });
        
//         tableHtml += `</tr><tr>`;
        
//         orderedComponents.forEach((comp, index) => {
//             const bgClass = `bg-comp-${index % 2}`;
//             componentMap[comp].forEach(co => tableHtml += `<th class="${bgClass}">${co}</th>`);
//             tableHtml += `<th class="${bgClass}">Total</th>`;
//         });
        
//         tableHtml += `</tr></thead><tbody>`;

//         marksDoc.actualMarks.forEach(({ regNo, marks: m }) => {
//             tableHtml += `<tr><td><b>${regNo}</b></td>`;
//             orderedComponents.forEach(comp => {
//                 componentMap[comp].forEach(co => tableHtml += `<td>${formatVal(m[`${comp}_${co}`])}</td>`);
//                 tableHtml += `<td>${formatVal(m[`${comp}_TOTAL`])}</td>`;
//             });
//             tableHtml += `</tr>`;
//         });

//         const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
//         calcLabels.forEach((label, i) => {
//             tableHtml += `<tr><td style="font-weight: bold;">${label}</td>`;
//             orderedComponents.forEach(comp => {
//                 [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
//                     const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
//                     const calc = marksDoc.reportData[key] || {};
//                     let val = '-';
//                     if (i === 0) val = formatVal(calc.maxMarks);
//                     if (i === 1) val = formatVal(calc.targetMarks);
//                     if (i === 2) val = formatVal(calc.studentsAboveTarget);
//                     if (i === 3) val = formatVal(calc.attainmentPercent);
//                     if (i === 4) val = formatVal(calc.attainmentLevel);
//                     tableHtml += `<td>${val}</td>`;
//                 });
//             });
//             tableHtml += `</tr>`;
//         });
        
//         tableHtml += `</tbody></table>`;

//         const htmlContent = getBaseHtml(`Calculated Marks & Attainment: ${subjectId} (${safeYear})`, tableHtml);

//         const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
//         const pdfBuffer = await page.pdf({ format: 'A4', landscape: true, margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }, printBackground: true });
//         await browser.close();

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('Error generating Calculated Marks PDF:', error);
//         if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
//     }
// }

// // ============================================================================
// // 3. Download Final CO Attainment ONLY (PDF)
// // ============================================================================
// async function handleDownloadFinalCoAttainmentPdf(req, res) {
//     try {
//         const { subjectId, course, academicYear } = req.query;
//         if (!subjectId || !course || !academicYear) return res.status(400).json({ message: "Missing parameters" });

//         const safeYear = academicYear.replace(/\//g, '-');
//         const fileName = `Final_CO_Attainment_${subjectId}_${safeYear}.pdf`;

//         const firstDoc = await FinalCoAttainment.findOne({ subjectId, course, academicYear }).lean();
//         if (!firstDoc?.attainmentTable) return res.status(404).json({ message: "No CO Attainment data found." });

//         let tableHtml = `
//             <table>
//                 <thead>
//                     <tr class="bg-header-gray">
//                         <th>CO's</th><th>Quiz 1</th><th>Sessional 1</th><th>Quiz 2</th>
//                         <th>Sessional 2</th><th>Assignment</th><th>End Sem</th>
//                         <th>Total Avg Int</th><th>Grand Total (50% int + 50% End term)</th>
//                     </tr>
//                 </thead>
//                 <tbody>`;
                
//         Object.entries(firstDoc.attainmentTable).forEach(([coName, coData]) => {
//             tableHtml += `<tr>
//                 <td><b>${coName}</b></td>
//                 <td>${formatVal(coData.Quiz_1)}</td><td>${formatVal(coData.Mid_Term)}</td>
//                 <td>${formatVal(coData.Quiz_2)}</td><td>${formatVal(coData.Surprise_Quiz)}</td>
//                 <td>${formatVal(coData.Assignment)}</td><td>${formatVal(coData.externalLevel)}</td>
//                 <td>${formatVal(coData.internalAvg)}</td><td>${formatVal(coData.grandTotal)}</td>
//             </tr>`;
//         });

//         let finalAttainmentValue = firstDoc.finalSubjectAttainment;
//         if (finalAttainmentValue === undefined) {
//             let sumGrandTotal = 0, countGrandTotal = 0;
//             Object.values(firstDoc.attainmentTable).forEach(co => {
//                 if (typeof co.grandTotal === 'number') { sumGrandTotal += co.grandTotal; countGrandTotal++; }
//             });
//             finalAttainmentValue = countGrandTotal > 0 ? parseFloat((sumGrandTotal / countGrandTotal).toFixed(2)) : undefined;
//         }

//         tableHtml += `<tr class="bg-footer-gray">
//                         <td colspan="8" class="text-right">Final CO Attainment</td>
//                         <td>${formatVal(finalAttainmentValue)}</td>
//                     </tr></tbody></table>`;

//         const htmlContent = getBaseHtml(`Final CO Attainment: ${subjectId} (${safeYear})`, tableHtml);

//         const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
//         const pdfBuffer = await page.pdf({ format: 'A4', landscape: true, margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }, printBackground: true });
//         await browser.close();

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('Error generating CO Attainment PDF:', error);
//         if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
//     }
// }

// // ============================================================================
// // 4. Download PO Attainment ONLY (PDF)
// // ============================================================================
// async function handleDownloadPoAttainmentPdf(req, res) {
//     try {
//         const { subjectId, course, academicYear } = req.query;
//         if (!subjectId || !course || !academicYear) return res.status(400).json({ message: "Missing parameters" });

//         const safeYear = academicYear.replace(/\//g, '-');
//         const fileName = `Final_PO_Attainment_${subjectId}_${safeYear}.pdf`;

//         const firstPoDoc = await PoAttainment.findOne({ subjectId, course, academicYear }).lean();
//         if (!firstPoDoc?.mappingData || !firstPoDoc?.averageCo) return res.status(404).json({ message: "No PO Attainment data found." });

//         const poKeys = Object.keys(firstPoDoc.averageCo).sort((a, b) => {
//             const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
//             const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
//             return textA === textB ? numA - numB : textA.localeCompare(textB);
//         });

//         let tableHtml = `<table><thead><tr class="bg-header-gray"><th>CO's</th>`;
//         poKeys.forEach(po => tableHtml += `<th>${po.toUpperCase()}</th>`);
//         tableHtml += `</tr></thead><tbody>`;

//         Object.keys(firstPoDoc.mappingData).forEach(co => {
//             tableHtml += `<tr><td><b>${co}</b></td>`;
//             poKeys.forEach(po => tableHtml += `<td>${formatVal(firstPoDoc.mappingData[co][po])}</td>`);
//             tableHtml += `</tr>`;
//         });

//         tableHtml += `<tr style="background-color: #F9F9F9; font-weight: bold;"><td>Average</td>`;
//         poKeys.forEach(po => tableHtml += `<td>${formatVal(firstPoDoc.averageCo[po])}</td>`);
//         tableHtml += `</tr>`;

//         tableHtml += `<tr class="bg-footer-gray">
//                         <td>Final Subject Attainment</td>
//                         <td colspan="${poKeys.length}">${formatVal(firstPoDoc.finalSubjectAttainment)}</td>
//                     </tr>`;

//         const poAttnData = firstPoDoc.poAttainment || firstPoDoc.poAttainments || {};
//         tableHtml += `<tr style="background-color: #E0E0E0; font-weight: bold;"><td>Final PO Attainment</td>`;
        
//         poKeys.forEach(po => {
//             let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
//             tableHtml += `<td>${formatVal(val)}</td>`;
//         });
//         tableHtml += `</tr></tbody></table>`;

//         const htmlContent = getBaseHtml(`Final PO Attainment: ${subjectId} (${safeYear})`, tableHtml);

//         const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
//         const pdfBuffer = await page.pdf({ format: 'A4', landscape: true, margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }, printBackground: true });
//         await browser.close();

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('Error generating PO Attainment PDF:', error);
//         if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
//     }
// }

// // Export all the compiled controllers
// module.exports = {
//     handleDownloadPdfReport,
//     handleDownloadCalculatedMarksPdf,
//     handleDownloadFinalCoAttainmentPdf,
//     handleDownloadPoAttainmentPdf
// };


// const puppeteer = require('puppeteer');

// // Models
// const calculatedMarks = require("../models/calculatedMarks");
// const FinalCoAttainment = require("../models/finalAttainment");
// const PoAttainment = require("../models/calculatedPo"); // Updated to correct model

// // Helper: Format values safely
// const formatVal = (val) => (val !== undefined && val !== null && val !== '') ? val : '-';

// // Shared HTML Base Template for consistent styling in individual reports
// // ADDED: tabTitle parameter to set the browser tab name
// const getBaseHtml = (title, tableHtml, tabTitle) => `
// <!DOCTYPE html>
// <html>
// <head>
//     <title>${tabTitle}</title> 
//     <style>
//         body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 0; }
//         h2 { text-align: center; font-size: 16px; margin-bottom: 20px; }
//         table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
//         tr { page-break-inside: avoid; page-break-after: auto; }
//         th, td { border: 1px solid black; padding: 5px; text-align: center; }
        
//         /* Excel matching styles */
//         .bg-reg { background-color: #D99694; font-weight: bold; }
//         .bg-comp-0 { background-color: #CCC1DA; font-weight: bold; }
//         .bg-comp-1 { background-color: #C5D9F1; font-weight: bold; }
//         .bg-header-gray { background-color: #F2F2F2; font-weight: bold; }
//         .bg-footer-gray { background-color: #E6E6E6; font-weight: bold; }
//         .text-right { text-align: right; padding-right: 10px; }
//     </style>
// </head>
// <body>
//     <h2>${title}</h2>
//     ${tableHtml}
// </body>
// </html>
// `;

// // ============================================================================
// // 1. Download Master Report as PDF
// // ============================================================================
// async function handleDownloadPdfReport(req, res) {
//     try {
//         const { subjectId, course, academicYear } = req.query;

//         if (!subjectId || !course || !academicYear) {
//             return res.status(400).json({ message: "Missing subjectId, course, or academicYear" });
//         }

//         const safeYear = academicYear.replace(/\//g, '-');
//         const fileName = `Report_${subjectId}_${safeYear}.pdf`;

//         // 1. FETCH DATA
//         const [marksDoc, coDoc, poDoc] = await Promise.all([
//             calculatedMarks.findOne({ subjectId, course, academicYear }).lean(),
//             FinalCoAttainment.findOne({ subjectId, course, academicYear }).lean(),
//             PoAttainment.findOne({ subjectId, course, academicYear }).lean() 
//         ]);

//         if (!marksDoc?.actualMarks?.length) {
//             return res.status(404).json({ message: "No marks data found for this subject and year." });
//         }

//         // 2. PREPARE DYNAMIC DATA MAPPINGS
//         const sampleMarks = marksDoc.actualMarks[0].marks;
//         const componentMap = {};
//         const orderedComponents = [];

//         Object.keys(sampleMarks).forEach(key => {
//             if (key.endsWith('_TOTAL')) return;
//             const match = key.match(/(.*)_(CO\d+)/);
//             if (match) {
//                 const [, compName, coName] = match;
//                 if (!componentMap[compName]) {
//                     componentMap[compName] = [];
//                     orderedComponents.push(compName);
//                 }
//                 componentMap[compName].push(coName);
//             }
//         });

//         orderedComponents.forEach(comp => componentMap[comp].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))));

//         // 3. BUILD HTML CONTENT
//         let htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <title>${subjectId}</title> <!-- Set Tab Title for Master Report -->
//             <style>
//                 body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 0; }
//                 h2 { text-align: center; font-size: 16px; margin-bottom: 5px; }
//                 h3 { text-align: left; font-size: 14px; margin-top: 20px; margin-bottom: 10px; color: #333; }
//                 table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
//                 tr { page-break-inside: avoid; page-break-after: auto; }
//                 th, td { border: 1px solid black; padding: 4px; text-align: center; }
//                 .page-break { page-break-before: always; }
                
//                 /* Colors matching your Excel styles */
//                 .bg-reg { background-color: #D99694; font-weight: bold; }
//                 .bg-comp-0 { background-color: #CCC1DA; font-weight: bold; }
//                 .bg-comp-1 { background-color: #C5D9F1; font-weight: bold; }
//                 .bg-header-gray { background-color: #F2F2F2; font-weight: bold; }
//                 .bg-footer-gray { background-color: #E6E6E6; font-weight: bold; }
//                 .text-right { text-align: right; padding-right: 10px; }
//             </style>
//         </head>
//         <body>
//             <h2>Attainment Report: ${subjectId} (${safeYear})</h2>
            
//             <!-- SECTION 1: CALCULATED MARKS -->
//             <h3>1. Calculated Marks & Attainment</h3>
//             <table>
//                 <thead>
//                     <tr>
//                         <th rowspan="2" class="bg-reg">Reg No</th>`;
        
//         // Headers Row 1 (Components)
//         orderedComponents.forEach((comp, index) => {
//             const colspan = componentMap[comp].length + 1;
//             const bgClass = `bg-comp-${index % 2}`;
//             htmlContent += `<th colspan="${colspan}" class="${bgClass}">${comp.replace(/_/g, ' ')}</th>`;
//         });
        
//         htmlContent += `</tr><tr>`;
        
//         // Headers Row 2 (COs & Totals)
//         orderedComponents.forEach((comp, index) => {
//             const bgClass = `bg-comp-${index % 2}`;
//             componentMap[comp].forEach(co => {
//                 htmlContent += `<th class="${bgClass}">${co}</th>`;
//             });
//             htmlContent += `<th class="${bgClass}">Total</th>`;
//         });
        
//         htmlContent += `</tr></thead><tbody>`;

//         // Student Marks Rows
//         marksDoc.actualMarks.forEach(({ regNo, marks: m }) => {
//             htmlContent += `<tr><td><b>${regNo}</b></td>`;
//             orderedComponents.forEach(comp => {
//                 componentMap[comp].forEach(co => {
//                     htmlContent += `<td>${formatVal(m[`${comp}_${co}`])}</td>`;
//                 });
//                 htmlContent += `<td>${formatVal(m[`${comp}_TOTAL`])}</td>`;
//             });
//             htmlContent += `</tr>`;
//         });

//         // Calculation Rows (Max, Target, Attainment, etc.)
//         const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
//         calcLabels.forEach((label, i) => {
//             htmlContent += `<tr><td style="font-weight: bold;">${label}</td>`;
//             orderedComponents.forEach(comp => {
//                 [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
//                     const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
//                     const calc = marksDoc.reportData[key] || {};
                    
//                     let val = '-';
//                     if (i === 0) val = formatVal(calc.maxMarks);
//                     if (i === 1) val = formatVal(calc.targetMarks);
//                     if (i === 2) val = formatVal(calc.studentsAboveTarget);
//                     if (i === 3) val = formatVal(calc.attainmentPercent);
//                     if (i === 4) val = formatVal(calc.attainmentLevel);
                    
//                     htmlContent += `<td>${val}</td>`;
//                 });
//             });
//             htmlContent += `</tr>`;
//         });
        
//         htmlContent += `</tbody></table>`;

//         // SECTION 2: FINAL CO ATTAINMENT
//         if (coDoc?.attainmentTable) {
//             htmlContent += `<div class="page-break"></div>
//                             <h3>2. Final CO Attainment</h3>
//                             <table>
//                                 <thead>
//                                     <tr class="bg-header-gray">
//                                         <th>CO's</th>
//                                         <th>Quiz 1</th>
//                                         <th>Sessional 1</th>
//                                         <th>Quiz 2</th>
//                                         <th>Sessional 2</th>
//                                         <th>Assignment</th>
//                                         <th>End Sem</th>
//                                         <th>Total Avg Int</th>
//                                         <th>Grand Total (50% int + 50% End term)</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>`;
                                
//             Object.entries(coDoc.attainmentTable).forEach(([coName, coData]) => {
//                 htmlContent += `<tr>
//                     <td><b>${coName}</b></td>
//                     <td>${formatVal(coData.Quiz_1)}</td>
//                     <td>${formatVal(coData.Mid_Term)}</td>
//                     <td>${formatVal(coData.Quiz_2)}</td>
//                     <td>${formatVal(coData.Surprise_Quiz)}</td>
//                     <td>${formatVal(coData.Assignment)}</td>
//                     <td>${formatVal(coData.externalLevel)}</td>
//                     <td>${formatVal(coData.internalAvg)}</td>
//                     <td>${formatVal(coData.grandTotal)}</td>
//                 </tr>`;
//             });

//             // Calculate Final CO Attainment Average if missing
//             let finalAttainmentValue = coDoc.finalSubjectAttainment;
//             if (finalAttainmentValue === undefined) {
//                 let sumGrandTotal = 0, countGrandTotal = 0;
//                 Object.values(coDoc.attainmentTable).forEach(co => {
//                     if (typeof co.grandTotal === 'number') { sumGrandTotal += co.grandTotal; countGrandTotal++; }
//                 });
//                 finalAttainmentValue = countGrandTotal > 0 ? parseFloat((sumGrandTotal / countGrandTotal).toFixed(2)) : undefined;
//             }

//             htmlContent += `<tr class="bg-footer-gray">
//                                 <td colspan="8" class="text-right">Final CO Attainment</td>
//                                 <td>${formatVal(finalAttainmentValue)}</td>
//                             </tr>
//                         </tbody>
//                     </table>`;
//         }

//         // SECTION 3: FINAL PO ATTAINMENT
//         if (poDoc?.mappingData && poDoc?.averageCo) {
//             const poKeys = Object.keys(poDoc.averageCo).sort((a, b) => {
//                 const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
//                 const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
//                 return textA === textB ? numA - numB : textA.localeCompare(textB);
//             });

//             htmlContent += `<br>
//                             <h3>3. Final PO Attainment</h3>
//                             <table>
//                                 <thead>
//                                     <tr class="bg-header-gray">
//                                         <th>CO's</th>`;
            
//             poKeys.forEach(po => htmlContent += `<th>${po.toUpperCase()}</th>`);
            
//             htmlContent += `</tr></thead><tbody>`;

//             // Mapping Rows
//             Object.keys(poDoc.mappingData).forEach(co => {
//                 htmlContent += `<tr><td><b>${co}</b></td>`;
//                 poKeys.forEach(po => htmlContent += `<td>${formatVal(poDoc.mappingData[co][po])}</td>`);
//                 htmlContent += `</tr>`;
//             });

//             // Average CO Row
//             htmlContent += `<tr style="background-color: #F9F9F9; font-weight: bold;">
//                                 <td>Average</td>`;
//             poKeys.forEach(po => htmlContent += `<td>${formatVal(poDoc.averageCo[po])}</td>`);
//             htmlContent += `</tr>`;

//             // Final Subject Attainment Row
//             htmlContent += `<tr class="bg-footer-gray">
//                                 <td>Final Subject Attainment</td>
//                                 <td colspan="${poKeys.length}">${formatVal(poDoc.finalSubjectAttainment)}</td>
//                             </tr>`;

//             // PO Attainment Row
//             const poAttnData = poDoc.poAttainment || poDoc.poAttainments || {};
//             htmlContent += `<tr style="background-color: #E0E0E0; font-weight: bold;">
//                                 <td>Final PO Attainment</td>`;
            
//             poKeys.forEach(po => {
//                 let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
//                 htmlContent += `<td>${formatVal(val)}</td>`;
//             });

//             htmlContent += `</tr></tbody></table>`;
//         }

//         htmlContent += `</body></html>`;

//         // 4. GENERATE PDF VIA PUPPETEER
//         const browser = await puppeteer.launch({ 
//             headless: 'new',
//             args: ['--no-sandbox', '--disable-setuid-sandbox'] 
//         });
        
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             landscape: true, 
//             scale: 0.65, // Shrinks wide tables to fit
//             margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
//             printBackground: true 
//         });

//         await browser.close();

//         // 5. STREAM PDF TO BROWSER INLINE
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('Error generating PDF report:', error);
//         if (!res.headersSent) res.status(500).json({ message: 'Internal server error while generating PDF report.' });
//     }
// }

// // ============================================================================
// // 2. Download Calculated Marks ONLY (PDF)
// // ============================================================================
// async function handleDownloadCalculatedMarksPdf(req, res) {
//     try {
//         const { subjectId, course, academicYear } = req.query;
//         if (!subjectId || !course || !academicYear) {
//             return res.status(400).json({ message: "Missing parameters" });
//         }

//         const safeYear = academicYear.replace(/\//g, '-');
//         const fileName = `CalculatedMarks_${subjectId}_${safeYear}.pdf`;

//         const marksDoc = await calculatedMarks.findOne({ subjectId, course, academicYear }).lean();
        
//         if (!marksDoc?.actualMarks?.length) {
//             return res.status(404).json({ message: "No marks data found." });
//         }

//         const sampleMarks = marksDoc.actualMarks[0].marks;
//         const componentMap = {};
//         const orderedComponents = [];

//         Object.keys(sampleMarks).forEach(key => {
//             if (key.endsWith('_TOTAL')) return;
//             const match = key.match(/(.*)_(CO\d+)/);
//             if (match) {
//                 const [, compName, coName] = match;
//                 if (!componentMap[compName]) { 
//                     componentMap[compName] = []; 
//                     orderedComponents.push(compName); 
//                 }
//                 componentMap[compName].push(coName);
//             }
//         });

//         orderedComponents.forEach(comp => componentMap[comp].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))));

//         let tableHtml = `<table><thead><tr><th rowspan="2" class="bg-reg">Reg No</th>`;
        
//         orderedComponents.forEach((comp, index) => {
//             const colspan = componentMap[comp].length + 1;
//             tableHtml += `<th colspan="${colspan}" class="bg-comp-${index % 2}">${comp.replace(/_/g, ' ')}</th>`;
//         });
        
//         tableHtml += `</tr><tr>`;
        
//         orderedComponents.forEach((comp, index) => {
//             const bgClass = `bg-comp-${index % 2}`;
//             componentMap[comp].forEach(co => tableHtml += `<th class="${bgClass}">${co}</th>`);
//             tableHtml += `<th class="${bgClass}">Total</th>`;
//         });
        
//         tableHtml += `</tr></thead><tbody>`;

//         marksDoc.actualMarks.forEach(({ regNo, marks: m }) => {
//             tableHtml += `<tr><td><b>${regNo}</b></td>`;
//             orderedComponents.forEach(comp => {
//                 componentMap[comp].forEach(co => tableHtml += `<td>${formatVal(m[`${comp}_${co}`])}</td>`);
//                 tableHtml += `<td>${formatVal(m[`${comp}_TOTAL`])}</td>`;
//             });
//             tableHtml += `</tr>`;
//         });

//         const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
//         calcLabels.forEach((label, i) => {
//             tableHtml += `<tr><td style="font-weight: bold;">${label}</td>`;
//             orderedComponents.forEach(comp => {
//                 [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
//                     const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
//                     const calc = marksDoc.reportData[key] || {};
//                     let val = '-';
//                     if (i === 0) val = formatVal(calc.maxMarks);
//                     if (i === 1) val = formatVal(calc.targetMarks);
//                     if (i === 2) val = formatVal(calc.studentsAboveTarget);
//                     if (i === 3) val = formatVal(calc.attainmentPercent);
//                     if (i === 4) val = formatVal(calc.attainmentLevel);
//                     tableHtml += `<td>${val}</td>`;
//                 });
//             });
//             tableHtml += `</tr>`;
//         });
        
//         tableHtml += `</tbody></table>`;

//         // Pass subjectId for the Tab Title
//         const htmlContent = getBaseHtml(`Calculated Marks & Attainment: ${subjectId} (${safeYear})`, tableHtml, subjectId);

//         const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
//         const pdfBuffer = await page.pdf({ 
//             format: 'A4', 
//             landscape: true, 
//             scale: 0.65, // Shrinks wide tables to fit
//             margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }, 
//             printBackground: true 
//         });
//         await browser.close();

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `inline; filename="${fileName}"`); // INLINE
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('Error generating Calculated Marks PDF:', error);
//         if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
//     }
// }

// // ============================================================================
// // 3. Download Final CO Attainment ONLY (PDF)
// // ============================================================================
// async function handleDownloadFinalCoAttainmentPdf(req, res) {
//     try {
//         const { subjectId, course, academicYear } = req.query;
//         if (!subjectId || !course || !academicYear) return res.status(400).json({ message: "Missing parameters" });

//         const safeYear = academicYear.replace(/\//g, '-');
//         const fileName = `Final_CO_Attainment_${subjectId}_${safeYear}.pdf`;

//         const firstDoc = await FinalCoAttainment.findOne({ subjectId, course, academicYear }).lean();
//         if (!firstDoc?.attainmentTable) return res.status(404).json({ message: "No CO Attainment data found." });

//         let tableHtml = `
//             <table>
//                 <thead>
//                     <tr class="bg-header-gray">
//                         <th>CO's</th><th>Quiz 1</th><th>Sessional 1</th><th>Quiz 2</th>
//                         <th>Sessional 2</th><th>Assignment</th><th>End Sem</th>
//                         <th>Total Avg Int</th><th>Grand Total (50% int + 50% End term)</th>
//                     </tr>
//                 </thead>
//                 <tbody>`;
                
//         Object.entries(firstDoc.attainmentTable).forEach(([coName, coData]) => {
//             tableHtml += `<tr>
//                 <td><b>${coName}</b></td>
//                 <td>${formatVal(coData.Quiz_1)}</td><td>${formatVal(coData.Mid_Term)}</td>
//                 <td>${formatVal(coData.Quiz_2)}</td><td>${formatVal(coData.Surprise_Quiz)}</td>
//                 <td>${formatVal(coData.Assignment)}</td><td>${formatVal(coData.externalLevel)}</td>
//                 <td>${formatVal(coData.internalAvg)}</td><td>${formatVal(coData.grandTotal)}</td>
//             </tr>`;
//         });

//         let finalAttainmentValue = firstDoc.finalSubjectAttainment;
//         if (finalAttainmentValue === undefined) {
//             let sumGrandTotal = 0, countGrandTotal = 0;
//             Object.values(firstDoc.attainmentTable).forEach(co => {
//                 if (typeof co.grandTotal === 'number') { sumGrandTotal += co.grandTotal; countGrandTotal++; }
//             });
//             finalAttainmentValue = countGrandTotal > 0 ? parseFloat((sumGrandTotal / countGrandTotal).toFixed(2)) : undefined;
//         }

//         tableHtml += `<tr class="bg-footer-gray">
//                         <td colspan="8" class="text-right">Final CO Attainment</td>
//                         <td>${formatVal(finalAttainmentValue)}</td>
//                     </tr></tbody></table>`;

//         // Pass subjectId for the Tab Title
//         const htmlContent = getBaseHtml(`Final CO Attainment: ${subjectId} (${safeYear})`, tableHtml, subjectId);

//         const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
//         const pdfBuffer = await page.pdf({ 
//             format: 'A4', 
//             landscape: true, 
//             scale: 0.65, // Shrinks wide tables to fit
//             margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }, 
//             printBackground: true 
//         });
//         await browser.close();

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `inline; filename="${fileName}"`); // INLINE
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('Error generating CO Attainment PDF:', error);
//         if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
//     }
// }

// // ============================================================================
// // 4. Download PO Attainment ONLY (PDF)
// // ============================================================================
// async function handleDownloadPoAttainmentPdf(req, res) {
//     try {
//         const { subjectId, course, academicYear } = req.query;
//         if (!subjectId || !course || !academicYear) return res.status(400).json({ message: "Missing parameters" });

//         const safeYear = academicYear.replace(/\//g, '-');
//         const fileName = `Final_PO_Attainment_${subjectId}_${safeYear}.pdf`;

//         const firstPoDoc = await PoAttainment.findOne({ subjectId, course, academicYear }).lean();
//         if (!firstPoDoc?.mappingData || !firstPoDoc?.averageCo) return res.status(404).json({ message: "No PO Attainment data found." });

//         const poKeys = Object.keys(firstPoDoc.averageCo).sort((a, b) => {
//             const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
//             const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
//             return textA === textB ? numA - numB : textA.localeCompare(textB);
//         });

//         let tableHtml = `<table><thead><tr class="bg-header-gray"><th>CO's</th>`;
//         poKeys.forEach(po => tableHtml += `<th>${po.toUpperCase()}</th>`);
//         tableHtml += `</tr></thead><tbody>`;

//         Object.keys(firstPoDoc.mappingData).forEach(co => {
//             tableHtml += `<tr><td><b>${co}</b></td>`;
//             poKeys.forEach(po => tableHtml += `<td>${formatVal(firstPoDoc.mappingData[co][po])}</td>`);
//             tableHtml += `</tr>`;
//         });

//         tableHtml += `<tr style="background-color: #F9F9F9; font-weight: bold;"><td>Average</td>`;
//         poKeys.forEach(po => tableHtml += `<td>${formatVal(firstPoDoc.averageCo[po])}</td>`);
//         tableHtml += `</tr>`;

//         tableHtml += `<tr class="bg-footer-gray">
//                         <td>Final Subject Attainment</td>
//                         <td colspan="${poKeys.length}">${formatVal(firstPoDoc.finalSubjectAttainment)}</td>
//                     </tr>`;

//         const poAttnData = firstPoDoc.poAttainment || firstPoDoc.poAttainments || {};
//         tableHtml += `<tr style="background-color: #E0E0E0; font-weight: bold;"><td>Final PO Attainment</td>`;
        
//         poKeys.forEach(po => {
//             let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
//             tableHtml += `<td>${formatVal(val)}</td>`;
//         });
//         tableHtml += `</tr></tbody></table>`;

//         // Pass subjectId for the Tab Title
//         const htmlContent = getBaseHtml(`Final PO Attainment: ${subjectId} (${safeYear})`, tableHtml, subjectId);

//         const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
//         const pdfBuffer = await page.pdf({ 
//             format: 'A4', 
//             landscape: true, 
//             scale: 0.65, // Shrinks wide tables to fit
//             margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }, 
//             printBackground: true 
//         });
//         await browser.close();

//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `inline; filename="${fileName}"`); // INLINE
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('Error generating PO Attainment PDF:', error);
//         if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
//     }
// }

// // Export all the compiled controllers
// module.exports = {
//     handleDownloadPdfReport,
//     handleDownloadCalculatedMarksPdf,
//     handleDownloadFinalCoAttainmentPdf,
//     handleDownloadPoAttainmentPdf
// };



















const puppeteer = require('puppeteer');

// Models
const calculatedMarks = require("../models/calculatedMarks");
const FinalCoAttainment = require("../models/finalAttainment");
const PoAttainment = require("../models/calculatedPo");

// Helper: Format values safely
const formatVal = (val) => (val !== undefined && val !== null && val !== '') ? val : '-';

// Shared HTML Base Template with DYNAMIC SCALING
// ADDED: colCount parameter to calculate dynamic font-size and padding
const getBaseHtml = (title, tableHtml, tabTitle, colCount = 10) => {
    
    // Dynamic Fitting Logic: Shrink text and padding only if the table is exceptionally wide
    let fontSize = '10px';
    let cellPadding = '5px';

    if (colCount > 24) {
        fontSize = '6.5px';
        cellPadding = '2px';
    } else if (colCount > 18) {
        fontSize = '7.5px';
        cellPadding = '3px';
    } else if (colCount > 14) {
        fontSize = '8.5px';
        cellPadding = '4px';
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${tabTitle}</title> 
        <style>
            body { font-family: Arial, sans-serif; font-size: ${fontSize}; margin: 0; padding: 0; }
            h2 { text-align: center; font-size: 16px; margin: 10px 0 20px 0; }
            h3 { text-align: left; font-size: 14px; margin: 15px 0 5px 0; color: #333; }
            
            table { width: 100%; max-width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; table-layout: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            
            /* Dynamically injected padding */
            th, td { border: 1px solid black; padding: ${cellPadding}; text-align: center; word-wrap: break-word; }
            
            .page-break { page-break-before: always; }
            
            /* Excel matching styles */
            .bg-reg { background-color: #D99694; font-weight: bold; }
            .bg-comp-0 { background-color: #CCC1DA; font-weight: bold; }
            .bg-comp-1 { background-color: #C5D9F1; font-weight: bold; }
            .bg-header-gray { background-color: #F2F2F2; font-weight: bold; }
            .bg-footer-gray { background-color: #E6E6E6; font-weight: bold; }
            .text-right { text-align: right; padding-right: 10px; }
        </style>
    </head>
    <body>
        <h2>${title}</h2>
        ${tableHtml}
    </body>
    </html>
    `;
};

// ============================================================================
// 1. Download Master Report as PDF
// ============================================================================
async function handleDownloadPdfReport(req, res) {
    try {
        const { subjectId, course, academicYear } = req.query;

        if (!subjectId || !course || !academicYear) {
            return res.status(400).json({ message: "Missing subjectId, course, or academicYear" });
        }

        const safeYear = academicYear.replace(/\//g, '-');
        const fileName = `Report_${subjectId}_${safeYear}.pdf`;

        const [marksDoc, coDoc, poDoc] = await Promise.all([
            calculatedMarks.findOne({ subjectId, course, academicYear }).lean(),
            FinalCoAttainment.findOne({ subjectId, course, academicYear }).lean(),
            PoAttainment.findOne({ subjectId, course, academicYear }).lean() 
        ]);

        if (!marksDoc?.actualMarks?.length) {
            return res.status(404).json({ message: "No marks data found for this subject and year." });
        }

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

        // Calculate maximum columns dynamically to pass to the HTML generator
        let calcMarksCols = 1; 
        orderedComponents.forEach(comp => { calcMarksCols += componentMap[comp].length + 1; });
        
        let poKeysCols = 0;
        if (poDoc?.averageCo) { poKeysCols = Object.keys(poDoc.averageCo).length + 1; }
        
        const maxColsForMasterReport = Math.max(calcMarksCols, 9, poKeysCols);

        let tableHtml = `
            <h3>1. Calculated Marks & Attainment</h3>
            <table>
                <thead>
                    <tr>
                        <th rowspan="2" class="bg-reg">Reg No</th>`;
        
        orderedComponents.forEach((comp, index) => {
            const colspan = componentMap[comp].length + 1;
            const bgClass = `bg-comp-${index % 2}`;
            tableHtml += `<th colspan="${colspan}" class="${bgClass}">${comp.replace(/_/g, ' ')}</th>`;
        });
        
        tableHtml += `</tr><tr>`;
        
        orderedComponents.forEach((comp, index) => {
            const bgClass = `bg-comp-${index % 2}`;
            componentMap[comp].forEach(co => {
                tableHtml += `<th class="${bgClass}">${co}</th>`;
            });
            tableHtml += `<th class="${bgClass}">Total</th>`;
        });
        
        tableHtml += `</tr></thead><tbody>`;

        marksDoc.actualMarks.forEach(({ regNo, marks: m }) => {
            tableHtml += `<tr><td><b>${regNo}</b></td>`;
            orderedComponents.forEach(comp => {
                componentMap[comp].forEach(co => {
                    tableHtml += `<td>${formatVal(m[`${comp}_${co}`])}</td>`;
                });
                tableHtml += `<td>${formatVal(m[`${comp}_TOTAL`])}</td>`;
            });
            tableHtml += `</tr>`;
        });

        const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
        calcLabels.forEach((label, i) => {
            tableHtml += `<tr><td style="font-weight: bold;">${label}</td>`;
            orderedComponents.forEach(comp => {
                [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
                    const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
                    const calc = marksDoc.reportData[key] || {};
                    let val = '-';
                    if (i === 0) val = formatVal(calc.maxMarks);
                    if (i === 1) val = formatVal(calc.targetMarks);
                    if (i === 2) val = formatVal(calc.studentsAboveTarget);
                    if (i === 3) val = formatVal(calc.attainmentPercent);
                    if (i === 4) val = formatVal(calc.attainmentLevel);
                    tableHtml += `<td>${val}</td>`;
                });
            });
            tableHtml += `</tr>`;
        });
        
        tableHtml += `</tbody></table>`;

        if (coDoc?.attainmentTable) {
            tableHtml += `<div class="page-break"></div>
                            <h3>2. Final CO Attainment</h3>
                            <table>
                                <thead>
                                    <tr class="bg-header-gray">
                                        <th>CO's</th>
                                        <th>Quiz 1</th>
                                        <th>Sessional 1</th>
                                        <th>Quiz 2</th>
                                        <th>Sessional 2</th>
                                        <th>Assignment</th>
                                        <th>End Sem</th>
                                        <th>Total Avg Int</th>
                                        <th>Grand Total (50% int + 50% End term)</th>
                                    </tr>
                                </thead>
                                <tbody>`;
                                
            Object.entries(coDoc.attainmentTable).forEach(([coName, coData]) => {
                tableHtml += `<tr>
                    <td><b>${coName}</b></td>
                    <td>${formatVal(coData.Quiz_1)}</td>
                    <td>${formatVal(coData.Mid_Term)}</td>
                    <td>${formatVal(coData.Quiz_2)}</td>
                    <td>${formatVal(coData.Surprise_Quiz)}</td>
                    <td>${formatVal(coData.Assignment)}</td>
                    <td>${formatVal(coData.externalLevel)}</td>
                    <td>${formatVal(coData.internalAvg)}</td>
                    <td>${formatVal(coData.grandTotal)}</td>
                </tr>`;
            });

            let finalAttainmentValue = coDoc.finalSubjectAttainment;
            if (finalAttainmentValue === undefined) {
                let sumGrandTotal = 0, countGrandTotal = 0;
                Object.values(coDoc.attainmentTable).forEach(co => {
                    if (typeof co.grandTotal === 'number') { sumGrandTotal += co.grandTotal; countGrandTotal++; }
                });
                finalAttainmentValue = countGrandTotal > 0 ? parseFloat((sumGrandTotal / countGrandTotal).toFixed(2)) : undefined;
            }

            tableHtml += `<tr class="bg-footer-gray">
                                <td colspan="8" class="text-right">Final CO Attainment</td>
                                <td>${formatVal(finalAttainmentValue)}</td>
                            </tr>
                        </tbody>
                    </table>`;
        }

        if (poDoc?.mappingData && poDoc?.averageCo) {
            const poKeys = Object.keys(poDoc.averageCo).sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
                const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
                return textA === textB ? numA - numB : textA.localeCompare(textB);
            });

            tableHtml += `<br>
                            <h3>3. Final PO Attainment</h3>
                            <table>
                                <thead>
                                    <tr class="bg-header-gray">
                                        <th>CO's</th>`;
            
            poKeys.forEach(po => tableHtml += `<th>${po.toUpperCase()}</th>`);
            
            tableHtml += `</tr></thead><tbody>`;

            Object.keys(poDoc.mappingData).forEach(co => {
                tableHtml += `<tr><td><b>${co}</b></td>`;
                poKeys.forEach(po => tableHtml += `<td>${formatVal(poDoc.mappingData[co][po])}</td>`);
                tableHtml += `</tr>`;
            });

            tableHtml += `<tr style="background-color: #F9F9F9; font-weight: bold;">
                                <td>Average</td>`;
            poKeys.forEach(po => tableHtml += `<td>${formatVal(poDoc.averageCo[po])}</td>`);
            tableHtml += `</tr>`;

            tableHtml += `<tr class="bg-footer-gray">
                                <td>Final Subject Attainment</td>
                                <td colspan="${poKeys.length}">${formatVal(poDoc.finalSubjectAttainment)}</td>
                            </tr>`;

            const poAttnData = poDoc.poAttainment || poDoc.poAttainments || {};
            tableHtml += `<tr style="background-color: #E0E0E0; font-weight: bold;">
                                <td>Final PO Attainment</td>`;
            
            poKeys.forEach(po => {
                let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
                tableHtml += `<td>${formatVal(val)}</td>`;
            });

            tableHtml += `</tr></tbody></table>`;
        }

        // Generate full HTML passing the max column count for dynamic scaling
        const htmlContent = getBaseHtml(`Attainment Report: ${subjectId} (${safeYear})`, tableHtml, subjectId, maxColsForMasterReport);

        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true, 
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }, // Removed scale
            printBackground: true 
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF report:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Internal server error while generating PDF report.' });
    }
}

// ============================================================================
// 2. Download Calculated Marks ONLY (PDF)
// ============================================================================
async function handleDownloadCalculatedMarksPdf(req, res) {
    try {
        const { subjectId, course, academicYear } = req.query;
        if (!subjectId || !course || !academicYear) {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const safeYear = academicYear.replace(/\//g, '-');
        const fileName = `CalculatedMarks_${subjectId}_${safeYear}.pdf`;

        const marksDoc = await calculatedMarks.findOne({ subjectId, course, academicYear }).lean();
        
        if (!marksDoc?.actualMarks?.length) {
            return res.status(404).json({ message: "No marks data found." });
        }

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

        // Calculate dynamic columns for this specific table
        let calcMarksCols = 1; 
        orderedComponents.forEach(comp => { calcMarksCols += componentMap[comp].length + 1; });

        let tableHtml = `<table><thead><tr><th rowspan="2" class="bg-reg">Reg No</th>`;
        
        orderedComponents.forEach((comp, index) => {
            const colspan = componentMap[comp].length + 1;
            tableHtml += `<th colspan="${colspan}" class="bg-comp-${index % 2}">${comp.replace(/_/g, ' ')}</th>`;
        });
        
        tableHtml += `</tr><tr>`;
        
        orderedComponents.forEach((comp, index) => {
            const bgClass = `bg-comp-${index % 2}`;
            componentMap[comp].forEach(co => tableHtml += `<th class="${bgClass}">${co}</th>`);
            tableHtml += `<th class="${bgClass}">Total</th>`;
        });
        
        tableHtml += `</tr></thead><tbody>`;

        marksDoc.actualMarks.forEach(({ regNo, marks: m }) => {
            tableHtml += `<tr><td><b>${regNo}</b></td>`;
            orderedComponents.forEach(comp => {
                componentMap[comp].forEach(co => tableHtml += `<td>${formatVal(m[`${comp}_${co}`])}</td>`);
                tableHtml += `<td>${formatVal(m[`${comp}_TOTAL`])}</td>`;
            });
            tableHtml += `</tr>`;
        });

        const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
        calcLabels.forEach((label, i) => {
            tableHtml += `<tr><td style="font-weight: bold;">${label}</td>`;
            orderedComponents.forEach(comp => {
                [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
                    const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
                    const calc = marksDoc.reportData[key] || {};
                    let val = '-';
                    if (i === 0) val = formatVal(calc.maxMarks);
                    if (i === 1) val = formatVal(calc.targetMarks);
                    if (i === 2) val = formatVal(calc.studentsAboveTarget);
                    if (i === 3) val = formatVal(calc.attainmentPercent);
                    if (i === 4) val = formatVal(calc.attainmentLevel);
                    tableHtml += `<td>${val}</td>`;
                });
            });
            tableHtml += `</tr>`;
        });
        
        tableHtml += `</tbody></table>`;

        // Pass calculated columns dynamically
        const htmlContent = getBaseHtml(`Calculated Marks & Attainment: ${subjectId} (${safeYear})`, tableHtml, subjectId, calcMarksCols);

        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            landscape: true, 
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }, // Removed scale
            printBackground: true 
        });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`); 
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating Calculated Marks PDF:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
    }
}

// ============================================================================
// 3. Download Final CO Attainment ONLY (PDF)
// ============================================================================
async function handleDownloadFinalCoAttainmentPdf(req, res) {
    try {
        const { subjectId, course, academicYear } = req.query;
        if (!subjectId || !course || !academicYear) return res.status(400).json({ message: "Missing parameters" });

        const safeYear = academicYear.replace(/\//g, '-');
        const fileName = `Final_CO_Attainment_${subjectId}_${safeYear}.pdf`;

        const firstDoc = await FinalCoAttainment.findOne({ subjectId, course, academicYear }).lean();
        if (!firstDoc?.attainmentTable) return res.status(404).json({ message: "No CO Attainment data found." });

        let tableHtml = `
            <table>
                <thead>
                    <tr class="bg-header-gray">
                        <th>CO's</th><th>Quiz 1</th><th>Sessional 1</th><th>Quiz 2</th>
                        <th>Sessional 2</th><th>Assignment</th><th>End Sem</th>
                        <th>Total Avg Int</th><th>Grand Total (50% int + 50% End term)</th>
                    </tr>
                </thead>
                <tbody>`;
                
        Object.entries(firstDoc.attainmentTable).forEach(([coName, coData]) => {
            tableHtml += `<tr>
                <td><b>${coName}</b></td>
                <td>${formatVal(coData.Quiz_1)}</td><td>${formatVal(coData.Mid_Term)}</td>
                <td>${formatVal(coData.Quiz_2)}</td><td>${formatVal(coData.Surprise_Quiz)}</td>
                <td>${formatVal(coData.Assignment)}</td><td>${formatVal(coData.externalLevel)}</td>
                <td>${formatVal(coData.internalAvg)}</td><td>${formatVal(coData.grandTotal)}</td>
            </tr>`;
        });

        let finalAttainmentValue = firstDoc.finalSubjectAttainment;
        if (finalAttainmentValue === undefined) {
            let sumGrandTotal = 0, countGrandTotal = 0;
            Object.values(firstDoc.attainmentTable).forEach(co => {
                if (typeof co.grandTotal === 'number') { sumGrandTotal += co.grandTotal; countGrandTotal++; }
            });
            finalAttainmentValue = countGrandTotal > 0 ? parseFloat((sumGrandTotal / countGrandTotal).toFixed(2)) : undefined;
        }

        tableHtml += `<tr class="bg-footer-gray">
                        <td colspan="8" class="text-right">Final CO Attainment</td>
                        <td>${formatVal(finalAttainmentValue)}</td>
                    </tr></tbody></table>`;

        // Fixed 9 columns for CO table
        const htmlContent = getBaseHtml(`Final CO Attainment: ${subjectId} (${safeYear})`, tableHtml, subjectId, 9);

        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            landscape: true, 
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }, // Removed scale
            printBackground: true 
        });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`); 
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating CO Attainment PDF:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
    }
}

// ============================================================================
// 4. Download PO Attainment ONLY (PDF)
// ============================================================================
async function handleDownloadPoAttainmentPdf(req, res) {
    try {
        const { subjectId, course, academicYear } = req.query;
        if (!subjectId || !course || !academicYear) return res.status(400).json({ message: "Missing parameters" });

        const safeYear = academicYear.replace(/\//g, '-');
        const fileName = `Final_PO_Attainment_${subjectId}_${safeYear}.pdf`;

        const firstPoDoc = await PoAttainment.findOne({ subjectId, course, academicYear }).lean();
        if (!firstPoDoc?.mappingData || !firstPoDoc?.averageCo) return res.status(404).json({ message: "No PO Attainment data found." });

        const poKeys = Object.keys(firstPoDoc.averageCo).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
            const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
            return textA === textB ? numA - numB : textA.localeCompare(textB);
        });

        let tableHtml = `<table><thead><tr class="bg-header-gray"><th>CO's</th>`;
        poKeys.forEach(po => tableHtml += `<th>${po.toUpperCase()}</th>`);
        tableHtml += `</tr></thead><tbody>`;

        Object.keys(firstPoDoc.mappingData).forEach(co => {
            tableHtml += `<tr><td><b>${co}</b></td>`;
            poKeys.forEach(po => tableHtml += `<td>${formatVal(firstPoDoc.mappingData[co][po])}</td>`);
            tableHtml += `</tr>`;
        });

        tableHtml += `<tr style="background-color: #F9F9F9; font-weight: bold;"><td>Average</td>`;
        poKeys.forEach(po => tableHtml += `<td>${formatVal(firstPoDoc.averageCo[po])}</td>`);
        tableHtml += `</tr>`;

        tableHtml += `<tr class="bg-footer-gray">
                        <td>Final Subject Attainment</td>
                        <td colspan="${poKeys.length}">${formatVal(firstPoDoc.finalSubjectAttainment)}</td>
                    </tr>`;

        const poAttnData = firstPoDoc.poAttainment || firstPoDoc.poAttainments || {};
        tableHtml += `<tr style="background-color: #E0E0E0; font-weight: bold;"><td>Final PO Attainment</td>`;
        
        poKeys.forEach(po => {
            let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
            tableHtml += `<td>${formatVal(val)}</td>`;
        });
        tableHtml += `</tr></tbody></table>`;

        // Calculate columns for PO table dynamically
        const poColsCount = poKeys.length + 1;
        const htmlContent = getBaseHtml(`Final PO Attainment: ${subjectId} (${safeYear})`, tableHtml, subjectId, poColsCount);

        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            landscape: true, 
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }, // Removed scale
            printBackground: true 
        });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`); 
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PO Attainment PDF:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
    }
}

// Export all the compiled controllers
module.exports = {
    handleDownloadPdfReport,
    handleDownloadCalculatedMarksPdf,
    handleDownloadFinalCoAttainmentPdf,
    handleDownloadPoAttainmentPdf
};