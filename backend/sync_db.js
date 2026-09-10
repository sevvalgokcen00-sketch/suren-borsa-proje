const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

async function syncAllTables() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listingId INTEGER,
      userId INTEGER,
      bidAmount REAL,
      quantity REAL,
      totalPrice REAL,
      status TEXT DEFAULT 'Beklemede',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listingId INTEGER,
      buyerId INTEGER,
      bidId INTEGER,
      agreedPrice REAL,
      quantity REAL,
      status TEXT DEFAULT 'Onaylandı',
      savedCarbon REAL,
      savedTrees REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS market_indices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT,
      name TEXT,
      price REAL,
      changeRate REAL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ Tablolar (bids, orders, market_indices) database.sqlite içine eklendi.");
}

syncAllTables();
