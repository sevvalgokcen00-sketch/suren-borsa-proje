const express = require('express');
const router = express.Router();
const { calculateReference, getCurrentIndices } = require('../controllers/indexController');

// Güncel endeks verileri
router.get('/current', getCurrentIndices);

// Canlı fiyat asistanı hesabı
router.post('/calculate', calculateReference);

module.exports = router;