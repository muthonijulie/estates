const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure local storage for ALL property images (main + gallery)
const propertyStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/properties';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with field name prefix
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'mainImage' ? 'main' : 'gallery';
        cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Single upload handler for both main and gallery images
const uploadPropertyImages = multer({
    storage: propertyStorage,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB for high-quality property images
        files: 21 // 1 main + 20 gallery images max
    },
    fileFilter: imageFilter
});

// Middleware to handle both main image and gallery images in one go
const uploadImages = uploadPropertyImages.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 20 }
]);

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 25MB per image.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 20 gallery images allowed.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field. Use "mainImage" and "galleryImages" field names.'
            });
        }
    }
    
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            success: false,
            message: 'Only image files (JPG, PNG, GIF, WebP) are allowed.'
        });
    }
    
    next(error);
};

module.exports = {
    uploadImages,
    handleUploadError
};