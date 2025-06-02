const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  bedrooms: {
    type: Number,
    required: true,
  },
  bathrooms: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  mainImage: {
    type: String,
  },
  galleryImages: {
    type: [String],
  },
  amenities: {
    type: [String],
  },
  features: {
    type: [String],
  },
  nearbyPlaces: {
    type: [String],
  },
  ownerName: {
    type: String,
    required: true,
  },
  ownerPhone: {
    type: String,
    required: true,
  },
  ownerEmail: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  }
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);