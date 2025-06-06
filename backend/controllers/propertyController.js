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
        
        // Ensure status has a valid value
        if (!updateData.status || !['available', 'booked', 'rented', 'sold'].includes(updateData.status)) {
            updateData.status = existingProperty.status || 'available';
        }
        
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
        
        // Use findOneAndUpdate with upsert option to force schema validation
        const updatedProperty = await Property.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updateData },
            { 
                new: true, 
                runValidators: true,
                strict: false  // Allow updates to fields not in original schema
            }
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

// UPDATED STATUS UPDATE ENDPOINT
// exports.updatePropertyStatus = async (req, res) => {
//     try {
//         const { status } = req.body;
        
//         // Validate status
//         const validStatuses = ['available', 'booked', 'rented', 'sold'];
//         if (!status || !validStatuses.includes(status)) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Invalid status. Must be one of: available, booked, rented, sold'
//             });
//         }
        
//         // Use direct MongoDB update to bypass schema restrictions
//         const updatedProperty = await Property.findOneAndUpdate(
//             { _id: req.params.id },
//             { $set: { status: status } },
//             { 
//                 new: true, 
//                 runValidators: false,  // Skip validation for this update
//                 strict: false
//             }
//         );
        
//         if (!updatedProperty) {
//             return res.status(404).json({
//                 success: false,
//                 error: 'Property not found'
//             });
//         }
        
//         res.status(200).json({
//             success: true,
//             data: updatedProperty,
//             message: 'Property status updated successfully'
//         });
        
//     } catch (error) {
//         console.error('Status update error:', error);
//         res.status(400).json({
//             success: false,
//             error: error.message
//         });
//     }
// };

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
        
        // Status filter - handle null values
        if (req.query.status) {
            if (req.query.status === 'available') {
                // Include both 'available' and null values
                query.$or = [
                    { status: 'available' },
                    { status: null },
                    { status: { $exists: false } }
                ];
            } else {
                query.status = req.query.status;
            }
        }
        
        // Amenities filter
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
        let property = await Property.findById(req.params.id);
        
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

// Add this method to your controller to handle status updates properly
exports.updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const propertyId = req.params.id;
        
        console.log('Updating property status:', { propertyId, status }); // Debug log
        
        // Validate status
        const validStatuses = ['available', 'booked', 'rented', 'sold'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: available, booked, rented, sold'
            });
        }
        
        // Update the property
        const updatedProperty = await Property.findByIdAndUpdate(
            propertyId,
            { status: status },
            { 
                new: true, 
                runValidators: true
            }
        );
        
        if (!updatedProperty) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }
        
        console.log('Property updated successfully:', updatedProperty.status); // Debug log
        
        res.status(200).json({
            success: true,
            data: updatedProperty,
            message: 'Property status updated successfully'
        });
        
    } catch (error) {
        console.error('Status update error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};