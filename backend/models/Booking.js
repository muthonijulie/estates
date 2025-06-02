const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    fullName:{type:String, required: true},
    contact:{type:String, required: true},
    email:{type:String, required: true},
    checkInDate:{type:Date, required: true},
    checkOutDate:{type:Date, required: true},
    numberOfAdults:{type:Number, required: true},
    numberOfChildren:{type:Number, required: true,default:0},
    numberOfBedrooms:{type:Number, required: true},
    specialRequests:{type:String},

  

}, {
    timestamps: true
});
module.exports = mongoose.model('Booking', bookingSchema);

