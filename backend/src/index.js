const express = require("express")
const path = require("path");
const dotenv = require("dotenv"); 
const cors = require("cors");
const connectDB = require("./Dbconfig/dbconfig")

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express()

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/user", require("./Route/UserRoute")); 

const port = 5002


app.get("/",(req,res)=>{
    res.send('connected')
})


connectDB()

app.listen(port, ()=>{
    console.log(`app is running on port ${port}`)

})