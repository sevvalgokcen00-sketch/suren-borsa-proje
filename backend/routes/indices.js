const express = require('express');
const router = express.Router();
const { calculateReference, getCurrentIndices } = require('../controllers/indexController');

// Güncel endeks verilerini listeler (GET /api/indices/current)
router.get('/current', getCurrentIndices);

// Pas/nem firelerini düşerek net fiyat hesaplar (POST /api/indices/calculate)
router.post('/calculate', calculateReference);

module.exports = router;