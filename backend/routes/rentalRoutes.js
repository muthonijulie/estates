const express = require('express');
const router = express.Router();
const {
    getRentalGallery,
    createRental,
    getRentals,
    getRentalById,
    updateRental,
    deleteRental,
    getFeaturedRentals,
    searchRentals
} = require('../controllers/rentalController');

router.get('/rentals/:id/gallery', getRentalGallery);
// GET /api/v1/rentals - Get all rentals
router.get('/rentals', getRentals);

// GET /api/v1/rentals/featured - Get featured rentals
router.get('/rentals/featured', getFeaturedRentals);

// GET /api/rentals/search - Search rentals
router.get('/rentals/search', searchRentals);

// GET /api/rentals/:id - Get single rental
router.get('/rentals/:id', getRentalById);

// POST /api/rentals - Create new rental
router.post('/rentals', createRental);

// PUT /api/rentals/:id - Update rental
router.put('/rentals/:id', updateRental);

// DELETE /api/rentals/:id - Delete rental
router.delete('/rentals/:id', deleteRental);

module.exports = router;