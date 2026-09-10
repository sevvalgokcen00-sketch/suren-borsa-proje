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
      minPrice REAL DEFAULT 0,
      maxPrice REAL DEFAULT 0,
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
      recordedDate DATE DEFAULT (date('now'))
    );
  `);

  // Eksik olabilecek kolonlar için dinamik migration
  const historyCols = (await db.all("PRAGMA table_info(price_history);")).map(c => c.name);
  if (!historyCols.includes('recordedDate')) {
    await db.run("ALTER TABLE price_history ADD COLUMN recordedDate DATE;");
    if (historyCols.includes('date')) {
      await db.run("UPDATE price_history SET recordedDate = date WHERE recordedDate IS NULL;");
    }
  }

  return db;
}

// --------------------------------------------------------------------------
// 1. TÜM ENDEKSLERİ LİSTELEME (GET /api/market/indexes)
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
// --------------------------------------------------------------------------
router.get('/history/:materialType', async (req, res) => {
  try {
    const db = await getDb();
    
    const history = await db.all(
      `SELECT id, materialType, price, 
              COALESCE(recordedDate, id) as recordedDate, 
              COALESCE(recordedDate, id) as date 
       FROM price_history 
       WHERE materialType = ? 
       ORDER BY id ASC 
       LIMIT 30`,
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
    const { 
      materialType, 
      userPrice, 
      price, 
      contamination, 
      usageStatus, 
      hasCertificate 
    } = req.body;

    if (!materialType) {
      return res.status(400).json({ message: "Malzeme türü zorunludur!" });
    }

    const index = await db.get('SELECT * FROM price_indexes WHERE materialType = ?', [materialType]);

    // Kayıt yoksa varsayılan baz fiyat ata
    let baseRef = index ? (index.referencePrice || index.basePrice || 12.5) : 12.5;
    let multiplier = 1.0;

    // Pas / Temizlik / Kullanım durumu kontrolü (hem usageStatus hem contamination destekler)
    const statusVal = usageStatus || contamination;
    if (statusVal === 'Yağlı-Kontamine' || statusVal === 'Ağır Paslı') {
      multiplier -= 0.08;
    } else if (statusVal === 'Temiz') {
      multiplier += 0.03;
    }

    // Sertifika kontrolü
    if (hasCertificate === true || hasCertificate === 'true' || hasCertificate === 1) {
      multiplier += 0.03;
    }

    const refPrice = Number((baseRef * multiplier).toFixed(2));
    const minRecommended = Number((refPrice * 0.95).toFixed(2));
    const maxRecommended = Number((refPrice * 1.05).toFixed(2));

    const enteredPrice = userPrice !== undefined ? userPrice : price;
    let comparisonNote = "";
    if (enteredPrice) {
      const diffPercent = (((Number(enteredPrice) - refPrice) / refPrice) * 100).toFixed(1);
      if (diffPercent > 0) {
        comparisonNote = `Girilen ilan fiyatı referans medyanın %${diffPercent} üzerinde`;
      } else if (diffPercent < 0) {
        comparisonNote = `Girilen ilan fiyatı referans medyanın %${Math.abs(diffPercent)} altında`;
      } else {
        comparisonNote = `Girilen ilan fiyatı referans medyana tam eşittir`;
      }
    }

    // Frontend'in hem Türkçe TL anahtarlarını hem de standart İngilizce anahtarları okuyabilmesi için çift uyumluluk
    res.json({
      materialType: materialType,
      basePrice: baseRef,
      recommendedPrice: refPrice,
      minPrice: minRecommended,
      maxPrice: maxRecommended,
      platformReferenceTL: refPrice.toFixed(2),
      recommendedMinTL: minRecommended.toFixed(2),
      recommendedMaxTL: maxRecommended.toFixed(2),
      trend: index ? (index.trend || 'stable') : 'stable',
      trustLevel: index ? (index.trustLevel || 'Yüksek') : 'Orta',
      transactionCount: index ? (index.transactionCount || 5) : 5,
      comparisonNote: comparisonNote
    });

  } catch (error) {
    res.status(500).json({ message: "Hesaplama yapılırken hata oluştu!", error: error.message });
  }
});

module.exports = router;