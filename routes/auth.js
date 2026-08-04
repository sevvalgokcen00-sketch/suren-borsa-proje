const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Kurumsal Kayıt
router.post('/register', authController.register);

// Giriş Yap
router.post('/login', authController.login);

// Şifremi Unuttum
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;