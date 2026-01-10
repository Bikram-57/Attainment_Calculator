// middlewares/upload.js
const multer = require("multer");
const path = require("path");

// storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// file filter (only excel files)
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname);

  if (ext === ".xls" || ext === ".xlsx") {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed"));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
