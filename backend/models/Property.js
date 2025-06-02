const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
    {
      title: (required),
      description ,
      propertyType: ['rental', 'sale'] (required),
      price:(required),
      bedrooms:(required),
      bathrooms,
      propertyCategory: ['villa', 'apartment', 'cottage', 'house'] (required),
      location: {
        address,
        city,
        county,
        coordinates: []
      },
      images: [],
      amenities: [],
      availableDates: [{
        date: Date,
        isAvailable: Boolean,
        bookingType: String
      }],
      status: ['active', 'inactive', 'rented', 'sold'],
      createdAt: Date,
      updatedAt: Date
    })

module.exports = mongoose.model('Property', propertySchema);