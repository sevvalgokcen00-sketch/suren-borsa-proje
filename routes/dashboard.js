const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Gösterge Paneli Veri Rotası
router.get('/', dashboardController.getDashboardData);

module.exports = router;