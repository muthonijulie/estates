const express= require('express');
const { createContact,getContact } = require('../controllers/contactController');
const router = express.Router();

router.post('/contact', createContact);
router.get('/contact', getContact);

module.exports = router;