const express = require('express')
const path = require("path");
const cookieParser = require('cookie-parser');

require('dotenv').config();

const { connectMongoDB } = require("./connection")


//require routers
const userRoute = require('./routes/user')
const staticRouter = require('./routes/staticRouter')
const subjectRoute = require('./routes/subject')
const marks = require('./routes/marks')
const coPoMapping = require('./routes/coPoMapping')
const assignSubject = require('./routes/assignSubject')
const calculatedPo = require('./routes/calculatedPo')
const directPoAttain = require('./routes/directPoAttainment')
const uploadAllSubjects = require('./routes/uploadAllSubjects')
const uploadRubrics = require('./routes/rubrics')
const downloadReport = require('./routes/downloadReport')
const login = require('./routes/login')
const forgotPassword = require('./routes/forgotPassword')



const app = express()

const PORT = process.env.PORT
const mongoUri = process.env.MONGO_URI

// Middelewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


//MongoDB connection 
connectMongoDB(mongoUri)
    .then(() => {
        console.log("MongoDB Connected!");

    })
    .catch((err) => {
        console.log("Error: ", err);
    }
    )


// View engine setup
app.set('view engine', "ejs")
app.set("views", path.resolve("./view"))


// All Routes

app.use("/", staticRouter)
app.use("/user", userRoute)
app.use("/sub", subjectRoute)
app.use("/mark", marks)
app.use("/co-po", coPoMapping)
app.use("/assignSub", assignSubject)
app.use("/calpo", calculatedPo)
app.use("/directpo", directPoAttain)
app.use("/uploadAll", uploadAllSubjects)
app.use("/rubrics", uploadRubrics)
app.use("/file", downloadReport)
app.use("/login", login)
app.use("/forgot", forgotPassword)



app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`);
})