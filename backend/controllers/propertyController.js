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

exports.getProperties = async (req, res) => {
    try {
        const properties = await Property.find();
        
        res.status(200).json({
            success: true,
            data: properties
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
        
    }
}

exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }
        
        res.status(200).json({
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

