const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Fixed: Should be Admin, not Login

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
    
    // Check if admin exists
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

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
exports.authenticateSession = async (req, res, next) => {
  try {
    if (!req.session || !req.session.isAuthenticated || !req.session.adminId) {
      return res.status(401).json({
        success: false,
        message: 'Session authentication required'
      });
    }

    // Optional: Verify admin still exists
    const admin = await Admin.findById(req.session.adminId).select('-password');
    if (!admin) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    req.adminId = admin._id;
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Session authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Role Authorization Middleware
exports.authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // If you have roles in your admin model, check them here
    if (req.admin.role && roles.includes(req.admin.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: 'Insufficient permissions'
    });
  };
};