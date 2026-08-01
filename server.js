const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

// Express Güvenlik ve Dosya Okuma Ayarları
app.use(cors());
app.use(express.json());
// Uploads klasörünü dışarıya açıyoruz (Resimlerin internet adresiyle görünmesi için)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------------------------------------------------------------
// 🖼️ MULTER AYARLARI (Resim Yükleme Sistemi)
// --------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Resimler uploads/ klasörüne kaydolacak
  },
  filename: (req, file, cb) => {
    // Resim adının çakışmaması için başına tarih ekliyoruz
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --------------------------------------------------------------------------
// 🗄️ SQLITE VERİ TABANI KURULUMU VE TABLO OLUŞTURMA
// --------------------------------------------------------------------------
let db;

async function initDb() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // 1. Users Tablosu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // 2. Categories Tablosu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  // 3. Listings Tablosu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      weight REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      price REAL NOT NULL,
      usageStatus TEXT,
      locationCity TEXT,
      locationDistrict TEXT,
      imageUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Varsayılan Kategorileri Ekle (Eğer tablo boşsa)
  const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
  if (categoryCount.count === 0) {
    await db.run(`INSERT INTO categories (name) VALUES 
      ('Yüksek Fırın Cürufu'),
      ('Çelikhane Cürufu'),
      ('Tufal (Haddehane Atığı)'),
      ('Baca Tozu'),
      ('Döküm Kumu')`);
  }

  console.log("🗄️ SQLite Veri Tabanı ve Tablolar Hazır!");
}

initDb();

// --------------------------------------------------------------------------
// 🔑 AUTH ENDPOINT'LERİ (BCrypt Şifreleme İle)
// --------------------------------------------------------------------------

// 1. KAYIT OL (Şifre Hash'leme Eklendi)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Lütfen tüm alanları doldurun!" });
    }

    // E-posta zaten var mı?
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta adresi zaten kayıtlı!" });
    }

    // 🔒 BCrypt ile Şifreyi Gizleme (Hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Veri Tabanına Kaydet
    const result = await db.run(
      'INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)',
      [fullName, email, hashedPassword]
    );

    res.status(201).json({
      message: "Kayıt başarılı!",
      user: { id: result.lastID, fullName, email }
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası!", error: error.message });
  }
});

// 2. GİRİŞ YAP (BCrypt Şifre Kontrolü Eklendi)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı!" });
    }

    // 🔒 Girilen şifre ile hash'lenmiş şifreyi karşılaştır
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı!" });
    }

    res.json({
      message: "Giriş başarılı!",
      user: { id: user.id, fullName: user.fullName, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

// --------------------------------------------------------------------------
// 📦 İLAN VE KATEGORİ ENDPOINT'LERİ (SQLite & Multer İle)
// --------------------------------------------------------------------------

// Categories Listesi
app.get('/api/categories', async (req, res) => {
  const categories = await db.all('SELECT * FROM categories');
  res.json(categories);
});

// Listings Listesi (Filtreleme & Arama Dahil)
app.get('/api/listings', async (req, res) => {
  const { categoryId, search } = req.query;
  let query = 'SELECT * FROM listings WHERE 1=1';
  let params = [];

  if (categoryId) {
    query += ' AND categoryId = ?';
    params.push(categoryId);
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const listings = await db.all(query, params);
  res.json(listings);
});

// İlan Detayı
app.get('/api/listings/:id', async (req, res) => {
  const listing = await db.get('SELECT * FROM listings WHERE id = ?', [req.params.id]);
  if (!listing) return res.status(404).json({ message: "İlan bulunamadı" });
  res.json(listing);
});

// 3. İLAN EKLEME (Multer Resim Yükleme Destekli)
// 'image' adıyla bir resim dosyası gelebilir (upload.single('image'))
app.post('/api/listings', upload.single('image'), async (req, res) => {
  try {
    const { title, description, weight, unit, price, usageStatus, locationCity, locationDistrict, categoryId } = req.body;

    if (!title || !price || !weight) {
      return res.status(400).json({ message: "Başlık, fiyat ve kilo alanları zorunludur!" });
    }

    // Eğer resim yüklendiyse URL'ini ayarla, yüklenmediyse varsayılan gri resmi koy
    let imageUrl = "https://via.placeholder.com/300";
    if (req.file) {
      imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    }

    const result = await db.run(
      `INSERT INTO listings 
      (categoryId, title, description, weight, unit, price, usageStatus, locationCity, locationDistrict, imageUrl) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [categoryId || 1, title, description, weight, unit || 'kg', price, usageStatus, locationCity, locationDistrict, imageUrl]
    );

    res.status(201).json({
      message: "İlan başarıyla oluşturuldu!",
      listingId: result.lastID,
      imageUrl: imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: "İlan eklenirken hata oluştu!", error: error.message });
  }
});

// Sunucuyu Başlat
app.listen(PORT, () => {
  console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});