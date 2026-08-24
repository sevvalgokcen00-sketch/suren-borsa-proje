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

    // 1. LISTINGS TABLOSU OLUŞTURMA & MIGRATION
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

    // 2. ESKİ KAYITLARDA NULL KALAN MATERIALTYPE ALANLARINI DOLDURMA (BACKFILL)
    await db.run("UPDATE listings SET materialType = 'Profil' WHERE (materialType IS NULL OR materialType = '') AND (title LIKE '%Profil%' OR description LIKE '%Profil%');");
    await db.run("UPDATE listings SET materialType = 'Ekstra Hurda' WHERE (materialType IS NULL OR materialType = '') AND (title LIKE '%Ekstra%' OR description LIKE '%Ekstra%');");
    await db.run("UPDATE listings SET materialType = 'Talaş' WHERE (materialType IS NULL OR materialType = '') AND (title LIKE '%Talaş%' OR description LIKE '%Talaş%');");
    await db.run("UPDATE listings SET materialType = 'DKP' WHERE (materialType IS NULL OR materialType = '') AND (title LIKE '%DKP%' OR description LIKE '%DKP%');");
    await db.run("UPDATE listings SET materialType = 'Karışık Hurda' WHERE (materialType IS NULL OR materialType = '') AND (title LIKE '%Karışık%' OR title LIKE '%Mahalle%');");
    await db.run("UPDATE listings SET materialType = '1.Grup Hurda' WHERE (materialType IS NULL OR materialType = '') AND title LIKE '%1.Grup%';");
    // Kalan diğer boş kayıtlara varsayılan değer
    await db.run("UPDATE listings SET materialType = 'Genel Hurda' WHERE materialType IS NULL OR materialType = '';");

    // 3. BIDS TABLOSU & MIGRATION
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

    // 4. PRICE_INDEXES VE PRICE_HISTORY MIGRATION
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

    const indexColumns = await db.all("PRAGMA table_info(price_indexes);");
    const existingIndexCols = indexColumns.map(col => col.name);

    const requiredIndexCols = [
      { name: 'materialType', type: 'TEXT' },
      { name: 'basePrice', type: 'REAL' },
      { name: 'currentAveragePrice', type: 'REAL' },
      { name: 'trend', type: 'TEXT' }
    ];

    for (const col of requiredIndexCols) {
      if (!existingIndexCols.includes(col.name)) {
        await db.run(`ALTER TABLE price_indexes ADD COLUMN ${col.name} ${col.type};`);
        console.log(`🛠️ price_indexes tablosuna '${col.name}' kolonu eklendi.`);
      }
    }

    // 5. MARKET VERİLERİNİ YÜKLE
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
    }

    const historyCount = await db.get('SELECT COUNT(*) as cnt FROM price_history');
    if (historyCount.cnt === 0) {
      for (const idx of sampleIndexes) {
        await db.run(
          `INSERT INTO price_history (materialType, price, recordedDate) VALUES 
            (?, ?, date('now', '-7 days')), 
            (?, ?, date('now', '-3 days')), 
            (?, ?, date('now'))`,
          [idx.materialType, idx.basePrice, idx.materialType, idx.currentAveragePrice - 0.2, idx.materialType, idx.currentAveragePrice]
        );
      }
      console.log('🎉 Market endeks ve geçmiş verileri yüklendi!');
    }

  } catch (err) {
    console.error('Auto seed / migration hatası:', err.message);
  }
}

app.listen(PORT, async () => {
  await autoSeed();
  console.log(`✅ Sunucu ${PORT} portunda çalışıyor`);
});