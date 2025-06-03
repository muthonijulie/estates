const express= require('express');
const { createContact,getContact, deleteContact, getContactById } = require('../controllers/contactController');
const router = express.Router();

router.post('/contact', createContact);

router.get('/contact', getContact);

router.delete('/contact/:id', deleteContact);

router.get('/contact/:id', getContactById);

module.exports = router;