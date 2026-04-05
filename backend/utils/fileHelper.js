const fs = require('fs').promises;
const path = require('path');

/**
 * Deletes an uploaded image from the server if it exists in the uploads folder.
 * @param {string} imagePath - The path stored in the database (e.g., /uploads/image.jpg)
 */
const deleteUploadedImage = async (imagePath) => {
    // Only delete if it's an uploaded image, NOT a default image
    if (imagePath && imagePath.startsWith('/uploads/')) {
        // Construct the absolute path to the file on your computer/server
        const fullPath = path.join(__dirname, '../public', imagePath);
        
        try {
            // Attempt to physically delete the file
            await fs.unlink(fullPath);
        } catch (error) {
            console.error(`Failed to delete old image at ${fullPath}:`, error.message);
            // We only log the error instead of crashing the app. 
            // This prevents errors if the file was already manually deleted.
        }
    }
};

module.exports = { deleteUploadedImage };
