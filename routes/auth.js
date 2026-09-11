const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  res.json({ message: "Auth servisi hazırlanıyor..." });
});

router.post('/login', (req, res) => {
  res.json({ message: "Auth servisi hazırlanıyor..." });
});

module.exports = router;