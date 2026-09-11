const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// --------------------------------------------------------------------------
// 1. TÜM ENDEKSLERİ LİSTELEME (GET /api/market/indexes)
// --------------------------------------------------------------------------
router.get('/indexes', async (req, res) => {
  try {
    const db = await getDb();
    const indexes = await db.all('SELECT * FROM price_indexes ORDER BY id ASC');
    res.json(indexes);
  } catch (error) {
    console.error("[routes/market.js]", error);
    res.status(500).json({ message: "Endeksler alınamadı!" });
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
    console.error("[routes/market.js]", error);
    res.status(500).json({ message: "Fiyat geçmişi alınamadı!" });
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
    console.error("[routes/market.js]", error);
    res.status(500).json({ message: "Hesaplama yapılırken hata oluştu!" });
  }
});

module.exports = router;