const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function getDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // İşlem Onay ve Sözleşme Protokolü Tablosu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bidId INTEGER,
      listingId INTEGER NOT NULL,
      buyerId INTEGER DEFAULT 1,
      sellerId INTEGER DEFAULT 1,
      agreedPrice REAL NOT NULL,
      amount REAL NOT NULL,
      paymentMethod TEXT DEFAULT 'Kurumsal Havale / EFT',
      deliveryAddress TEXT,
      shippingDate DATE,
      contractAccepted INTEGER DEFAULT 1,
      savedCarbon REAL,
      savedTrees INTEGER,
      status TEXT DEFAULT 'Completed',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

// --------------------------------------------------------------------------
// 1. TESCİLLİ İŞLEMİ VE ÖDEMEYİ ONAYLA (POST /api/orders/checkout)
// --------------------------------------------------------------------------
router.post('/checkout', async (req, res) => {
  try {
    const db = await getDb();
    const { 
      bidId, 
      listingId, 
      buyerId, 
      deliveryAddress, 
      shippingDate, 
      paymentMethod = 'Kurumsal Havale / EFT',
      contractAccepted 
    } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: "İlan ID (listingId) zorunludur!" });
    }

    if (!contractAccepted) {
      return res.status(400).json({ message: "B2B Satış Şartnamesini onaylamalısınız!" });
    }

    // İlanı getir
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', [listingId]);
    if (!listing) {
      return res.status(404).json({ message: "İşlem yapılacak ilan bulunamadı!" });
    }

    // Teklif varsa teklif fiyatı/miktarı, yoksa ilanın kendi fiyatı/miktarı
    let finalPrice = listing.price;
    let finalAmount = listing.weight || 1000;

    if (bidId) {
      const bid = await db.get('SELECT * FROM bids WHERE id = ?', [bidId]);
      if (bid) {
        finalPrice = bid.price;
        finalAmount = bid.amount;
        // Teklifi 'Onaylandı' yap
        await db.run("UPDATE bids SET status = 'Onaylandı' WHERE id = ?", [bidId]);
      }
    }

    // Çevresel Etki Hesaplaması (Görsel 1):
    // 1 kg geri dönüştürülen çelik yaklaşık 1.5 kg CO2 salınımını önler.
    // 1 yetişkin ağaç yılda yaklaşık 22 kg CO2 emer.
    const weightInKg = finalAmount;
    const savedCarbonTon = Number(((weightInKg * 1.5) / 1000).toFixed(2));
    const savedTrees = Math.round((savedCarbonTon * 1000) / 22);

    // Siparişi / Protokolü Kaydet
    const result = await db.run(`
      INSERT INTO orders (
        bidId, listingId, buyerId, sellerId, agreedPrice, amount, 
        paymentMethod, deliveryAddress, shippingDate, contractAccepted, 
        savedCarbon, savedTrees, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed')
    `, [
      bidId || null,
      listingId,
      buyerId || 1,
      listing.userId || 1,
      finalPrice,
      finalAmount,
      paymentMethod,
      deliveryAddress || 'Sakarya 1. OSB, Çelik Cad. No:14',
      shippingDate || new Date().toISOString().split('T')[0],
      contractAccepted ? 1 : 0,
      savedCarbonTon,
      savedTrees
    ]);

    // İlanı satıldı (Sold / Pasif) olarak işaretle
    await db.run("UPDATE listings SET status = 'Sold' WHERE id = ?", [listingId]);

    // Frontend modalının son adımında (3. Onay) gösterilecek veriler
    res.status(201).json({
      success: true,
      message: "Ticari İşlem Başarıyla Onaylandı!",
      orderId: result.lastID,
      environmentalImpact: {
        savedCarbonTon: `~${savedCarbonTon} Ton CO₂e`,
        savedTrees: `~${savedTrees} Yetişkin Ağaç`,
        standardNote: "ISO 14064 Kapsam 3 Raporunuza Otomatik İşlendi"
      },
      logistics: {
        deliveryAddress: deliveryAddress || 'Sakarya 1. OSB, Çelik Cad. No:14',
        shippingDate: shippingDate || new Date().toISOString().split('T')[0]
      }
    });

  } catch (error) {
    res.status(500).json({ message: "İşlem onaylanırken bir hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 2. ONAYLANAN PROTOKOLLERİ / SİPARİŞLERİ LİSTELE (GET /api/orders)
// --------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const orders = await db.all(`
      SELECT o.*, l.title as listingTitle, l.materialType 
      FROM orders o
      LEFT JOIN listings l ON o.listingId = l.id
      ORDER BY o.createdAt DESC
    `);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Siparişler alınamadı!", error: error.message });
  }
});

module.exports = router;