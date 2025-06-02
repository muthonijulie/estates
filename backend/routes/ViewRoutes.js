const express = require('express');
const { createViewing } = require('../controllers/viewingController');

const router = express.Router();


// Route to create a new viewing
router.post('/viewing', createViewing);

module.exports = router;