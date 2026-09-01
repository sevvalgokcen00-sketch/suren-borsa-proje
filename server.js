const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const bidsRouter = require('./routes/bids');
const marketRouter = require('./routes/market');
const homeRouter = require('./routes/home'); // <-- Home route eklendi

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bids', bidsRouter);
app.use('/api/market', marketRouter);
app.use('/api/home', homeRouter); // <-- /api/home adresi tanımlandı

// Otomatik Veri Yükleyici (Seed)
async function autoSeed() {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Tablo yoksa oluştur
    await db.exec(`
      CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER,
        title TEXT,
        description TEXT,
        weight REAL,
        unit TEXT,
        price REAL,
        usageStatus TEXT,
        locationCity TEXT,
        locationDistrict TEXT,
        hasCertificate INTEGER,
        imageUrls TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const count = await db.get('SELECT COUNT(*) as cnt FROM listings');
    if (count.cnt === 0) {
      console.log('⚡ Veritabanı boş, başlangıç ilanları ekleniyor...');
      const initialListings = [
        { title: 'İmalat Artığı Profil - Gevşek', description: 'Yağlı-Kontamine nitelikte İmalat Artığı Profil.', weight: 931.9, unit: 'kg', price: 13.58, usageStatus: 'Yağlı-Kontamine', locationCity: 'Gaziantep', locationDistrict: 'Şehitkamil' },
        { title: 'Ekstra Hurda - Preslenmiş Balya', description: 'Temiz nitelikte Ekstra Hurda.', weight: 1100.6, unit: 'kg', price: 12.07, usageStatus: 'Temiz', locationCity: 'Gaziantep', locationDistrict: 'Şahinbey' },
        { title: 'Talaş / Kırpıntı - Preslenmiş Balya', description: 'Temiz nitelikte Talaş / Kırpıntı.', weight: 176.1, unit: 'kg', price: 10.46, usageStatus: 'Temiz', locationCity: 'İstanbul', locationDistrict: 'Ümraniye' },
        { title: 'DKP Hurda - Parçalanmış', description: 'Temiz nitelikte DKP Hurda.', weight: 1349.8, unit: 'kg', price: 14.26, usageStatus: 'Temiz', locationCity: 'İstanbul', locationDistrict: 'Tuzla' },
        { title: 'Talaş / Kırpıntı - Parçalanmış', description: 'Ağır Paslı nitelikte Talaş / Kırpıntı.', weight: 1732.2, unit: 'kg', price: 8.82, usageStatus: 'Ağır Paslı', locationCity: 'İstanbul', locationDistrict: 'Tuzla' },
        { title: 'Mahalle (Karışık) - Gevşek', description: 'Yağlı-Kontamine nitelikte Karışık Hurda.', weight: 1100.1, unit: 'kg', price: 8.30, usageStatus: 'Yağlı-Kontamine', locationCity: 'İstanbul', locationDistrict: 'Esenyurt' },
        { title: '1.Grup Hurda - Balya', description: 'Temiz nitelikte 1.Grup Hurda.', weight: 999.1, unit: 'kg', price: 10.68, usageStatus: 'Temiz', locationCity: 'Kocaeli', locationDistrict: 'Gebze' }
      ];

      const sampleImage = 'http://localhost:5000/uploads/sample-iron.jpg';
      for (const item of initialListings) {
        await db.run(
          `INSERT INTO listings (categoryId, title, description, weight, unit, price, usageStatus, locationCity, locationDistrict, hasCertificate, imageUrls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [1, item.title, item.description, item.weight, item.unit, item.price, item.usageStatus, item.locationCity, item.locationDistrict, 1, JSON.stringify([sampleImage])]
        );
      }
      console.log('🎉 Başlangıç ilanları veritabanına başarıyla yüklendi!');
    }
  } catch (err) {
    console.error('Auto seed hatası:', err.message);
  }
}

app.listen(PORT, async () => {
  await autoSeed();
  console.log(`✅ Sunucu 5000 portunda başarıyla çalışıyor!`);
});