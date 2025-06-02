const express=require('express');
const app=express();
require("dotenv").config();
const cors=require('cors');



const port_number=process.env.PORT ||4000;


//using middleware globally
app.use(cors());

//routes


app.listen(port_number,()=>{
    console.log(`Server is running on http://localhost:${port_number}`);
  
})