const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Property= require('./models/Property');

require("dotenv").config();

const cors = require('cors');
const mongoose = require('mongoose');
const viewRoutes = require('./routes/ViewRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const contactRoutes = require("./routes/contactRoutes");
const rentalRoutes = require('./routes/rentalRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testEmailRoutes = require('./routes/testEmail');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'WeRent/admin/uploads/gallery'; // Relative path
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Fix upload controller
exports.uploadGallery = [
    upload.array('images', 10), // ✅ Use configured instance
    async (req, res) => {
        try {
            const filePaths = req.files.map(file => `/${file.filename}`);
            
            await Property.findByIdAndUpdate(req.params.id, {
                $push: { galleryImages: { $each: filePaths } }
            });
            
            res.json({ success: true, uploaded: filePaths });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];



// CORS configuration - MUST come before routes
app.use(cors());
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000','https://estates-eosin.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connecting to the database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

// Routes - AFTER CORS configuration
app.use('/api/v1', viewRoutes);
app.use('/api/v1', propertyRoutes);
app.use('/api/v1', contactRoutes);
app.use('/api/v1', rentalRoutes);
app.use('/api/v1', bookingRoutes);
app.use('/api/v1', blogRoutes); 
app.use('/api/test-email', testEmailRoutes);
app.use('/WeRent/admin/uploads/gallery', express.static('WeRent/admin/uploads/gallery'));

const port_number = process.env.PORT || 5000;

// Health check route
app.get('/', (req, res) => {
    res.send("Server is Healthy 😂😂😂");
});

app.listen(port_number, () => {
    console.log(`Server is running on http://localhost:${port_number}`);
});