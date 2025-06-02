const express= require('express');
const { createBooking,getBookingId,getAllBookings,updateBooking } = require('../controllers/bookingController');
const router = express.Router();

router.post('/book', createBooking);
router.get('/:id', getBookingId);
router.get('/property/:id', getAllBookings);
router.put('/:id/status', updateBooking);


module.exports = router;