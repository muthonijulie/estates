const mongoose = require('mongoose');

const viewingSchema = new mongoose.Schema({
    propertyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Property', 
        required: true 
    },
    fullName: { 
        type: String, 
        required: true 
    },
    contactInfo: { 
        type: String, 
        required: true 
    },
    preferredDate: { 
        type: Date, 
        required: true 
    },
    preferredTime: {
        type: String,
        required: true
    },
    comments: { 
        type: String 
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    agentNotes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Viewing', viewingSchema);