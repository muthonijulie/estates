const Viewing = require('../models/Viewing');
const emailService = require('../services/emailService');

exports.createViewing = async (req, res) => {
    try {
        // Frontend sends propertyId in the request body
        const viewing = await Viewing.create(req.body);
        
        // Populate the property details in the response
        const populatedViewing = await Viewing.findById(viewing._id).populate('propertyId');
        
        // Send viewing confirmation email
        try {
            await emailService.sendViewingConfirmation(populatedViewing);
            console.log('Viewing confirmation email sent');
        } catch (emailError) {
            console.error('Failed to send viewing confirmation email:', emailError);
            // Don't fail the viewing process if email fails
        }
        
        res.status(201).json({
            success: true,
            data: populatedViewing
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.getAllViewings = async (req, res) => {
    try {
        const viewings = await Viewing.find().populate('propertyId').sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: viewings.length,
            data: viewings
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.getViewingById = async (req, res) => {
    try {
        const viewing = await Viewing.findById(req.params.id).populate('propertyId');
        
        if (!viewing) {
            return res.status(404).json({
                success: false,
                error: 'Viewing not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: viewing
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.getViewingsByProperty = async (req, res) => {
    try {
        const viewings = await Viewing.find({ propertyId: req.params.propertyId })
            .populate('propertyId')
            .sort({ preferredDate: 1 });
        
        res.status(200).json({
            success: true,
            count: viewings.length,
            data: viewings
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.updateViewingStatus = async (req, res) => {
    try {
        const { status, agentNotes } = req.body;
        
        const viewing = await Viewing.findByIdAndUpdate(
            req.params.id,
            { status, agentNotes },
            { new: true, runValidators: true }
        ).populate('propertyId');
        
        if (!viewing) {
            return res.status(404).json({
                success: false,
                error: 'Viewing not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: viewing
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.updateViewing = async (req, res) => {
    try {
        const viewing = await Viewing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('propertyId');
        
        if (!viewing) {
            return res.status(404).json({
                success: false,
                error: 'Viewing not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: viewing
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

exports.deleteViewing = async (req, res) => {
    try {
        const viewing = await Viewing.findByIdAndDelete(req.params.id);
        
        if (!viewing) {
            return res.status(404).json({
                success: false,
                error: 'Viewing not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Viewing deleted successfully'
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}