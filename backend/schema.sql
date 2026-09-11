-- =====================================================================
-- SÜREN BORSA — TAM ŞEMA (tek kaynak)
-- Koddaki TÜM sorgulanan tablo ve kolonları içerir.
-- Uygulama:  sqlite3 database.sqlite < backend/schema.sql
-- Turso:     turso db shell suren-borsa < backend/schema.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- users
-- db.js:17 tablosuna profileController'ın sorguladığı 7 EKSİK kolon eklendi:
-- tax_office, address, email_offers, email_market, sms_alerts,
-- subscription_plan, subscription_features
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  name                  TEXT NOT NULL,
  email                 TEXT UNIQUE NOT NULL,
  password              TEXT NOT NULL,
  phone                 TEXT,
  company_name          TEXT,
  tax_number            TEXT,
  tax_office            TEXT,
  address               TEXT,
  theme                 TEXT    DEFAULT 'light',
  notifications_enabled INTEGER DEFAULT 1,
  email_offers          INTEGER DEFAULT 1,
  email_market          INTEGER DEFAULT 1,
  sms_alerts            INTEGER DEFAULT 0,
  subscription_plan     TEXT    DEFAULT 'free',
  subscription_features TEXT,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- listings
-- Hem snake_case hem camelCase kolonlar bilinçli olarak birlikte var:
-- kod tabanı her iki adlandırmayı da sorguluyor (listings.js + homeController.js).
-- EKSİK olanlar eklendi: description, usageStatus, locationCity,
-- locationDistrict, imageUrls, imageUrl, unit, categoryId
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listings (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER REFERENCES users(id),
  categoryId       INTEGER,
  title            TEXT NOT NULL,
  description      TEXT,
  material_type    TEXT NOT NULL,
  materialType     TEXT,
  category         TEXT,
  usageStatus      TEXT,
  weight           REAL NOT NULL,
  unit             TEXT    DEFAULT 'kg',
  price            REAL NOT NULL,
  city             TEXT,
  locationCity     TEXT,
  locationDistrict TEXT,
  image_url        TEXT,
  imageUrl         TEXT,
  imageUrls        TEXT,                     -- JSON dizi METNİ: '["/uploads/a.jpg"]'
  status           TEXT    DEFAULT 'Aktif',
  is_archived      INTEGER DEFAULT 0,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- bids  *** KODDA HİÇBİR YERDE YARATILMIYORDU ***
-- routes/bids.js bu tabloyu sorguluyor; yokluğunda 4 endpoint patlıyor.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bids (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  listingId        INTEGER REFERENCES listings(id),
  buyerId          INTEGER REFERENCES users(id),
  buyerCompanyName TEXT,
  amount           REAL NOT NULL,
  unit             TEXT    DEFAULT 'kg',
  price            REAL NOT NULL,
  totalPrice       REAL,
  incoterm         TEXT    DEFAULT 'FOB',
  paymentType      TEXT    DEFAULT 'Peşin',
  buyerNote        TEXT,
  expiresIn        TEXT    DEFAULT '24 Saat',
  status           TEXT    DEFAULT 'bekleyen',
  hasCertificate   INTEGER DEFAULT 0,
  createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- invoices  *** KODDA HİÇBİR YERDE YARATILMIYORDU ***
-- profileController.js:97 sorguluyor.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  date    DATE,
  amount  REAL,
  status  TEXT DEFAULT 'Ödendi',
  pdf_url TEXT
);

-- ---------------------------------------------------------------------
-- orders  (routes/orders.js:14'ten alındı — artık çalışma anında değil)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  bidId            INTEGER,
  listingId        INTEGER NOT NULL,
  buyerId          INTEGER DEFAULT 1,
  sellerId         INTEGER DEFAULT 1,
  agreedPrice      REAL NOT NULL,
  amount           REAL NOT NULL,
  paymentMethod    TEXT    DEFAULT 'Kurumsal Havale / EFT',
  deliveryAddress  TEXT,
  shippingDate     DATE,
  contractAccepted INTEGER DEFAULT 1,
  savedCarbon      REAL,
  savedTrees       INTEGER,
  status           TEXT    DEFAULT 'Completed',
  createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- offers  (dashboardController.js:25 "pending" sayımı için)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offers (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id           INTEGER,
  buyer_id             INTEGER,
  offered_price_per_kg REAL,
  status               TEXT DEFAULT 'pending',
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- material_indices  (controllers/indexController.js)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_indices (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  material_type        TEXT UNIQUE,
  reference_price      REAL,
  daily_change_percent REAL,
  confidence_level     TEXT,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS index_history (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  material_type TEXT,
  price         REAL,
  recorded_date DATE
);

-- ---------------------------------------------------------------------
-- price_indexes  (routes/market.js)
-- 'basePrice' ve 'trend' eklendi: market.js:119 ve :162 bu alanları
-- okuyor ama market.js:25'teki CREATE'de yoklardı (hep fallback'e düşüyordu).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_indexes (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  materialType       TEXT UNIQUE NOT NULL,
  referencePrice     REAL NOT NULL,
  basePrice          REAL,
  trend              TEXT    DEFAULT 'stable',
  dailyChangePercent REAL    DEFAULT 0.0,
  minPrice           REAL    DEFAULT 0,
  maxPrice           REAL    DEFAULT 0,
  transactionCount   INTEGER DEFAULT 0,
  trustLevel         TEXT    DEFAULT 'Yüksek',
  updatedAt          DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_history (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  materialType TEXT NOT NULL,
  price        REAL NOT NULL,
  recordedDate DATE DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS external_market_prices (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  materialType  TEXT NOT NULL,
  usdRate       REAL DEFAULT 38.5,
  globalPriceTL REAL NOT NULL,
  updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- İndeksler
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_listings_archived ON listings(is_archived);
CREATE INDEX IF NOT EXISTS idx_listings_user     ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status   ON listings(status);
CREATE INDEX IF NOT EXISTS idx_bids_listing      ON bids(listingId);
CREATE INDEX IF NOT EXISTS idx_bids_buyer        ON bids(buyerId);
CREATE INDEX IF NOT EXISTS idx_orders_listing    ON orders(listingId);
CREATE INDEX IF NOT EXISTS idx_history_material  ON price_history(materialType);
