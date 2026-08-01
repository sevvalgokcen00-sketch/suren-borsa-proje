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
// Uploads klasörünü dışarıya açıyoruz
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------------------------------------------------------------
// 🖼️ MULTER AYARLARI (Çoklu Resim Yükleme Sistemi)
// --------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// En fazla 5 adet resim yüklenmesine izin veriyoruz
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

  // 1. Users Tablosu (Kurumsal & Bireysel Tüm Alanlar Eklendi)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userType TEXT DEFAULT 'kurumsal',
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      companyName TEXT,
      taxOffice TEXT,
      taxNumber TEXT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      city TEXT,
      district TEXT,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Categories Tablosu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  // 3. Listings Tablosu (Sertifika ve Çoklu Görsel Alanı Eklendi)
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
      hasCertificate INTEGER DEFAULT 0,
      imageUrls TEXT, 
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sizin Demir-Çelik Sistemine Uygun Kategorileri Ekle
  const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
  if (categoryCount.count === 0) {
    await db.run(`INSERT INTO categories (name) VALUES 
      ('Yassı Mamuller'),
      ('Uzun Mamuller'),
      ('Boru & Kutu Profil'),
      ('Paslanmaz Çelik'),
      ('Hurda & Parça Sac'),
      ('Vasıflı Çelikler')`);
  }

  console.log("🗄️ SQLite Veri Tabanı ve Tablolar Hazır!");
}

initDb();

// --------------------------------------------------------------------------
// 🔑 AUTH ENDPOINT'LERİ (Kayıt Ol ve Giriş Yap)
// --------------------------------------------------------------------------

// 1. KAYIT OL (Frontend Kayıt Formu İle Birebir Uyumlu)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      userType, firstName, lastName, companyName, 
      taxOffice, taxNumber, email, phone, city, district, password 
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Lütfen zorunlu alanları doldurun!" });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta adresi zaten kayıtlı!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      `INSERT INTO users 
      (userType, firstName, lastName, companyName, taxOffice, taxNumber, email, phone, city, district, password) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userType || 'kurumsal', firstName, lastName, companyName || null, taxOffice || null, taxNumber || null, email, phone || null, city || null, district || null, hashedPassword]
    );

    res.status(201).json({
      message: "Kayıt başarılı!",
      user: { id: result.lastID, firstName, lastName, email }
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası!", error: error.message });
  }
});

// 2. GİRİŞ YAP
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı!" });
    }

    res.json({
      message: "Giriş başarılı!",
      user: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email,
        companyName: user.companyName 
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

// --------------------------------------------------------------------------
// 📦 İLAN VE KATEGORİ ENDPOINT'LERİ
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
  
  // Resim URL'lerini JSON dizisine çevirip geri yolluyoruz
  const formattedListings = listings.map(item => ({
    ...item,
    imageUrls: item.imageUrls ? JSON.parse(item.imageUrls) : []
  }));

  res.json(formattedListings);
});

// 3. İLAN EKLEME (Çoklu Resim Desteği: upload.array('images', 5))
app.post('/api/listings', upload.array('images', 5), async (req, res) => {
  try {
    const { 
      title, description, weight, unit, price, 
      usageStatus, locationCity, locationDistrict, categoryId, hasCertificate 
    } = req.body;

    if (!title || !price || !weight) {
      return res.status(400).json({ message: "Başlık, fiyat ve miktar alanları zorunludur!" });
    }

    // Yüklenen tüm resimlerin adreslerini diziye alıyoruz
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `http://localhost:${PORT}/uploads/${file.filename}`);
    }

    const result = await db.run(
      `INSERT INTO listings 
      (categoryId, title, description, weight, unit, price, usageStatus, locationCity, locationDistrict, hasCertificate, imageUrls) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId || 1, title, description || '', weight, unit || 'kg', 
        price, usageStatus, locationCity, locationDistrict, 
        hasCertificate === 'true' || hasCertificate === true ? 1 : 0, 
        JSON.stringify(imageUrls)
      ]
    );

    res.status(201).json({
      message: "İlan başarıyla oluşturuldu!",
      listingId: result.lastID,
      imageUrls: imageUrls
    });
  } catch (error) {
    res.status(500).json({ message: "İlan eklenirken hata oluştu!", error: error.message });
  }
});

// Sunucuyu Başlat
app.listen(PORT, () => {
  console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});