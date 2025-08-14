const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const Property = require('./models/Property');
const multer = require('multer');

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

// CRITICAL: Trust proxy for HTTPS deployment
app.set('trust proxy', 1);

// CORS configuration with enhanced settings for HTTPS/HTTP compatibility
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests from both HTTP and HTTPS
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://209.74.89.145:5000',
            'https://www.werentonline.com', 
            'https://api.werentonline.com/api/v1', // Replace with your actual domain
            // Add your actual production domain here
        ];
        
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        // Allow all origins in development
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // Check allowed origins in production
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        callback(null, true); // For now, allow all - tighten this in production
    },
    
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'Accept', 
        'Origin',
        'X-Forwarded-Proto',
        'X-Forwarded-For'
    ],
    credentials: true,
    maxAge: 86400,
    optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Force HTTPS redirect in production (if needed)
app.use((req, res, next) => {
    // Skip redirect for localhost and development
    if (req.hostname === 'localhost' || req.hostname === '127.0.0.1' || process.env.NODE_ENV !== 'production') {
        return next();
    }
    
    // Force HTTPS in production
    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});

// Body parsing middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ENHANCED STATIC FILE SERVING with better CORS and security headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        // Enhanced CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        // Cache control
        res.setHeader('Cache-Control', 'public, max-age=86400');
        
        // Security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Set proper MIME types
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };
        
        if (mimeTypes[ext]) {
            res.setHeader('Content-Type', mimeTypes[ext]);
        }
    },
    maxAge: '1d'
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

connectDB();

// Session configuration with HTTPS support
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_key_here',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Auto-detect HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    },
    name: 'sessionId'
}));

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

// ENHANCED IMAGE PROXY ENDPOINT - Critical for HTTPS compatibility
app.get('/api/proxy-image/:imagePath(*)', (req, res) => {
    // Double decode to handle potential double encoding
    let imagePath = decodeURIComponent(decodeURIComponent(req.params.imagePath));
    
    console.log('🖼️ Image proxy request for:', imagePath);
    console.log('🔍 Original param:', req.params.imagePath);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    const possiblePaths = [
        path.join(__dirname, imagePath),
        path.join(__dirname, 'uploads', imagePath),
        path.join(__dirname, 'uploads/properties', path.basename(imagePath)),
        path.join(__dirname, 'uploads', path.basename(imagePath)),
        // Additional fallbacks for different path structures
        path.join(__dirname, imagePath.replace('uploads/', '')),
        path.join(__dirname, 'uploads/properties', imagePath.replace(/^.*\//, '')),
    ];
    
    console.log('🔍 Searching in paths:', possiblePaths);
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log('✅ Image found at:', filePath);
            
            // Set proper content type
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml'
            };
            
            if (mimeTypes[ext]) {
                res.setHeader('Content-Type', mimeTypes[ext]);
            }
            
            return res.sendFile(path.resolve(filePath));
        }
    }
    
    console.warn('❌ Image not found:', imagePath);
    
    // Try to serve placeholder if available
    const placeholderPath = path.join(__dirname, 'public/assets/images/final.png');
    if (fs.existsSync(placeholderPath)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(path.resolve(placeholderPath));
    }
    
    res.status(404).json({
        error: 'Image not found',
        requestedPath: imagePath,
        originalParam: req.params.imagePath,
        searchedPaths: possiblePaths.map(p => ({
            path: p,
            exists: fs.existsSync(p)
        }))
    });
});

// Alternative proxy endpoint with different route structure
app.get('/api/images/:folder?/:filename', (req, res) => {
    const folder = req.params.folder;
    const filename = req.params.filename || folder; // Handle case where folder is actually filename
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    const possiblePaths = [
        folder && filename !== folder 
            ? path.join(__dirname, 'uploads', folder, filename)
            : path.join(__dirname, 'uploads/properties', filename || folder),
        path.join(__dirname, 'uploads', filename || folder)
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg', 
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp'
            };
            
            if (mimeTypes[ext]) {
                res.setHeader('Content-Type', mimeTypes[ext]);
            }
            
            return res.sendFile(path.resolve(filePath));
        }
    }
    
    res.status(404).send('Image not found');
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

// ENHANCED HEALTH CHECK
app.get('/', (req, res) => {
    res.json({
        status: "Server is Healthy 😂😂😂",
        timestamp: new Date().toISOString(),
        protocol: req.protocol,
        host: req.get('host'),
        secure: req.secure,
        environment: process.env.NODE_ENV || 'development',
        uploadsPath: path.join(__dirname, 'uploads'),
        staticFilesServed: ['/uploads', '/public', '/static', '/files'],
        corsEnabled: true,
        proxyEndpoints: [
            '/api/proxy-image/:imagePath',
            '/api/images/:folder/:filename'
        ]
    });
});

// Alternative health endpoint
app.get('/health', (req, res) => {
    const uploadsPath = path.join(__dirname, 'uploads');
    const propertiesPath = path.join(__dirname, 'uploads/properties');
    
    res.json({
        status: 'OK',
        server: `${req.protocol}://${req.get('host')}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        paths: {
            uploads: uploadsPath,
            properties: propertiesPath,
            uploadsExists: fs.existsSync(uploadsPath),
            propertiesExists: fs.existsSync(propertiesPath)
        },
        cors: 'enabled',
        https: req.secure,
        protocol: req.protocol
    });
});

// Enhanced file listing endpoint
app.get('/api/files/list', (req, res) => {
    try {
        const uploadsPath = path.join(__dirname, 'uploads');
        const propertiesPath = path.join(__dirname, 'uploads/properties');
        
        let files = {
            uploads: [],
            properties: []
        };
        
        const protocol = req.secure ? 'https' : 'http';
        const host = req.get('host');
        
        if (fs.existsSync(uploadsPath)) {
            files.uploads = fs.readdirSync(uploadsPath)
                .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                .map(filename => ({
                    filename,
                    url: `${protocol}://${host}/uploads/${filename}`,
                    proxyUrl: `${protocol}://${host}/api/proxy-image/uploads/${filename}`
                }));
        }
        
        if (fs.existsSync(propertiesPath)) {
            files.properties = fs.readdirSync(propertiesPath)
                .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                .map(filename => ({
                    filename,
                    url: `${protocol}://${host}/uploads/properties/${filename}`,
                    proxyUrl: `${protocol}://${host}/api/proxy-image/uploads/properties/${filename}`
                }));
        }
        
        res.json({ 
            files,
            serverInfo: {
                protocol,
                host,
                secure: req.secure
            }
        });
    } catch (error) {
        console.error('❌ Error listing files:', error);
        res.status(500).json({ error: 'Could not list files' });
    }
});

// Enhanced test image endpoint
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
            
            // Set proper headers
            const ext = path.extname(imagePath).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp'
            };
            
            if (mimeTypes[ext]) {
                res.setHeader('Content-Type', mimeTypes[ext]);
            }
            
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            
            return res.sendFile(path.resolve(imagePath));
        }
    }
    
    res.status(404).json({
        error: 'Image not found',
        tested: possiblePaths,
        exists: possiblePaths.map(p => ({ 
            path: p, 
            exists: fs.existsSync(p),
            isFile: fs.existsSync(p) ? fs.statSync(p).isFile() : false
        }))
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

// Listen on all interfaces
app.listen(port_number, '0.0.0.0', () => {
    console.log('🚀 Server Configuration:');
    console.log(`   - Server running on: http://209.74.89.145:${port_number}`);
    console.log(`   - Local access: http://localhost:${port_number}`);
    console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Uploads path: ${path.join(__dirname, 'uploads')}`);
    console.log('   - CORS: Enabled for all origins');
    console.log('   - Static files served from: /uploads, /public, /static, /files');
    console.log('   - Image proxy endpoints: /api/proxy-image/* and /api/images/*');
    console.log('');
    console.log('🧪 Test endpoints:');
    console.log(`   Health: http://209.74.89.145:${port_number}/health`);
    console.log(`   Files:  http://209.74.89.145:${port_number}/api/files/list`);
    console.log(`   Test:   http://209.74.89.145:${port_number}/test-image/your-image.jpg`);
    console.log(`   Proxy:  http://209.74.89.145:${port_number}/api/proxy-image/uploads/properties/your-image.jpg`);
});