const path = require('path');

// ============================================================================
// HELPER: Reusable File Downloader
// ============================================================================
/**
 * Handles the construction of the file path and the Express download response.
 * 
 * @param {Object} res - The Express response object
 * @param {String} relativePath - Path to the file relative to this script's directory
 * @param {String} fileName - The name the file should have when downloaded by the user
 */
const downloadFile = (res, relativePath, fileName) => {
    // 1. Construct the absolute path safely across different operating systems
    const filePath = path.join(__dirname, relativePath);

    // 2. Trigger the file download
    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error(`Error downloading ${fileName}:`, err.message);

            // 3. Prevent crashing by ensuring headers haven't already been sent 
            // (e.g., if the download fails halfway through)
            if (!res.headersSent) {
                res.status(404).json({
                    success: false,
                    message: `The requested file '${fileName}' could not be found or accessed.`
                });
            }
        }
    });
};

// ============================================================================
// CONTROLLERS
// ============================================================================

// @desc    Download the standard data upload format Excel file
// @route   GET /api/downloads/format
const handleFormatDownload = (req, res) => {
    downloadFile(
        res,
        '../public/uploadDataFormat/uploadDataFormat.xlsx',
        'uploadDataFormat.xlsx'
    );
};

// @desc    Download the subject assignment upload format Excel file
// @route   GET /api/downloads/assign-subject-format
const handleUploadAssignSubjectDownload = (req, res) => {
    downloadFile(
        res,
        '../public/uploadAssignSubjectFormat/Upload-All-Assign-Subjects.xlsx',
        'Upload-All-Assign-Subjects.xlsx'
    );
};

// @desc    Download the CO-PO Mapping upload format Excel file

const handleCoPoMappingFormatDownload = (req, res) => {
    downloadFile(
        res,
        '../public/uploadCoPoMappingFormat/uploadCoPoMapping.xlsx',
        'uploadCoPoMapping.xlsx'
    );
};


// @desc    Download the Subject upload format Excel file

const handleUploadAllSubjectFormatDownload = (req, res) => {
    downloadFile(
        res,
        '../public/uploadAllSubjectFormat/Upload_all_subjects.xlsx',
        'uploadCoPoMapping.xlsx'
    );
};


module.exports = {
    handleFormatDownload,
    handleUploadAssignSubjectDownload,
    handleCoPoMappingFormatDownload,
    handleUploadAllSubjectFormatDownload,
};


// const path = require('path');

// const handleFormatDownload = (req, res) => {
//   // 1. Construct the exact path to format.xlsx based on your folder structure
//   const filePath = path.join(__dirname, '../public/uploadDataFormat/uploadDataFormat.xlsx');

//   // 2. Force the browser to download the file, naming it "format.xlsx"
//   res.download(filePath, 'uploadDataFormat.xlsx', (err) => {
//     if (err) {
//       console.error("Error downloading format file:", err);
//       // Only send an error response if the headers haven't already been sent
//       if (!res.headersSent) {
//         res.status(404).json({ error: "Format file could not be found." });
//       }
//     }
//   });
// };

// const handleUploadAssignSubjectDownload = (req, res) => {
//   // 1. Construct the exact path to format.xlsx based on your folder structure
//   const filePath = path.join(__dirname, '../public/uploadAssignSubjectFormat/Upload-All-Assign-Subjects.xlsx');

//   // 2. Force the browser to download the file, naming it "Upload-All-Assign-Subjects.xlsx"
//   res.download(filePath, 'Upload-All-Assign-Subjects.xlsx', (err) => {
//     if (err) {
//       console.error("Error downloading format file:", err);
//       // Only send an error response if the headers haven't already been sent
//       if (!res.headersSent) {
//         res.status(404).json({ error: "Format file could not be found." });
//       }
//     }
//   });
// };

// module.exports = {
//   handleFormatDownload,
//   handleUploadAssignSubjectDownload
// };