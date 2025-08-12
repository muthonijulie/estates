const express = require('express');
const {
    getPropertyGallery,
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    updatePropertyStatus
} = require('../controllers/propertyController');
const { uploadMainImage, uploadGalleryImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Configure multer fields for property creation/update
const uploadFields = [
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 20 } // Allow up to 20 gallery images
];

// Routes
router.route('/')
    .get(getProperties)
    .post(uploadMainImage.fields(uploadFields), createProperty);

router.route('/:id')
    .get(getPropertyById)
    .put(uploadMainImage.fields(uploadFields), updateProperty)
    .delete(deleteProperty);

router.route('/:id/status')
    .patch(updatePropertyStatus);

router.route('/:id/gallery')
    .get(getPropertyGallery);

module.exports = router;