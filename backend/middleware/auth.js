const jwt = require('jsonwebtoken');
const Admin = require('../models/Login');

// JWT Authentication Middleware
exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
       // Add admin info to request
    req.adminId = admin._id;
    req.admin = admin;
    
    next();
  } catch (error) {
    console.error('Token authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Session Authentication Middleware
exports.authenticateSession = (req, res, next) => {
  if (req.session && req.session.isAuthenticated && req.session.adminId) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'Session authentication required'
  });
};

