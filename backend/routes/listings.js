const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db'); // Ortak veritabanı modülü

// 1. Güvenli Multer Ayarları (5MB Limit + Format Filtresi)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error("Sadece JPG, PNG ve WEBP formatındaki resimler yüklenebilir."));
  }
});

// --------------------------------------------------------------------------
// 1. TÜM İLANLARI LİSTELEME VE FİLTRELEME (GET /api/listings)
// --------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { search, materialType, city, minPrice, maxPrice, minWeight, maxWeight } = req.query;

    // Sadece arşivlenmemiş (aktif) ilanları getir
    let query = 'SELECT * FROM listings WHERE (is_archived = 0 OR is_archived IS NULL)';
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
// 2. İLAN PANELİ İSTATİSTİKLERİ VE GRAFİKLERİ (GET /api/listings/dashboard-stats)
// --------------------------------------------------------------------------
router.get('/dashboard-stats', async (req, res) => {
  try {
    const db = await getDb();
    
    const totalCountResult = await db.get('SELECT COUNT(*) as count FROM listings WHERE is_archived = 0 OR is_archived IS NULL');
    const totalCount = totalCountResult ? totalCountResult.count : 0;

    res.json({
      success: true,
      data: {
        kpi: {
          totalListings: { value: totalCount, change: "+18.7%", period: "geçen aya göre" },
          activeListings: { value: totalCount, change: "+15.3%", period: "geçen aya göre" },
          addedToday: { value: 12, change: "+9.2%", period: "düne göre" },
          pendingOffers: { value: 5, change: "+12.1%", period: "geçen aya göre" }
        },
        charts: {
          byCategory: [
            { category: "Metal", count: totalCount },
            { category: "Plastik", count: 0 }
          ],
          byStatus: [
            { status: "Aktif", count: totalCount },
            { status: "Pasif", count: 0 }
          ]
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: "İstatistikler çekilirken hata oluştu!", error: error.message });
  }
});

// --------------------------------------------------------------------------
// 3. TEK BİR İLANIN DETAYINI GETİRME (GET /api/listings/:id)
// --------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const listing = await db.get('SELECT * FROM listings WHERE id = ? AND (is_archived = 0 OR is_archived IS NULL)', [req.params.id]);

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
// 4. YENİ İLAN OLUŞTURMA (POST /api/listings) - Validasyon Eklendi
// --------------------------------------------------------------------------
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const db = await getDb();
    const { 
      title, description, weight, unit, price, 
      usageStatus, locationCity, locationDistrict, categoryId, hasCertificate 
    } = req.body;

    const numPrice = parseFloat(price);
    const numWeight = parseFloat(weight);

    // Zorunlu alan kontrolü
    if (!title || isNaN(numPrice) || isNaN(numWeight)) {
      return res.status(400).json({ message: "Başlık, fiyat ve miktar alanları zorunludur!" });
    }

    // Negatif veya Sıfır Fiyat/Ağırlık Engeli
    if (numPrice <= 0 || numWeight <= 0) {
      return res.status(400).json({ message: "Fiyat ve miktar (ağırlık) 0'dan büyük olmalıdır!" });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
    }

    const result = await db.run(
      `INSERT INTO listings 
      (categoryId, title, description, weight, unit, price, usageStatus, locationCity, locationDistrict, hasCertificate, imageUrls, is_archived) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        categoryId || 1, title, description || '', numWeight, unit || 'kg', 
        numPrice, usageStatus, locationCity, locationDistrict, 
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
// 5. İLAN GÜNCELLEME (PUT /api/listings/:id) - Eski Görsel Temizliği & Validasyon
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

    // Fiyat / Ağırlık Güncelleniyorsa Negatiflik Kontrolü
    if (price !== undefined && parseFloat(price) <= 0) {
      return res.status(400).json({ message: "Fiyat 0'dan büyük olmalıdır!" });
    }
    if (weight !== undefined && parseFloat(weight) <= 0) {
      return res.status(400).json({ message: "Miktar 0'dan büyük olmalıdır!" });
    }

    let imageUrls = existingListing.imageUrls ? JSON.parse(existingListing.imageUrls) : [];

    // Yeni resim yüklendiyse eski resimleri diskten temizle
    if (req.files && req.files.length > 0) {
      imageUrls.forEach(url => {
        const filename = url.split('/uploads/')[1];
        if (filename) {
          const filePath = path.join(__dirname, '..', 'uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
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
        title !== undefined ? title : null, 
        description !== undefined ? description : null, 
        weight !== undefined ? parseFloat(weight) : null, 
        unit !== undefined ? unit : null, 
        price !== undefined ? parseFloat(price) : null, 
        usageStatus !== undefined ? usageStatus : null, 
        locationCity !== undefined ? locationCity : null, 
        locationDistrict !== undefined ? locationDistrict : null, 
        categoryId !== undefined ? categoryId : null, 
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
// 6. İLAN KALDIRMA (DELETE /api/listings/:id) - Soft Delete (Arşivleme)
// --------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const listing = await db.get('SELECT id FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ message: "Kaldırılacak ilan bulunamadı!" });
    }

    // Veritabanından silmek yerine pasife alıp arşivliyoruz
    await db.run(
      'UPDATE listings SET is_archived = 1, usageStatus = "Pasif" WHERE id = ?',
      [id]
    );

    res.json({ message: "İlan başarıyla kaldırıldı (arşivlendi)." });
  } catch (error) {
    res.status(500).json({ message: "İlan kaldırılırken hata oluştu!", error: error.message });
  }
});

module.exports = router;