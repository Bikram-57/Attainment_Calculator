const FinalAttainment = require('../models/finalAttainment');
const CoPoMatrix = require('../models/coPoMapping');
const DirectPoAttainment = require('../models/directAttainment2');

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

        // Fetch only required fields
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

        // Fetch mappings
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

        // Create lookup map
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

            // Final Direct PO row
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
                tableData
            };
        });

        // Save result
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




module.exports = {
    extractAttainmentLevels,
    handleGetDirectAttainment
};