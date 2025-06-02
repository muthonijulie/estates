const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
    {
      title: (required),
      description ,
      propertyType,
      listingType: ['rent', 'sale'](required),
      price:(required),
      bedrooms:(required),
      bathrooms,
      location: {
        address,
        city,
        county
      },
      images: [],
      amenities: [],
      isFeatured:false,
      status: ['booked', 'rented', 'sold'],
      createdAt: Date,
      updatedAt: Date
    })

module.exports = mongoose.model('Property', propertySchema);