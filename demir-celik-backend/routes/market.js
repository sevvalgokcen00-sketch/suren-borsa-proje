const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function getDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // 1. Dış Piyasa Fiyatları Tablosu (Manuel/Yönetici)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS external_market_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materialType TEXT NOT NULL,
      usdRate REAL DEFAULT 38.5,
      globalPriceTL REAL NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Güncel Malzeme Endeksleri Tablosu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS price_indexes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materialType TEXT UNIQUE NOT NULL,
      referencePrice REAL NOT NULL,
      dailyChangePercent REAL DEFAULT 0.0,
      minPrice REAL NOT NULL,
      maxPrice REAL NOT NULL,
      transactionCount INTEGER DEFAULT 0,
      trustLevel TEXT DEFAULT 'Yüksek',
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Fiyat Geçmişi Tablosu (7 ve 30 Günlük Grafik İçin)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materialType TEXT NOT NULL,
      price REAL NOT NULL,
      date DATE NOT NULL
    );
  `);

  return db;
}

// --------------------------------------------------------------------------
// 1. TÜM ENDEKSLERİ LİSTELEME (GET /api/market/indexes)
// (Ana sayfadaki hareketli borsa fiyat şeridi için)
// --------------------------------------------------------------------------
router.get('/indexes', async (req, res) => {
  try {
    const db = await getDb();
    const indexes = await db.all('SELECT * FROM price_indexes ORDER BY id ASC');
    res.json(indexes);
  } catch (error) {
    res.status(500).json({ message: "Endeksler alınamadı!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 2. BELİRLİ MALZEMENİN GEÇMİŞİNİ VE ENDEKSİNİ GETİRME (GET /api/market/history/:materialType)
// (7 ve 30 günlük çizgi grafikleri için)
// --------------------------------------------------------------------------
router.get('/history/:materialType', async (req, res) => {
  try {
    const db = await getDb();
    const history = await db.all(
      'SELECT * FROM price_history WHERE materialType = ? ORDER BY date ASC LIMIT 30',
      [req.params.materialType]
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Fiyat geçmişi alınamadı!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 3. İLAN İÇİN ÖNERİLEN FİYAT VE MEDYAN HESAPLAMA (POST /api/market/calculate-recommendation)
// --------------------------------------------------------------------------
router.post('/calculate-recommendation', async (req, res) => {
  try {
    const db = await getDb();
    const { materialType, userPrice, contamination } = req.body;

    if (!materialType) {
      return res.status(400).json({ message: "Malzeme türü zorunludur!" });
    }

    const index = await db.get('SELECT * FROM price_indexes WHERE materialType = ?', [materialType]);

    if (!index || index.transactionCount < 3) {
      return res.json({
        status: "Yetersiz veri",
        message: "Bu malzeme türü için henüz yeterli işlem bulunmamaktadır."
      });
    }

    let refPrice = index.referencePrice;

    // Pas/Kirlilik durumuna göre dinamik ıskonto
    if (contamination === 'Yağlı-Kontamine' || contamination === 'Ağır Paslı') {
      refPrice = refPrice * 0.92;
    }

    const minRecommended = (refPrice * 0.95).toFixed(2);
    const maxRecommended = (refPrice * 1.05).toFixed(2);

    let comparisonNote = "";
    if (userPrice) {
      const diffPercent = (((userPrice - refPrice) / refPrice) * 100).toFixed(1);
      if (diffPercent > 0) {
        comparisonNote = `Girilen ilan fiyatı referans medyanın %${diffPercent} üzerinde`;
      } else if (diffPercent < 0) {
        comparisonNote = `Girilen ilan fiyatı referans medyanın %${Math.abs(diffPercent)} altında`;
      } else {
        comparisonNote = `Girilen ilan fiyatı referans medyana tam eşittir`;
      }
    }

    res.json({
      materialType: materialType,
      platformReferenceTL: refPrice.toFixed(2),
      recommendedMinTL: minRecommended,
      recommendedMaxTL: maxRecommended,
      trustLevel: index.trustLevel,
      transactionCount: index.transactionCount,
      comparisonNote: comparisonNote
    });

  } catch (error) {
    res.status(500).json({ message: "Hesaplama yapılırken hata oluştu!", error: error.message });
  }
});

module.exports = router;