const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Türkçe Karakter (UTF-8) Yanıt Zorlaması
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Uploads Klasör Kontrolü (Klasör yoksa otomatik oluşturur)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes (İçe Aktarmalar)
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const listingRoutes = require('./routes/listings');
const companyAnalysisRoutes = require('./routes/companyAnalysis');
const dashboardRoutes = require('./routes/dashboard');
const homeRoutes = require('./routes/home');
const indicesRoutes = require('./routes/indices');
const offersRoutes = require('./routes/offers');

// Routes (Tanımlamalar)
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/company-analysis', companyAnalysisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/indices', indicesRoutes);
app.use('/api/offers', offersRoutes);

// Veritabanı kontrolü ve sunucuyu başlatma
getDb().then(() => {
  console.log('✅ Veritabanı ve tüm tablolar hazır.');
  app.listen(PORT, () => {
    console.log(`🚀 Sunucu modüler yapıda çalışıyor: http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Veritabanı başlatma hatası:', err);
});