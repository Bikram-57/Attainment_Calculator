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

// // module.exports = mongoose.model('CoPoMapping', CoPoMappingSchema);
// module.exports = mongoose.models.CoPoMapping || mongoose.model('CoPoMapping', CoPoMappingSchema);



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
    // This stores the actual grid including both POs and PSOs: 
    // Example: { "CO1": { "PO1": 3, "PO2": 2, ..., "PSO1": 2, "PSO2": 3, "PSO3": 1 }, "CO2": {...} }
    mappingData: { 
        type: Object, 
        required: true 
    },
    uploadedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { collection: 'copomappings' });

// Indexing ensures we don't get duplicate mappings for the same subject/year/course
CoPoMappingSchema.index({ subjectId: 1, academicYear: 1, course: 1 }, { unique: true });

module.exports = mongoose.models.CoPoMapping || mongoose.model('CoPoMapping', CoPoMappingSchema);