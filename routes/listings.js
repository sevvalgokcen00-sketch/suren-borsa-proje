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

// DB Bağlantısı ve Otomatik Tablo Oluşturucu
async function getDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      weight REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      price REAL NOT NULL,
      usageStatus TEXT,
      locationCity TEXT,
      locationDistrict TEXT,
      hasCertificate INTEGER DEFAULT 0,
      imageUrls TEXT, 
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

// --------------------------------------------------------------------------
// 1. TÜM İLANLARI LİSTELEME VE FİLTRELEME (GET /api/listings)
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

    query += ' ORDER BY createdAt DESC';

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
// 2. TEK BİR İLANIN DETAYINI GETİRME (GET /api/listings/:id)
// --------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', [req.params.id]);

    if (!listing) {
      return res.status(404).json({ message: "İlan bulunamadı!" });
    }

    res.json({
      ...listing,
      imageUrls: listing.imageUrls ? JSON.parse(listing.imageUrls) : []
    });
  } catch (error) {
    res.status(500).json({ message: "İlan detayı alınırken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 3. YENİ İLAN OLUŞTURMA (POST /api/listings)
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

// --------------------------------------------------------------------------
// 4. İLAN GÜNCELLEME (PUT /api/listings/:id)
// --------------------------------------------------------------------------
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { 
      title, description, weight, unit, price, 
      usageStatus, locationCity, locationDistrict, categoryId, hasCertificate 
    } = req.body;

    const existingListing = await db.get('SELECT * FROM listings WHERE id = ?', [id]);
    if (!existingListing) {
      return res.status(404).json({ message: "Güncellenecek ilan bulunamadı!" });
    }

    let imageUrls = existingListing.imageUrls ? JSON.parse(existingListing.imageUrls) : [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
    }

    await db.run(
      `UPDATE listings SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        weight = COALESCE(?, weight),
        unit = COALESCE(?, unit),
        price = COALESCE(?, price),
        usageStatus = COALESCE(?, usageStatus),
        locationCity = COALESCE(?, locationCity),
        locationDistrict = COALESCE(?, locationDistrict),
        categoryId = COALESCE(?, categoryId),
        hasCertificate = COALESCE(?, hasCertificate),
        imageUrls = ?
      WHERE id = ?`,
      [
        title, description, weight, unit, price, 
        usageStatus, locationCity, locationDistrict, categoryId, 
        hasCertificate !== undefined ? (hasCertificate === 'true' || hasCertificate === true ? 1 : 0) : null,
        JSON.stringify(imageUrls),
        id
      ]
    );

    res.json({ message: "İlan başarıyla güncellendi!" });
  } catch (error) {
    res.status(500).json({ message: "İlan güncellenirken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 5. İLAN SİLME (DELETE /api/listings/:id)
// --------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM listings WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Silinecek ilan bulunamadı!" });
    }

    res.json({ message: "İlan başarıyla silindi!" });
  } catch (error) {
    res.status(500).json({ message: "İlan silinirken hata oluştu!", error: error.message });
  }
});

module.exports = router;