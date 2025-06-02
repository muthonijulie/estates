const express = require('express');
const { createProperty, getProperties, getPropertyById, updateProperty, deleteProperty } = require('../controllers/propertyController');
const router = express.Router();

// Route to create a new property
router.post('/properties', createProperty);
// Route to get all properties
router.get('/properties', getProperties);

// Route to get a property by ID
router.get('/properties/:id', getPropertyById);

module.exports = router;