require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Cloud Run / Vercel proxy'si arkasında çalışıyoruz. Bu olmadan tüm istekler
// aynı proxy IP'sinden geliyor görünür ve rate limit herkesi birlikte engeller.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ---------------------------------------------------------------------------
// Güvenlik başlıkları
// ---------------------------------------------------------------------------
app.use(helmet({
  // /uploads altındaki görsellerin Vercel kaynağından yüklenebilmesi için
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ---------------------------------------------------------------------------
// CORS — sabit allowlist (wildcard DEĞİL)
// ---------------------------------------------------------------------------
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // origin yoksa (curl, sunucu-sunucu, sağlık kontrolü) izin ver
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: izin verilmeyen origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ---------------------------------------------------------------------------
// Gövde ayrıştırma
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// NOT: Burada eskiden her yanıta 'application/json; charset=utf-8' zorlayan bir
// middleware vardı. Kaldırıldı — iki nedenle:
//   1) res.json() zaten charset=utf-8 gönderir, yani hiç gerekli değildi.
//   2) express.static önceden AYARLANMIŞ bir Content-Type'ı ezmez; bu yüzden
//      /uploads altındaki JPEG'ler de "application/json" olarak etiketleniyordu.
//      Tarayıcılar baytlara bakıp yine de gösteriyordu, ancak helmet'in
//      X-Content-Type-Options: nosniff başlığı bu tahmini kapatır ve görseller
//      kırılırdı.

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.' },
}));

// Giriş/kayıt uçları brute force'a açık — çok daha dar limit
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.' },
}));

// ---------------------------------------------------------------------------
// Statik dosyalar
// Not: Cloud Run dosya sistemi efemerdir. uploads/ imaja gömülü SALT-OKUNUR
// varlıktır; çalışma anında klasör oluşturulmaz.
// ---------------------------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------------------
// Sağlık kontrolleri — İKİ AYRI SÖZLEŞME, bilinçli olarak ayrılmıştır.
//
// /healthz (liveness): Süreç ayaktaysa 200 döner, VERİTABANINA DOKUNMAZ.
//   Cloud Run'ın konteyneri "başladı" sayması için gereken uç budur. Buraya
//   veritabanı sorgusu eklemek, yavaş/erişilemez bir veritabanını başarısız
//   deploy'a çevirir — yani kaçınmaya çalıştığımız hatanın ta kendisi.
//
// /readyz (readiness): Veritabanını gerçekten sorgular, erişilemezse 503 döner.
//   Sorunu deploy'dan SONRA teşhis etmek için kullanılır.
// ---------------------------------------------------------------------------

// Arka plan bağlantı kontrolünün son durumu (yalnızca gözlemlenebilirlik için)
const dbState = { ok: false, lastError: null, checkedAt: null };

// Liveness — veritabanına dokunmaz
function liveness(req, res) {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
  });
}

app.get('/healthz', liveness);
app.get('/health', liveness); // geriye dönük takma ad

// Readiness — veritabanını sorgular
app.get('/readyz', async (req, res) => {
  try {
    await db.get('SELECT 1 AS ok');
    dbState.ok = true;
    dbState.lastError = null;
    dbState.checkedAt = new Date().toISOString();
    res.json({ status: 'ready', db: 'turso' });
  } catch (err) {
    dbState.ok = false;
    dbState.lastError = err.message;
    dbState.checkedAt = new Date().toISOString();
    console.error('[READYZ] Veritabanı erişilemiyor:', err.message);
    res.status(503).json({
      status: 'not-ready',
      db: 'unreachable',
      // Ayrıntı yalnızca üretim dışında; üretimde detay loga gider.
      ...(isProd ? {} : { detail: err.message }),
    });
  }
});

// ---------------------------------------------------------------------------
// Rotalar
// ---------------------------------------------------------------------------
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const listingRoutes = require('./routes/listings');
const companyAnalysisRoutes = require('./routes/companyAnalysis');
const dashboardRoutes = require('./routes/dashboard');
const homeRoutes = require('./routes/home');
const indicesRoutes = require('./routes/indices');
const offersRoutes = require('./routes/offers');
const ordersRoutes = require('./routes/orders');
const bidsRoutes = require('./routes/bids');
const marketRoutes = require('./routes/market');
const reportsRoutes = require('./routes/reports');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/company-analysis', companyAnalysisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/indices', indicesRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/reports', reportsRoutes);

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı.' });
});

// ---------------------------------------------------------------------------
// Merkezi hata yakalayıcı
// Üretimde iç detay (tablo/kolon adları, SQL, dosya yolları) SIZDIRILMAZ.
// Detay yalnızca sunucu loguna (Cloud Logging) gider.
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('[HATA]', req.method, req.originalUrl, err);

  if (err && err.message === 'CORS: izin verilmeyen origin') {
    return res.status(403).json({ error: 'Bu kaynaktan erişime izin verilmiyor.' });
  }

  res.status(err.status || 500).json({
    error: isProd ? 'Sunucu hatası oluştu.' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
});

// ---------------------------------------------------------------------------
// Başlatma
//
// listen() KOŞULSUZ ve mümkün olan en erken anda çağrılır. Cloud Run, konteyneri
// "başladı" saymak için $PORT üzerinde dinlenmesini bekler; bu pencere içinde
// hâlâ Turso'ya ağ gidiş-dönüşü bekleniyorsa revizyon "failed to start" olarak
// işaretlenir ve deploy geri alınır. Böylece yavaş/erişilemez bir veritabanı,
// "veritabanı sorununu bildiren çalışan servis" yerine BAŞARISIZ DEPLOY'a
// dönüşür — üstelik hata yüzeyi gerçek nedene dair neredeyse hiç ipucu vermez.
//
// Veritabanı kontrolü bu yüzden listen()'dan SONRA, arka planda yapılır.
// Başarısızlık loglanır; süreç sonlandırılmaz, dinleme engellenmez.
// ---------------------------------------------------------------------------
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sunucu çalışıyor: port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
});

// Arka plan bağlantı kontrolü — yalnızca gözlemlenebilirlik içindir.
// Durum Cloud Logging'de her iki halde de görünür.
(async () => {
  let host = '(bilinmiyor)';
  try {
    host = new URL(process.env.TURSO_DATABASE_URL).host;
  } catch { /* URL ayrıştırılamazsa log etiketi bilinmiyor kalır */ }

  try {
    await db.get('SELECT 1 AS ok');
    dbState.ok = true;
    dbState.checkedAt = new Date().toISOString();
    console.log(`✅ Turso bağlantısı doğrulandı: ${host}`);
  } catch (err) {
    dbState.ok = false;
    dbState.lastError = err.message;
    dbState.checkedAt = new Date().toISOString();
    // process.exit YOK — sunucu ayakta kalır, /readyz 503 ile durumu bildirir.
    console.error(`❌ Turso bağlantı hatası (${host}): ${err.message}`);
    console.error('   Sunucu dinlemeye devam ediyor; durum için GET /readyz.');
  }
})();

// ---------------------------------------------------------------------------
// Graceful shutdown — Cloud Run SIGTERM gönderip ~10 sn sonra SIGKILL eder.
// ---------------------------------------------------------------------------
function shutdown(signal) {
  console.log(`${signal} alındı, sunucu kapatılıyor...`);
  if (!server) process.exit(0);

  server.close(() => {
    console.log('HTTP sunucusu kapandı.');
    process.exit(0);
  });

  // Uçuştaki istekler 8 sn içinde bitmezse zorla kapat
  setTimeout(() => {
    console.error('Kapanış zaman aşımı, zorla çıkılıyor.');
    process.exit(1);
  }, 8000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
