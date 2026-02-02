const express = require('express')
const path = require("path");
require('dotenv').config();

const { connectMongoDB } = require("./connection")


//require routers
const userRoute  = require('./routes/user')
const staticRouter  = require('./routes/staticRouter')
const subjectRoute  = require('./routes/subject')
const marks  = require('./routes/marks')
// const calculatedMarks = require('./routes/calculatedMarks')



const app = express()

const PORT = process.env.PORT
const mongoUri = process.env.MONGO_URI

// Middelewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
// app.use("/calculatedMarks", calculatedMarks)


app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`);
})