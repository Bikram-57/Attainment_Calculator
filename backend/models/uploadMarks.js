const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    regNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    exams: {
      type: Map,
      of: {
        type: Map,
        of: Number
      },
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Marks", marksSchema);




// const mongoose = require("mongoose");

// const marksSchema = new mongoose.Schema(
//   {
//     regNo: {
//       type: Number,
//       required: true,
//       unique: true
//     },

//     // Dynamic exam → CO → marks structure
//     exams: {
//       type: Map,
//       of: {
//         type: Map,
//         of: Number
//       },
//       default: {}
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// module.exports = mongoose.model("Marks", marksSchema);
