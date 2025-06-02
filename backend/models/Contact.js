
const mongoose = require('mongoose');

<<<<<<< HEAD
const contactSchema = new mongoose.Schema(
    {
        name:{ type: String, required: true },
        email: { type: String, required: true },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: {
            type: Date
        },
        updatedAt: {type:Date}
      }
=======
const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  serviceType: {
    type: String,
    enum: [
      'property_rentals', 
      'booking_assistance', 
      'airport_transfers', 
      'housekeeping', 
      'safaris_excursions', 
      'property_management', 
      'general'
    ],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'resolved'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
>>>>>>> aa1ce590d6979c0f603624dc0b3b10f028858f55

module.exports = mongoose.model('Contact', ContactSchema);