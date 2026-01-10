// controllers/excelController.js
const xlsx = require("xlsx");
const Marks = require("../models/uploadMarks");

async function handleExcelUpload(req, res) {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: 0 });

    console.log("Excel rows:", rows);

    let count = 0;

    for (let row of rows) {
      if (!row.regNo) {
        console.log("Skipping row (no regNo):", row);
        continue;
      }

      const data = {
        regNo: row.regNo,
        exams: {}
      };

      for (let key in row) {
        if (key === "regNo") continue;

        const parts = key.split("_");
        if (parts.length !== 2) continue;

        const exam = parts[0];
        const co = parts[1];

        if (!data.exams[exam]) {
          data.exams[exam] = {};
        }

        data.exams[exam][co] = row[key];
      }

      await Marks.findOneAndUpdate(
        { regNo: data.regNo },
        data,
        { upsert: true }
      );

      count++;
    }

    return res.json({
      success: true,
      message: "Data saved to MongoDB",
      recordsSaved: count
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { handleExcelUpload };
