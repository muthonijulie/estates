const express = require('express');
const {
  createBooking,
  getBookingById,
  getAllBookingsForProperty,
  getAllBookings,
  updateBooking,
  cancelBooking
} = require('../controllers/bookingController');

const router = express.Router();

// Create a new booking
router.post('/bookings', createBooking);

// Get all bookings
router.get('/bookings', getAllBookings);

// Get booking by ID
router.get('/bookings/:id', getBookingById);

// Get all bookings for a specific property
router.get('/properties/:id/bookings', getAllBookingsForProperty);

// Update a booking by ID - USE THE CONTROLLER FUNCTION
router.patch('/bookings/:id', updateBooking);

// Cancel a booking
router.delete('/bookings/:id', cancelBooking);

module.exports = router;