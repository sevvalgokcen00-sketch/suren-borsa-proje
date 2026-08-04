const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const multer = require('multer');
const path = require('path');

// Multer (Resim Yükleme) Ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// DB Bağlantısı
async function getDb() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}

// --------------------------------------------------------------------------
// 1. İLANLARI LİSTELEME VE FİLTRELEME
// --------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { search, materialType, city, minPrice, maxPrice, minWeight, maxWeight } = req.query;

    let query = 'SELECT * FROM listings WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (materialType) {
      query += ' AND usageStatus = ?';
      params.push(materialType);
    }

    if (city) {
      query += ' AND locationCity = ?';
      params.push(city);
    }

    if (minPrice) { query += ' AND price >= ?'; params.push(minPrice); }
    if (maxPrice) { query += ' AND price <= ?'; params.push(maxPrice); }

    if (minWeight) { query += ' AND weight >= ?'; params.push(minWeight); }
    if (maxWeight) { query += ' AND weight <= ?'; params.push(maxWeight); }

    const listings = await db.all(query, params);

    const formattedListings = listings.map(item => ({
      ...item,
      imageUrls: item.imageUrls ? JSON.parse(item.imageUrls) : []
    }));

    res.json(formattedListings);
  } catch (error) {
    res.status(500).json({ message: "İlanlar çekilirken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 2. İLAN PANELİ İSTATİSTİKLERİ VE GRAFİKLERİ
// --------------------------------------------------------------------------
router.get('/dashboard-stats', async (req, res) => {
  try {
    const db = await getDb();
    
    // DB üzerindeki toplam ilan sayısını alalım
    const totalCountResult = await db.get('SELECT COUNT(*) as count FROM listings');
    const totalCount = totalCountResult ? totalCountResult.count : 0;

    res.json({
      success: true,
      data: {
        kpi: {
          totalListings: { value: totalCount || 3562, change: "+18.7%", period: "geçen aya göre" },
          activeListings: { value: 2948, change: "+15.3%", period: "geçen aya göre" },
          addedToday: { value: 128, change: "+9.2%", period: "düne göre" },
          pendingOffers: { value: 246, change: "+12.1%", period: "geçen aya göre" }
        },
        charts: {
          byCategory: [
            { category: "Metal", count: 1400 },
            { category: "Plastik", count: 950 },
            { category: "Alüminyum", count: 650 },
            { category: "Kağıt", count: 320 },
            { category: "Diğer", count: 242 }
          ],
          byStatus: [
            { status: "Aktif", count: 2948 },
            { status: "Öne Çıkan", count: 356 },
            { status: "Teklifte", count: 246 },
            { status: "Pasif", count: 12 }
          ]
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: "İstatistikler çekilirken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 3. YENİ İLAN OLUŞTURMA
// --------------------------------------------------------------------------
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const db = await getDb();
    const { 
      title, description, weight, unit, price, 
      usageStatus, locationCity, locationDistrict, categoryId, hasCertificate 
    } = req.body;

    if (!title || !price || !weight) {
      return res.status(400).json({ message: "Başlık, fiyat ve miktar alanları zorunludur!" });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
    }

    const result = await db.run(
      `INSERT INTO listings 
      (categoryId, title, description, weight, unit, price, usageStatus, locationCity, locationDistrict, hasCertificate, imageUrls) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId || 1, title, description || '', weight, unit || 'kg', 
        price, usageStatus, locationCity, locationDistrict, 
        hasCertificate === 'true' || hasCertificate === true ? 1 : 0, 
        JSON.stringify(imageUrls)
      ]
    );

    res.status(201).json({
      message: "İlan başarıyla oluşturuldu!",
      listingId: result.lastID,
      imageUrls: imageUrls
    });
  } catch (error) {
    res.status(500).json({ message: "İlan eklenirken hata oluştu!", error: error.message });
  }
});

module.exports = router;