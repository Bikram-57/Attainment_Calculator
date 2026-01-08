const express = require('express')
const path = require("path");

const { connectMongoDB } = require("./connection")


//require routers
const userRoute  = require('./routes/user')
const staticRouter  = require('./routes/staticRouter')



const app = express()

const PORT = 8000


// Middelewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//MongoDB connection 
connectMongoDB('mongodb://127.0.0.1:27017/Attainment_Calculator')
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


app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`);
})