const express = require('express');
const {
    getPropertyGallery,
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
} = require('../controllers/propertyController');
const { uploadMainImage, uploadGalleryImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Configure multer fields for property creation/update
const uploadFields = [
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 } // Allow up to 10 gallery images
];

// Route to get property gallery
router.get('/properties/:id/gallery', getPropertyGallery);

// Route to create a new property with image uploads
router.post('/properties', 
    uploadMainImage.fields(uploadFields),
    createProperty
);

// Route to get all properties
router.get('/properties', getProperties);

// Route to get a property by ID
router.get('/properties/:id', getPropertyById);

// Route to update a property by ID with image uploads
router.put('/properties/:id',
    uploadMainImage.fields(uploadFields),
    updateProperty
);

// Route to delete a property by ID
router.delete('/properties/:id', deleteProperty);

module.exports = router;