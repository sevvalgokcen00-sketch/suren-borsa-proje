const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Veritabanı bağlantısı ve users tablosu kurulumu
async function getDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      companyName TEXT NOT NULL,
      role TEXT DEFAULT 'company',
      phone TEXT,
      taxNumber TEXT,
      city TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

// --------------------------------------------------------------------------
// 1. KAYIT OL (POST /api/auth/register)
// --------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const db = await getDb();
    const { email, password, companyName, phone, taxNumber, city } = req.body;

    if (!email || !password || !companyName) {
      return res.status(400).json({ message: "E-posta, şifre ve firma adı zorunludur!" });
    }

    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta adresi zaten kayıtlı!" });
    }

    const result = await db.run(
      `INSERT INTO users (email, password, companyName, phone, taxNumber, city) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password, companyName, phone || null, taxNumber || null, city || null]
    );

    res.status(201).json({
      message: "Kayıt işlemi başarıyla tamamlandı!",
      user: {
        id: result.lastID,
        email,
        companyName,
        role: 'company'
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Kayıt olurken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 2. GİRİŞ YAP (POST /api/auth/login)
// --------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const db = await getDb();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "E-posta ve şifre girilmelidir!" });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (!user) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı!" });
    }

    res.json({
      message: "Giriş başarılı!",
      token: `token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        phone: user.phone,
        city: user.city,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Giriş yapılırken hata oluştu!", error: error.message });
  }
});

module.exports = router;