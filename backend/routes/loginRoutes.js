const express = require('express');
const router = express.Router();
const loginController= require('../controllers/loginController');
const { authenticateToken, authenticateSession, authorizeRole } = require('../middleware/auth');

// Public Routes
router.post('/login', loginController.login);
router.post('/logout', loginController.logout);

// Protected Routes - Use session auth for web interface
router.get('/me', authenticateSession, loginController.getCurrentAdmin);

// Admin creation route (for setup - you might want to restrict this in production)
router.post('/create-admin', loginController.createAdmin);

// Example protected route that requires super_admin role
router.get('/super-admin', 
  authenticateToken,
  authorizeRole(['super_admin']),
  (req, res) => {
    res.json({
      success: true,
      message: 'This is a super admin only route',
      admin: req.admin
    });
  }
);

module.exports = router;