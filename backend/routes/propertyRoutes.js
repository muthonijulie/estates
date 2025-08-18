const express = require('express');
const { 
    getPropertyGallery,
    createProperty, 
    getProperties, 
    getPropertyById, 
    updateProperty, 
    deleteProperty 
} = require('../controllers/propertyController');

const router = express.Router();
router.get('/properties/:id/gallery', getPropertyGallery);
// Route to create a new property
router.post('/properties', createProperty);

// Route to get all properties
router.get('/properties', getProperties);

// Route to get a property by ID
router.get('/properties/:id', getPropertyById);

// Route to update a property by ID
router.put('/properties/:id', updateProperty);

// Route to delete a property by ID
router.delete('/properties/:id', deleteProperty);

module.exports = router;