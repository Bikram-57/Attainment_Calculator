// const puppeteer = require('puppeteer');
// const CalculatedLabMark = require('../models/calculatedLabMarks'); 
// const FinalLabAttainment = require('../models/finalLabAttainment');
// const LabPoAttainment = require('../models/calculatedLabPo'); 

// // ============================================================================
// // Download PRINT READY Complete Lab Attainment Excel Report
// // ============================================================================

// async function handleDownloadPrintReadyReportForLab(req, res) {
//     let browser;
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

//         if (!calcData && !finalData && !poData) {
//             return res.status(404).json({ success: false, message: "No lab data found to download for these parameters." });
//         }

//         // 3. CSS AND HTML SETUP
//         const alternatingColors = ['#CCC1DA', '#C5D9F1']; // Lavender, Light Blue
//         const pinkColor = '#D99694';
//         const grayColor = '#D9D9D9';
//         const lightGrayColor = '#EBEBEB';

//         let htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
//                     h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
//                     h3 { color: #555; font-size: 14px; margin-bottom: 10px; margin-top: 20px; }
                    
//                     /* 🎯 table width set to max-content ensures it stretches to its true size for measurement */
//                     table { width: max-content; min-width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: auto; margin-left: auto; margin-right: auto; }
//                     tr { page-break-inside: avoid; page-break-after: auto; }
//                     thead { display: table-header-group; }
//                     th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; }
//                     th { font-weight: bold; color: #000; }
                    
//                     /* Prevents columns from squishing text into unreadable stacks */
//                     th, td { white-space: nowrap; } 
                    
//                     /* Utility class for forcing page breaks */
//                     .page-break { page-break-before: always; }
//                 </style>
//             </head>
//             <body>
//                 <h2>Lab Attainment Report - ${cleanSubjectId} (${cleanYear})</h2>
//         `;

//         const parentColorMap = {};
//         let hasTable1 = false;
        
//         // ==========================================================
//         // TABLE 1: CO Attainment (Internal Lab Marks)
//         // ==========================================================
//         if (calcData && calcData.maxMarks) {
//             hasTable1 = true;
//             htmlContent += `<h3>1. CO Attainment (Internal Marks)</h3>`;
//             const marksKeys = Object.keys(calcData.maxMarks);
            
//             const parentGroups = [];
//             let currentGroup = null;
            
//             marksKeys.forEach(key => {
//                 const lastUnderscore = key.lastIndexOf('_');
//                 const rawParent = lastUnderscore !== -1 ? key.substring(0, lastUnderscore) : key;
//                 const subName = lastUnderscore !== -1 ? key.substring(lastUnderscore + 1) : "";
//                 const parentDisplay = rawParent.replace(/_/g, ' ');

//                 if (!currentGroup || currentGroup.raw !== rawParent) {
//                     if (currentGroup) parentGroups.push(currentGroup);
//                     currentGroup = { name: parentDisplay, raw: rawParent, subNames: [subName] };
//                 } else {
//                     currentGroup.subNames.push(subName);
//                 }
//             });
//             if (currentGroup) parentGroups.push(currentGroup);

//             htmlContent += `<table><thead><tr><th rowspan="2" style="background-color: ${pinkColor};">Reg No</th>`;
//             let subRowHtml = `<tr>`;

//             parentGroups.forEach((group, index) => {
//                 const color = alternatingColors[index % 2];
//                 parentColorMap[group.raw] = color; 
                
//                 htmlContent += `<th colspan="${group.subNames.length}" style="background-color: ${color};">${group.name}</th>`;
//                 group.subNames.forEach(sub => {
//                     subRowHtml += `<th style="background-color: ${color};">${sub}</th>`;
//                 });
//             });

//             htmlContent += `</tr>${subRowHtml}</tr></thead><tbody>`;

//             if (calcData.actualMarks && calcData.actualMarks.length > 0) {
//                 calcData.actualMarks.forEach(student => {
//                     htmlContent += `<tr><td>${student.regNo}</td>`;
//                     marksKeys.forEach(key => {
//                         htmlContent += `<td>${student.marks?.[key] ?? "-"}</td>`;
//                     });
//                     htmlContent += `</tr>`;
//                 });
//             }

//             const generateFooterRow = (label, keyProp, isPercent = false, multiplier = 1) => {
//                 let rowHtml = `<tr><th style="background-color: #fff;">${label}</th>`;
//                 marksKeys.forEach(key => {
//                     const rd = calcData.reportData?.[key] || {};
//                     let val = rd[keyProp] ?? 0;
//                     if (multiplier !== 1) val = parseFloat((val * multiplier).toFixed(2));
//                     rowHtml += `<th>${val}</th>`;
//                 });
//                 return rowHtml + `</tr>`;
//             };

//             htmlContent += generateFooterRow("Max Marks", "maxMarks");
//             htmlContent += generateFooterRow("Target Marks", "maxMarks", false, 0.6);
//             htmlContent += generateFooterRow("Students Above Target", "studentsAboveTarget");
//             htmlContent += generateFooterRow("Attainment %", "attainmentPercent");
//             htmlContent += generateFooterRow("Attainment Level", "attainmentLevel");
//             htmlContent += `</tbody></table>`;
//         }

//         // ==========================================================
//         // TABLE 2: Final CO Attainment
//         // ==========================================================
//         if (finalData && finalData.attainmentTable) {
//             const pageBreakClass = hasTable1 ? 'class="page-break"' : '';
//             htmlContent += `<h3 ${pageBreakClass}>2. Final CO Attainment</h3>`;
            
//             const coKeys = Object.keys(finalData.attainmentTable).sort();
            
//             if (coKeys.length > 0) {
//                 const dynamicExams = new Set();
//                 coKeys.forEach(co => {
//                     Object.keys(finalData.attainmentTable[co]).forEach(k => {
//                         if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
//                     });
//                 });
//                 const examHeaders = Array.from(dynamicExams);

//                 htmlContent += `<table><thead><tr>`;
//                 htmlContent += `<th style="background-color: ${pinkColor};">CO's</th>`;
                
//                 examHeaders.forEach(exam => {
//                     const color = parentColorMap[exam] || grayColor;
//                     htmlContent += `<th style="background-color: ${color};">${exam}</th>`;
//                 });
                
//                 htmlContent += `<th style="background-color: ${grayColor};">Internal Average</th>`;
//                 htmlContent += `<th style="background-color: ${grayColor};">End Sem (External)</th>`;
//                 htmlContent += `<th style="background-color: ${grayColor};">Grand Total</th>`;
//                 htmlContent += `</tr></thead><tbody>`;

//                 coKeys.forEach(co => {
//                     htmlContent += `<tr><td>${co}</td>`;
//                     const coInfo = finalData.attainmentTable[co];
                    
//                     examHeaders.forEach(exam => htmlContent += `<td>${coInfo[exam] ?? "-"}</td>`);
                    
//                     htmlContent += `<td>${coInfo.internalAvg ?? 0}</td>`;
//                     htmlContent += `<td>${coInfo.externalLevel ?? 0}</td>`;
//                     htmlContent += `<td>${coInfo.grandTotal ?? 0}</td></tr>`;
//                 });

//                 const totalCols = examHeaders.length + 4;
//                 htmlContent += `<tr><th colspan="${totalCols - 1}" style="background-color: ${lightGrayColor}; text-align: right; padding-right: 15px;">Final CO Attainment</th>`;
//                 htmlContent += `<th style="background-color: ${lightGrayColor};">${finalData.finalSubjectAttainment ?? 0}</th></tr>`;
//                 htmlContent += `</tbody></table>`;
//             }
//         }

//         // ==========================================================
//         // TABLE 3: PO Attainment
//         // ==========================================================
//         if (poData && poData.mappingData) {
//             const needsPageBreak = hasTable1 && !(finalData && finalData.attainmentTable);
//             const pageBreakClass = needsPageBreak ? 'class="page-break"' : '';
//             htmlContent += `<h3 ${pageBreakClass}>3. PO Attainment</h3>`;
            
//             htmlContent += `<table><thead><tr>`;
//             htmlContent += `<th style="background-color: ${pinkColor};">CO's</th>`;
            
//             for (let i = 1; i <= 8; i++) {
//                 const poColor = alternatingColors[(i - 1) % 2];
//                 htmlContent += `<th style="background-color: ${poColor};">PO${i}</th>`;
//             }
//             htmlContent += `</tr></thead><tbody>`;

//             for (let i = 1; i <= 5; i++) {
//                 htmlContent += `<tr><td>CO${i}</td>`;
//                 for (let j = 1; j <= 8; j++) {
//                     htmlContent += `<td>${poData.mappingData[`CO${i}`]?.[`PO${j}`] || "-"}</td>`;
//                 }
//                 htmlContent += `</tr>`;
//             }

//             htmlContent += `<tr><th style="background-color: #fff;">Average</th>`;
//             for (let j = 1; j <= 8; j++) {
//                 htmlContent += `<th>${poData.averageCo?.[`PO${j}`] ?? "-"}</th>`;
//             }
//             htmlContent += `</tr>`;

//             const subjectAttainmentVal = poData.finalSubjectAttainment ?? finalData?.finalSubjectAttainment ?? 0;
//             htmlContent += `<tr><th style="background-color: #fff;">Final Subject Attainment</th>`;
//             htmlContent += `<th colspan="8" style="background-color: #fff;">${subjectAttainmentVal}</th></tr>`;

//             htmlContent += `<tr><th style="background-color: ${lightGrayColor};">Final PO Attainment</th>`;
//             for (let j = 1; j <= 8; j++) {
//                 htmlContent += `<th style="background-color: ${lightGrayColor};">${poData.poAttainment?.[`PO${j}`] ?? "-"}</th>`;
//             }
//             htmlContent += `</tr></tbody></table>`;
//         }

//         htmlContent += `</body></html>`;

//         // ==========================================================
//         // 4. GENERATE PDF USING PUPPETEER (🎯 PERFECT DYNAMIC SCALING)
//         // ==========================================================
//         browser = await puppeteer.launch({ 
//             headless: 'new',
//             args: ['--no-sandbox', '--disable-setuid-sandbox'] 
//         });
        
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//         // 🎯 Measure the EXACT pixel width of the absolute widest table on the page
//         const maxContentWidth = await page.evaluate(() => {
//             let maxWidth = 0;
//             const tables = document.querySelectorAll('table');
//             tables.forEach(table => {
//                 if (table.offsetWidth > maxWidth) {
//                     maxWidth = table.offsetWidth;
//                 }
//             });
//             return maxWidth;
//         });

//         // 🎯 A4 Landscape width is exactly 297mm. At standard 96 DPI, this is ~1122 pixels.
//         // We subtract the left/right margins (20px + 20px = 40px) to get the true Printable Area.
//         const printableA4Width = 1082; 
        
//         let scaleFactor = 1;
        
//         // 🎯 If the table is wider than the paper, mathematically calculate the perfect shrink ratio
//         if (maxContentWidth > printableA4Width) {
//             // Adding a 10px buffer so the table borders don't touch the very edge of the margin
//             scaleFactor = printableA4Width / (maxContentWidth + 10); 
//         }

//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             landscape: true,       
//             printBackground: true, 
//             scale: scaleFactor,    // 🎯 Dynamically applies the perfect shrink ratio here
//             margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
//         });

//         await browser.close();

//         // 5. STREAM PDF TO CLIENT
//         const fileName = `Lab_Attainment_${cleanSubjectId}_${cleanYear}.pdf`;
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

//         return res.status(200).send(pdfBuffer);

//     } catch (error) {
//         console.error("PDF Download Error:", error.message);
//         if (browser) await browser.close();
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: "Error generating PDF download.", error: error.message });
//         }
//     }
// }











// async function handleDownloadCOAttainmentPDF(req, res) {
//     let browser;
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

//         // 2. FETCH ONLY CO DATA (CalculatedLabMark)
//         const calcData = await CalculatedLabMark.findOne({ 
//             subjectId: cleanSubjectId, 
//             course: cleanCourse, 
//             academicYear: cleanYear 
//         }).lean();

//         if (!calcData) {
//             return res.status(404).json({ success: false, message: "No CO attainment data found to download for these parameters." });
//         }

//         // 3. CSS AND HTML SETUP
//         const alternatingColors = ['#CCC1DA', '#C5D9F1']; // Lavender, Light Blue
//         const pinkColor = '#D99694';

//         let htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
//                     h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
//                     table { width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: auto; }
//                     tr { page-break-inside: avoid; page-break-after: auto; }
//                     thead { display: table-header-group; }
//                     th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; }
//                     th { font-weight: bold; color: #000; }
                    
//                     /* Prevents columns from squishing text into unreadable stacks */
//                     th, td { white-space: nowrap; } 
//                 </style>
//             </head>
//             <body>
//                 <h2>CO Attainment Report - ${cleanSubjectId} (${cleanYear})</h2>
//         `;
        
//         // ==========================================================
//         // TABLE: CO Attainment (Internal Lab Marks)
//         // ==========================================================
//         if (calcData && calcData.maxMarks) {
//             const marksKeys = Object.keys(calcData.maxMarks);
            
//             // Group parent labs dynamically for colspans
//             const parentGroups = [];
//             let currentGroup = null;
            
//             marksKeys.forEach(key => {
//                 const lastUnderscore = key.lastIndexOf('_');
//                 const rawParent = lastUnderscore !== -1 ? key.substring(0, lastUnderscore) : key;
//                 const subName = lastUnderscore !== -1 ? key.substring(lastUnderscore + 1) : "";
//                 const parentDisplay = rawParent.replace(/_/g, ' ');

//                 if (!currentGroup || currentGroup.raw !== rawParent) {
//                     if (currentGroup) parentGroups.push(currentGroup);
//                     currentGroup = { name: parentDisplay, raw: rawParent, subNames: [subName] };
//                 } else {
//                     currentGroup.subNames.push(subName);
//                 }
//             });
//             if (currentGroup) parentGroups.push(currentGroup);

//             htmlContent += `<table><thead><tr><th rowspan="2" style="background-color: ${pinkColor};">Reg No</th>`;
//             let subRowHtml = `<tr>`;

//             parentGroups.forEach((group, index) => {
//                 const color = alternatingColors[index % 2];
                
//                 htmlContent += `<th colspan="${group.subNames.length}" style="background-color: ${color};">${group.name}</th>`;
//                 group.subNames.forEach(sub => {
//                     subRowHtml += `<th style="background-color: ${color};">${sub}</th>`;
//                 });
//             });

//             htmlContent += `</tr>${subRowHtml}</tr></thead><tbody>`;

//             // Student Rows
//             if (calcData.actualMarks && calcData.actualMarks.length > 0) {
//                 calcData.actualMarks.forEach(student => {
//                     htmlContent += `<tr><td>${student.regNo}</td>`;
//                     marksKeys.forEach(key => {
//                         htmlContent += `<td>${student.marks?.[key] ?? "-"}</td>`;
//                     });
//                     htmlContent += `</tr>`;
//                 });
//             }

//             // Bottom Calculation Rows
//             const generateFooterRow = (label, keyProp, isPercent = false, multiplier = 1) => {
//                 let rowHtml = `<tr><th style="background-color: #fff;">${label}</th>`;
//                 marksKeys.forEach(key => {
//                     const rd = calcData.reportData?.[key] || {};
//                     let val = rd[keyProp] ?? 0;
//                     if (multiplier !== 1) val = parseFloat((val * multiplier).toFixed(2));
//                     rowHtml += `<th>${val}</th>`;
//                 });
//                 return rowHtml + `</tr>`;
//             };

//             htmlContent += generateFooterRow("Max Marks", "maxMarks");
//             htmlContent += generateFooterRow("Target Marks", "maxMarks", false, 0.6);
//             htmlContent += generateFooterRow("Students Above Target", "studentsAboveTarget");
//             htmlContent += generateFooterRow("Attainment %", "attainmentPercent");
//             htmlContent += generateFooterRow("Attainment Level", "attainmentLevel");
//             htmlContent += `</tbody></table>`;
//         }

//         htmlContent += `</body></html>`;

//         // ==========================================================
//         // 4. GENERATE PDF USING PUPPETEER (With Shrink-to-Fit Logic)
//         // ==========================================================
//         browser = await puppeteer.launch({ 
//             headless: 'new',
//             args: ['--no-sandbox', '--disable-setuid-sandbox'] 
//         });
        
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//         // Calculate exact scale needed to fit horizontally
//         const contentWidth = await page.evaluate(() => {
//             return document.body.scrollWidth;
//         });

//         const a4LandscapeWidth = 1122; 
//         let scaleFactor = 1;
        
//         if (contentWidth > a4LandscapeWidth) {
//             scaleFactor = a4LandscapeWidth / (contentWidth + 50); 
//             if (scaleFactor < 0.3) scaleFactor = 0.3; 
//         }

//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             landscape: true,       
//             printBackground: true, 
//             scale: scaleFactor,    
//             margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
//         });

//         await browser.close();

//         // 5. STREAM PDF TO CLIENT
//         const fileName = `CO_Attainment_${cleanSubjectId}_${cleanYear}.pdf`;
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

//         return res.status(200).send(pdfBuffer);

//     } catch (error) {
//         console.error("CO Attainment PDF Download Error:", error.message);
//         if (browser) await browser.close();
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: "Error generating CO Attainment PDF.", error: error.message });
//         }
//     }
// }












// async function handleDownloadFinalCOAttainmentPDF(req, res) {
//     let browser;
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
//         // (We fetch CalculatedLabMark just to keep the alternating color logic perfectly synced)
//         const [calcData, finalData] = await Promise.all([
//             CalculatedLabMark.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
//             FinalLabAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
//         ]);

//         if (!finalData || !finalData.attainmentTable) {
//             return res.status(404).json({ success: false, message: "No Final CO attainment data found to download for these parameters." });
//         }

//         // 3. CSS AND HTML SETUP
//         const alternatingColors = ['#CCC1DA', '#C5D9F1']; // Lavender, Light Blue
//         const pinkColor = '#D99694';
//         const grayColor = '#D9D9D9';
//         const lightGrayColor = '#EBEBEB';

//         let htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
//                     h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
//                     table { width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: auto; }
//                     tr { page-break-inside: avoid; page-break-after: auto; }
//                     thead { display: table-header-group; }
//                     th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; }
//                     th { font-weight: bold; color: #000; }
                    
//                     /* Prevents columns from squishing text into unreadable stacks */
//                     th, td { white-space: nowrap; } 
//                 </style>
//             </head>
//             <body>
//                 <h2>Final CO Attainment Report - ${cleanSubjectId} (${cleanYear})</h2>
//         `;

//         // Generate Color Map to keep column colors consistent
//         const parentColorMap = {};
//         let colorToggle = 0;
//         const marksKeys = calcData?.maxMarks ? Object.keys(calcData.maxMarks) : [];

//         marksKeys.forEach(key => {
//             const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
//             if (!parentColorMap[rawParent]) {
//                 parentColorMap[rawParent] = alternatingColors[colorToggle % 2];
//                 colorToggle++;
//             }
//         });

//         // ==========================================================
//         // TABLE: Final CO Attainment
//         // ==========================================================
//         const coKeys = Object.keys(finalData.attainmentTable).sort();
        
//         if (coKeys.length > 0) {
//             const dynamicExams = new Set();
//             coKeys.forEach(co => {
//                 Object.keys(finalData.attainmentTable[co]).forEach(k => {
//                     if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
//                 });
//             });
//             const examHeaders = Array.from(dynamicExams);

//             htmlContent += `<table><thead><tr>`;
//             htmlContent += `<th style="background-color: ${pinkColor};">CO's</th>`;
            
//             examHeaders.forEach(exam => {
//                 const color = parentColorMap[exam] || grayColor;
//                 htmlContent += `<th style="background-color: ${color};">${exam}</th>`;
//             });
            
//             htmlContent += `<th style="background-color: ${grayColor};">Internal Average</th>`;
//             htmlContent += `<th style="background-color: ${grayColor};">End Sem (External)</th>`;
//             htmlContent += `<th style="background-color: ${grayColor};">Grand Total</th>`;
//             htmlContent += `</tr></thead><tbody>`;

//             coKeys.forEach(co => {
//                 htmlContent += `<tr><td>${co}</td>`;
//                 const coInfo = finalData.attainmentTable[co];
                
//                 examHeaders.forEach(exam => htmlContent += `<td>${coInfo[exam] ?? "-"}</td>`);
                
//                 htmlContent += `<td>${coInfo.internalAvg ?? 0}</td>`;
//                 htmlContent += `<td>${coInfo.externalLevel ?? 0}</td>`;
//                 htmlContent += `<td>${coInfo.grandTotal ?? 0}</td></tr>`;
//             });

//             // Final Row Merged
//             const totalCols = examHeaders.length + 4;
//             htmlContent += `<tr><th colspan="${totalCols - 1}" style="background-color: ${lightGrayColor}; text-align: right; padding-right: 15px;">Final CO Attainment</th>`;
//             htmlContent += `<th style="background-color: ${lightGrayColor};">${finalData.finalSubjectAttainment ?? 0}</th></tr>`;
//             htmlContent += `</tbody></table>`;
//         }

//         htmlContent += `</body></html>`;

//         // ==========================================================
//         // 4. GENERATE PDF USING PUPPETEER (With Shrink-to-Fit Logic)
//         // ==========================================================
//         browser = await puppeteer.launch({ 
//             headless: 'new',
//             args: ['--no-sandbox', '--disable-setuid-sandbox'] 
//         });
        
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//         // Calculate exact scale needed to fit horizontally
//         const contentWidth = await page.evaluate(() => {
//             return document.body.scrollWidth;
//         });

//         // Standard A4 Landscape printable width is roughly 1122 pixels
//         const a4LandscapeWidth = 1122; 
        
//         let scaleFactor = 1;
//         if (contentWidth > a4LandscapeWidth) {
//             // Shrink the scale exactly enough to fit the A4 width (with 50px buffer)
//             scaleFactor = a4LandscapeWidth / (contentWidth + 50); 
//             // Prevent it from becoming microscopic
//             if (scaleFactor < 0.3) scaleFactor = 0.3; 
//         }

//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             landscape: true,       
//             printBackground: true, // Forces background colors to render
//             scale: scaleFactor,    // Applies the dynamic shrink-to-fit calculation
//             margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
//         });

//         await browser.close();

//         // 5. STREAM PDF TO CLIENT (Updated filename)
//         const fileName = `Final_CO_Attainment_${cleanSubjectId}_${cleanYear}.pdf`;
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

//         return res.status(200).send(pdfBuffer);

//     } catch (error) {
//         console.error("Final CO Attainment PDF Download Error:", error.message);
//         if (browser) await browser.close();
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: "Error generating Final CO Attainment PDF download.", error: error.message });
//         }
//     }
// }










// async function handleDownloadPOAttainmentPDF(req, res) {
//     let browser;
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
//         const [finalData, poData] = await Promise.all([
//             FinalLabAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
//             LabPoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
//         ]);

//         if (!poData || !poData.mappingData) {
//             return res.status(404).json({ success: false, message: "No PO attainment data found to download for these parameters." });
//         }

//         // 3. CSS AND HTML SETUP
//         const alternatingColors = ['#CCC1DA', '#C5D9F1']; // Lavender, Light Blue
//         const pinkColor = '#D99694';
//         const lightGrayColor = '#EBEBEB';

//         let htmlContent = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
//                     h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
//                     table { width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: auto; }
//                     tr { page-break-inside: avoid; page-break-after: auto; }
//                     thead { display: table-header-group; }
//                     th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; }
//                     th { font-weight: bold; color: #000; }
                    
//                     /* Prevents columns from squishing text into unreadable stacks */
//                     th, td { white-space: nowrap; } 
//                 </style>
//             </head>
//             <body>
//                 <h2>PO Attainment Report - ${cleanSubjectId} (${cleanYear})</h2>
//         `;

//         // ==========================================================
//         // TABLE: PO Attainment
//         // ==========================================================
//         htmlContent += `<table><thead><tr>`;
//         htmlContent += `<th style="background-color: ${pinkColor};">CO's</th>`;
        
//         for (let i = 1; i <= 8; i++) {
//             const poColor = alternatingColors[(i - 1) % 2];
//             htmlContent += `<th style="background-color: ${poColor};">PO${i}</th>`;
//         }
//         htmlContent += `</tr></thead><tbody>`;

//         // CO Rows (CO1 to CO5)
//         for (let i = 1; i <= 5; i++) {
//             htmlContent += `<tr><td>CO${i}</td>`;
//             for (let j = 1; j <= 8; j++) {
//                 htmlContent += `<td>${poData.mappingData[`CO${i}`]?.[`PO${j}`] || "-"}</td>`;
//             }
//             htmlContent += `</tr>`;
//         }

//         // Average Row
//         htmlContent += `<tr><th style="background-color: #fff;">Average</th>`;
//         for (let j = 1; j <= 8; j++) {
//             htmlContent += `<th>${poData.averageCo?.[`PO${j}`] ?? "-"}</th>`;
//         }
//         htmlContent += `</tr>`;

//         // Final Subject Row (Merged)
//         const subjectAttainmentVal = poData.finalSubjectAttainment ?? finalData?.finalSubjectAttainment ?? 0;
//         htmlContent += `<tr><th style="background-color: #fff;">Final Subject Attainment</th>`;
//         htmlContent += `<th colspan="8" style="background-color: #fff;">${subjectAttainmentVal}</th></tr>`;

//         // Final PO Row
//         htmlContent += `<tr><th style="background-color: ${lightGrayColor};">Final PO Attainment</th>`;
//         for (let j = 1; j <= 8; j++) {
//             htmlContent += `<th style="background-color: ${lightGrayColor};">${poData.poAttainment?.[`PO${j}`] ?? "-"}</th>`;
//         }
//         htmlContent += `</tr></tbody></table>`;
//         htmlContent += `</body></html>`;

//         // ==========================================================
//         // 4. GENERATE PDF USING PUPPETEER (With Shrink-to-Fit Logic)
//         // ==========================================================
//         browser = await puppeteer.launch({ 
//             headless: 'new',
//             args: ['--no-sandbox', '--disable-setuid-sandbox'] 
//         });
        
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//         // Calculate exact scale needed to fit horizontally
//         const contentWidth = await page.evaluate(() => {
//             return document.body.scrollWidth;
//         });

//         // Standard A4 Landscape printable width is roughly 1122 pixels
//         const a4LandscapeWidth = 1122; 
        
//         let scaleFactor = 1;
//         if (contentWidth > a4LandscapeWidth) {
//             // Shrink the scale exactly enough to fit the A4 width (with 50px buffer)
//             scaleFactor = a4LandscapeWidth / (contentWidth + 50); 
//             // Prevent it from becoming microscopic
//             if (scaleFactor < 0.3) scaleFactor = 0.3; 
//         }

//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             landscape: true,       
//             printBackground: true, // Forces background colors to render
//             scale: scaleFactor,    // Applies the dynamic shrink-to-fit calculation
//             margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
//         });

//         await browser.close();

//         // 5. STREAM PDF TO CLIENT
//         const fileName = `PO_Attainment_${cleanSubjectId}_${cleanYear}.pdf`;
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

//         return res.status(200).send(pdfBuffer);

//     } catch (error) {
//         console.error("PO Attainment PDF Download Error:", error.message);
//         if (browser) await browser.close();
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: "Error generating PO Attainment PDF download.", error: error.message });
//         }
//     }
// }


// module.exports = {
//     handleDownloadPrintReadyReportForLab,
//     handleDownloadCOAttainmentPDF,
//     handleDownloadFinalCOAttainmentPDF,
//     handleDownloadPOAttainmentPDF
// };











































// const puppeteer = require('puppeteer');
// const CalculatedLabMark = require('../models/calculatedLabMarks'); 
// const FinalLabAttainment = require('../models/finalLabAttainment');
// const LabPoAttainment = require('../models/calculatedLabPo'); 

// // ============================================================================
// // CONSTANTS (Colors & Styling)
// // ============================================================================
// const COLORS = {
//     alternating: ['#CCC1DA', '#C5D9F1'], // Lavender, Light Blue
//     pink: '#D99694',
//     gray: '#D9D9D9',
//     lightGray: '#EBEBEB'
// };

// // ============================================================================
// // HELPER FUNCTIONS
// // ============================================================================

// // 1. Sanitize Inputs
// function getSanitizedInputs(req) {
//     const { subjectId, academicYear, course } = req.query;
//     if (!subjectId || !academicYear || !course) return null;

//     let cleanYear = academicYear.trim();
//     if (cleanYear.includes('-')) cleanYear = cleanYear.split('-')[1].trim();

//     return {
//         cleanSubjectId: subjectId.trim().toUpperCase(),
//         cleanCourse: course.trim().toUpperCase(),
//         cleanYear
//     };
// }

// // 2. Generate Color Map (Ensures dynamic labs get the right alternating color)
// function buildColorMap(calcData) {
//     const map = {};
//     let toggle = 0;
//     const keys = calcData?.maxMarks ? Object.keys(calcData.maxMarks) : [];
//     keys.forEach(key => {
//         const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
//         if (!map[rawParent]) {
//             map[rawParent] = COLORS.alternating[toggle % 2];
//             toggle++;
//         }
//     });
//     return map;
// }

// // 3. HTML Base Template
// function getBaseHtml(title) {
//     return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <style>
//                 body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
//                 h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
//                 h3 { color: #555; font-size: 14px; margin-bottom: 10px; margin-top: 20px; }
//                 table { width: max-content; min-width: 100%; border-collapse: collapse; margin-bottom: 30px; margin-left: auto; margin-right: auto; }
//                 tr { page-break-inside: avoid; page-break-after: auto; }
//                 thead { display: table-header-group; }
//                 th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; white-space: nowrap; }
//                 th { font-weight: bold; color: #000; }
//                 .page-break { page-break-before: always; }
//             </style>
//         </head>
//         <body>
//             <h2>${title}</h2>
//     `;
// }

// // 4. Generate Table 1: CO Attainment
// function getTable1Html(calcData, colorMap, heading = '') {
//     if (!calcData || !calcData.maxMarks) return '';
//     let html = heading ? `<h3>${heading}</h3>` : '';
//     const marksKeys = Object.keys(calcData.maxMarks);
//     const parentGroups = [];
//     let currentGroup = null;

//     marksKeys.forEach(key => {
//         const lastUnderscore = key.lastIndexOf('_');
//         const rawParent = lastUnderscore !== -1 ? key.substring(0, lastUnderscore) : key;
//         const subName = lastUnderscore !== -1 ? key.substring(lastUnderscore + 1) : "";
//         if (!currentGroup || currentGroup.raw !== rawParent) {
//             if (currentGroup) parentGroups.push(currentGroup);
//             currentGroup = { name: rawParent.replace(/_/g, ' '), raw: rawParent, subNames: [subName] };
//         } else {
//             currentGroup.subNames.push(subName);
//         }
//     });
//     if (currentGroup) parentGroups.push(currentGroup);

//     html += `<table><thead><tr><th rowspan="2" style="background-color: ${COLORS.pink};">Reg No</th>`;
//     let subRow = `<tr>`;

//     parentGroups.forEach(group => {
//         const color = colorMap[group.raw] || COLORS.alternating[0];
//         html += `<th colspan="${group.subNames.length}" style="background-color: ${color};">${group.name}</th>`;
//         group.subNames.forEach(sub => subRow += `<th style="background-color: ${color};">${sub}</th>`);
//     });

//     html += `</tr>${subRow}</tr></thead><tbody>`;

//     if (calcData.actualMarks) {
//         calcData.actualMarks.forEach(student => {
//             html += `<tr><td>${student.regNo}</td>`;
//             marksKeys.forEach(key => html += `<td>${student.marks?.[key] ?? "-"}</td>`);
//             html += `</tr>`;
//         });
//     }

//     const footer = (label, prop, mult = 1) => {
//         let r = `<tr><th style="background-color: #fff;">${label}</th>`;
//         marksKeys.forEach(key => {
//             let val = calcData.reportData?.[key]?.[prop] ?? 0;
//             if (mult !== 1) val = parseFloat((val * mult).toFixed(2));
//             r += `<th>${val}</th>`;
//         });
//         return r + `</tr>`;
//     };

//     html += footer("Max Marks", "maxMarks");
//     html += footer("Target Marks", "maxMarks", 0.6);
//     html += footer("Students Above Target", "studentsAboveTarget");
//     html += footer("Attainment %", "attainmentPercent");
//     html += footer("Attainment Level", "attainmentLevel");
    
//     return html + `</tbody></table>`;
// }

// // 5. Generate Table 2: Final CO Attainment
// function getTable2Html(finalData, colorMap, heading = '') {
//     if (!finalData || !finalData.attainmentTable) return '';
//     let html = heading;
//     const coKeys = Object.keys(finalData.attainmentTable).sort();
//     if (coKeys.length === 0) return '';

//     const dynamicExams = new Set();
//     coKeys.forEach(co => Object.keys(finalData.attainmentTable[co]).forEach(k => {
//         if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
//     }));
//     const examHeaders = Array.from(dynamicExams);

//     html += `<table><thead><tr><th style="background-color: ${COLORS.pink};">CO's</th>`;
//     examHeaders.forEach(exam => html += `<th style="background-color: ${colorMap[exam] || COLORS.gray};">${exam}</th>`);
//     html += `<th style="background-color: ${COLORS.gray};">Internal Average</th><th style="background-color: ${COLORS.gray};">End Sem (External)</th><th style="background-color: ${COLORS.gray};">Grand Total</th></tr></thead><tbody>`;

//     coKeys.forEach(co => {
//         html += `<tr><td>${co}</td>`;
//         const info = finalData.attainmentTable[co];
//         examHeaders.forEach(exam => html += `<td>${info[exam] ?? "-"}</td>`);
//         html += `<td>${info.internalAvg ?? 0}</td><td>${info.externalLevel ?? 0}</td><td>${info.grandTotal ?? 0}</td></tr>`;
//     });

//     const totalCols = examHeaders.length + 4;
//     html += `<tr><th colspan="${totalCols - 1}" style="background-color: ${COLORS.lightGray}; text-align: right; padding-right: 15px;">Final CO Attainment</th>`;
//     html += `<th style="background-color: ${COLORS.lightGray};">${finalData.finalSubjectAttainment ?? 0}</th></tr></tbody></table>`;

//     return html;
// }

// // 6. Generate Table 3: PO Attainment
// function getTable3Html(poData, finalData, heading = '') {
//     if (!poData || !poData.mappingData) return '';
//     let html = heading;
//     html += `<table><thead><tr><th style="background-color: ${COLORS.pink};">CO's</th>`;
    
//     for (let i = 1; i <= 8; i++) {
//         html += `<th style="background-color: ${COLORS.alternating[(i - 1) % 2]};">PO${i}</th>`;
//     }
//     html += `</tr></thead><tbody>`;

//     for (let i = 1; i <= 5; i++) {
//         html += `<tr><td>CO${i}</td>`;
//         for (let j = 1; j <= 8; j++) html += `<td>${poData.mappingData[`CO${i}`]?.[`PO${j}`] || "-"}</td>`;
//         html += `</tr>`;
//     }

//     html += `<tr><th style="background-color: #fff;">Average</th>`;
//     for (let j = 1; j <= 8; j++) html += `<th>${poData.averageCo?.[`PO${j}`] ?? "-"}</th>`;
    
//     const subjAttain = poData.finalSubjectAttainment ?? finalData?.finalSubjectAttainment ?? 0;
//     html += `</tr><tr><th style="background-color: #fff;">Final Subject Attainment</th><th colspan="8" style="background-color: #fff;">${subjAttain}</th></tr>`;

//     html += `<tr><th style="background-color: ${COLORS.lightGray};">Final PO Attainment</th>`;
//     for (let j = 1; j <= 8; j++) html += `<th style="background-color: ${COLORS.lightGray};">${poData.poAttainment?.[`PO${j}`] ?? "-"}</th>`;
    
//     return html + `</tr></tbody></table>`;
// }

// // 7. Puppeteer PDF Generator (with safety finally block)
// async function generatePdfBuffer(htmlContent) {
//     let browser;
//     try {
//         browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//         const contentWidth = await page.evaluate(() => document.body.scrollWidth);
//         let scaleFactor = 1;
//         if (contentWidth > 1122) {
//             scaleFactor = Math.max(1122 / (contentWidth + 50), 0.3); // Scale down, min 0.3
//         }

//         return await page.pdf({
//             format: 'A4', landscape: true, printBackground: true, scale: scaleFactor,
//             margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
//         });
//     } finally {
//         if (browser) await browser.close(); // Ensures no memory leaks
//     }
// }


// // ============================================================================
// // CONTROLLERS
// // ============================================================================

// async function handleDownloadPrintReadyReportForLab(req, res) {
//     try {
//         const inputs = getSanitizedInputs(req);
//         if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });
//         const { cleanSubjectId, cleanCourse, cleanYear } = inputs;

//         const [calcData, finalData, poData] = await Promise.all([
//             CalculatedLabMark.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
//             FinalLabAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
//             LabPoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
//         ]);

//         if (!calcData && !finalData && !poData) return res.status(404).json({ success: false, message: "No data found." });

//         const colorMap = buildColorMap(calcData);
//         let html = getBaseHtml(`Lab Attainment Report - ${cleanSubjectId} (${cleanYear})`);

//         html += getTable1Html(calcData, colorMap, '1. CO Attainment (Internal Marks)');
        
//         const hasT1 = !!calcData;
//         const pageBreakT2 = hasT1 ? '<h3 class="page-break">2. Final CO Attainment</h3>' : '<h3>2. Final CO Attainment</h3>';
//         html += getTable2Html(finalData, colorMap, pageBreakT2);

//         const pageBreakT3 = (hasT1 && !finalData) ? '<h3 class="page-break">3. PO Attainment</h3>' : '<h3>3. PO Attainment</h3>';
//         html += getTable3Html(poData, finalData, pageBreakT3);
        
//         html += `</body></html>`;

//         const pdfBuffer = await generatePdfBuffer(html);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="Lab_Attainment_${cleanSubjectId}_${cleanYear}.pdf"`);
//         return res.status(200).send(pdfBuffer);

//     } catch (error) {
//         console.error("Print Ready PDF Error:", error.message);
//         if (!res.headersSent) return res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function handleDownloadCOAttainmentPDF(req, res) {
//     try {
//         const inputs = getSanitizedInputs(req);
//         if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });
        
//         const calcData = await CalculatedLabMark.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean();
//         if (!calcData) return res.status(404).json({ success: false, message: "No data found." });

//         let html = getBaseHtml(`CO Attainment Report - ${inputs.cleanSubjectId} (${inputs.cleanYear})`);
//         html += getTable1Html(calcData, buildColorMap(calcData));
//         html += `</body></html>`;

//         const pdfBuffer = await generatePdfBuffer(html);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="CO_Attainment_${inputs.cleanSubjectId}_${inputs.cleanYear}.pdf"`);
//         return res.status(200).send(pdfBuffer);

//     } catch (error) {
//         console.error("CO Attainment PDF Error:", error.message);
//         if (!res.headersSent) return res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function handleDownloadFinalCOAttainmentPDF(req, res) {
//     try {
//         const inputs = getSanitizedInputs(req);
//         if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });

//         const [calcData, finalData] = await Promise.all([
//             CalculatedLabMark.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean(),
//             FinalLabAttainment.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean()
//         ]);

//         if (!finalData) return res.status(404).json({ success: false, message: "No data found." });

//         let html = getBaseHtml(`Final CO Attainment Report - ${inputs.cleanSubjectId} (${inputs.cleanYear})`);
//         html += getTable2Html(finalData, buildColorMap(calcData));
//         html += `</body></html>`;

//         const pdfBuffer = await generatePdfBuffer(html);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="Final_CO_Attainment_${inputs.cleanSubjectId}_${inputs.cleanYear}.pdf"`);
//         return res.status(200).send(pdfBuffer);

//     } catch (error) {
//         console.error("Final CO Attainment PDF Error:", error.message);
//         if (!res.headersSent) return res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function handleDownloadPOAttainmentPDF(req, res) {
//     try {
//         const inputs = getSanitizedInputs(req);
//         if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });

//         const [finalData, poData] = await Promise.all([
//             FinalLabAttainment.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean(),
//             LabPoAttainment.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean()
//         ]);

//         if (!poData) return res.status(404).json({ success: false, message: "No data found." });

//         let html = getBaseHtml(`PO Attainment Report - ${inputs.cleanSubjectId} (${inputs.cleanYear})`);
//         html += getTable3Html(poData, finalData);
//         html += `</body></html>`;

//         const pdfBuffer = await generatePdfBuffer(html);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="PO_Attainment_${inputs.cleanSubjectId}_${inputs.cleanYear}.pdf"`);
//         return res.status(200).send(pdfBuffer);

//     } catch (error) {
//         console.error("PO Attainment PDF Error:", error.message);
//         if (!res.headersSent) return res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     handleDownloadPrintReadyReportForLab,
//     handleDownloadCOAttainmentPDF,
//     handleDownloadFinalCOAttainmentPDF,
//     handleDownloadPOAttainmentPDF
// };








































const puppeteer = require('puppeteer');

// Models
const calculatedMarks = require("../models/calculatedLabMarks");
const FinalCoAttainment = require("../models/finalLabAttainment");
const PoAttainment = require("../models/calculatedLabPo");

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================
const COLORS = {
    alternating: ['#CCC1DA', '#C5D9F1'], // Lavender, Light Blue
    pink: '#D99694',
    gray: '#D9D9D9',
    lightGray: '#EBEBEB'
};

const formatVal = (val) => (val !== undefined && val !== null && val !== '') ? val : '-';

function getSanitizedInputs(req) {
    const { subjectId, academicYear, course } = req.query;
    if (!subjectId || !academicYear || !course) return null;
    
    let cleanYear = academicYear.trim();
    if (cleanYear.includes('/')) cleanYear = cleanYear.replace(/\//g, '-');
    else if (cleanYear.includes('-')) cleanYear = cleanYear.split('-')[1].trim(); 

    return {
        cleanSubjectId: subjectId.trim().toUpperCase(),
        cleanCourse: course.trim().toUpperCase(),
        cleanYear
    };
}

// Builds dynamic color map based on parsed component headers (Quiz_1, Sessional_1, etc.)
function buildColorMap(orderedComponents) {
    const map = {};
    orderedComponents.forEach((comp, index) => {
        map[comp] = COLORS.alternating[index % 2];
    });
    return map;
}

function getBaseHtml(title) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
                h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
                h3 { color: #555; font-size: 14px; margin-bottom: 10px; margin-top: 20px; }
                table { width: max-content; min-width: 100%; border-collapse: collapse; margin-bottom: 30px; margin-left: auto; margin-right: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; white-space: nowrap; }
                th { font-weight: bold; color: #000; }
                .page-break { page-break-before: always; }
            </style>
        </head>
        <body>
            <h2>${title}</h2>
    `;
}

// ============================================================================
// HTML GENERATORS FOR EACH TABLE
// ============================================================================

// 1. Generate Table 1: Calculated Marks & Attainment
// function getTable1Html(calcData, colorMap, orderedComponents, componentMap, heading = '') {
//     if (!calcData || !calcData.actualMarks || calcData.actualMarks.length === 0) return '';
//     let html = heading ? `<h3>${heading}</h3>` : '';

//     html += `<table><thead><tr><th rowspan="2" style="background-color: ${COLORS.pink};">Reg No</th>`;
    
//     // Top Header Row (Component Names)
//     orderedComponents.forEach(comp => {
//         const colspan = componentMap[comp].length + 1;
//         html += `<th colspan="${colspan}" style="background-color: ${colorMap[comp]};">${comp.replace(/_/g, ' ')}</th>`;
//     });
//     html += `</tr><tr>`;
    
//     // Sub Header Row (CO1, CO2, Total)
//     orderedComponents.forEach(comp => {
//         componentMap[comp].forEach(co => {
//             html += `<th style="background-color: ${colorMap[comp]};">${co}</th>`;
//         });
//         html += `<th style="background-color: ${colorMap[comp]};">Total</th>`;
//     });
//     html += `</tr></thead><tbody>`;

    // Student Rows
    // calcData.actualMarks.forEach(({ regNo, marks: m }) => {
    //     html += `<tr><td><b>${regNo}</b></td>`;
    //     orderedComponents.forEach(comp => {
    //         componentMap[comp].forEach(co => {
    //             html += `<td>${formatVal(m[`${comp}_${co}`])}</td>`;
    //         });
    //         html += `<td>${formatVal(m[`${comp}_TOTAL`])}</td>`;
    //     });
    //     html += `</tr>`;
    // });


// Footer Rows (Max Marks, Target, etc.)
    // const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
    // const keys = ['maxMarks', 'targetMarks', 'studentsAboveTarget', 'attainmentPercent', 'attainmentLevel'];
    
//     calcLabels.forEach((label, i) => {
//         html += `<tr><th style="background-color: #fff;">${label}</th>`;
//         orderedComponents.forEach(comp => {
//             // FIX: Changed 'TOTAL' to 'Total'
//             [...componentMap[comp], 'Total'].forEach(coSuffix => { 
//                 // FIX: Changed 'TOTAL' to 'Total' and _TOTAL to _Total
//                 const key = coSuffix === 'Total' ? `${comp}_Total` : `${comp}_${coSuffix}`;
//                 const calc = calcData.reportData?.[key] || {};
//                 html += `<th>${formatVal(calc[keys[i]])}</th>`;
//             });
//         });
//         html += `</tr>`;
//     });


//     // Footer Rows (Max Marks, Target, etc.)
//     const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
//     const keys = ['maxMarks', 'targetMarks', 'studentsAboveTarget', 'attainmentPercent', 'attainmentLevel'];
    
//     calcLabels.forEach((label, i) => {
//         html += `<tr><th style="background-color: #fff;">${label}</th>`;
//         orderedComponents.forEach(comp => {
//             [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
//                 const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
//                 const calc = calcData.reportData?.[key] || {};
//                 html += `<th>${formatVal(calc[keys[i]])}</th>`;
//             });
//         });
//         html += `</tr>`;
//     });

//     return html + `</tbody></table>`;
// }



// 1. Generate Table 1: Calculated Marks & Attainment
function getTable1Html(calcData, colorMap, orderedComponents, componentMap, heading = '') {
    if (!calcData || !calcData.actualMarks || calcData.actualMarks.length === 0) return '';
    let html = heading ? `<h3>${heading}</h3>` : '';

    html += `<table><thead><tr><th rowspan="2" style="background-color: ${COLORS.pink};">Reg No</th>`;
    
    // Top Header Row (Component Names)
    orderedComponents.forEach(comp => {
        const colspan = componentMap[comp].length + 1;
        html += `<th colspan="${colspan}" style="background-color: ${colorMap[comp]};">${comp.replace(/_/g, ' ')}</th>`;
    });
    html += `</tr><tr>`;
    
    // Sub Header Row (CO1, CO2, Total)
    orderedComponents.forEach(comp => {
        componentMap[comp].forEach(co => {
            html += `<th style="background-color: ${colorMap[comp]};">${co}</th>`;
        });
        html += `<th style="background-color: ${colorMap[comp]};">Total</th>`;
    });
    html += `</tr></thead><tbody>`;

    // Student Rows
    calcData.actualMarks.forEach(({ regNo, marks: m }) => {
        html += `<tr><td><b>${regNo}</b></td>`;
        orderedComponents.forEach(comp => {
            componentMap[comp].forEach(co => {
                html += `<td>${formatVal(m[`${comp}_${co}`])}</td>`;
            });
            // FIX: Using _Total to match the DB
            html += `<td>${formatVal(m[`${comp}_Total`])}</td>`; 
        });
        html += `</tr>`;
    });

    // Footer Rows (Max Marks, Target, etc.)
    // MUST BE DECLARED BEFORE THE LOOP
    const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
    const keys = ['maxMarks', 'targetMarks', 'studentsAboveTarget', 'attainmentPercent', 'attainmentLevel'];
    
    calcLabels.forEach((label, i) => {
        html += `<tr><th style="background-color: #fff;">${label}</th>`;
        orderedComponents.forEach(comp => {
            // FIX: Checking for 'Total' instead of 'TOTAL'
            [...componentMap[comp], 'Total'].forEach(coSuffix => {
                const key = coSuffix === 'Total' ? `${comp}_Total` : `${comp}_${coSuffix}`;
                const calc = calcData.reportData?.[key] || {};
                html += `<th>${formatVal(calc[keys[i]])}</th>`;
            });
        });
        html += `</tr>`;
    });

    return html + `</tbody></table>`;
}


// 2. Generate Table 2: Final CO Attainment
// function getTable2Html(finalData, colorMap, heading = '') {
//     if (!finalData || !finalData.attainmentTable) return '';
//     let html = heading;
//     const coKeys = Object.keys(finalData.attainmentTable).sort();
//     if (coKeys.length === 0) return '';

//     const dynamicExams = new Set();
//     coKeys.forEach(co => Object.keys(finalData.attainmentTable[co]).forEach(k => {
//         if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
//     }));
//     const examHeaders = Array.from(dynamicExams);

//     html += `<table><thead><tr><th style="background-color: ${COLORS.pink};">CO's</th>`;
//     examHeaders.forEach(exam => html += `<th style="background-color: ${colorMap[exam] || COLORS.gray};">${exam.replace(/_/g, ' ')}</th>`);
    
//     html += `<th style="background-color: ${COLORS.gray};">Total Avg Int</th>`;
//     html += `<th style="background-color: ${COLORS.gray};">End Sem</th>`;
//     html += `<th style="background-color: ${COLORS.gray};">Grand Total (50% int + 50% End term)</th></tr></thead><tbody>`;

//     coKeys.forEach(co => {
//         html += `<tr><td><b>${co}</b></td>`;
//         const info = finalData.attainmentTable[co];
//         examHeaders.forEach(exam => html += `<td>${formatVal(info[exam])}</td>`);
//         html += `<td>${formatVal(info.internalAvg)}</td><td>${formatVal(info.externalLevel)}</td><td>${formatVal(info.grandTotal)}</td></tr>`;
//     });

//     // Fallback calculation if finalSubjectAttainment is missing
//     let finalAttainmentValue = finalData.finalSubjectAttainment;
//     if (finalAttainmentValue === undefined) {
//         let sum = 0, count = 0;
//         Object.values(finalData.attainmentTable).forEach(co => {
//             if (typeof co.grandTotal === 'number') { sum += co.grandTotal; count++; }
//         });
//         finalAttainmentValue = count > 0 ? parseFloat((sum / count).toFixed(2)) : undefined;
//     }

//     const totalCols = examHeaders.length + 4;
//     html += `<tr><th colspan="${totalCols - 1}" style="background-color: ${COLORS.lightGray}; text-align: right; padding-right: 15px;">Final CO Attainment</th>`;
//     html += `<th style="background-color: ${COLORS.lightGray};">${formatVal(finalAttainmentValue)}</th></tr></tbody></table>`;

//     return html;
// }




// 2. Generate Table 2: Final CO Attainment
function getTable2Html(finalData, colorMap, heading = '') {
    if (!finalData || !finalData.attainmentTable) return '';
    let html = heading;
    const coKeys = Object.keys(finalData.attainmentTable).sort();
    if (coKeys.length === 0) return '';

    const dynamicExams = new Set();
    coKeys.forEach(co => Object.keys(finalData.attainmentTable[co]).forEach(k => {
        if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
    }));
    
    // FIX: Apply natural alphanumeric sorting to accurately order Lab_1, Lab_2, ..., Lab_10
    const examHeaders = Array.from(dynamicExams).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        const textA = a.replace(/\d/g, '');
        const textB = b.replace(/\d/g, '');
        return textA === textB ? numA - numB : textA.localeCompare(textB);
    });

    html += `<table><thead><tr><th style="background-color: ${COLORS.pink};">CO's</th>`;
    examHeaders.forEach(exam => html += `<th style="background-color: ${colorMap[exam] || COLORS.gray};">${exam.replace(/_/g, ' ')}</th>`);
    
    html += `<th style="background-color: ${COLORS.gray};">Total Avg Int</th>`;
    html += `<th style="background-color: ${COLORS.gray};">End Sem</th>`;
    html += `<th style="background-color: ${COLORS.gray};">Grand Total (50% int + 50% End term)</th></tr></thead><tbody>`;

    coKeys.forEach(co => {
        html += `<tr><td><b>${co}</b></td>`;
        const info = finalData.attainmentTable[co];
        examHeaders.forEach(exam => html += `<td>${formatVal(info[exam])}</td>`);
        html += `<td>${formatVal(info.internalAvg)}</td><td>${formatVal(info.externalLevel)}</td><td>${formatVal(info.grandTotal)}</td></tr>`;
    });

    // Fallback calculation if finalSubjectAttainment is missing
    let finalAttainmentValue = finalData.finalSubjectAttainment;
    if (finalAttainmentValue === undefined) {
        let sum = 0, count = 0;
        Object.values(finalData.attainmentTable).forEach(co => {
            if (typeof co.grandTotal === 'number') { sum += co.grandTotal; count++; }
        });
        finalAttainmentValue = count > 0 ? parseFloat((sum / count).toFixed(2)) : undefined;
    }

    const totalCols = examHeaders.length + 4;
    html += `<tr><th colspan="${totalCols - 1}" style="background-color: ${COLORS.lightGray}; text-align: right; padding-right: 15px;">Final CO Attainment</th>`;
    html += `<th style="background-color: ${COLORS.lightGray};">${formatVal(finalAttainmentValue)}</th></tr></tbody></table>`;

    return html;
}

// 3. Generate Table 3: PO Attainment
function getTable3Html(poData, finalData = null, heading = '') {
    if (!poData || !poData.mappingData || !poData.averageCo) return '';
    let html = heading;

    const poKeys = Object.keys(poData.averageCo).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0, numB = parseInt(b.replace(/\D/g, '')) || 0;
        const textA = a.replace(/\d/g, ''), textB = b.replace(/\d/g, '');
        return textA === textB ? numA - numB : textA.localeCompare(textB);
    });

    html += `<table><thead><tr><th style="background-color: ${COLORS.pink};">CO's</th>`;
    poKeys.forEach((po, i) => html += `<th style="background-color: ${COLORS.alternating[i % 2]};">${po.toUpperCase()}</th>`);
    html += `</tr></thead><tbody>`;

    Object.keys(poData.mappingData).sort().forEach(co => {
        html += `<tr><td><b>${co}</b></td>`;
        poKeys.forEach(po => html += `<td>${formatVal(poData.mappingData[co][po])}</td>`);
        html += `</tr>`;
    });

    html += `<tr><th style="background-color: #fff;">Average</th>`;
    poKeys.forEach(po => html += `<th>${formatVal(poData.averageCo[po])}</th>`);
    
    const subjAttain = poData.finalSubjectAttainment ?? finalData?.finalSubjectAttainment ?? 0;
    html += `</tr><tr><th style="background-color: #fff;">Final Subject Attainment</th>`;
    html += `<th colspan="${poKeys.length}" style="background-color: #fff;">${formatVal(subjAttain)}</th></tr>`;

    const poAttnData = poData.poAttainment || poData.poAttainments || {};
    html += `<tr><th style="background-color: ${COLORS.lightGray};">Final PO Attainment</th>`;
    
    poKeys.forEach(po => {
        let val = poAttnData[po] ?? poAttnData[Object.keys(poAttnData).find(k => k.toLowerCase() === po.toLowerCase())];
        html += `<th style="background-color: ${COLORS.lightGray};">${formatVal(val)}</th>`;
    });
    
    return html + `</tr></tbody></table>`;
}

// ============================================================================
// PUPPETEER PDF GENERATOR (With Vertical / Portrait Shrink-to-Fit)
// ============================================================================
async function generatePdfBuffer(htmlContent) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // 🎯 Dynamically calculate perfect scale for PORTRAIT mode
        const contentWidth = await page.evaluate(() => {
            let maxWidth = 0;
            document.querySelectorAll('table').forEach(table => {
                if (table.offsetWidth > maxWidth) maxWidth = table.offsetWidth;
            });
            return maxWidth;
        });

        // A4 Portrait width is approx 794px at 96 DPI. 
        // We subtract the 40px margins (20px left + 20px right) = ~754px Printable Width
        const printableA4PortraitWidth = 754; 
        let scaleFactor = 1;
        
        if (contentWidth > printableA4PortraitWidth) {
            scaleFactor = printableA4PortraitWidth / (contentWidth + 10); 
        }

        return await page.pdf({
            format: 'A4', 
            landscape: false, // 🌟 SET TO PORTRAIT / VERTICAL
            printBackground: true, 
            scale: scaleFactor,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });
    } finally {
        if (browser) await browser.close(); // Ensures no memory leaks
    }
}


// ============================================================================
// CONTROLLERS
// ============================================================================

// Extract ordered components helper for parsing DB data
// function extractComponents(marksDoc) {
//     if (!marksDoc || !marksDoc.actualMarks || marksDoc.actualMarks.length === 0) return { orderedComponents: [], componentMap: {} };
    
//     const sampleMarks = marksDoc.actualMarks[0].marks;
//     const componentMap = {};
//     const orderedComponents = [];

//     Object.keys(sampleMarks).forEach(key => {
//         if (key.endsWith('_TOTAL')) return;
//         const match = key.match(/(.*)_(CO\d+)/);
//         if (match) {
//             const [, compName, coName] = match;
//             if (!componentMap[compName]) {
//                 componentMap[compName] = [];
//                 orderedComponents.push(compName);
//             }
//             componentMap[compName].push(coName);
//         }
//     });

//     orderedComponents.forEach(comp => componentMap[comp].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))));
//     return { orderedComponents, componentMap };
// }





function extractComponents(marksDoc) {
    if (!marksDoc || !marksDoc.actualMarks || marksDoc.actualMarks.length === 0) return { orderedComponents: [], componentMap: {} };
    
    const sampleMarks = marksDoc.actualMarks[0].marks;
    const componentMap = {};
    const orderedComponents = [];

    Object.keys(sampleMarks).forEach(key => {
        // FIX: Changed to _Total to match DB schema
        if (key.endsWith('_Total')) return; 
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
    return { orderedComponents, componentMap };
}



// 1. Download Master Report (All 3 Tables)
// async function handleDownloadPdfReport(req, res) {
//     try {
//         const inputs = getSanitizedInputs(req);
//         if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });
//         const { cleanSubjectId, cleanCourse, cleanYear } = inputs;

//         const [calcData, finalData, poData] = await Promise.all([
//             calculatedMarks.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
//             FinalCoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
//             PoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
//         ]);

//         if (!calcData && !finalData && !poData) return res.status(404).json({ success: false, message: "No data found." });

//         const { orderedComponents, componentMap } = extractComponents(calcData);
//         const colorMap = buildColorMap(orderedComponents);

//         let html = getBaseHtml(`Attainment Report - ${cleanSubjectId} (${cleanYear})`);

//         html += getTable1Html(calcData, colorMap, orderedComponents, componentMap, '1. Calculated Marks & Attainment');
        
//         const hasT1 = !!calcData;
//         const pageBreakT2 = hasT1 ? '<h3 class="page-break">2. Final CO Attainment</h3>' : '<h3>2. Final CO Attainment</h3>';
//         html += getTable2Html(finalData, colorMap, pageBreakT2);

//         const pageBreakT3 = (hasT1 || !!finalData) ? '<h3 class="page-break">3. Final PO Attainment</h3>' : '<h3>3. Final PO Attainment</h3>';
//         html += getTable3Html(poData, finalData, pageBreakT3);
        
//         html += `</body></html>`;

//         const pdfBuffer = await generatePdfBuffer(html);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `inline; filename="Report_${cleanSubjectId}_${cleanYear}.pdf"`);
//         return res.send(pdfBuffer);

//     } catch (error) {
//         console.error("Master PDF Error:", error.message);
//         if (!res.headersSent) return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// }





async function handleDownloadPdfReport(req, res) {
    try {
        const inputs = getSanitizedInputs(req);
        if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });
        const { cleanSubjectId, cleanCourse, cleanYear } = inputs;

        const [calcData, finalData, poData] = await Promise.all([
            calculatedMarks.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
            FinalCoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
            PoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
        ]);

        if (!calcData && !finalData && !poData) return res.status(404).json({ success: false, message: "No data found." });

        const { orderedComponents, componentMap } = extractComponents(calcData);
        const colorMap = buildColorMap(orderedComponents);

        let html = getBaseHtml(`Attainment Report - ${cleanSubjectId} (${cleanYear})`);

        // Table 1 stays on Page 1 naturally
        html += getTable1Html(calcData, colorMap, orderedComponents, componentMap, '1. Calculated Marks & Attainment');
        
        const hasT1 = !!calcData;
        
        // Table 2 adds a page break to move to Page 2
        const pageBreakT2 = hasT1 ? '<h3 class="page-break">2. Final CO Attainment</h3>' : '<h3>2. Final CO Attainment</h3>';
        html += getTable2Html(finalData, colorMap, pageBreakT2);

        // Table 3 NO LONGER has a page break, so it stays on Page 2 with Table 2
        const pageBreakT3 = '<h3>3. Final PO Attainment</h3>';
        html += getTable3Html(poData, finalData, pageBreakT3);
        
        html += `</body></html>`;

        const pdfBuffer = await generatePdfBuffer(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Report_${cleanSubjectId}_${cleanYear}.pdf"`);
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Master PDF Error:", error.message);
        if (!res.headersSent) return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// 2. Download Calculated Marks ONLY
async function handleDownloadCalculatedMarksPdf(req, res) {
    try {
        const inputs = getSanitizedInputs(req);
        if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });
        
        const calcData = await calculatedMarks.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean();
        if (!calcData) return res.status(404).json({ success: false, message: "No marks data found." });

        const { orderedComponents, componentMap } = extractComponents(calcData);
        const colorMap = buildColorMap(orderedComponents);

        let html = getBaseHtml(`Calculated Marks - ${inputs.cleanSubjectId} (${inputs.cleanYear})`);
        html += getTable1Html(calcData, colorMap, orderedComponents, componentMap);
        html += `</body></html>`;

        const pdfBuffer = await generatePdfBuffer(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="CalculatedMarks_${inputs.cleanSubjectId}_${inputs.cleanYear}.pdf"`);
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Calculated Marks PDF Error:", error.message);
        if (!res.headersSent) return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// 3. Download Final CO Attainment ONLY
async function handleDownloadFinalCoAttainmentPdf(req, res) {
    try {
        const inputs = getSanitizedInputs(req);
        if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });

        const [calcData, finalData] = await Promise.all([
            calculatedMarks.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean(),
            FinalCoAttainment.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean()
        ]);

        if (!finalData) return res.status(404).json({ success: false, message: "No final CO data found." });

        const { orderedComponents } = extractComponents(calcData);
        const colorMap = buildColorMap(orderedComponents);

        let html = getBaseHtml(`Final CO Attainment - ${inputs.cleanSubjectId} (${inputs.cleanYear})`);
        html += getTable2Html(finalData, colorMap);
        html += `</body></html>`;

        const pdfBuffer = await generatePdfBuffer(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Final_CO_Attainment_${inputs.cleanSubjectId}_${inputs.cleanYear}.pdf"`);
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Final CO Attainment PDF Error:", error.message);
        if (!res.headersSent) return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// 4. Download PO Attainment ONLY
async function handleDownloadPoAttainmentPdf(req, res) {
    try {
        const inputs = getSanitizedInputs(req);
        if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });

        const [finalData, poData] = await Promise.all([
            FinalCoAttainment.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean(),
            PoAttainment.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean()
        ]);

        if (!poData) return res.status(404).json({ success: false, message: "No PO data found." });

        let html = getBaseHtml(`Final PO Attainment - ${inputs.cleanSubjectId} (${inputs.cleanYear})`);
        html += getTable3Html(poData, finalData);
        html += `</body></html>`;

        const pdfBuffer = await generatePdfBuffer(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Final_PO_Attainment_${inputs.cleanSubjectId}_${inputs.cleanYear}.pdf"`);
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("PO Attainment PDF Error:", error.message);
        if (!res.headersSent) return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    handleDownloadPdfReport,
    handleDownloadCalculatedMarksPdf,
    handleDownloadFinalCoAttainmentPdf,
    handleDownloadPoAttainmentPdf
};