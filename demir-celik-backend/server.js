const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const bidsRouter = require('./routes/bids');
const marketRouter = require('./routes/market');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bids', bidsRouter);
app.use('/api/market', marketRouter);

// Otomatik Veri Yükleyici (Seed) ve Dinamik Kolon Onarıcı
async function autoSeed() {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // 1. Listings tablosu yoksa oluştur
    await db.exec(`
      CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER DEFAULT 1,
        companyName TEXT DEFAULT 'Referans Demir Çelik A.Ş.',
        categoryId INTEGER DEFAULT 1,
        materialType TEXT,
        title TEXT,
        description TEXT,
        weight REAL,
        unit TEXT DEFAULT 'kg',
        price REAL,
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

    // 2. LISTINGS DİNAMİK MİGRATION: Veriyi silmeden eksik tüm kolonları ekler
    const listingColumns = await db.all("PRAGMA table_info(listings);");
    const existingListingCols = listingColumns.map(col => col.name);

    const requiredListingCols = [
      { name: 'userId', type: 'INTEGER DEFAULT 1' },
      { name: 'companyName', type: "TEXT DEFAULT 'Referans Demir Çelik A.Ş.'" },
      { name: 'categoryId', type: 'INTEGER DEFAULT 1' },
      { name: 'materialType', type: 'TEXT' },
      { name: 'hasCertificate', type: 'INTEGER DEFAULT 0' },
      { name: 'status', type: "TEXT DEFAULT 'Active'" },
      { name: 'imageUrls', type: "TEXT DEFAULT '[]'" },
      { name: 'qualityStandard', type: 'TEXT' },
      { name: 'deliveryType', type: 'TEXT' },
      { name: 'wallThickness', type: 'TEXT' },
      { name: 'chemicalAnalysis', type: 'TEXT' }
    ];

    for (const col of requiredListingCols) {
      if (!existingListingCols.includes(col.name)) {
        await db.run(`ALTER TABLE listings ADD COLUMN ${col.name} ${col.type};`);
        console.log(`🛠️ listings tablosuna '${col.name}' kolonu eklendi.`);
      }
    }

    // 3. BIDS DİNAMİK MİGRATION
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listingId INTEGER NOT NULL,
        buyerId INTEGER DEFAULT 1,
        buyerCompanyName TEXT,
        companyName TEXT,
        price REAL NOT NULL,
        amount REAL NOT NULL,
        unit TEXT DEFAULT 'kg',
        status TEXT DEFAULT 'Bekliyor',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const bidColumns = await db.all("PRAGMA table_info(bids);");
    const existingBidCols = bidColumns.map(col => col.name);

    const requiredBidCols = [
      { name: 'buyerId', type: 'INTEGER DEFAULT 1' },
      { name: 'buyerCompanyName', type: 'TEXT' }
    ];

    for (const col of requiredBidCols) {
      if (!existingBidCols.includes(col.name)) {
        await db.run(`ALTER TABLE bids ADD COLUMN ${col.name} ${col.type};`);
        console.log(`🛠️ bids tablosuna '${col.name}' kolonu eklendi.`);
      }
    }

    // 4. MARKET TABLOLARI VE SEED VERİLERİ
    await db.exec(`
      CREATE TABLE IF NOT EXISTS price_indexes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        materialType TEXT UNIQUE,
        basePrice REAL,
        currentAveragePrice REAL,
        trend TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        materialType TEXT,
        price REAL,
        recordedDate DATE DEFAULT (date('now'))
      );
    `);

    const marketCount = await db.get('SELECT COUNT(*) as cnt FROM price_indexes');
    if (marketCount.cnt === 0) {
      console.log('⚡ Market endeks ve geçmiş fiyat verileri yükleniyor...');
      
      const sampleIndexes = [
        { materialType: 'Profil', basePrice: 13.0, currentAveragePrice: 13.50, trend: 'up' },
        { materialType: 'Ekstra Hurda', basePrice: 11.5, currentAveragePrice: 12.10, trend: 'stable' },
        { materialType: 'DKP', basePrice: 13.8, currentAveragePrice: 14.30, trend: 'up' },
        { materialType: 'Talaş', basePrice: 9.8, currentAveragePrice: 10.20, trend: 'down' }
      ];

      for (const idx of sampleIndexes) {
        await db.run(
          `INSERT OR REPLACE INTO price_indexes (materialType, basePrice, currentAveragePrice, trend) VALUES (?, ?, ?, ?)`,
          [idx.materialType, idx.basePrice, idx.currentAveragePrice, idx.trend]
        );

        await db.run(
          `INSERT INTO price_history (materialType, price, recordedDate) VALUES (?, ?, date('now', '-7 days')), (?, ?, date('now', '-3 days')), (?, ?, date('now'))`,
          [idx.materialType, idx.basePrice, idx.materialType, idx.currentAveragePrice - 0.2, idx.materialType, idx.currentAveragePrice]
        );
      }
      console.log('🎉 Market verileri başarıyla yüklendi!');
    }

    // 5. Başlangıç Verilerini Yükle
    const count = await db.get('SELECT COUNT(*) as cnt FROM listings');
    if (count.cnt === 0) {
      console.log('⚡ Veritabanı boş, başlangıç ilanları ekleniyor...');
      const initialListings = [
        { userId: 1, companyName: 'Marmara Geri Dönüşüm A.Ş.', materialType: 'Profil', title: 'İmalat Artığı Profil - Gevşek', description: 'Yağlı-Kontamine nitelikte İmalat Artığı Profil.', weight: 931.9, unit: 'kg', price: 13.58, usageStatus: 'Yağlı-Kontamine', locationCity: 'Gaziantep', locationDistrict: 'Şehitkamil', qualityStandard: 'DIN 2395', deliveryType: 'Fabrika Teslim' },
        { userId: 1, companyName: 'Anadolu Metal Sanayi', materialType: 'Ekstra Hurda', title: 'Ekstra Hurda - Preslenmiş Balya', description: 'Temiz nitelikte Ekstra Hurda.', weight: 1100.6, unit: 'kg', price: 12.07, usageStatus: 'Temiz', locationCity: 'Gaziantep', locationDistrict: 'Şahinbey', qualityStandard: 'EN 10025', deliveryType: 'Adrese Teslim' },
        { userId: 2, companyName: 'Ege Çelik Geri Kazanım', materialType: 'Talaş', title: 'Talaş / Kırpıntı - Preslenmiş Balya', description: 'Temiz nitelikte Talaş / Kırpıntı.', weight: 176.1, unit: 'kg', price: 10.46, usageStatus: 'Temiz', locationCity: 'İstanbul', locationDistrict: 'Ümraniye', qualityStandard: 'Standart Dışı', deliveryType: 'Fabrika Teslim' },
        { userId: 2, companyName: 'Boğaziçi Hurda Sanayi', materialType: 'DKP', title: 'DKP Hurda - Parçalanmış', description: 'Temiz nitelikte DKP Hurda.', weight: 1349.8, unit: 'kg', price: 14.26, usageStatus: 'Temiz', locationCity: 'İstanbul', locationDistrict: 'Tuzla', qualityStandard: 'DIN EN 10130', deliveryType: 'Adrese Teslim' }
      ];

      for (const item of initialListings) {
        await db.run(
          `INSERT INTO listings (
            userId, companyName, categoryId, materialType, title, description, 
            weight, unit, price, usageStatus, locationCity, locationDistrict, 
            hasCertificate, status, imageUrls, qualityStandard, deliveryType
          ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Active', '[]', ?, ?)`,
          [
            item.userId, item.companyName, item.materialType, item.title, item.description,
            item.weight, item.unit, item.price, item.usageStatus, item.locationCity, item.locationDistrict,
            item.qualityStandard, item.deliveryType
          ]
        );
      }
      console.log('🎉 Başlangıç ilanları veritabanına başarıyla yüklendi!');
    }
  } catch (err) {
    console.error('Auto seed / migration hatası:', err.message);
  }
}

app.listen(PORT, async () => {
  await autoSeed();
  console.log(`✅ Sunucu ${PORT} portunda çalışıyor`);
});