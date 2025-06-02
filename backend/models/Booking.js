const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    fullName:{String, required: true},
    contact:{String, required: true},
    email:{String, required: true},
    checkInDate:{Date, required: true},
    checkOutDate:{Date, required: true},
    numberOfAdults:{Number, required: true},
    numberOfChildren:{Number, required: true,default:0},
    numberOfBedrooms:{Number, required: true},
    specialRequests:{String},

  

}, {
    timestamps: true
});
module.exports = mongoose.model('Booking', bookingSchema);

