const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// DB Bağlantısı
async function getDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listingId INTEGER NOT NULL,
      companyName TEXT,
      price REAL NOT NULL,
      amount REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      status TEXT DEFAULT 'Bekliyor',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

// --------------------------------------------------------------------------
// 1. TÜM TEKLİFLERİ LİSTELEME (GET /api/bids)
// --------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    
    // LEFT JOIN kullanarak silinmiş/arşivlenmiş ilanların başlıklarını da koruyoruz
    const bids = await db.all(`
      SELECT b.*, l.title as listingTitle 
      FROM bids b 
      LEFT JOIN listings l ON b.listingId = l.id
      ORDER BY b.createdAt DESC
    `);

    // totalPrice hesaplama ve null başlık engelleme
    const formattedBids = bids.map(bid => ({
      ...bid,
      listingTitle: bid.listingTitle || 'Arşivlenmiş İlan',
      totalPrice: Number((bid.price * bid.amount).toFixed(2)) // Toplam Fiyat Hesaplama
    }));

    res.json(formattedBids);
  } catch (error) {
    res.status(500).json({ message: "Teklifler çekilirken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 2. YENİ TEKLİF OLUŞTURMA (POST /api/bids)
// --------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { listingId, companyName, price, amount, unit } = req.body;

    // VALIDATION
    if (!listingId || !price || !amount) {
      return res.status(400).json({ message: "İlan kimliği, teklif fiyatı ve miktar alanları zorunludur!" });
    }

    if (Number(price) <= 0 || Number(amount) <= 0) {
      return res.status(400).json({ message: "Teklif fiyatı ve miktar 0'dan büyük olmalıdır!" });
    }

    const result = await db.run(
      `INSERT INTO bids (listingId, companyName, price, amount, unit, status) VALUES (?, ?, ?, ?, ?, 'Bekliyor')`,
      [listingId, companyName || 'Anonim Firma', price, amount, unit || 'kg']
    );

    res.status(201).json({
      message: "Teklif başarıyla gönderildi!",
      bidId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ message: "Teklif oluşturulurken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 3. TEKLİF DURUMUNU GÜNCELLEME (PATCH /api/bids/:id/status)
// --------------------------------------------------------------------------
router.patch('/:id/status', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { status } = req.body;

    // Teklif durumu standartlaştırması
    const allowedStatuses = ['Bekliyor', 'Kabul Edildi', 'Reddedildi'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Geçersiz teklif durumu! Sadece 'Bekliyor', 'Kabul Edildi' veya 'Reddedildi' değerleri kullanılabilir." 
      });
    }

    const result = await db.run(`UPDATE bids SET status = ? WHERE id = ?`, [status, id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Güncellenecek teklif bulunamadı!" });
    }

    res.json({ message: "Teklif durumu başarıyla güncellendi!" });
  } catch (error) {
    res.status(500).json({ message: "Teklif durumu güncellenirken hata oluştu!", error: error.message });
  }
});

module.exports = router;