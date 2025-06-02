const mongoose = require('mongoose');

const viewingSchema = new mongoose.Schema({
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: false },
    fullName: { type: String, required: true },
    contactInfo: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    comments: { type: String },

}, {
    timestamps: true
});
module.exports = mongoose.model('Viewing', viewingSchema);
