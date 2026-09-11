const { getDb } = require('../db');

// Sistemde kabul edilen geçerli malzeme türleri listesi
const VALID_MATERIALS = ['dkp', 'ekstra', 'bonus', 'toplama', 'pik', 'sac', 'alüminyum', 'bakır'];

// 1. GÜNCEL ENDEKS VERİLERİNİ GETİR (GET /api/indices/current)
exports.getCurrentIndices = async (req, res) => {
  try {
    const db = await getDb();
    let indices = await db.all('SELECT * FROM material_indices ORDER BY updated_at DESC');

    // Tablo boşsa başlangıç için varsayılan endeks verilerini ekle
    if (indices.length === 0) {
      const defaultIndices = [
        ['DKP', 12.50, 1.2, 'Yüksek'],
        ['Ekstra', 11.80, -0.5, 'Yüksek'],
        ['Bonus', 12.10, 0.8, 'Orta'],
        ['Toplama', 10.20, 0.0, 'Orta'],
        ['Pik', 13.40, 2.1, 'Yüksek']
      ];

      for (const item of defaultIndices) {
        await db.run(
          `INSERT OR IGNORE INTO material_indices (material_type, reference_price, daily_change_percent, confidence_level) 
           VALUES (?, ?, ?, ?)`,
          item
        );
      }
      // Ekledikten sonra tekrar veritabanından çek
      indices = await db.all('SELECT * FROM material_indices ORDER BY updated_at DESC');
    }

    res.json({ success: true, data: indices });
  } catch (error) {
    console.error("[controllers/indexController.js]", error);
    res.status(500).json({ message: "Endeksler çekilirken hata oluştu!" });
  }
};

// 2. FİYAT HESAPLAMA VE VALİDASYON (POST /api/indices/calculate)
exports.calculateReference = async (req, res) => {
  const { material_type, pas, nem, user_price, weight } = req.body;

  // Güvenlik 1: Malzeme türü kontrolü
  if (!material_type || !VALID_MATERIALS.includes(material_type.toLowerCase())) {
    return res.status(400).json({ 
      error: `Geçersiz malzeme türü! İzin verilen türler: ${VALID_MATERIALS.join(', ')}` 
    });
  }

  const rustRatio = parseFloat(pas);
  const moistureRatio = parseFloat(nem);
  const basePrice = parseFloat(user_price);
  const totalWeight = weight !== undefined && weight !== null ? parseFloat(weight) : 1;

  // Güvenlik 2: Pas ve Nem tekil mantık sınırı (%0 ile %100 arası olmalı)
  if (isNaN(rustRatio) || rustRatio < 0 || rustRatio > 100) {
    return res.status(400).json({ error: "Pas oranı %0 ile %100 arasında bir sayı olmalıdır." });
  }

  if (isNaN(moistureRatio) || moistureRatio < 0 || moistureRatio > 100) {
    return res.status(400).json({ error: "Nem oranı %0 ile %100 arasında bir sayı olmalıdır." });
  }

  // Güvenlik 3: Toplam Pas ve Nem oranı (Fire) %100 veya üzeri olamaz
  if (rustRatio + moistureRatio >= 100) {
    return res.status(400).json({ error: "Toplam pas ve nem oranı (toplam fire) %100 veya daha fazla olamaz." });
  }

  // Güvenlik 4: Fiyat sıfır veya negatif olamaz
  if (isNaN(basePrice) || basePrice <= 0) {
    return res.status(400).json({ error: "Fiyat (user_price) 0'dan büyük olmalıdır." });
  }

  // Güvenlik 5: Ağırlık sıfır veya negatif olamaz
  if (isNaN(totalWeight) || totalWeight <= 0) {
    return res.status(400).json({ error: "Ağırlık (weight) 0'dan büyük bir sayı olmalıdır." });
  }

  // HESAPLAMA MANTIĞI:
  // Toplam Fire = Pas Oranı + Nem Oranı (Örn: %5 pas + %5 nem = %10 fire)
  const totalDeductionRatio = (rustRatio + moistureRatio) / 100;
  
  // Net kg Fiyatı = Baz Fiyat * (1 - Fire)
  const netPricePerKg = basePrice * (1 - totalDeductionRatio);
  
  // Toplam Tutar = Net kg Fiyatı * Ağırlık
  const totalPrice = netPricePerKg * totalWeight;

  res.json({
    success: true,
    data: {
      material_type,
      original_price: basePrice,
      rust_ratio: rustRatio,
      moisture_ratio: moistureRatio,
      total_deduction_percent: rustRatio + moistureRatio,
      net_price_per_kg: parseFloat(netPricePerKg.toFixed(2)),
      total_price: parseFloat(totalPrice.toFixed(2))
    }
  });
};