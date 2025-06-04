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
        const query = {};
        
        // Location filter
        if (req.query.location) {
            query.location = new RegExp(req.query.location, 'i');
        }
        
        // Property type filter
        if (req.query.propertyType) {
            query.propertyType = req.query.propertyType;
        }
        
        // Listing type filter
        if (req.query.listingType) {
            query.listingType = req.query.listingType;
        }
        
        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = parseInt(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = parseInt(req.query.maxPrice);
        }
        
        // Bedrooms filter
        if (req.query.bedrooms) {
            const bedrooms = parseInt(req.query.bedrooms);
            query.bedrooms = bedrooms >= 5 ? { $gte: 5 } : bedrooms;
        }
        
        // Bathrooms filter
        if (req.query.bathrooms) {
            const bathrooms = parseInt(req.query.bathrooms);
            query.bathrooms = bathrooms >= 4 ? { $gte: 4 } : bathrooms;
        }
        
        // Status filter
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        // Amenities filter
        if (req.query.amenities) {
            const amenitiesArray = req.query.amenities.split(',');
            // Use $in to match properties that have any of the specified amenities
            // Or use $all if you want properties that have ALL specified amenities
            query.amenities = { $in: amenitiesArray };
        }
        
        // Execute query - this will get ALL properties if no filters, or filtered properties if filters exist
        const properties = await Property.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};


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

exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
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

exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Property deleted successfully'
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}