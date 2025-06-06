const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    propertyType: { type: [String], required: true },
    listingType: { type: String, enum: ["Rent", "Sale"], required: true },
    price: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    location: { type: String, required: true },
    mainImage: { type: String },
    galleryImages: { type: [String] },
    imageMetadata: [
      {
        url: String,
        filename: String,
        size: Number,
        uploadDate: { type: Date, default: Date.now },
        alt: String,
        caption: String,
      },
    ],
    amenities: { type: [String] },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["available", "booked", "rented", "sold"],
      default: "available",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Property", propertySchema);
