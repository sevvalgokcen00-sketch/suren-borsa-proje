const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

// 1. Route importlarını ekle
const importAnchor = "const offersRoutes = require('./routes/offers');";
const newImports = `const offersRoutes = require('./routes/offers');
const ordersRoutes = require('./routes/orders');
const bidsRoutes = require('./routes/bids');
const marketRoutes = require('./routes/market');`;

if (!content.includes("require('./routes/orders')")) {
  content = content.replace(importAnchor, newImports);
}

// 2. Route kullanımlarını ekle
const useAnchor = "app.use('/api/offers', offersRoutes);";
const newUses = `app.use('/api/offers', offersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/market', marketRoutes);`;

if (!content.includes("app.use('/api/orders'")) {
  content = content.replace(useAnchor, newUses);
}

fs.writeFileSync('server.js', content, 'utf8');
console.log("✅ orders, bids ve market rotaları server.js dosyasına başarıyla eklendi.");
