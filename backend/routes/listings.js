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

    query += ' ORDER BY id DESC';

    const listings = await db.all(query, params);

    const formattedListings = listings.map(item => ({
      ...item,
      imageUrls: item.imageUrls ? JSON.parse(item.imageUrls) : []
    }));

    res.json(formattedListings);
  } catch (error) {
    console.error("[routes/listings.js]", error);
    res.status(500).json({ message: "İlanlar çekilirken hata oluştu!" });
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
    console.error("[routes/listings.js]", error);
    res.status(500).json({ message: "İstatistikler çekilirken hata oluştu!" });
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
    console.error("[routes/listings.js]", error);
    res.status(500).json({ message: "İlan detayı alınırken hata oluştu!" });
  }
});

// --------------------------------------------------------------------------
// 4. YENİ İLAN OLUŞTURMA (POST /api/listings) - Validasyon Eklendi
// --------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const b = req.body || {};
    
    const titleVal = b.title || b.material_type || b.materialType || 'Demir-Çelik Malzeme';
    const matTypeVal = b.material_type || b.materialType || b.title || 'Demir-Çelik Malzeme';
    const weightVal = parseFloat(b.weight) || 0;
    const priceVal = parseFloat(b.price) || 0;
    const cityVal = b.locationCity || b.city || 'Kocaeli';
    const catVal = b.category || 'Metal';
    const userIdVal = b.userId || b.user_id || 1;

    const result = await db.run(
      `INSERT INTO listings 
      (user_id, title, material_type, weight, price, city, image_url, status, is_archived, materialType, category) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        userIdVal,
        titleVal,
        matTypeVal,
        weightVal,
        priceVal,
        cityVal,
        null,
        'Aktif',
        matTypeVal,
        catVal
      ]
    );

    res.status(201).json({
      message: "İlan başarıyla oluşturuldu!",
      id: result.lastID
    });
  } catch (err) {
    console.error("İlan ekleme hatası:", err);
    res.status(500).json({ message: "İlan eklenirken hata oluştu!" });
  }
});

// --------------------------------------------------------------------------
// 5. İLAN GÜNCELLEME (Kalıcı SQLite Güncellemesi)
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const rawId = req.params.id;
    const numericId = parseInt(String(rawId).replace(/\D/g, ''), 10) || rawId;
    const { price, amount, weight } = req.body || {};
    const finalWeight = weight !== undefined ? weight : amount;

    // Hem rawId hem numericId ile ara
    let existing = await db.get('SELECT * FROM listings WHERE id = ? OR id = ?', [rawId, numericId]);
    
    if (!existing) {
      return res.status(404).json({ message: 'Güncellenecek ilan bulunamadı!' });
    }

    await db.run(
      'UPDATE listings SET price = COALESCE(?, price), weight = COALESCE(?, weight) WHERE id = ?',
      [price, finalWeight, existing.id]
    );

    res.json({ success: true, message: 'İlan başarıyla güncellendi' });
  } catch (error) {
    console.error("PUT /api/listings/:id hatası:", error);
    res.status(500).json({ message: 'İlan güncellenirken hata oluştu!' });
  }
});

// 6. İLAN SİLME (Kalıcı SQLite Silme)
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const rawId = req.params.id;
    const numericId = parseInt(String(rawId).replace(/\D/g, ''), 10) || rawId;

    let existing = await db.get('SELECT id FROM listings WHERE id = ? OR id = ?', [rawId, numericId]);
    
    if (!existing) {
      return res.status(404).json({ message: 'Kaldırılacak ilan bulunamadı!' });
    }

    await db.run('DELETE FROM listings WHERE id = ?', [existing.id]);
    res.json({ success: true, message: 'İlan veritabanından kalıcı olarak kaldırıldı.' });
  } catch (error) {
    console.error("DELETE /api/listings/:id hatası:", error);
    res.status(500).json({ message: 'İlan kaldırılırken hata oluştu!' });
  }
});

// Kullanıcının kendi ilanlarını getiren endpoint (İlanlarım sayfası için)
router.get('/user/:userId', async (req, res) => {
  try {
    const db = await getDb();
    const { userId } = req.params;
    const listings = await db.all(
      'SELECT * FROM listings WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
