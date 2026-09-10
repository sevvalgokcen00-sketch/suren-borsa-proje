const express = require('express');
const router = express.Router();
const companyAnalysisController = require('../controllers/companyAnalysisController');

// Firma Analiz Paneli Verileri
router.get('/', companyAnalysisController.getCompanyAnalysis);

module.exports = router;