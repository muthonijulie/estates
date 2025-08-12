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

// Import the CORRECT middleware exports
const { uploadImages, handleUploadError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Routes with the fixed middleware
router.route('/')
    .get(getProperties)
    .post(uploadImages, handleUploadError, createProperty);

router.route('/:id')
    .get(getPropertyById)
    .put(uploadImages, handleUploadError, updateProperty)
    .delete(deleteProperty);

router.route('/:id/status')
    .patch(updatePropertyStatus);

router.route('/:id/gallery')
    .get(getPropertyGallery);

module.exports = router;