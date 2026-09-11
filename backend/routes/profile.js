const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateSettings, getInvoices } = require('../controllers/profileController');

router.get('/:userId', getProfile);
router.put('/:userId', updateProfile);
router.put('/:userId/settings', updateSettings);
router.get('/:userId/invoices', getInvoices);

module.exports = router;
