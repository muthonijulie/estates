const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authenticateSession, authorizeRole } = require('../middleware/auth');

// Public Routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected Routes (require authentication)
router.get('/me', authenticateToken, authController.getCurrentAdmin);

// Admin creation route (for setup - you might want to restrict this in production)
router.post('/create-admin', authController.createAdmin);

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

// Example route using session authentication
router.get('/dashboard', authenticateSession, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the admin dashboard',
    sessionId: req.session.adminId
  });
});

module.exports = router;