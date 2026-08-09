const { getDb } = require('../db');

// Profil Bilgilerini Getir
exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const db = await getDb();
    const user = await db.get(
      `SELECT id, name, email, phone, company_name, tax_number, theme, notifications_enabled, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Profil Bilgilerini Güncelle
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, phone, company_name, tax_number } = req.body;

  try {
    const db = await getDb();
    await db.run(
      `UPDATE users 
       SET name = COALESCE(?, name), 
           phone = COALESCE(?, phone), 
           company_name = COALESCE(?, company_name), 
           tax_number = COALESCE(?, tax_number) 
       WHERE id = ?`,
      [name, phone, company_name, tax_number, userId]
    );

    res.json({ success: true, message: "Profil bilgileri güncellendi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tema ve Bildirim Ayarlarını Güncelle
exports.updateSettings = async (req, res) => {
  const { userId } = req.params;
  const { theme, notifications_enabled } = req.body;

  try {
    const db = await getDb();
    await db.run(
      `UPDATE users 
       SET theme = COALESCE(?, theme), 
           notifications_enabled = COALESCE(?, notifications_enabled) 
       WHERE id = ?`,
      [theme, notifications_enabled, userId]
    );

    res.json({ success: true, message: "Ayarlar güncellendi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};