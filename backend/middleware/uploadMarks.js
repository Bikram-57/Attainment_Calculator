const multer = require("multer");

// Use memory storage (NO permanent file save)
const storage = multer.memoryStorage();

// File filter (ONLY .xlsx allowed)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.originalname.endsWith(".xlsx")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only .xlsx Excel files are allowed."),
      false
    );
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 5 MB limit
  }
});

module.exports = upload;



// // middlewares/upload.js
// const multer = require("multer");
// const path = require("path");

// // storage config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });

// // file filter (only excel files)
// function fileFilter(req, file, cb) {
//   const ext = path.extname(file.originalname);

//   if (ext === ".xls" || ext === ".xlsx") {
//     cb(null, true);
//   } else {
//     cb(new Error("Only Excel files are allowed"));
//   }
// }

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter
// });

// module.exports = upload;
