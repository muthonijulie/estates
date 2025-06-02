const Property = require('../models/Property');

exports.createProperty = async (req, res) => {
    try {
        const property = await Property.create(req.body);
        
        res.status(201).json({
            success: true,
            data: property
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
        
    }
}