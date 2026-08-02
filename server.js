const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware Ayarları
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ROUTER BAĞLANTILARI
// (Senin ve arkadaşının rotalarını buraya bağlıyoruz)
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

// Sunucuyu Başlat
app.listen(PORT, () => {
  console.log(`✅ Sunucu modüler yapıda çalışıyor: http://localhost:${PORT}`);
});
