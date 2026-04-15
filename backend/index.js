const express = require('express')
const path = require("path");
require('dotenv').config();

const { connectMongoDB } = require("./connection")


//require routers
const userRoute = require('./routes/user')
const staticRouter = require('./routes/staticRouter')
const subjectRoute = require('./routes/subject')
const marks = require('./routes/marks')
const coPoMapping = require('./routes/coPoMapping')
const assignSubject = require('./routes/assignSubject')



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

app.use("/user", userRoute)
app.use("/", staticRouter)
app.use("/sub", subjectRoute)
app.use("/mark", marks)
app.use("/co-po", coPoMapping)
app.use("/assignSub", assignSubject)



app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`);
})