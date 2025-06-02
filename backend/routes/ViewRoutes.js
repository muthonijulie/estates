const express = require('express');
const { 
    createViewing, 
    getAllViewings, 
    getViewingById, 
    getViewingsByProperty,
    updateViewingStatus,
    updateViewing,
    deleteViewing 
} = require('../controllers/viewingController');

const router = express.Router();

// Route to create a new viewing
router.post('/viewings', createViewing);

// Route to get all viewings
router.get('/viewings', getAllViewings);

// Route to get a viewing by ID
router.get('/viewings/:id', getViewingById);

// Route to get all viewings for a specific property
router.get('/viewings/property/:propertyId', getViewingsByProperty);

// Route to update viewing status (for agents)
router.patch('/viewings/:id/status', updateViewingStatus);

// Route to update a viewing
router.put('/viewings/:id', updateViewing);

// Route to delete a viewing
router.delete('/viewings/:id', deleteViewing);

module.exports = router;