const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

// Veritabanı Bağlantısı
async function getDb() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}

// Örnek Arama Verileri (DB Boş veya Çökmüşse Yedeğe Geçer)
const SAMPLE_SEARCH_DATA = [
  { id: 101, title: "Paslanmaz Çelik Profil Hurdası", locationCity: "İstanbul", description: "Temiz profil atığı, demir ve çelik içerir", usageStatus: "Temiz", materialType: "Demir & Çelik", category: "Endüstriyel Hurda" },
  { id: 102, title: "Geri Dönüştürülebilir PET Granül", locationCity: "Kocaeli", description: "Sanayi tipi granül", usageStatus: "Temiz", materialType: "Plastik", category: "Plastik & Granül" },
  { id: 103, title: "Endüstriyel Bakır Kablo Atığı", locationCity: "İzmir", description: "Soyulmuş bakır", usageStatus: "Temiz", materialType: "Bakır", category: "Endüstriyel Hurda" },
  { id: 104, title: "Stok Fazlası Alüminyum Levha", locationCity: "Bursa", description: "Sıfır ayarında levha", usageStatus: "Temiz", materialType: "Alüminyum", category: "Sac & Levha" }
];

// 1. Kategoriler Listesi
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

// 3. Üst Arama Çubuğu (SQL LIKE & LOWER İle Gelişmiş Filtreleme)
exports.searchListings = async (req, res) => {
  try {
    const db = await getDb();

    const rawKeyword = (req.query.q || req.query.keyword || req.query.search || '').trim();
    const rawCategory = (req.query.category || '').trim();

    const cleanKeyword = rawKeyword
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase('tr-TR');

    const cleanCategory = rawCategory
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase('tr-TR');

    // Filtre yoksa tüm ilanları dön
    if (!cleanKeyword && (!cleanCategory || cleanCategory === 'tum kategoriler' || cleanCategory === 'all')) {
      const allListings = await db.all(`SELECT * FROM listings ORDER BY id DESC`);
      const finalData = (allListings && allListings.length > 0) ? allListings : SAMPLE_SEARCH_DATA;

      return res.status(200).json({
        success: true,
        query: { keyword: rawKeyword, category: rawCategory || "Tüm Kategoriler" },
        count: finalData.length,
        data: finalData,
        results: finalData
      });
    }

    // SQL Sorgusu Hazırlığı
    const searchTerm = `%${cleanKeyword}%`;
    let query = `
      SELECT * FROM listings 
      WHERE (
        LOWER(title) LIKE ? OR 
        LOWER(description) LIKE ? OR 
        LOWER(materialType) LIKE ? OR 
        LOWER(locationCity) LIKE ? OR
        LOWER(usageStatus) LIKE ?
      )
    `;

    const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

    if (cleanCategory && cleanCategory !== 'tum kategoriler' && cleanCategory !== 'all') {
      query += ` AND (LOWER(category) LIKE ? OR LOWER(materialType) LIKE ?)`;
      const categoryTerm = `%${cleanCategory}%`;
      params.push(categoryTerm, categoryTerm);
    }

    query += ` ORDER BY id DESC`;

    let dbResults = await db.all(query, params);

    // Sonuç çıkmazsa yedek verilere bak
    if (!dbResults || dbResults.length === 0) {
      dbResults = SAMPLE_SEARCH_DATA.filter(item => {
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const mat = (item.materialType || '').toLowerCase();
        return title.includes(cleanKeyword) || desc.includes(cleanKeyword) || mat.includes(cleanKeyword);
      });
    }

    return res.status(200).json({
      success: true,
      query: { keyword: rawKeyword, category: rawCategory || "Tüm Kategoriler" },
      count: dbResults.length,
      data: dbResults,
      results: dbResults
    });

  } catch (error) {
    console.error("Arama Hatası:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Arama yapılırken sunucu hatası oluştu.", 
      error: error.message 
    });
  }
};