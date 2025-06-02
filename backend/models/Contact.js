const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
    {
        name: String (required),
        email: String (required),
        subject: String,
        message: String (required),
        createdAt: Date,
        updatedAt: Date
      }

)

module.exports = mongoose.model('Contact', contactSchema);