const Rental = require('../models/Rental');

exports.createRental = async (req, res) => {
    try {
        const rental = await Rental.create(req.body);
        
        res.status(201).json({
            success: true,
            data: rental
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.getRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ status: 'active' });
        
        res.status(200).json({
            success: true,
            data: rentals
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.getRentalById = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
        
        if (!rental) {
            return res.status(404).json({
                success: false,
                error: 'Rental not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: rental
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.updateRental = async (req, res) => {
    try {
        const rental = await Rental.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!rental) {
            return res.status(404).json({
                success: false,
                error: 'Rental not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: rental
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.deleteRental = async (req, res) => {
    try {
        const rental = await Rental.findByIdAndDelete(req.params.id);
        
        if (!rental) {
            return res.status(404).json({
                success: false,
                error: 'Rental not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Rental deleted successfully'
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.getFeaturedRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ 
            status: 'active', 
            isFeatured: true 
        });
        
        res.status(200).json({
            success: true,
            data: rentals
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.searchRentals = async (req, res) => {
    try {
        const { location, minPrice, maxPrice, bedrooms } = req.query;
        let filter = { status: 'active' };

        if (location) {
            filter.location = new RegExp(location, 'i');
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseInt(minPrice);
            if (maxPrice) filter.price.$lte = parseInt(maxPrice);
        }

        if (bedrooms) {
            filter.bedrooms = parseInt(bedrooms);
        }

        const rentals = await Rental.find(filter);
        
        res.status(200).json({
            success: true,
            data: rentals
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}