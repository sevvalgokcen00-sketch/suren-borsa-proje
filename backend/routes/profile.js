const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateSettings } = require('../controllers/profileController');

router.get('/:userId', getProfile);
router.put('/:userId', updateProfile);
router.put('/:userId/settings', updateSettings);

module.exports = router;