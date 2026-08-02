const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

app.listen(PORT, () => {
  console.log(`✅ Sunucu modüler yapıda çalışıyor: http://localhost:${PORT}`);
});