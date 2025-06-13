const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// Public Routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected Routes
router.get('/me', isAuthenticated, authController.getCurrentAdmin);

// Admin creation route (for setup - you might want to restrict this in production)
router.post('/create-admin', authController.createAdmin);

module.exports = router;