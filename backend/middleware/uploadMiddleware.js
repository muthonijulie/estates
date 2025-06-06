const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage for property images
const propertyStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'real-estate/properties',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto' }, // Main images
        ],
    },
});

// Configure Cloudinary storage for gallery images (smaller size)
const galleryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'real-estate/gallery',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 800, height: 600, crop: 'limit', quality: 'auto' },
        ],
    },
});

// Main image upload (single)
const uploadMainImage = multer({
    storage: propertyStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// Gallery images upload (multiple)
const uploadGalleryImages = multer({
    storage: galleryStorage,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB per image
    },
});

module.exports = {
    uploadMainImage,
    uploadGalleryImages,
    cloudinary
};