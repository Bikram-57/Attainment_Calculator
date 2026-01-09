
const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    required: true,
    unique: true
  },
  subjectName: {
    type: String,
    required: true,
    unique: true
  },
  course: {
    type: String,
    required: true
  }
});


const SUB = mongoose.model('subjectList', subjectSchema);
module.exports = SUB;