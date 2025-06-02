const Booking = require("../models/Booking");
const Property = require("../models/Property");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const property = await Property.findById(req.body.propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false,
        error: "Property not found" 
      });
    }

    // Check if property is available (not booked, rented, or sold)
    if (property.status === 'booked' || property.status === 'rented' || property.status === 'sold') {
      return res.status(400).json({ 
        success: false,
        error: `Property is already ${property.status}` 
      });
    }

    // Validate dates
    const checkIn = new Date(req.body.checkInDate);
    const checkOut = new Date(req.body.checkOutDate);
    const today = new Date();
    
    if (checkIn < today) {
      return res.status(400).json({ 
        success: false,
        error: "Check-in date cannot be in the past" 
      });
    }
    
    if (checkOut <= checkIn) {
      return res.status(400).json({ 
        success: false,
        error: "Check-out date must be after check-in date" 
      });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      propertyId: req.body.propertyId,
      $or: [
        {
          checkInDate: { $lte: checkOut },
          checkOutDate: { $gte: checkIn }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        success: false,
        error: "Property is already booked for these dates" 
      });
    }

    // Create the booking
    const newBooking = new Booking(req.body);
    await newBooking.save();

    // Update property status to booked
    await Property.findByIdAndUpdate(req.body.propertyId, { status: 'booked' });

    // Populate property details in response
    await newBooking.populate('propertyId');

    res.status(201).json({
      success: true,
      data: newBooking
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: "Bad request", 
      message: error.message 
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('propertyId');
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all bookings for a specific property
const getAllBookingsForProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    
    // Validate that property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false,
        message: "Property not found" 
      });
    }

    const bookings = await Booking.find({ propertyId: propertyId }).populate('propertyId');

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: "No bookings found for this property",
        data: []
      });
    }

    res.status(200).json({ 
      success: true, 
      count: bookings.length,
      data: bookings 
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('propertyId');
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update a booking
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    // If updating dates, validate them
    if (req.body.checkInDate || req.body.checkOutDate) {
      const checkIn = new Date(req.body.checkInDate || booking.checkInDate);
      const checkOut = new Date(req.body.checkOutDate || booking.checkOutDate);
      
      if (checkOut <= checkIn) {
        return res.status(400).json({ 
          success: false,
          error: "Check-out date must be after check-in date" 
        });
      }

      // Check for overlapping bookings (excluding current booking)
      const overlappingBooking = await Booking.findOne({
        _id: { $ne: req.params.id },
        propertyId: booking.propertyId,
        $or: [
          {
            checkInDate: { $lte: checkOut },
            checkOutDate: { $gte: checkIn }
          }
        ]
      });

      if (overlappingBooking) {
        return res.status(400).json({ 
          success: false,
          error: "Property is already booked for these dates" 
        });
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('propertyId');

    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    // Update property status back to available (null)
    await Property.findByIdAndUpdate(booking.propertyId, { status: null });

    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getAllBookingsForProperty,
  getAllBookings,
  updateBooking,
  cancelBooking
};