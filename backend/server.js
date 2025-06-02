const express=require('express');
const app=express();

require("dotenv").config();

const cors=require('cors');
const mongoose=require('mongoose');
//connecting to the database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
//middleware
app.use(express.json());
//importing routes



const port_number=process.env.PORT ||5000;


app.use(cors());

//routes

app.get('/',(req,res)=>{
    res.send("Server is Healthy 😂😂😂");
})


app.listen(port_number,()=>{
    console.log(`Server is running on http://localhost:${port_number}`);
  
})