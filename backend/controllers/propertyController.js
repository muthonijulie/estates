const Property = require('../models/Property');
const { cloudinary } = require('../middleware/uploadMiddleware');

// Helper function to delete images from Cloudinary
const deleteCloudinaryImages = async (imageUrls) => {
    const deletePromises = imageUrls.map(async (url) => {
        if (url && url.includes('cloudinary.com')) {
            const publicId = url.split('/').pop().split('.')[0];
            const folderPath = url.includes('/gallery/') ? 'real-estate/gallery/' : 'real-estate/properties/';
            return cloudinary.uploader.destroy(folderPath + publicId);
        }
    });
    
    try {
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
    }
};

exports.createProperty = async (req, res) => {
    try {
        const propertyData = { ...req.body };
        
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
                filename: file.filename,
                size: file.size,
                uploadDate: new Date(),
                alt: `${propertyData.title || 'Property'} - Gallery Image`,
                caption: ''
            }));
        }
        
        const property = await Property.create(propertyData);
        
        res.status(201).json({
            success: true,
            data: property,
            message: 'Property created successfully with images uploaded to Cloudinary'
        });
        
    } catch (error) {
        // If property creation fails, clean up uploaded images
        if (req.files) {
            const imagesToDelete = [];
            if (req.files.mainImage) imagesToDelete.push(req.files.mainImage[0].path);
            if (req.files.galleryImages) {
                imagesToDelete.push(...req.files.galleryImages.map(f => f.path));
            }
            await deleteCloudinaryImages(imagesToDelete);
        }
        
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const existingProperty = await Property.findById(req.params.id);
        if (!existingProperty) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }
        
        // Prepare update data
        const updateData = { ...req.body };
        const imagesToDelete = [];
        
        // Handle main image update
        if (req.files && req.files.mainImage) {
            // Delete old main image if it exists
            if (existingProperty.mainImage) {
                imagesToDelete.push(existingProperty.mainImage);
            }
            updateData.mainImage = req.files.mainImage[0].path;
        }
        
        // Handle gallery images update
        if (req.files && req.files.galleryImages) {
            // Delete old gallery images if they exist
            if (existingProperty.galleryImages && existingProperty.galleryImages.length > 0) {
                imagesToDelete.push(...existingProperty.galleryImages);
            }
            
            updateData.galleryImages = req.files.galleryImages.map(file => file.path);
            
            // Create new image metadata
            updateData.imageMetadata = req.files.galleryImages.map(file => ({
                url: file.path,
                filename: file.filename,
                size: file.size,
                uploadDate: new Date(),
                alt: `${updateData.title || existingProperty.title} - Gallery Image`,
                caption: ''
            }));
        }
        
        // Update the property in the database
        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        // Delete old images from Cloudinary after successful update
        if (imagesToDelete.length > 0) {
            await deleteCloudinaryImages(imagesToDelete);
        }
        
        res.status(200).json({
            success: true,
            data: updatedProperty,
            message: 'Property updated successfully'
        });
        
    } catch (error) {
        // If update fails and new images were uploaded, clean them up
        if (req.files) {
            const newImagesToDelete = [];
            if (req.files.mainImage) newImagesToDelete.push(req.files.mainImage[0].path);
            if (req.files.galleryImages) {
                newImagesToDelete.push(...req.files.galleryImages.map(f => f.path));
            }
            await deleteCloudinaryImages(newImagesToDelete);
        }
        
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// ADD THIS NEW PATCH ENDPOINT FOR STATUS UPDATES
exports.updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['available', 'booked', 'rented', 'sold'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: available, booked, rented, sold'
            });
        }
        
        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            { status: status || 'available' },
            { new: true, runValidators: true }
        );
        
        if (!updatedProperty) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedProperty,
            message: 'Property status updated successfully'
        });
        
    } catch (error) {
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
        
        // Collect all images to delete
        const imagesToDelete = [];
        if (property.mainImage) imagesToDelete.push(property.mainImage);
        if (property.galleryImages && property.galleryImages.length > 0) {
            imagesToDelete.push(...property.galleryImages);
        }
        
        // Delete property from database
        await Property.findByIdAndDelete(req.params.id);
        
        // Delete images from Cloudinary
        if (imagesToDelete.length > 0) {
            await deleteCloudinaryImages(imagesToDelete);
        }
        
        res.status(200).json({
            success: true,
            message: 'Property and associated images deleted successfully'
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

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
            query.amenities = { $in: amenitiesArray };
        }
        
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
};

exports.getPropertyGallery = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .select('galleryImages imageMetadata title');
        
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        
        // Gallery images are already full Cloudinary URLs
        const galleryWithMetadata = property.galleryImages.map((img, index) => {
            const metadata = property.imageMetadata && property.imageMetadata[index] 
                ? property.imageMetadata[index] 
                : {};
            
            return {
                url: img, // Cloudinary URL is already complete
                index,
                alt: metadata.alt || `${property.title} - Image ${index + 1}`,
                caption: metadata.caption || '',
                uploadDate: metadata.uploadDate,
                size: metadata.size
            };
        });
        
        res.json({
            success: true,
            data: galleryWithMetadata
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gallery',
            error: error.message
        });
    }
};