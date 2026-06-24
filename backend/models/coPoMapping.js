// const mongoose = require('mongoose');

// const CoPoMappingSchema = new mongoose.Schema({
//     subjectId: { 
//         type: String, 
//         required: true, 
//         uppercase: true 
//     },
//     academicYear: { 
//         type: String, 
//         required: true 
//     },
//     course: { 
//         type: String, 
//         required: true, 
//         uppercase: true 
//     },
//     // This stores the actual grid: { "CO1": { "PO1": 3, "PO2": 2 }, "CO2": {...} }
//     mappingData: { 
//         type: Object, 
//         required: true 
//     },
//     uploadedAt: { 
//         type: Date, 
//         default: Date.now 
//     }
// }, { collection: 'copomappings' });

// // Indexing ensures we don't get duplicate mappings for the same subject/year
// CoPoMappingSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

// module.exports = mongoose.model('CoPoMapping', CoPoMappingSchema);













const mongoose = require('mongoose');

const CoPoMappingSchema = new mongoose.Schema({
    subjectId: { 
        type: String, 
        required: true, 
        uppercase: true 
    },
    academicYear: { 
        type: String, 
        required: true 
    },
    course: { 
        type: String, 
        required: true, 
        uppercase: true 
    },
    // This stores the actual grid: { "CO1": { "PO1": 3, "PO2": 2 }, "CO2": {...} }
    mappingData: { 
        type: Object, 
        required: true 
    },
    
    // --- NEW: Upload and Pending Section ---
    status: {
        type: String,
        enum: ['pending', 'Uploaded'], // Restricts values to these three states
        default: 'pending'                         // Automatically sets to pending on upload
    },
    uploadedBy: {
        type: String, // Change to `mongoose.Schema.Types.ObjectId` if referencing a User model
        required: false // Consider making this `true` if you need strict audit trails
    },
    // ---------------------------------------

    uploadedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { collection: 'copomappings' });

// Indexing ensures we don't get duplicate mappings for the same subject/year
CoPoMappingSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CoPoMapping', CoPoMappingSchema);