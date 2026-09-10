const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function getDb() {
  return open({
    filename: path.join(__dirname, '../database.sqlite'), // Kök dizindeki ortak veritabanı
    driver: sqlite3.Database
  });
}

async function initDb() {
  const db = await getDb();

  // 1. Tablo Yapılarını Oluştur (Sıfır kurulumlar için materialType ve category eklendi)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      company_name TEXT,
      tax_number TEXT,
      theme TEXT DEFAULT 'light',
      notifications_enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      material_type TEXT NOT NULL,
      materialType TEXT,
      category TEXT,
      weight REAL NOT NULL,
      price REAL NOT NULL,
      city TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'Aktif',
      is_archived INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER,
      buyer_id INTEGER,
      offered_price_per_kg REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS material_indices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_type TEXT UNIQUE,
      reference_price REAL,
      daily_change_percent REAL,
      confidence_level TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS index_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_type TEXT,
      price REAL,
      recorded_date DATE
    );
  `);

  // 2. DB Migration: Var olan 'listings' tablosuna eksik kolonları güvenli şekilde ekle
  try {
    const columns = await db.all(`PRAGMA table_info(listings)`);
    const existingColumns = columns.map(c => c.name);

    if (!existingColumns.includes('materialType')) {
      await db.exec(`ALTER TABLE listings ADD COLUMN materialType TEXT;`);
      console.log("✅ Migration: 'materialType' kolonu eklendi.");
    }

    if (!existingColumns.includes('category')) {
      await db.exec(`ALTER TABLE listings ADD COLUMN category TEXT;`);
      console.log("✅ Migration: 'category' kolonu eklendi.");
    }
  } catch (migErr) {
    console.error("Migration Kontrol Hatası:", migErr.message);
  }

  // 3. UTF-8 Karakter Onarımı (Bozuk Türkçe Karakterleri Otomatik Düzelt)
  try {
    await db.run(`
      UPDATE listings 
      SET title = REPLACE(REPLACE(title, 'Gncel', 'Güncel'), 'elik', 'Çelik'),
          material_type = REPLACE(REPLACE(material_type, 'Gncel', 'Güncel'), 'elik', 'Çelik')
      WHERE title LIKE '%Gncel%' OR title LIKE '%elik%' OR material_type LIKE '%Gncel%' OR material_type LIKE '%elik%';
    `);
  } catch (utfErr) {
    // Düzeltme esnasında bir uyarı oluşursa sunucu açılışının patlamasını engeller
  }
}

initDb().catch(console.error);

module.exports = { getDb };