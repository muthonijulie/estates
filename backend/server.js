const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
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
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middleware/auth');

// REMOVED OLD MULTER CONFIG - Using dedicated uploadMiddleware.js instead
// The uploadMiddleware.js handles property image uploads with 25MB limits

// CORS configuration with more permissive settings to avoid CORS errors
app.use(cors({
    origin: function(origin, callback) {
        // Allow any origin
        callback(null, true);
    },
    
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    maxAge: 86400
}));

// Body parsing middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// FIXED: MongoDB connection without deprecated options
const connectDB = async () => {
    try {
        // Removed useNewUrlParser and useUnifiedTopology (deprecated in v4.0+)
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        
        // Fallback connection attempts
        console.log("Attempting fallback connection strategies...");
        
        // Try with explicit options if needed
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log("MongoDB Connected via fallback method");
        } catch (fallbackError) {
            console.error("Fallback connection also failed:", fallbackError);
            process.exit(1);
        }
    }
};

// Connect to database
connectDB();

// Session configuration (after DB connection)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_key_here',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // Session TTL (1 day)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Authentication middleware for admin pages
app.use('/admin', (req, res, next) => {
    // Allow access to login page and assets without authentication
    if (req.path === '/login.html' || 
        req.path.startsWith('/assets/') || 
        req.path.startsWith('/css/') || 
        req.path.startsWith('/js/')) {
        return next();
    }

    // Check if user is authenticated
    if (req.session && req.session.adminId && req.session.isAuthenticated) {
        return next();
    }

    // If not authenticated, redirect to login page
    return res.redirect('/admin/login.html');
});

// API Routes
app.use('/api/v1', viewRoutes);
app.use('/api/v1', propertyRoutes);
app.use('/api/v1', contactRoutes);
app.use('/api/v1', rentalRoutes);
app.use('/api/v1', bookingRoutes);
app.use('/api/v1', blogRoutes); 
app.use('/api/test-email', testEmailRoutes);
app.use('/api/auth', authRoutes);

const port_number = process.env.PORT || 5000;

// Health check route
app.get('/', (req, res) => {
    res.send("Server is Healthy 😂😂😂");
});

// Authentication check API endpoint
app.get('/api/check-auth', isAuthenticated, (req, res) => {
    res.status(200).json({
        success: true,
        isAuthenticated: true,
        admin: {
            id: req.admin._id,
            username: req.admin.username
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 25MB for property images.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 20 gallery images allowed.'
            });
        }
    }
    
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            success: false,
            message: 'Only image files (JPG, PNG, GIF, WebP) are allowed.'
        });
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