const express=require('express');
const app=express();

require("dotenv").config();

const cors=require('cors');



const port_number=process.env.PORT ||5000;


app.use(cors());

//routes

app.get('/',(req,res)=>{
    res.send("Server is Healthy 😂😂😂");
})


app.listen(port_number,()=>{
    console.log(`Server is running on http://localhost:${port_number}`);
  
})