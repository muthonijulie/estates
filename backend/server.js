const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const Property = require('./models/Property');
const multer = require('multer'); // ADD THIS - needed for error handling

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

// Handle preflight requests explicitly
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// STATIC FILE SERVING - Enhanced with proper headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        // Add CORS headers for all static files
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        
        // Set proper MIME types for images
        if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.gif')) {
            res.setHeader('Content-Type', 'image/gif');
        } else if (path.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        }
    }
}));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/files', express.static(path.join(__dirname, 'files')));

// Also serve files directly from root for backward compatibility
app.use(express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        
        // Fallback connection attempts
        console.log("Attempting fallback connection strategies...");
        
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

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_key_here',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Serve static files (duplicate removed - already handled above)
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware for admin pages
app.use('/admin', (req, res, next) => {
    if (req.path === '/login.html' || 
        req.path.startsWith('/assets/') || 
        req.path.startsWith('/css/') || 
        req.path.startsWith('/js/')) {
        return next();
    }

    if (req.session && req.session.adminId && req.session.isAuthenticated) {
        return next();
    }

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

// ENHANCED HEALTH CHECK - More informative
app.get('/', (req, res) => {
    res.json({
        status: "Server is Healthy 😂😂😂",
        timestamp: new Date().toISOString(),
        uploadsPath: path.join(__dirname, 'uploads'),
        staticFilesServed: [
            '/uploads',
            '/public', 
            '/static',
            '/files'
        ],
        corsEnabled: true
    });
});

// DEBUGGING ENDPOINTS
app.get('/health', (req, res) => {
    const uploadsPath = path.join(__dirname, 'uploads');
    const propertiesPath = path.join(__dirname, 'uploads/properties');
    
    res.json({
        status: 'OK',
        server: `http://209.74.89.145:${port_number}`,
        paths: {
            uploads: uploadsPath,
            properties: propertiesPath,
            uploadsExists: fs.existsSync(uploadsPath),
            propertiesExists: fs.existsSync(propertiesPath)
        },
        cors: 'enabled',
        timestamp: new Date().toISOString()
    });
});

// List files endpoint for debugging
app.get('/api/files/list', (req, res) => {
    try {
        const uploadsPath = path.join(__dirname, 'uploads');
        const propertiesPath = path.join(__dirname, 'uploads/properties');
        
        let files = {
            uploads: [],
            properties: []
        };
        
        if (fs.existsSync(uploadsPath)) {
            files.uploads = fs.readdirSync(uploadsPath)
                .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                .map(filename => ({
                    filename,
                    url: `http://209.74.89.145:${port_number}/uploads/${filename}`
                }));
        }
        
        if (fs.existsSync(propertiesPath)) {
            files.properties = fs.readdirSync(propertiesPath)
                .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                .map(filename => ({
                    filename,
                    url: `http://209.74.89.145:${port_number}/uploads/properties/${filename}`
                }));
        }
        
        res.json({ files });
    } catch (error) {
        console.error('❌ Error listing files:', error);
        res.status(500).json({ error: 'Could not list files' });
    }
});

// Test specific image endpoint
app.get('/test-image/:folder?/:filename', (req, res) => {
    const folder = req.params.folder || '';
    const filename = req.params.filename || req.params.folder;
    
    const possiblePaths = [
        path.join(__dirname, 'uploads', folder, filename),
        path.join(__dirname, 'uploads', 'properties', filename),
        path.join(__dirname, 'uploads', filename)
    ];
    
    console.log('🔍 Testing image paths:', possiblePaths);
    
    for (const imagePath of possiblePaths) {
        if (fs.existsSync(imagePath)) {
            console.log('✅ Found image at:', imagePath);
            return res.sendFile(imagePath);
        }
    }
    
    res.status(404).json({
        error: 'Image not found',
        tested: possiblePaths,
        exists: possiblePaths.map(p => ({ path: p, exists: fs.existsSync(p) }))
    });
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

// CRITICAL FIX: Listen on all interfaces, not just localhost
app.listen(port_number, '0.0.0.0', () => {
    console.log('🚀 Server Configuration:');
    console.log(`   - Server running on: http://209.74.89.145:${port_number}`);
    console.log(`   - Local access: http://localhost:${port_number}`);
    console.log(`   - Uploads path: ${path.join(__dirname, 'uploads')}`);
    console.log('   - CORS: Enabled for all origins');
    console.log('   - Static files served from: /uploads, /public, /static, /files');
    console.log('');
    console.log('🧪 Test endpoints:');
    console.log(`   Health: http://209.74.89.145:${port_number}/health`);
    console.log(`   Files:  http://209.74.89.145:${port_number}/api/files/list`);
    console.log(`   Test:   http://209.74.89.145:${port_number}/test-image/your-image.jpg`);
});