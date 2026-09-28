const puppeteer = require('puppeteer');
const CalculatedLabMark = require('../models/calculatedLabMarks'); 
const FinalLabAttainment = require('../models/finalLabAttainment');
const LabPoAttainment = require('../models/calculatedLabPo'); 

// ============================================================================
// Download PRINT READY Complete Lab Attainment Excel Report
// ============================================================================
// async function handleDownloadPrintReadyReportForLab(req, res) {
  
//   let browser;
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

//         // 3. CSS AND HTML SETUP (Matches Excel Colors & Formatting)
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
//                 <h2>Lab Attainment Report - ${cleanSubjectId} (${cleanYear})</h2>
//         `;

//         const parentColorMap = {};
        
//         // ==========================================================
//         // TABLE 1: CO Attainment (Internal Lab Marks)
//         // ==========================================================
//         if (calcData && calcData.maxMarks) {
//             htmlContent += `<h3>1. CO Attainment (Internal Marks)</h3>`;
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
//                 parentColorMap[group.raw] = color; // Save color for Table 2
                
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
//                     rowHtml += `<th>${val}</th>`; // Bolded footers
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
//             htmlContent += `<h3>2. Final CO Attainment</h3>`;
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

//                 // Final Row Merged
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
//             htmlContent += `<h3>3. PO Attainment</h3>`;
//             htmlContent += `<table><thead><tr>`;
//             htmlContent += `<th style="background-color: ${pinkColor};">CO's</th>`;
            
//             for (let i = 1; i <= 8; i++) {
//                 const poColor = alternatingColors[(i - 1) % 2];
//                 htmlContent += `<th style="background-color: ${poColor};">PO${i}</th>`;
//             }
//             htmlContent += `</tr></thead><tbody>`;

//             // CO Rows
//             for (let i = 1; i <= 5; i++) {
//                 htmlContent += `<tr><td>CO${i}</td>`;
//                 for (let j = 1; j <= 8; j++) {
//                     htmlContent += `<td>${poData.mappingData[`CO${i}`]?.[`PO${j}`] || "-"}</td>`;
//                 }
//                 htmlContent += `</tr>`;
//             }

//             // Average Row
//             htmlContent += `<tr><th style="background-color: #fff;">Average</th>`;
//             for (let j = 1; j <= 8; j++) {
//                 htmlContent += `<th>${poData.averageCo?.[`PO${j}`] ?? "-"}</th>`;
//             }
//             htmlContent += `</tr>`;

//             // Final Subject Row (Merged)
//             const subjectAttainmentVal = poData.finalSubjectAttainment ?? finalData?.finalSubjectAttainment ?? 0;
//             htmlContent += `<tr><th style="background-color: #fff;">Final Subject Attainment</th>`;
//             htmlContent += `<th colspan="8" style="background-color: #fff;">${subjectAttainmentVal}</th></tr>`;

//             // Final PO Row
//             htmlContent += `<tr><th style="background-color: ${lightGrayColor};">Final PO Attainment</th>`;
//             for (let j = 1; j <= 8; j++) {
//                 htmlContent += `<th style="background-color: ${lightGrayColor};">${poData.poAttainment?.[`PO${j}`] ?? "-"}</th>`;
//             }
//             htmlContent += `</tr></tbody></table>`;
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


async function handleDownloadPrintReadyReportForLab(req, res) {
    let browser;
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

        if (!calcData && !finalData && !poData) {
            return res.status(404).json({ success: false, message: "No lab data found to download for these parameters." });
        }

        // 3. CSS AND HTML SETUP
        const alternatingColors = ['#CCC1DA', '#C5D9F1']; // Lavender, Light Blue
        const pinkColor = '#D99694';
        const grayColor = '#D9D9D9';
        const lightGrayColor = '#EBEBEB';

        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
                    h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
                    h3 { color: #555; font-size: 14px; margin-bottom: 10px; margin-top: 20px; }
                    
                    /* 🎯 table width set to max-content ensures it stretches to its true size for measurement */
                    table { width: max-content; min-width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: auto; margin-left: auto; margin-right: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; }
                    th { font-weight: bold; color: #000; }
                    
                    /* Prevents columns from squishing text into unreadable stacks */
                    th, td { white-space: nowrap; } 
                    
                    /* Utility class for forcing page breaks */
                    .page-break { page-break-before: always; }
                </style>
            </head>
            <body>
                <h2>Lab Attainment Report - ${cleanSubjectId} (${cleanYear})</h2>
        `;

        const parentColorMap = {};
        let hasTable1 = false;
        
        // ==========================================================
        // TABLE 1: CO Attainment (Internal Lab Marks)
        // ==========================================================
        if (calcData && calcData.maxMarks) {
            hasTable1 = true;
            htmlContent += `<h3>1. CO Attainment (Internal Marks)</h3>`;
            const marksKeys = Object.keys(calcData.maxMarks);
            
            const parentGroups = [];
            let currentGroup = null;
            
            marksKeys.forEach(key => {
                const lastUnderscore = key.lastIndexOf('_');
                const rawParent = lastUnderscore !== -1 ? key.substring(0, lastUnderscore) : key;
                const subName = lastUnderscore !== -1 ? key.substring(lastUnderscore + 1) : "";
                const parentDisplay = rawParent.replace(/_/g, ' ');

                if (!currentGroup || currentGroup.raw !== rawParent) {
                    if (currentGroup) parentGroups.push(currentGroup);
                    currentGroup = { name: parentDisplay, raw: rawParent, subNames: [subName] };
                } else {
                    currentGroup.subNames.push(subName);
                }
            });
            if (currentGroup) parentGroups.push(currentGroup);

            htmlContent += `<table><thead><tr><th rowspan="2" style="background-color: ${pinkColor};">Reg No</th>`;
            let subRowHtml = `<tr>`;

            parentGroups.forEach((group, index) => {
                const color = alternatingColors[index % 2];
                parentColorMap[group.raw] = color; 
                
                htmlContent += `<th colspan="${group.subNames.length}" style="background-color: ${color};">${group.name}</th>`;
                group.subNames.forEach(sub => {
                    subRowHtml += `<th style="background-color: ${color};">${sub}</th>`;
                });
            });

            htmlContent += `</tr>${subRowHtml}</tr></thead><tbody>`;

            if (calcData.actualMarks && calcData.actualMarks.length > 0) {
                calcData.actualMarks.forEach(student => {
                    htmlContent += `<tr><td>${student.regNo}</td>`;
                    marksKeys.forEach(key => {
                        htmlContent += `<td>${student.marks?.[key] ?? "-"}</td>`;
                    });
                    htmlContent += `</tr>`;
                });
            }

            const generateFooterRow = (label, keyProp, isPercent = false, multiplier = 1) => {
                let rowHtml = `<tr><th style="background-color: #fff;">${label}</th>`;
                marksKeys.forEach(key => {
                    const rd = calcData.reportData?.[key] || {};
                    let val = rd[keyProp] ?? 0;
                    if (multiplier !== 1) val = parseFloat((val * multiplier).toFixed(2));
                    rowHtml += `<th>${val}</th>`;
                });
                return rowHtml + `</tr>`;
            };

            htmlContent += generateFooterRow("Max Marks", "maxMarks");
            htmlContent += generateFooterRow("Target Marks", "maxMarks", false, 0.6);
            htmlContent += generateFooterRow("Students Above Target", "studentsAboveTarget");
            htmlContent += generateFooterRow("Attainment %", "attainmentPercent");
            htmlContent += generateFooterRow("Attainment Level", "attainmentLevel");
            htmlContent += `</tbody></table>`;
        }

        // ==========================================================
        // TABLE 2: Final CO Attainment
        // ==========================================================
        if (finalData && finalData.attainmentTable) {
            const pageBreakClass = hasTable1 ? 'class="page-break"' : '';
            htmlContent += `<h3 ${pageBreakClass}>2. Final CO Attainment</h3>`;
            
            const coKeys = Object.keys(finalData.attainmentTable).sort();
            
            if (coKeys.length > 0) {
                const dynamicExams = new Set();
                coKeys.forEach(co => {
                    Object.keys(finalData.attainmentTable[co]).forEach(k => {
                        if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
                    });
                });
                const examHeaders = Array.from(dynamicExams);

                htmlContent += `<table><thead><tr>`;
                htmlContent += `<th style="background-color: ${pinkColor};">CO's</th>`;
                
                examHeaders.forEach(exam => {
                    const color = parentColorMap[exam] || grayColor;
                    htmlContent += `<th style="background-color: ${color};">${exam}</th>`;
                });
                
                htmlContent += `<th style="background-color: ${grayColor};">Internal Average</th>`;
                htmlContent += `<th style="background-color: ${grayColor};">End Sem (External)</th>`;
                htmlContent += `<th style="background-color: ${grayColor};">Grand Total</th>`;
                htmlContent += `</tr></thead><tbody>`;

                coKeys.forEach(co => {
                    htmlContent += `<tr><td>${co}</td>`;
                    const coInfo = finalData.attainmentTable[co];
                    
                    examHeaders.forEach(exam => htmlContent += `<td>${coInfo[exam] ?? "-"}</td>`);
                    
                    htmlContent += `<td>${coInfo.internalAvg ?? 0}</td>`;
                    htmlContent += `<td>${coInfo.externalLevel ?? 0}</td>`;
                    htmlContent += `<td>${coInfo.grandTotal ?? 0}</td></tr>`;
                });

                const totalCols = examHeaders.length + 4;
                htmlContent += `<tr><th colspan="${totalCols - 1}" style="background-color: ${lightGrayColor}; text-align: right; padding-right: 15px;">Final CO Attainment</th>`;
                htmlContent += `<th style="background-color: ${lightGrayColor};">${finalData.finalSubjectAttainment ?? 0}</th></tr>`;
                htmlContent += `</tbody></table>`;
            }
        }

        // ==========================================================
        // TABLE 3: PO Attainment
        // ==========================================================
        if (poData && poData.mappingData) {
            const needsPageBreak = hasTable1 && !(finalData && finalData.attainmentTable);
            const pageBreakClass = needsPageBreak ? 'class="page-break"' : '';
            htmlContent += `<h3 ${pageBreakClass}>3. PO Attainment</h3>`;
            
            htmlContent += `<table><thead><tr>`;
            htmlContent += `<th style="background-color: ${pinkColor};">CO's</th>`;
            
            for (let i = 1; i <= 8; i++) {
                const poColor = alternatingColors[(i - 1) % 2];
                htmlContent += `<th style="background-color: ${poColor};">PO${i}</th>`;
            }
            htmlContent += `</tr></thead><tbody>`;

            for (let i = 1; i <= 5; i++) {
                htmlContent += `<tr><td>CO${i}</td>`;
                for (let j = 1; j <= 8; j++) {
                    htmlContent += `<td>${poData.mappingData[`CO${i}`]?.[`PO${j}`] || "-"}</td>`;
                }
                htmlContent += `</tr>`;
            }

            htmlContent += `<tr><th style="background-color: #fff;">Average</th>`;
            for (let j = 1; j <= 8; j++) {
                htmlContent += `<th>${poData.averageCo?.[`PO${j}`] ?? "-"}</th>`;
            }
            htmlContent += `</tr>`;

            const subjectAttainmentVal = poData.finalSubjectAttainment ?? finalData?.finalSubjectAttainment ?? 0;
            htmlContent += `<tr><th style="background-color: #fff;">Final Subject Attainment</th>`;
            htmlContent += `<th colspan="8" style="background-color: #fff;">${subjectAttainmentVal}</th></tr>`;

            htmlContent += `<tr><th style="background-color: ${lightGrayColor};">Final PO Attainment</th>`;
            for (let j = 1; j <= 8; j++) {
                htmlContent += `<th style="background-color: ${lightGrayColor};">${poData.poAttainment?.[`PO${j}`] ?? "-"}</th>`;
            }
            htmlContent += `</tr></tbody></table>`;
        }

        htmlContent += `</body></html>`;

        // ==========================================================
        // 4. GENERATE PDF USING PUPPETEER (🎯 PERFECT DYNAMIC SCALING)
        // ==========================================================
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // 🎯 Measure the EXACT pixel width of the absolute widest table on the page
        const maxContentWidth = await page.evaluate(() => {
            let maxWidth = 0;
            const tables = document.querySelectorAll('table');
            tables.forEach(table => {
                if (table.offsetWidth > maxWidth) {
                    maxWidth = table.offsetWidth;
                }
            });
            return maxWidth;
        });

        // 🎯 A4 Landscape width is exactly 297mm. At standard 96 DPI, this is ~1122 pixels.
        // We subtract the left/right margins (20px + 20px = 40px) to get the true Printable Area.
        const printableA4Width = 1082; 
        
        let scaleFactor = 1;
        
        // 🎯 If the table is wider than the paper, mathematically calculate the perfect shrink ratio
        if (maxContentWidth > printableA4Width) {
            // Adding a 10px buffer so the table borders don't touch the very edge of the margin
            scaleFactor = printableA4Width / (maxContentWidth + 10); 
        }

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,       
            printBackground: true, 
            scale: scaleFactor,    // 🎯 Dynamically applies the perfect shrink ratio here
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        // 5. STREAM PDF TO CLIENT
        const fileName = `Lab_Attainment_${cleanSubjectId}_${cleanYear}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error("PDF Download Error:", error.message);
        if (browser) await browser.close();
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error generating PDF download.", error: error.message });
        }
    }
}











async function handleDownloadCOAttainmentPDF(req, res) {
    let browser;
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

        // 2. FETCH ONLY CO DATA (CalculatedLabMark)
        const calcData = await CalculatedLabMark.findOne({ 
            subjectId: cleanSubjectId, 
            course: cleanCourse, 
            academicYear: cleanYear 
        }).lean();

        if (!calcData) {
            return res.status(404).json({ success: false, message: "No CO attainment data found to download for these parameters." });
        }

        // 3. CSS AND HTML SETUP
        const alternatingColors = ['#CCC1DA', '#C5D9F1']; // Lavender, Light Blue
        const pinkColor = '#D99694';

        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
                    h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; }
                    th { font-weight: bold; color: #000; }
                    
                    /* Prevents columns from squishing text into unreadable stacks */
                    th, td { white-space: nowrap; } 
                </style>
            </head>
            <body>
                <h2>CO Attainment Report - ${cleanSubjectId} (${cleanYear})</h2>
        `;
        
        // ==========================================================
        // TABLE: CO Attainment (Internal Lab Marks)
        // ==========================================================
        if (calcData && calcData.maxMarks) {
            const marksKeys = Object.keys(calcData.maxMarks);
            
            // Group parent labs dynamically for colspans
            const parentGroups = [];
            let currentGroup = null;
            
            marksKeys.forEach(key => {
                const lastUnderscore = key.lastIndexOf('_');
                const rawParent = lastUnderscore !== -1 ? key.substring(0, lastUnderscore) : key;
                const subName = lastUnderscore !== -1 ? key.substring(lastUnderscore + 1) : "";
                const parentDisplay = rawParent.replace(/_/g, ' ');

                if (!currentGroup || currentGroup.raw !== rawParent) {
                    if (currentGroup) parentGroups.push(currentGroup);
                    currentGroup = { name: parentDisplay, raw: rawParent, subNames: [subName] };
                } else {
                    currentGroup.subNames.push(subName);
                }
            });
            if (currentGroup) parentGroups.push(currentGroup);

            htmlContent += `<table><thead><tr><th rowspan="2" style="background-color: ${pinkColor};">Reg No</th>`;
            let subRowHtml = `<tr>`;

            parentGroups.forEach((group, index) => {
                const color = alternatingColors[index % 2];
                
                htmlContent += `<th colspan="${group.subNames.length}" style="background-color: ${color};">${group.name}</th>`;
                group.subNames.forEach(sub => {
                    subRowHtml += `<th style="background-color: ${color};">${sub}</th>`;
                });
            });

            htmlContent += `</tr>${subRowHtml}</tr></thead><tbody>`;

            // Student Rows
            if (calcData.actualMarks && calcData.actualMarks.length > 0) {
                calcData.actualMarks.forEach(student => {
                    htmlContent += `<tr><td>${student.regNo}</td>`;
                    marksKeys.forEach(key => {
                        htmlContent += `<td>${student.marks?.[key] ?? "-"}</td>`;
                    });
                    htmlContent += `</tr>`;
                });
            }

            // Bottom Calculation Rows
            const generateFooterRow = (label, keyProp, isPercent = false, multiplier = 1) => {
                let rowHtml = `<tr><th style="background-color: #fff;">${label}</th>`;
                marksKeys.forEach(key => {
                    const rd = calcData.reportData?.[key] || {};
                    let val = rd[keyProp] ?? 0;
                    if (multiplier !== 1) val = parseFloat((val * multiplier).toFixed(2));
                    rowHtml += `<th>${val}</th>`;
                });
                return rowHtml + `</tr>`;
            };

            htmlContent += generateFooterRow("Max Marks", "maxMarks");
            htmlContent += generateFooterRow("Target Marks", "maxMarks", false, 0.6);
            htmlContent += generateFooterRow("Students Above Target", "studentsAboveTarget");
            htmlContent += generateFooterRow("Attainment %", "attainmentPercent");
            htmlContent += generateFooterRow("Attainment Level", "attainmentLevel");
            htmlContent += `</tbody></table>`;
        }

        htmlContent += `</body></html>`;

        // ==========================================================
        // 4. GENERATE PDF USING PUPPETEER (With Shrink-to-Fit Logic)
        // ==========================================================
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Calculate exact scale needed to fit horizontally
        const contentWidth = await page.evaluate(() => {
            return document.body.scrollWidth;
        });

        const a4LandscapeWidth = 1122; 
        let scaleFactor = 1;
        
        if (contentWidth > a4LandscapeWidth) {
            scaleFactor = a4LandscapeWidth / (contentWidth + 50); 
            if (scaleFactor < 0.3) scaleFactor = 0.3; 
        }

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,       
            printBackground: true, 
            scale: scaleFactor,    
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        // 5. STREAM PDF TO CLIENT
        const fileName = `CO_Attainment_${cleanSubjectId}_${cleanYear}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error("CO Attainment PDF Download Error:", error.message);
        if (browser) await browser.close();
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error generating CO Attainment PDF.", error: error.message });
        }
    }
}












async function handleDownloadFinalCOAttainmentPDF(req, res) {
    let browser;
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

        // 3. CSS AND HTML SETUP
        const alternatingColors = ['#CCC1DA', '#C5D9F1']; // Lavender, Light Blue
        const pinkColor = '#D99694';
        const grayColor = '#D9D9D9';
        const lightGrayColor = '#EBEBEB';

        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
                    h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; }
                    th { font-weight: bold; color: #000; }
                    
                    /* Prevents columns from squishing text into unreadable stacks */
                    th, td { white-space: nowrap; } 
                </style>
            </head>
            <body>
                <h2>Final CO Attainment Report - ${cleanSubjectId} (${cleanYear})</h2>
        `;

        // Generate Color Map to keep column colors consistent
        const parentColorMap = {};
        let colorToggle = 0;
        const marksKeys = calcData?.maxMarks ? Object.keys(calcData.maxMarks) : [];

        marksKeys.forEach(key => {
            const rawParent = key.lastIndexOf('_') !== -1 ? key.substring(0, key.lastIndexOf('_')) : key;
            if (!parentColorMap[rawParent]) {
                parentColorMap[rawParent] = alternatingColors[colorToggle % 2];
                colorToggle++;
            }
        });

        // ==========================================================
        // TABLE: Final CO Attainment
        // ==========================================================
        const coKeys = Object.keys(finalData.attainmentTable).sort();
        
        if (coKeys.length > 0) {
            const dynamicExams = new Set();
            coKeys.forEach(co => {
                Object.keys(finalData.attainmentTable[co]).forEach(k => {
                    if (!['internalAvg', 'externalLevel', 'grandTotal'].includes(k)) dynamicExams.add(k);
                });
            });
            const examHeaders = Array.from(dynamicExams);

            htmlContent += `<table><thead><tr>`;
            htmlContent += `<th style="background-color: ${pinkColor};">CO's</th>`;
            
            examHeaders.forEach(exam => {
                const color = parentColorMap[exam] || grayColor;
                htmlContent += `<th style="background-color: ${color};">${exam}</th>`;
            });
            
            htmlContent += `<th style="background-color: ${grayColor};">Internal Average</th>`;
            htmlContent += `<th style="background-color: ${grayColor};">End Sem (External)</th>`;
            htmlContent += `<th style="background-color: ${grayColor};">Grand Total</th>`;
            htmlContent += `</tr></thead><tbody>`;

            coKeys.forEach(co => {
                htmlContent += `<tr><td>${co}</td>`;
                const coInfo = finalData.attainmentTable[co];
                
                examHeaders.forEach(exam => htmlContent += `<td>${coInfo[exam] ?? "-"}</td>`);
                
                htmlContent += `<td>${coInfo.internalAvg ?? 0}</td>`;
                htmlContent += `<td>${coInfo.externalLevel ?? 0}</td>`;
                htmlContent += `<td>${coInfo.grandTotal ?? 0}</td></tr>`;
            });

            // Final Row Merged
            const totalCols = examHeaders.length + 4;
            htmlContent += `<tr><th colspan="${totalCols - 1}" style="background-color: ${lightGrayColor}; text-align: right; padding-right: 15px;">Final CO Attainment</th>`;
            htmlContent += `<th style="background-color: ${lightGrayColor};">${finalData.finalSubjectAttainment ?? 0}</th></tr>`;
            htmlContent += `</tbody></table>`;
        }

        htmlContent += `</body></html>`;

        // ==========================================================
        // 4. GENERATE PDF USING PUPPETEER (With Shrink-to-Fit Logic)
        // ==========================================================
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Calculate exact scale needed to fit horizontally
        const contentWidth = await page.evaluate(() => {
            return document.body.scrollWidth;
        });

        // Standard A4 Landscape printable width is roughly 1122 pixels
        const a4LandscapeWidth = 1122; 
        
        let scaleFactor = 1;
        if (contentWidth > a4LandscapeWidth) {
            // Shrink the scale exactly enough to fit the A4 width (with 50px buffer)
            scaleFactor = a4LandscapeWidth / (contentWidth + 50); 
            // Prevent it from becoming microscopic
            if (scaleFactor < 0.3) scaleFactor = 0.3; 
        }

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,       
            printBackground: true, // Forces background colors to render
            scale: scaleFactor,    // Applies the dynamic shrink-to-fit calculation
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        // 5. STREAM PDF TO CLIENT (Updated filename)
        const fileName = `Final_CO_Attainment_${cleanSubjectId}_${cleanYear}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error("Final CO Attainment PDF Download Error:", error.message);
        if (browser) await browser.close();
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error generating Final CO Attainment PDF download.", error: error.message });
        }
    }
}










async function handleDownloadPOAttainmentPDF(req, res) {
    let browser;
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

        // 3. CSS AND HTML SETUP
        const alternatingColors = ['#CCC1DA', '#C5D9F1']; // Lavender, Light Blue
        const pinkColor = '#D99694';
        const lightGrayColor = '#EBEBEB';

        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 20px; }
                    h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    th, td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; }
                    th { font-weight: bold; color: #000; }
                    
                    /* Prevents columns from squishing text into unreadable stacks */
                    th, td { white-space: nowrap; } 
                </style>
            </head>
            <body>
                <h2>PO Attainment Report - ${cleanSubjectId} (${cleanYear})</h2>
        `;

        // ==========================================================
        // TABLE: PO Attainment
        // ==========================================================
        htmlContent += `<table><thead><tr>`;
        htmlContent += `<th style="background-color: ${pinkColor};">CO's</th>`;
        
        for (let i = 1; i <= 8; i++) {
            const poColor = alternatingColors[(i - 1) % 2];
            htmlContent += `<th style="background-color: ${poColor};">PO${i}</th>`;
        }
        htmlContent += `</tr></thead><tbody>`;

        // CO Rows (CO1 to CO5)
        for (let i = 1; i <= 5; i++) {
            htmlContent += `<tr><td>CO${i}</td>`;
            for (let j = 1; j <= 8; j++) {
                htmlContent += `<td>${poData.mappingData[`CO${i}`]?.[`PO${j}`] || "-"}</td>`;
            }
            htmlContent += `</tr>`;
        }

        // Average Row
        htmlContent += `<tr><th style="background-color: #fff;">Average</th>`;
        for (let j = 1; j <= 8; j++) {
            htmlContent += `<th>${poData.averageCo?.[`PO${j}`] ?? "-"}</th>`;
        }
        htmlContent += `</tr>`;

        // Final Subject Row (Merged)
        const subjectAttainmentVal = poData.finalSubjectAttainment ?? finalData?.finalSubjectAttainment ?? 0;
        htmlContent += `<tr><th style="background-color: #fff;">Final Subject Attainment</th>`;
        htmlContent += `<th colspan="8" style="background-color: #fff;">${subjectAttainmentVal}</th></tr>`;

        // Final PO Row
        htmlContent += `<tr><th style="background-color: ${lightGrayColor};">Final PO Attainment</th>`;
        for (let j = 1; j <= 8; j++) {
            htmlContent += `<th style="background-color: ${lightGrayColor};">${poData.poAttainment?.[`PO${j}`] ?? "-"}</th>`;
        }
        htmlContent += `</tr></tbody></table>`;
        htmlContent += `</body></html>`;

        // ==========================================================
        // 4. GENERATE PDF USING PUPPETEER (With Shrink-to-Fit Logic)
        // ==========================================================
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Calculate exact scale needed to fit horizontally
        const contentWidth = await page.evaluate(() => {
            return document.body.scrollWidth;
        });

        // Standard A4 Landscape printable width is roughly 1122 pixels
        const a4LandscapeWidth = 1122; 
        
        let scaleFactor = 1;
        if (contentWidth > a4LandscapeWidth) {
            // Shrink the scale exactly enough to fit the A4 width (with 50px buffer)
            scaleFactor = a4LandscapeWidth / (contentWidth + 50); 
            // Prevent it from becoming microscopic
            if (scaleFactor < 0.3) scaleFactor = 0.3; 
        }

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,       
            printBackground: true, // Forces background colors to render
            scale: scaleFactor,    // Applies the dynamic shrink-to-fit calculation
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        // 5. STREAM PDF TO CLIENT
        const fileName = `PO_Attainment_${cleanSubjectId}_${cleanYear}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error("PO Attainment PDF Download Error:", error.message);
        if (browser) await browser.close();
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error generating PO Attainment PDF download.", error: error.message });
        }
    }
}


module.exports = {
    handleDownloadPrintReadyReportForLab,
    handleDownloadCOAttainmentPDF,
    handleDownloadFinalCOAttainmentPDF,
    handleDownloadPOAttainmentPDF
};