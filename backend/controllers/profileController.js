const { getDb } = require('../db');

// Profil Bilgilerini Getir
exports.getProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const db = await getDb();
    const user = await db.get(
      'SELECT id, name, email, phone, company_name, tax_number, tax_office, address, theme, notifications_enabled, email_offers, email_market, sms_alerts, subscription_plan, subscription_features, created_at FROM users WHERE id = ?',
      [userId]
    );
    if (!user) {
      return res.status(404).json({ success: false, error: "Kullanıcı bulunamadı." });
    }
    res.json(user);
  } catch (err) {
    console.error("GET /api/profile/:userId hatası:", err);
    res.status(500).json({ error: "Profil bilgileri alınamadı." });
  }
};

// Profil / Firma Bilgilerini Güncelle
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, phone, company_name, tax_number, tax_office, address, currentPassword, newPassword } = req.body;

  try {
    const db = await getDb();

    if (newPassword) {
      const user = await db.get('SELECT password FROM users WHERE id = ?', [userId]);
      if (user && user.password && currentPassword && user.password !== currentPassword) {
        return res.status(400).json({ success: false, error: "Mevcut şifreniz hatalı!" });
      }
      await db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
    }

    const result = await db.run(
      `UPDATE users 
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           company_name = COALESCE(?, company_name),
           tax_number = COALESCE(?, tax_number),
           tax_office = COALESCE(?, tax_office),
           address = COALESCE(?, address)
       WHERE id = ?`,
      [name, phone, company_name, tax_number, tax_office, address, userId]
    );

    res.json({ success: true, message: "Profil ve firma bilgileri başarıyla güncellendi." });
  } catch (err) {
    console.error("PUT /api/profile/:userId hatası:", err);
    res.status(500).json({ error: "Profil güncellenirken hata oluştu." });
  }
};

// Tercihleri Güncelle
exports.updateSettings = async (req, res) => {
  const { userId } = req.params;
  const { emailOffers, emailMarket, smsAlerts, theme, notifications_enabled } = req.body;

  try {
    const db = await getDb();
    await db.run(
      `UPDATE users 
       SET email_offers = CASE WHEN ? IS NOT NULL THEN ? ELSE email_offers END,
           email_market = CASE WHEN ? IS NOT NULL THEN ? ELSE email_market END,
           sms_alerts = CASE WHEN ? IS NOT NULL THEN ? ELSE sms_alerts END,
           theme = COALESCE(?, theme),
           notifications_enabled = COALESCE(?, notifications_enabled)
       WHERE id = ?`,
      [
        emailOffers !== undefined ? (emailOffers ? 1 : 0) : null,
        emailOffers !== undefined ? (emailOffers ? 1 : 0) : null,
        emailMarket !== undefined ? (emailMarket ? 1 : 0) : null,
        emailMarket !== undefined ? (emailMarket ? 1 : 0) : null,
        smsAlerts !== undefined ? (smsAlerts ? 1 : 0) : null,
        smsAlerts !== undefined ? (smsAlerts ? 1 : 0) : null,
        theme,
        notifications_enabled,
        userId
      ]
    );
    res.json({ success: true, message: "Kullanıcı tercihleri güncellendi." });
  } catch (err) {
    console.error("PUT /api/profile/:userId/settings hatası:", err);
    res.status(500).json({ error: "Tercihler güncellenirken hata oluştu." });
  }
};

// Faturaları Getir
exports.getInvoices = async (req, res) => {
  const { userId } = req.params;
  try {
    const db = await getDb();
    const invoices = await db.all(
      'SELECT id, date, amount, status, pdf_url FROM invoices WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );
    res.json(invoices || []);
  } catch (err) {
    console.error("GET /api/profile/:userId/invoices hatası:", err);
    res.status(500).json({ error: "Faturalar alınamadı." });
  }
};
