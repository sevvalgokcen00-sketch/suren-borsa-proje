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
}

initDb().catch(console.error);
module.exports = { getDb };