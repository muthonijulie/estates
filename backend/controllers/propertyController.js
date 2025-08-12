const Property = require('../models/Property');
const fs = require('fs');
const path = require('path');

// Helper function to delete local images
const deleteLocalImages = async (imagePaths) => {
    try {
        for (const imagePath of imagePaths) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`Deleted local image: ${imagePath}`);
            }
        }
    } catch (error) {
        console.error('Error deleting local images:', error);
    }
};

exports.createProperty = async (req, res) => {
    try {
        const propertyData = { ...req.body };
        
        // Ensure status has a valid value
        if (!propertyData.status || !['available', 'booked', 'rented', 'sold'].includes(propertyData.status)) {
            propertyData.status = 'available';
        }

        // Handle main image
        if (req.files && req.files.mainImage) {
            propertyData.mainImage = req.files.mainImage[0].path;
        }

        // Handle gallery images
        if (req.files && req.files.galleryImages) {
            propertyData.galleryImages = req.files.galleryImages.map(file => file.path);
            
            // Create image metadata
            propertyData.imageMetadata = req.files.galleryImages.map(file => ({
                url: file.path,
                alt: `${propertyData.title || 'Property'} - Gallery Image`,
                caption: ''
            }));
        }

        const property = await Property.create(propertyData);

        res.status(201).json({
            success: true,
            data: property,
            message: 'Property created successfully with images uploaded locally'
        });
    } catch (error) {
        // If property creation fails, clean up uploaded images
        if (req.files) {
            const imagesToDelete = [];
            if (req.files.mainImage) imagesToDelete.push(req.files.mainImage[0].path);
            if (req.files.galleryImages) {
                imagesToDelete.push(...req.files.galleryImages.map(f => f.path));
            }
            await deleteLocalImages(imagesToDelete);
        }
        
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getProperties = async (req, res) => {
    try {
        let query = {};
        
        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        // Filter by type
        if (req.query.type) {
            query.type = req.query.type;
        }
        
        // Filter by listing type
        if (req.query.listingType) {
            query.listingType = req.query.listingType;
        }
        
        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }
        
        // Filter by bedrooms
        if (req.query.bedrooms) {
            query.bedrooms = req.query.bedrooms;
        }
        
        // Filter by bathrooms
        if (req.query.bathrooms) {
            query.bathrooms = req.query.bathrooms;
        }
        
        // Filter by location
        if (req.query.location) {
            query.location = { $regex: req.query.location, $options: 'i' };
        }
        
        // Filter by amenities
        if (req.query.amenities) {
            const amenitiesArray = req.query.amenities.split(',');
            query.amenities = { $in: amenitiesArray };
        }

        let properties = await Property.find(query).sort({ createdAt: -1 });
        
        // Post-process to handle null status values in the response
        properties = properties.map(property => {
            const propertyObj = property.toObject();
            if (!propertyObj.status || propertyObj.status === null) {
                propertyObj.status = 'available';
            }
            return propertyObj;
        });

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

        // Handle null status
        const propertyObj = property.toObject();
        if (!propertyObj.status || propertyObj.status === null) {
            propertyObj.status = 'available';
        }

        res.status(200).json({
            success: true,
            data: propertyObj
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        const propertyData = { ...req.body };
        const oldImages = [];

        // Handle main image update
        if (req.files && req.files.mainImage) {
            if (property.mainImage) {
                oldImages.push(property.mainImage);
            }
            propertyData.mainImage = req.files.mainImage[0].path;
        }

        // Handle gallery images update
        if (req.files && req.files.galleryImages) {
            if (property.galleryImages && property.galleryImages.length > 0) {
                oldImages.push(...property.galleryImages);
            }
            propertyData.galleryImages = req.files.galleryImages.map(file => file.path);
            
            // Create image metadata
            propertyData.imageMetadata = req.files.galleryImages.map(file => ({
                url: file.path,
                alt: `${propertyData.title || property.title || 'Property'} - Gallery Image`,
                caption: ''
            }));
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            propertyData,
            {
                new: true,
                runValidators: true
            }
        );

        // Delete old images after successful update
        if (oldImages.length > 0) {
            await deleteLocalImages(oldImages);
        }

        res.status(200).json({
            success: true,
            data: updatedProperty,
            message: 'Property updated successfully'
        });
    } catch (error) {
        // If update fails, clean up new uploaded images
        if (req.files) {
            const imagesToDelete = [];
            if (req.files.mainImage) imagesToDelete.push(req.files.mainImage[0].path);
            if (req.files.galleryImages) {
                imagesToDelete.push(...req.files.galleryImages.map(f => f.path));
            }
            await deleteLocalImages(imagesToDelete);
        }
        
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        // Collect images to delete
        const imagesToDelete = [];
        if (property.mainImage) imagesToDelete.push(property.mainImage);
        if (property.galleryImages && property.galleryImages.length > 0) {
            imagesToDelete.push(...property.galleryImages);
        }

        // Delete property from database
        await Property.findByIdAndDelete(req.params.id);

        // Delete images from local storage
        await deleteLocalImages(imagesToDelete);

        res.status(200).json({
            success: true,
            data: {},
            message: 'Property deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['available', 'booked', 'rented', 'sold'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be: available, booked, rented, or sold'
            });
        }

        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        res.status(200).json({
            success: true,
            data: property,
            message: 'Property status updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getPropertyGallery = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).select('galleryImages imageMetadata title');
        
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                galleryImages: property.galleryImages || [],
                imageMetadata: property.imageMetadata || []
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};