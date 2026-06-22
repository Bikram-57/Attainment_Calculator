const FinalAttainment = require('../models/finalAttainment');
const Subject = require('../models/subject');
const CoPoMatrix = require('../models/coPoMapping');
const DirectPoAttainment = require('../models/directAttainment');

const STANDARD_POS = [
    'PO1',
    'PO2',
    'PO3',
    'PO4',
    'PO5',
    'PO6',
    'PO7',
    'PO8'
];

const extractAttainmentLevels = async (req, res) => {
    try {

        const targetCourse = req.body?.course || 'MCA';
        const targetYear = req.body?.academicYear || '2026';

        console.log(
            `Calculating Direct PO Attainment: ${targetCourse} - ${targetYear}`
        );

        // ==========================
        // FETCH FINAL ATTAINMENT DATA
        // ==========================
        const allSubjects = await FinalAttainment.find(
            {
                course: targetCourse,
                academicYear: targetYear
            },
            {
                subjectId: 1,
                attainmentTable: 1,
                _id: 0
            }
        ).lean();

        if (!allSubjects.length) {
            return res.status(404).json({
                success: false,
                message: 'No subjects found.'
            });
        }

        const subjectIds = allSubjects.map(
            subject => subject.subjectId
        );

        console.log('Subject IDs:', subjectIds);

        // ==========================
        // FETCH SUBJECT NAMES
        // ==========================
        const subjectRecords = await Subject.find(
            {
                subjectId: { $in: subjectIds },
                course: targetCourse,
                academicYear: Number(targetYear)
            },
            {
                subjectId: 1,
                subjectName: 1,
                _id: 0
            }
        ).lean();

        console.log('Subject Records:', subjectRecords);

        const subjectLookup = new Map();

        subjectRecords.forEach(subject => {
            subjectLookup.set(
                subject.subjectId,
                subject.subjectName
            );
        });

        console.log(
            'Subject Lookup:',
            Object.fromEntries(subjectLookup)
        );

        // ==========================
        // FETCH CO-PO MAPPINGS
        // ==========================
        const allMatrices = await CoPoMatrix.find(
            {
                subjectId: { $in: subjectIds }
            },
            {
                subjectId: 1,
                mappingData: 1,
                matrix: 1,
                copoMapping: 1,
                _id: 0
            }
        ).lean();

        const matrixLookup = new Map();

        allMatrices.forEach(matrix => {
            matrixLookup.set(
                matrix.subjectId,
                matrix.mappingData ||
                matrix.matrix ||
                matrix.copoMapping ||
                {}
            );
        });

        // ==========================
        // CALCULATE DIRECT PO
        // ==========================
        const calculatedBatchData = allSubjects.map(subject => {

            const attainmentTable =
                subject.attainmentTable || {};

            const rawMatrix =
                matrixLookup.get(subject.subjectId) || {};

            const tableData = [];

            const poTotals = Object.fromEntries(
                STANDARD_POS.map(po => [po, 0])
            );

            const poWeights = Object.fromEntries(
                STANDARD_POS.map(po => [po, 0])
            );

            const extractedLevels = {};

            Object.keys(attainmentTable).forEach(coKey => {

                if (
                    attainmentTable[coKey] &&
                    attainmentTable[coKey].grandTotal !== undefined
                ) {
                    extractedLevels[coKey] =
                        Number(
                            attainmentTable[coKey].grandTotal
                        ) || 0;
                }
            });

            const sortedCOs = Object.keys(
                extractedLevels
            ).sort(
                (a, b) =>
                    Number(a.replace('CO', '')) -
                    Number(b.replace('CO', ''))
            );

            sortedCOs.forEach((coKey, index) => {

                const attainmentLevel =
                    extractedLevels[coKey];

                const mappings =
                    rawMatrix?.[coKey] || {};

                const row = {
                    course:
                        index === 0
                            ? subject.subjectId
                            : '',
                    co: coKey,
                    attainmentLevel
                };

                STANDARD_POS.forEach(po => {

                    const weight =
                        mappings[po] === '' ||
                        mappings[po] === null ||
                        mappings[po] === undefined
                            ? null
                            : Number(mappings[po]);

                    row[po] = weight;

                    if (weight !== null) {
                        poTotals[po] +=
                            attainmentLevel * weight;

                        poWeights[po] += weight;
                    }
                });

                tableData.push(row);
            });

            const directPoRow = {
                course: 'Direct PO Attainment',
                co: '',
                attainmentLevel: ''
            };

            STANDARD_POS.forEach(po => {

                directPoRow[po] =
                    poWeights[po] > 0
                        ? Number(
                              (
                                  poTotals[po] /
                                  poWeights[po]
                              ).toFixed(2)
                          )
                        : null;
            });

            tableData.push(directPoRow);

            return {
                subjectId: subject.subjectId,
                subjectName:
                    subjectLookup.get(subject.subjectId) ||
                    'Unknown Subject',
                tableData
            };
        });

        // ==========================
        // SAVE REPORT
        // ==========================
        const savedDocument =
            await DirectPoAttainment.findOneAndUpdate(
                {
                    course: targetCourse,
                    academicYear: targetYear
                },
                {
                    $set: {
                        course: targetCourse,
                        academicYear: targetYear,
                        subjects: calculatedBatchData,
                        calculatedAt: new Date()
                    }
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            ).lean();

        return res.status(200).json({
            success: true,
            count: calculatedBatchData.length,
            data: calculatedBatchData,
            documentId: savedDocument._id
        });

    } catch (error) {

        console.error(
            'Direct PO Attainment Error:',
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};









const handleGetDirectAttainment = async (req, res) => {
    try {

        const course = req.query.course || 'MCA';
        const academicYear = req.query.academicYear || '2026';

        const document = await DirectPoAttainment.findOne(
            {
                course,
                academicYear
            },
            {
                _id: 0,
                createdAt: 0,
                updatedAt: 0
            }
        ).lean();

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Direct PO Attainment data not found'
            });
        }

        return res.status(200).json({
            success: true,
            count: document.subjects.length,
            data: document
        });

    } catch (error) {

        console.error(
            'Get Direct PO Attainment Error:',
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};



const handleGetAllReports = async (req, res) => {
    try {

        const reports = await DirectPoAttainment.find(
            {},
            {
                course: 1,
                academicYear: 1,
                calculatedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                subjects: 1
            }
        )
        .sort({ calculatedAt: -1 })
        .lean();

        const formattedReports = reports.map(report => ({
            id: report._id,
            course: report.course,
            academicYear: report.academicYear,
            subjectCount: report.subjects?.length || 0,
            calculatedAt: report.calculatedAt,
            createdAt: report.createdAt
        }));

        return res.status(200).json({
            success: true,
            count: formattedReports.length,
            data: formattedReports
        });

    } catch (error) {

        console.error(
            'Get Reports Error:',
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};





const handleGetReportByYear = async (req, res) => {
    try {

        const { academicYear } = req.body;

        if (!academicYear) {
            return res.status(400).json({
                success: false,
                message: 'academicYear is required'
            });
        }

        const reports = await DirectPoAttainment.find(
            {
                academicYear
            },
            {
                course: 1,
                academicYear: 1,
                calculatedAt: 1,
                createdAt: 1
            }
        )
        .sort({ calculatedAt: -1 })
        .lean();

        return res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });

    } catch (error) {

        console.error(
            'Get Reports By Year Error:',
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};




module.exports = {
    extractAttainmentLevels,
    handleGetDirectAttainment,
    handleGetAllReports,
    handleGetReportByYear
};