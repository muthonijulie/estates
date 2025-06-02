const express=require('express');
const app=express();

require("dotenv").config();

const cors=require('cors');
const mongoose=require('mongoose');
const viewRoutes = require('./routes/ViewRoutes');

//connecting to the database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//importing routes
app.use('/api/v1/sales', viewRoutes);



const port_number=process.env.PORT ||5000;


app.use(cors());

//routes

app.get('/',(req,res)=>{
    res.send("Server is Healthy 😂😂😂");
})


app.listen(port_number,()=>{
    console.log(`Server is running on http://localhost:${port_number}`);
  
})