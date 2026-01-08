const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    facultyId:
    {
       type: Number,
        require: true,
        unique: true
    },
   name:
    {
       type: String,
        require: true,
    },
   email:
    {
       type: String,
        require: true,
        unique: true
    },
    password: {
    type: String,
    default: "cadept@1234"
  }
});

const URL = mongoose.model('users', urlSchema);
module.exports = URL;