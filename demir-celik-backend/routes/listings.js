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
      userId INTEGER DEFAULT 1,
      companyName TEXT DEFAULT 'Referans Demir Çelik A.Ş.',
      categoryId INTEGER,
      materialType TEXT,
      title TEXT NOT NULL,
      description TEXT,
      weight REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      price REAL NOT NULL,
      usageStatus TEXT,
      locationCity TEXT,
      locationDistrict TEXT,
      hasCertificate INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Active',
      imageUrls TEXT DEFAULT '[]',
      qualityStandard TEXT,
      deliveryType TEXT,
      wallThickness TEXT,
      chemicalAnalysis TEXT,
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
    const { 
      search, materialType, usageStatus, city, 
      minPrice, maxPrice, minWeight, maxWeight, 
      userId, categoryId, sort 
    } = req.query;

    // Sadece aktif ilanları çekiyoruz
    let query = "SELECT * FROM listings WHERE status = 'Active'";
    let params = [];

    // Kullanıcıya göre filtre (Benim İlanlarım)
    if (userId) {
      query += ' AND userId = ?';
      params.push(Number(userId));
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR companyName LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Malzeme Türü ve Kullanım Durumu bağımsız filtrelenir
    if (materialType) {
      query += ' AND materialType = ?';
      params.push(materialType);
    }

    if (usageStatus) {
      query += ' AND usageStatus = ?';
      params.push(usageStatus);
    }

    if (categoryId) {
      query += ' AND categoryId = ?';
      params.push(Number(categoryId));
    }

    if (city) {
      query += ' AND locationCity = ?';
      params.push(city);
    }

    if (minPrice) { query += ' AND price >= ?'; params.push(Number(minPrice)); }
    if (maxPrice) { query += ' AND price <= ?'; params.push(Number(maxPrice)); }

    if (minWeight) { query += ' AND weight >= ?'; params.push(Number(minWeight)); }
    if (maxWeight) { query += ' AND weight <= ?'; params.push(Number(maxWeight)); }

    // Sıralama Desteği
    switch (sort) {
      case 'oldest':
        query += ' ORDER BY id ASC';
        break;
      case 'priceAsc':
        query += ' ORDER BY price ASC';
        break;
      case 'priceDesc':
        query += ' ORDER BY price DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY createdAt DESC, id DESC';
        break;
    }

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
      userId, companyName, categoryId, materialType, title, description, 
      weight, unit, price, usageStatus, locationCity, locationDistrict, 
      hasCertificate, qualityStandard, deliveryType, wallThickness, chemicalAnalysis 
    } = req.body;

    // VALIDATION KONTROLLERİ
    if (!title || !price || !weight) {
      return res.status(400).json({ message: "Başlık, fiyat ve miktar alanları zorunludur!" });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ message: "Fiyat 0'dan büyük bir değer olmalıdır!" });
    }

    if (Number(weight) <= 0) {
      return res.status(400).json({ message: "Miktar/Ağırlık 0'dan büyük bir değer olmalıdır!" });
    }

    if (!locationCity || !locationDistrict) {
      return res.status(400).json({ message: "Lütfen geçerli bir şehir ve ilçe giriniz!" });
    }

    // Deploy uyumlu relative URL formatı
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const result = await db.run(
      `INSERT INTO listings 
      (userId, companyName, categoryId, materialType, title, description, weight, unit, price, usageStatus, locationCity, locationDistrict, hasCertificate, status, imageUrls, qualityStandard, deliveryType, wallThickness, chemicalAnalysis) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, ?)`,
      [
        userId ? Number(userId) : 1,
        companyName || 'Referans Demir Çelik A.Ş.',
        categoryId ? Number(categoryId) : 1,
        materialType || '',
        title, 
        description || '', 
        Number(weight), 
        unit || 'kg', 
        Number(price), 
        usageStatus || '', 
        locationCity, 
        locationDistrict, 
        hasCertificate === 'true' || hasCertificate === true ? 1 : 0, 
        JSON.stringify(imageUrls),
        qualityStandard || '',
        deliveryType || '',
        wallThickness || '',
        chemicalAnalysis || ''
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
      userId, title, description, weight, unit, price, 
      usageStatus, materialType, locationCity, locationDistrict, 
      categoryId, hasCertificate, qualityStandard, deliveryType, 
      wallThickness, chemicalAnalysis 
    } = req.body;

    const existingListing = await db.get('SELECT * FROM listings WHERE id = ?', [id]);
    if (!existingListing) {
      return res.status(404).json({ message: "Güncellenecek ilan bulunamadı!" });
    }

    // Yetkilendirme / Sahiplik Kontrolü
    if (userId && Number(existingListing.userId) !== Number(userId)) {
      return res.status(403).json({ message: "Bu ilanı güncelleme yetkiniz yok!" });
    }

    // VALIDATION KONTROLLERİ
    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({ message: "Fiyat 0'dan büyük bir değer olmalıdır!" });
    }

    if (weight !== undefined && Number(weight) <= 0) {
      return res.status(400).json({ message: "Miktar/Ağırlık 0'dan büyük bir değer olmalıdır!" });
    }

    let imageUrls = existingListing.imageUrls ? JSON.parse(existingListing.imageUrls) : [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    await db.run(
      `UPDATE listings SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        weight = COALESCE(?, weight),
        unit = COALESCE(?, unit),
        price = COALESCE(?, price),
        usageStatus = COALESCE(?, usageStatus),
        materialType = COALESCE(?, materialType),
        locationCity = COALESCE(?, locationCity),
        locationDistrict = COALESCE(?, locationDistrict),
        categoryId = COALESCE(?, categoryId),
        hasCertificate = COALESCE(?, hasCertificate),
        qualityStandard = COALESCE(?, qualityStandard),
        deliveryType = COALESCE(?, deliveryType),
        wallThickness = COALESCE(?, wallThickness),
        chemicalAnalysis = COALESCE(?, chemicalAnalysis),
        imageUrls = ?
      WHERE id = ?`,
      [
        title !== undefined ? title : null, 
        description !== undefined ? description : null, 
        weight !== undefined ? Number(weight) : null, 
        unit !== undefined ? unit : null, 
        price !== undefined ? Number(price) : null, 
        usageStatus !== undefined ? usageStatus : null, 
        materialType !== undefined ? materialType : null,
        locationCity !== undefined ? locationCity : null, 
        locationDistrict !== undefined ? locationDistrict : null, 
        categoryId !== undefined ? Number(categoryId) : null, 
        hasCertificate !== undefined ? (hasCertificate === 'true' || hasCertificate === true ? 1 : 0) : null,
        qualityStandard !== undefined ? qualityStandard : null,
        deliveryType !== undefined ? deliveryType : null,
        wallThickness !== undefined ? wallThickness : null,
        chemicalAnalysis !== undefined ? chemicalAnalysis : null,
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
// 5. İLAN SİLME / ARŞİVE ALMA (DELETE /api/listings/:id) - SOFT DELETE
// --------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { userId } = req.body || {};

    const listing = await db.get('SELECT id, userId FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ message: "Silinecek ilan bulunamadı!" });
    }

    // Yetkilendirme / Sahiplik Kontrolü
    if (userId && Number(listing.userId) !== Number(userId)) {
      return res.status(403).json({ message: "Bu ilanı silme yetkiniz yok!" });
    }

    // İlan tamamen silinmeyip statüsü 'Archived' yapılır.
    await db.run("UPDATE listings SET status = 'Archived' WHERE id = ?", [id]);

    res.json({ message: "İlan başarıyla arşive alındı, geçmiş teklifler korundu!" });
  } catch (error) {
    res.status(500).json({ message: "İlan silinirken hata oluştu!", error: error.message });
  }
});

module.exports = router;