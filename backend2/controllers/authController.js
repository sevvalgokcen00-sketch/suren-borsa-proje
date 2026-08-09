const { getDb } = require('../db');

// Kullanıcı Kaydı (Register)
exports.register = async (req, res) => {
  const { name, email, password, company_name } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Ad, e-posta ve şifre zorunludur." });
  }

  try {
    const db = await getDb();

    // E-posta kontrolü
    const existingUser = await db.get(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta adresi zaten kayıtlı." });
    }

    // Kullanıcıyı veritabanına ekle
    const result = await db.run(
      `INSERT INTO users (name, email, password, company_name) VALUES (?, ?, ?, ?)`,
      [name, email, password, company_name || null]
    );

    res.status(201).json({
      success: true,
      message: "Kullanıcı başarıyla kaydedildi.",
      userId: result.lastID
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Kullanıcı Girişi (Login)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-posta ve şifre zorunludur." });
  }

  try {
    const db = await getDb();

    // Kullanıcıyı sorgula
    const user = await db.get(
      `SELECT id, name, email, company_name, theme, notifications_enabled FROM users WHERE email = ? AND password = ?`,
      [email, password]
    );

    if (!user) {
      return res.status(401).json({ error: "Geçersiz e-posta veya şifre." });
    }

    res.json({
      success: true,
      message: "Giriş başarılı.",
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Şifremi Unuttum (Forgot Password)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-posta adresi zorunludur." });
  }

  try {
    const db = await getDb();
    const user = await db.get(`SELECT id FROM users WHERE email = ?`, [email]);

    if (!user) {
      return res.status(404).json({ error: "Bu e-posta adresine ait kullanıcı bulunamadı." });
    }

    res.json({
      success: true,
      message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};