const path = require('path');

const handleFormatDownload = (req, res) => {
  // 1. Construct the exact path to format.xlsx based on your folder structure
  const filePath = path.join(__dirname, '../public/uploadDataFormat/format.xlsx');

  // 2. Force the browser to download the file, naming it "format.xlsx"
  res.download(filePath, 'format.xlsx', (err) => {
    if (err) {
      console.error("Error downloading format file:", err);
      // Only send an error response if the headers haven't already been sent
      if (!res.headersSent) {
        res.status(404).json({ error: "Format file could not be found." });
      }
    }
  });
};

const handleUploadAssignSubjectDownload = (req, res) => {
  // 1. Construct the exact path to format.xlsx based on your folder structure
  const filePath = path.join(__dirname, '../public/uploadAssignSubjectFormat/Upload-All-Assign-Subjects.xlsx');

  // 2. Force the browser to download the file, naming it "Upload-All-Assign-Subjects.xlsx"
  res.download(filePath, 'Upload-All-Assign-Subjects.xlsx', (err) => {
    if (err) {
      console.error("Error downloading format file:", err);
      // Only send an error response if the headers haven't already been sent
      if (!res.headersSent) {
        res.status(404).json({ error: "Format file could not be found." });
      }
    }
  });
};

module.exports = { handleFormatDownload, handleUploadAssignSubjectDownload };