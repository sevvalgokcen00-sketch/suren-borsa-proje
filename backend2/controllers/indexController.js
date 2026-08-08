// Canlı Fiyat Asistanı Hesaplama Servisi
exports.calculateReference = async (req, res) => {
  try {
    const { material_type, pas, nem, user_price } = req.body;

    // Baz Referans Fiyatlar (TL/kg)
    let basePrice = 13.50;
    if (material_type === 'profil_levha') basePrice = 14.10;
    if (material_type === 'talas') basePrice = 11.80;
    if (material_type === 'karisik') basePrice = 10.50;

    // Pas ve Nem Katsayı Çarpanları
    let pasMultiplier = pas === 'hafif' ? 0.98 : pas === 'yogun' ? 0.92 : 1.0;
    let nemMultiplier = nem === 'az' ? 0.97 : nem === 'cok' ? 0.90 : 1.0;

    // Referans Hesaplama
    let calculatedPrice = basePrice * pasMultiplier * nemMultiplier;
    let minPrice = (calculatedPrice * 0.95).toFixed(2);
    let maxPrice = (calculatedPrice * 1.05).toFixed(2);

    // Sapma Yüzdesi Hesabı
    let deviationPercent = null;
    if (user_price && user_price > 0) {
      deviationPercent = (((user_price - calculatedPrice) / calculatedPrice) * 100).toFixed(1);
    }

    res.json({
      reference_price: calculatedPrice.toFixed(2),
      min_price: minPrice,
      max_price: maxPrice,
      confidence_level: "Yüksek",
      deviation_percent: deviationPercent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Güncel Endeks Listesi (Ana Sayfa Fiyat Şeridi İçin)
exports.getCurrentIndices = async (req, res) => {
  try {
    const indices = [
      { id: 1, name: 'Temiz Demir-Çelik Kırpıntısı', price: 13.40, change: 1.2 },
      { id: 2, name: 'Profil ve Levha Artığı', price: 14.10, change: -0.5 },
      { id: 3, name: 'Demir-Çelik Talaşı', price: 11.80, change: 0.8 },
      { id: 4, name: 'Karışık / Kontamine Hurda', price: 10.50, change: 0.0 }
    ];
    res.json(indices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};