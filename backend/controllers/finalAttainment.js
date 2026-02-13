const CalculatedMarks = require('../models/calculatedMarks');
const FinalAttainment = require('../models/finalAttainment');

// const processFinalAttainment = async (req, res) => {
async function handleFinalAttainment(req, res) {

    try {
        const { subjectId, batch } = req.body;

        // 1. Retrieve the level from Calculated Marks
        // We find the latest record for this subject/batch
        const latestCalc = await CalculatedMarks.findOne({ subjectId, batch }).sort({ createdAt: -1 });

        if (!latestCalc) {
            return res.status(404).json({ message: "No calculated marks found to process." });
        }

        const retrievedLevel = latestCalc.level;

        // 2. Perform the Final Attainment Calculation
        // (Adjust this math based on your specific college formula)
        // Example: If Level is 3, Final Attainment might be (Level * Weightage)
        const finalValue = retrievedLevel * 1; // Placeholder for your specific logic

        // 3. Create and Save to the new collection
        const finalRecord = new FinalAttainment({
            subjectId: latestCalc.subjectId,
            batch: latestCalc.batch,
            calculatedLevel: retrievedLevel,
            finalAttainmentValue: finalValue
        });

        await finalRecord.save();

        res.status(201).json({
            success: true,
            data: finalRecord
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { handleFinalAttainment };