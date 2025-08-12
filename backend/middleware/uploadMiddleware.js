const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure local storage for property images
const propertyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/properties';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: propertytype-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure local storage for gallery images
const galleryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/gallery';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Main image upload (single) - Large file sizes for real estate
const uploadMainImage = multer({
    storage: propertyStorage,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB for high-quality property images
    },
    fileFilter: imageFilter
});

// Gallery images upload (multiple) - Large file sizes for real estate
const uploadGalleryImages = multer({
    storage: galleryStorage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB per gallery image
        files: 20 // Allow up to 20 gallery images
    },
    fileFilter: imageFilter
});

module.exports = {
    uploadMainImage,
    uploadGalleryImages
};