const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (İçe Aktarmalar)
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const companyAnalysisRoutes = require('./routes/companyAnalysis');
const dashboardRoutes = require('./routes/dashboard');
const homeRoutes = require('./routes/home');

// Routes (Tanımlamalar)
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/company-analysis', companyAnalysisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/home', homeRoutes);

app.listen(PORT, () => {
  console.log(`✅ Sunucu modüler yapıda çalışıyor: http://localhost:${PORT}`);
});  