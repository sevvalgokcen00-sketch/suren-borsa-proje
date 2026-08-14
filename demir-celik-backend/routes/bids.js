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
      buyerId INTEGER DEFAULT 1,
      buyerCompanyName TEXT,
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
    const { userId, type, listingId } = req.query;

    let query = `
      SELECT b.*, 
             l.title as listingTitle, 
             l.userId as sellerId, 
             l.companyName as sellerCompanyName,
             l.status as listingStatus
      FROM bids b 
      LEFT JOIN listings l ON b.listingId = l.id
      WHERE 1=1
    `;
    const params = [];

    if (listingId) {
      query += ' AND b.listingId = ?';
      params.push(Number(listingId));
    }

    // Gelen veya Verilen Teklif Filtreleri
    if (userId) {
      if (type === 'incoming') {
        // İlanlarıma gelen teklifler (Satıcı benim)
        query += ' AND l.userId = ?';
        params.push(Number(userId));
      } else if (type === 'outgoing') {
        // Benim verdiğim teklifler (Alıcı benim)
        query += ' AND b.buyerId = ?';
        params.push(Number(userId));
      }
    }

    query += ' ORDER BY b.id DESC';

    const bids = await db.all(query, params);

    // totalPrice hesaplama ve null başlık engelleme
    const formattedBids = bids.map(bid => ({
      ...bid,
      listingTitle: bid.listingTitle || 'Arşivlenmiş İlan',
      totalPrice: Number((bid.price * bid.amount).toFixed(2))
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
    const { listingId, buyerId, buyerCompanyName, companyName, price, amount, unit } = req.body;

    // VALIDATION
    if (!listingId || !price || !amount) {
      return res.status(400).json({ message: "İlan kimliği, teklif fiyatı ve miktar alanları zorunludur!" });
    }

    if (Number(price) <= 0 || Number(amount) <= 0) {
      return res.status(400).json({ message: "Teklif fiyatı ve miktar 0'dan büyük olmalıdır!" });
    }

    // İLANIN VARLIĞI VE AKTİFLİK KONTROLÜ
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', [listingId]);
    if (!listing) {
      return res.status(404).json({ message: "Teklif verilmek istenen ilan bulunamadı!" });
    }
    if (listing.status !== 'Active') {
      return res.status(400).json({ message: "Yalnızca aktif durumda olan ilanlara teklif verilebilir!" });
    }

    const firmName = buyerCompanyName || companyName || 'Anonim Firma';

    const result = await db.run(
      `INSERT INTO bids (listingId, buyerId, buyerCompanyName, companyName, price, amount, unit, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Bekliyor')`,
      [
        Number(listingId),
        buyerId ? Number(buyerId) : 1,
        firmName,
        firmName,
        Number(price),
        Number(amount),
        unit || 'kg'
      ]
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
// 3. TEKLİF / PAZARLIK GÜNCELLEME (PUT /api/bids/:id)
// --------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { price, amount, unit, buyerId } = req.body;

    const bid = await db.get('SELECT * FROM bids WHERE id = ?', [id]);
    if (!bid) {
      return res.status(404).json({ message: "Güncellenecek teklif bulunamadı!" });
    }

    // Sahiplik kontrolü
    if (buyerId && Number(bid.buyerId) !== Number(buyerId)) {
      return res.status(403).json({ message: "Bu teklifi düzenleme yetkiniz yok!" });
    }

    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({ message: "Teklif fiyatı 0'dan büyük olmalıdır!" });
    }
    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ message: "Miktar 0'dan büyük olmalıdır!" });
    }

    await db.run(
      `UPDATE bids SET 
        price = COALESCE(?, price),
        amount = COALESCE(?, amount),
        unit = COALESCE(?, unit),
        status = 'Bekliyor'
      WHERE id = ?`,
      [
        price !== undefined ? Number(price) : null,
        amount !== undefined ? Number(amount) : null,
        unit !== undefined ? unit : null,
        id
      ]
    );

    res.json({ message: "Teklif başarıyla güncellendi!" });
  } catch (error) {
    res.status(500).json({ message: "Teklif güncellenirken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 4. TEKLİF DURUMUNU GÜNCELLEME (PATCH /api/bids/:id/status)
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

// --------------------------------------------------------------------------
// 5. TEKLİF SİLME / GERİ ÇEKME (DELETE /api/bids/:id)
// --------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { buyerId } = req.body || {};

    const bid = await db.get('SELECT * FROM bids WHERE id = ?', [id]);
    if (!bid) {
      return res.status(404).json({ message: "Silinecek teklif bulunamadı!" });
    }

    // Sahiplik kontrolü
    if (buyerId && Number(bid.buyerId) !== Number(buyerId)) {
      return res.status(403).json({ message: "Bu teklifi silme/geri çekme yetkiniz yok!" });
    }

    await db.run('DELETE FROM bids WHERE id = ?', [id]);
    res.json({ message: "Teklif başarıyla silindi/geri çekildi!" });
  } catch (error) {
    res.status(500).json({ message: "Teklif silinirken hata oluştu!", error: error.message });
  }
});

module.exports = router;