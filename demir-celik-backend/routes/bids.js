const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// DB Bağlantısı ve Bids (Teklifler) Tablosu
async function getDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listingId INTEGER NOT NULL,
      companyName TEXT NOT NULL,
      offerPrice REAL NOT NULL,
      note TEXT,
      status TEXT DEFAULT 'Bekliyor', 
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listingId) REFERENCES listings (id) ON DELETE CASCADE
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
    
    // Teklifleri ilan bilgisiyle birlikte çekiyoruz (JOIN)
    const bids = await db.all(`
      SELECT bids.*, listings.title as listingTitle 
      FROM bids 
      LEFT JOIN listings ON bids.listingId = listings.id
      ORDER BY bids.createdAt DESC
    `);

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: "Teklifler çekilirken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 2. BİR İLANA TEKLİF VERME (POST /api/bids)
// --------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { listingId, companyName, offerPrice, note } = req.body;

    if (!listingId || !offerPrice || !companyName) {
      return res.status(400).json({ message: "İlan ID, Firma Adı ve Teklif Fiyatı zorunludur!" });
    }

    const result = await db.run(
      `INSERT INTO bids (listingId, companyName, offerPrice, note) VALUES (?, ?, ?, ?)`,
      [listingId, companyName, offerPrice, note || '']
    );

    res.status(201).json({
      message: "Teklifiniz başarıyla iletildi!",
      bidId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ message: "Teklif verilirken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 3. TEKLİF DURUMUNU GÜNCELLEME (Kabul / Red) (PUT /api/bids/:id)
// --------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { status } = req.body; // 'Kabul Edildi' veya 'Reddedildi'

    await db.run('UPDATE bids SET status = ? WHERE id = ?', [status, req.params.id]);

    res.json({ message: `Teklif durumu '${status}' olarak güncellendi.` });
  } catch (error) {
    res.status(500).json({ message: "Teklif güncellenirken hata oluştu!", error: error.message });
  }
});

module.exports = router;