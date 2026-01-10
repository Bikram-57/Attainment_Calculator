const express = require('express')
const path = require("path");
require('dotenv').config();

const { connectMongoDB } = require("./connection")


//require routers
const userRoute  = require('./routes/user')
const subjectRoute  = require('./routes/subject')
const staticRouter  = require('./routes/staticRouter')
const marksRoute  = require('./routes/uploadMarks')



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
app.use("/subject", subjectRoute)
app.use("/", staticRouter)
app.use("/marks", marksRoute)


app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`);
})