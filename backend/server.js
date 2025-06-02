const express=require('express');
const app=express();

require("dotenv").config();

const cors=require('cors');
const mongoose=require('mongoose');
const viewRoutes = require('./routes/ViewRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const contactRoutes=require("./routes/contactRoutes");
const bookingRoutes = require('./routes/bookingRoutes');

//connecting to the database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

//use routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//importing routes
//sales routes
app.use('/api/v1', viewRoutes);

//property routes
app.use('/api/v1', propertyRoutes);

//contact routes
app.use('/api/v1', contactRoutes);

//booking routes
app.use('/api/v1/rentals', bookingRoutes);

const port_number=process.env.PORT ||5000;


app.use(cors());

//routes

app.get('/',(req,res)=>{
    res.send("Server is Healthy 😂😂😂");
})


app.listen(port_number,()=>{
    console.log(`Server is running on http://localhost:${port_number}`);
  
})