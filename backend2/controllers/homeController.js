const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

// Veritabanı Bağlantısı (Bağımsız ve Güvenli)
async function getDb() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}

// Türkçe karakter ve küçük/büyük harf uyumsuzluğunu çözen yardımcı fonksiyon
const normalizeText = (str) => {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase('tr-TR')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
};

// Örnek Arama Verileri (Yalnızca DB Çökerse Devreye Girer)
const SAMPLE_SEARCH_DATA = [
  { id: 101, title: "Paslanmaz Çelik Profil Hurdası", locationCity: "İstanbul", description: "Temiz profil atığı", usageStatus: "Temiz" },
  { id: 102, title: "Geri Dönüştürülebilir PET Granül", locationCity: "Kocaeli", description: "Sanayi tipi granül", usageStatus: "Temiz" },
  { id: 103, title: "Endüstriyel Bakır Kablo Atığı", locationCity: "İzmir", description: "Soyulmuş bakır", usageStatus: "Temiz" },
  { id: 104, title: "Stok Fazlası Alüminyum Levha", locationCity: "Bursa", description: "Sıfır ayarında levha", usageStatus: "Temiz" }
];

// 1. Kategoriler
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 1, name: "Profiller & Borular", count: 1234, icon: "pipe" },
      { id: 2, name: "Sac & Levha", count: 2345, icon: "sheet" },
      { id: 3, name: "Plastik & Granül", count: 856, icon: "plastic" },
      { id: 4, name: "Alüminyum", count: 1098, icon: "aluminum" },
      { id: 5, name: "Kağıt & Karton", count: 987, icon: "paper" },
      { id: 6, name: "Ahşap & Palet", count: 654, icon: "wood" },
      { id: 7, name: "Endüstriyel Hurda", count: 543, icon: "scrap" },
      { id: 8, name: "Diğer", count: 321, icon: "other" }
    ];
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Öne Çıkan İlanlar
exports.getFeaturedListings = async (req, res) => {
  try {
    const db = await getDb();
    const dbListings = await db.all(`SELECT * FROM listings ORDER BY id DESC LIMIT 4`);

    if (dbListings && dbListings.length > 0) {
      return res.status(200).json({ success: true, data: dbListings, results: dbListings });
    }

    res.status(200).json({ success: true, data: SAMPLE_SEARCH_DATA, results: SAMPLE_SEARCH_DATA });
  } catch (error) {
    res.status(200).json({ success: true, data: SAMPLE_SEARCH_DATA, results: SAMPLE_SEARCH_DATA });
  }
};

// 3. Üst Arama Çubuğu (Gelişmiş Arama ve Filtreleme)
exports.searchListings = async (req, res) => {
  try {
    const db = await getDb();

    const rawKeyword = (req.query.keyword || req.query.q || req.query.search || '').trim();
    const rawCategory = (req.query.category || '').trim();

    const normKeyword = normalizeText(rawKeyword);
    const normCategory = normalizeText(rawCategory);

    let allListings = [];

    try {
      // Tabloda 'status' sütunu olmadığı için yalın çekim yapılıyor
      allListings = await db.all(`SELECT * FROM listings ORDER BY id DESC`);
    } catch (dbErr) {
      console.error("DB Çekme Hatası:", dbErr.message);
      allListings = [];
    }

    const targetSource = (allListings && allListings.length > 0) ? allListings : SAMPLE_SEARCH_DATA;

    // Veritabanı Şemasına Uygun Filtreleme (locationCity, usageStatus, title, description)
    const filteredResults = targetSource.filter(item => {
      const title = normalizeText(item.title);
      const desc = normalizeText(item.description);
      const city = normalizeText(item.locationCity || item.city);
      const usageStatus = normalizeText(item.usageStatus);
      const matType = normalizeText(item.material_type || item.title);
      const itemCat = normalizeText(item.category || item.title);

      const matchesKeyword = !normKeyword || 
        title.includes(normKeyword) || 
        desc.includes(normKeyword) || 
        city.includes(normKeyword) ||
        usageStatus.includes(normKeyword) ||
        matType.includes(normKeyword);

      const matchesCategory = !normCategory || 
        normCategory === "tum kategoriler" || 
        normCategory === "all" ||
        itemCat.includes(normCategory) ||
        matType.includes(normCategory);

      return matchesKeyword && matchesCategory;
    });

    return res.status(200).json({
      success: true,
      query: { keyword: rawKeyword, category: rawCategory || "Tüm Kategoriler" },
      count: filteredResults.length,
      data: filteredResults,
      results: filteredResults
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Arama yapılırken sunucu hatası oluştu.", 
      error: error.message 
    });
  }
};