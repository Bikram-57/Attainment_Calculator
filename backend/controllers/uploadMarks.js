const xlsx = require("xlsx");
const Marks = require("../models/uploadMarks");

async function handleExcelUpload(req, res) {
  console.log("========== EXCEL UPLOAD START ==========");

  try {
    /* ================= FILE CHECK ================= */
    console.log("➡️ Checking file...");
    if (!req.file) {
      console.log("❌ No file found in request");
      return res.status(400).json({ success: false, message: "Excel file required" });
    }

    console.log("✅ File received:", req.file.originalname);

    /* ================= READ EXCEL ================= */
    console.log("➡️ Reading Excel buffer...");
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    console.log("📄 Sheet name:", sheetName);

    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log("📊 Total rows extracted:", rows.length);

    /* ================= HEADER VALIDATION ================= */
    console.log("🔍 HEADER ROWS INSPECTION:");
    console.log("ROW 0 (Exam Row):", rows[0]);
    console.log("ROW 1 (Ignored/Merged):", rows[1]);
    console.log("ROW 2 (CO Row):", rows[2]);

    if (rows.length < 4) {
      console.log("❌ Invalid Excel format");
      return res.status(400).json({ success: false, message: "Invalid Excel structure" });
    }

    const examRowRaw = rows[0];
    const coRowRaw = rows[2];        // ⚠️ IMPORTANT
    const studentRows = rows.slice(3);

    console.log("👨‍🎓 Student rows count:", studentRows.length);

    /* ================= FORWARD FILL EXAM ROW ================= */
    console.log("➡️ Forward-filling EXAM row...");
    let lastExam = null;
    const examRow = examRowRaw.map((cell, index) => {
      if (cell && cell !== "Total" && cell !== "Reg No") {
        lastExam = cell;
      }
      return lastExam;
    });

    console.log("✅ RESOLVED EXAM ROW:", examRow);

    /* ================= FORWARD FILL CO ROW ================= */
    console.log("➡️ Forward-filling CO row...");
    let lastCO = null;
    const coRow = coRowRaw.map((cell, index) => {
      if (cell && cell !== "Total") {
        lastCO = cell;
      }
      return lastCO;
    });

    console.log("✅ RESOLVED CO ROW:", coRow);

    /* ================= PARSE STUDENT DATA ================= */
    console.log("➡️ Parsing student data...");
    const records = [];

    studentRows.forEach((row, rowIndex) => {
      console.log(`\n🧑 Processing row ${rowIndex + 4}:`, row);

      const regNo = row[0];
      if (!regNo) {
        console.log("⚠️ Skipped (empty regNo)");
        return;
      }

      const exams = {};

      for (let col = 1; col < row.length; col++) {
        const exam = examRow[col];
        const co = coRow[col];
        const marks = row[col];

        console.log(`➡️ COL ${col}`, {
          exam,
          co,
          marks
        });

        if (!exam) {
          console.log("⏭️ Skipped: exam undefined");
          continue;
        }

        if (!co) {
          console.log("⏭️ Skipped: co undefined");
          continue;
        }

        if (co === "Total") {
          console.log("⏭️ Skipped: Total column");
          continue;
        }

        if (!exams[exam]) {
          exams[exam] = {};
        }

        exams[exam][co] = typeof marks === "number" ? marks : 0;
      }

      console.log(`✅ Parsed exams for ${regNo}:`, exams);

      records.push({ regNo, exams });
    });

    console.log("\n📦 FINAL RECORDS OBJECT:");
    console.dir(records, { depth: null });

    /* ================= DATABASE INSERT ================= */
    if (!records.length) {
      console.log("❌ No valid records to insert");
      return res.status(400).json({ success: false, message: "No valid student data" });
    }

    console.log("➡️ Preparing bulkWrite operations...");
    const bulkOps = records.map(r => ({
      updateOne: {
        filter: { regNo: r.regNo },
        update: { $set: { exams: r.exams } },
        upsert: true
      }
    }));

    console.log("🚀 bulkWrite ops count:", bulkOps.length);

    const result = await Marks.bulkWrite(bulkOps);
    console.log("✅ MongoDB bulkWrite result:", result);

    console.log("========== EXCEL UPLOAD END ==========");

    res.json({
      success: true,
      studentsInserted: records.length
    });

  } catch (error) {
    console.error("🔥 EXCEL UPLOAD ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { handleExcelUpload };



// // controllers/excelController.js
// const xlsx = require("xlsx");
// const Marks = require("../models/uploadMarks");

// async function handleExcelUpload(req, res) {
//   try {
//     const workbook = xlsx.readFile(req.file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = xlsx.utils.sheet_to_json(sheet, { defval: 0 });

//     console.log("Excel rows:", rows);

//     let count = 0;

//     for (let row of rows) {
//       if (!row.regNo) {
//         console.log("Skipping row (no regNo):", row);
//         continue;
//       }

//       const data = {
//         regNo: row.regNo,
//         exams: {}
//       };

//       for (let key in row) {
//         if (key === "regNo") continue;

//         const parts = key.split("_");
//         if (parts.length !== 2) continue;

//         const exam = parts[0];
//         const co = parts[1];

//         if (!data.exams[exam]) {
//           data.exams[exam] = {};
//         }

//         data.exams[exam][co] = row[key];
//       }

//       await Marks.findOneAndUpdate(
//         { regNo: data.regNo },
//         data,
//         { upsert: true }
//       );

//       count++;
//     }

//     return res.json({
//       success: true,
//       message: "Data saved to MongoDB",
//       recordsSaved: count
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: err.message });
//   }
// }

// module.exports = { handleExcelUpload };
