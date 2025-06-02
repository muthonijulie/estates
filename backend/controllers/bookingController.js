const Booking=require("../models/Booking");

const createBooking = async (req, res) => {
  try {
    const newBooking = await Booking.create(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ error: "Bad request", message: error.message });
  }
};

// Get booking by ID
const getBookingId = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all bookings for a specific property
const getAllBookings = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const bookings = await Booking.find({ property: propertyId });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this property" });
    }

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a booking
const updateBooking = async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports={getBookingId,getAllBookings,createBooking,updateBooking};