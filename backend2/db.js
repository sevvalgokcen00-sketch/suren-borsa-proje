const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function getDb() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
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

    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER,
      buyer_id INTEGER,
      offered_price_per_kg REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

module.exports = { getDb };