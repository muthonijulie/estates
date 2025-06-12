const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const session = require('express-session'); // Add this
const MongoStore = require('connect-mongo'); // Add this
const Property = require('./models/Property');

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
const authRoutes = require('./routes/loginRoutes');

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/properties';
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

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit per file
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// CORS configuration - MUST come before routes
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000', 'https://estates-eosin.vercel.app'],
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

// Session configuration - ADD THIS AFTER DATABASE CONNECTION
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-fallback-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files - ADD THIS
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Import auth middleware for protected routes
const { authenticateSession } = require('./middleware/auth');

// Routes - AFTER CORS and session configuration
app.use('/api/v1', viewRoutes);
app.use('/api/v1', propertyRoutes);
app.use('/api/v1', contactRoutes);
app.use('/api/v1', rentalRoutes);
app.use('/api/v1', bookingRoutes);
app.use('/api/v1', blogRoutes); 
app.use('/api/test-email', testEmailRoutes);
app.use('/api/auth', authRoutes); // Changed from '/auth' to '/api/auth' to match frontend

// Admin routes - ADD THESE
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/dashboard', authenticateSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Could not log out'
            });
        }
        res.clearCookie('connect.sid');
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

const port_number = process.env.PORT || 5000;

// Health check route
app.get('/', (req, res) => {
    res.send("Server is Healthy 😂😂😂");
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.listen(port_number, () => {
    console.log(`Server is running on http://localhost:${port_number}`);
});