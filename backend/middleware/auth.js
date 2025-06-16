const jwt = require('jsonwebtoken');
const Admin = require('../models/Login');

// Authentication Middleware - Checks both session and JWT token
exports.isAuthenticated = async (req, res, next) => {
  try {
    // First check session
    if (req.session && req.session.adminId && req.session.isAuthenticated) {
      const admin = await Admin.findById(req.session.adminId).select('-password');
      if (admin) {
        req.admin = admin;
        return next();
      }
    }
    
    // Then check JWT token as fallback
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId).select('-password');
        
        if (admin) {
          req.admin = admin;
          return next();
        }
      } catch (tokenError) {
        // Token error, continue to unauthorized response
      }
    }
    
    // If neither session nor token authentication succeeded
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware for protecting routes that render HTML pages
exports.requireAuth = (req, res, next) => {
  // Check for session
  if (req.session && req.session.adminId && req.session.isAuthenticated) {
    return next();
  }
  
  // Check for JWT token in localStorage (client-side)
  // This will be handled by JavaScript in the browser, but we need to redirect here
  
  // Redirect to login page
  res.redirect('/admin/login.html');
};