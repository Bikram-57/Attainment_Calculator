


const puppeteer = require('puppeteer');

// ============================================================================
// MODELS (Adjust the file paths to your actual Theory models)
// ============================================================================
const TheoryCalculatedMarks = require("../models/calculatedMarks");
const TheoryFinalCoAttainment = require("../models/finalAttainment");
const TheoryPoAttainment = require("../models/calculatedPo");

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

// Builds dynamic color map based on parsed component headers (e.g., MidSem, Assignment, etc.)
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

// Extract ordered components helper for parsing DB data dynamically
function extractComponents(marksDoc) {
    if (!marksDoc || !marksDoc.actualMarks || marksDoc.actualMarks.length === 0) return { orderedComponents: [], componentMap: {} };
    
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
    return { orderedComponents, componentMap };
}

// ============================================================================
// HTML GENERATORS FOR EACH TABLE
// ============================================================================

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
            html += `<td>${formatVal(m[`${comp}_TOTAL`])}</td>`;
        });
        html += `</tr>`;
    });

    // Footer Rows (Max Marks, Target, etc.)
    const calcLabels = ['Max Marks', 'Target Marks', 'Students Above Target', 'Attainment %', 'Attainment Level'];
    const keys = ['maxMarks', 'targetMarks', 'studentsAboveTarget', 'attainmentPercent', 'attainmentLevel'];
    
    calcLabels.forEach((label, i) => {
        html += `<tr><th style="background-color: #fff;">${label}</th>`;
        orderedComponents.forEach(comp => {
            [...componentMap[comp], 'TOTAL'].forEach(coSuffix => {
                const key = coSuffix === 'TOTAL' ? `${comp}_TOTAL` : `${comp}_${coSuffix}`;
                const calc = calcData.reportData?.[key] || {};
                html += `<th>${formatVal(calc[keys[i]])}</th>`;
            });
        });
        html += `</tr>`;
    });

    return html + `</tbody></table>`;
}

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
    const examHeaders = Array.from(dynamicExams);

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
// PUPPETEER PDF GENERATOR (Portrait Shrink-to-Fit)
// ============================================================================
async function generatePdfBuffer(htmlContent) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const contentWidth = await page.evaluate(() => {
            let maxWidth = 0;
            document.querySelectorAll('table').forEach(table => {
                if (table.offsetWidth > maxWidth) maxWidth = table.offsetWidth;
            });
            return maxWidth;
        });

        const printableA4PortraitWidth = 754; 
        let scaleFactor = 1;
        
        if (contentWidth > printableA4PortraitWidth) {
            scaleFactor = printableA4PortraitWidth / (contentWidth + 10); 
        }

        return await page.pdf({
            format: 'A4', 
            landscape: false, 
            printBackground: true, 
            scale: scaleFactor,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });
    } finally {
        if (browser) await browser.close();
    }
}

// ============================================================================
// CONTROLLERS FOR THEORY SUBJECTS
// ============================================================================

// 1. Download Master Report (All 3 Tables)
async function handleDownloadTheoryPdfReport(req, res) {
    try {
        const inputs = getSanitizedInputs(req);
        if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });
        const { cleanSubjectId, cleanCourse, cleanYear } = inputs;

        const [calcData, finalData, poData] = await Promise.all([
            TheoryCalculatedMarks.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
            TheoryFinalCoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean(),
            TheoryPoAttainment.findOne({ subjectId: cleanSubjectId, course: cleanCourse, academicYear: cleanYear }).lean()
        ]);

        if (!calcData && !finalData && !poData) return res.status(404).json({ success: false, message: "No data found." });

        const { orderedComponents, componentMap } = extractComponents(calcData);
        const colorMap = buildColorMap(orderedComponents);

        let html = getBaseHtml(`Theory Attainment Report - ${cleanSubjectId} (${cleanYear})`);

        html += getTable1Html(calcData, colorMap, orderedComponents, componentMap, '1. Calculated Marks & Attainment');
        
        const hasT1 = !!calcData;
        const pageBreakT2 = hasT1 ? '<h3 class="page-break">2. Final CO Attainment</h3>' : '<h3>2. Final CO Attainment</h3>';
        html += getTable2Html(finalData, colorMap, pageBreakT2);

        const pageBreakT3 = (hasT1 || !!finalData) ? '<h3 class="page-break">3. Final PO Attainment</h3>' : '<h3>3. Final PO Attainment</h3>';
        html += getTable3Html(poData, finalData, pageBreakT3);
        
        html += `</body></html>`;

        const pdfBuffer = await generatePdfBuffer(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Theory_Report_${cleanSubjectId}_${cleanYear}.pdf"`);
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Master Theory PDF Error:", error.message);
        if (!res.headersSent) return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// 2. Download Calculated Marks ONLY
async function handleDownloadTheoryCalculatedMarksPdf(req, res) {
    try {
        const inputs = getSanitizedInputs(req);
        if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });
        
        const calcData = await TheoryCalculatedMarks.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean();
        if (!calcData) return res.status(404).json({ success: false, message: "No marks data found." });

        const { orderedComponents, componentMap } = extractComponents(calcData);
        const colorMap = buildColorMap(orderedComponents);

        let html = getBaseHtml(`Theory Calculated Marks - ${inputs.cleanSubjectId} (${inputs.cleanYear})`);
        html += getTable1Html(calcData, colorMap, orderedComponents, componentMap);
        html += `</body></html>`;

        const pdfBuffer = await generatePdfBuffer(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Theory_CalculatedMarks_${inputs.cleanSubjectId}_${inputs.cleanYear}.pdf"`);
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Theory Calculated Marks PDF Error:", error.message);
        if (!res.headersSent) return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// 3. Download Final CO Attainment ONLY
async function handleDownloadTheoryFinalCoAttainmentPdf(req, res) {
    try {
        const inputs = getSanitizedInputs(req);
        if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });

        const [calcData, finalData] = await Promise.all([
            TheoryCalculatedMarks.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean(),
            TheoryFinalCoAttainment.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean()
        ]);

        if (!finalData) return res.status(404).json({ success: false, message: "No final CO data found." });

        const { orderedComponents } = extractComponents(calcData);
        const colorMap = buildColorMap(orderedComponents);

        let html = getBaseHtml(`Theory Final CO Attainment - ${inputs.cleanSubjectId} (${inputs.cleanYear})`);
        html += getTable2Html(finalData, colorMap);
        html += `</body></html>`;

        const pdfBuffer = await generatePdfBuffer(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Theory_Final_CO_Attainment_${inputs.cleanSubjectId}_${inputs.cleanYear}.pdf"`);
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Theory Final CO Attainment PDF Error:", error.message);
        if (!res.headersSent) return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// 4. Download PO Attainment ONLY
async function handleDownloadTheoryPoAttainmentPdf(req, res) {
    try {
        const inputs = getSanitizedInputs(req);
        if (!inputs) return res.status(400).json({ success: false, message: "Missing inputs." });

        const [finalData, poData] = await Promise.all([
            TheoryFinalCoAttainment.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean(),
            TheoryPoAttainment.findOne({ subjectId: inputs.cleanSubjectId, course: inputs.cleanCourse, academicYear: inputs.cleanYear }).lean()
        ]);

        if (!poData) return res.status(404).json({ success: false, message: "No PO data found." });

        let html = getBaseHtml(`Theory Final PO Attainment - ${inputs.cleanSubjectId} (${inputs.cleanYear})`);
        html += getTable3Html(poData, finalData);
        html += `</body></html>`;

        const pdfBuffer = await generatePdfBuffer(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Theory_Final_PO_Attainment_${inputs.cleanSubjectId}_${inputs.cleanYear}.pdf"`);
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Theory PO Attainment PDF Error:", error.message);
        if (!res.headersSent) return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    handleDownloadTheoryPdfReport,
    handleDownloadTheoryCalculatedMarksPdf,
    handleDownloadTheoryFinalCoAttainmentPdf,
    handleDownloadTheoryPoAttainmentPdf
};