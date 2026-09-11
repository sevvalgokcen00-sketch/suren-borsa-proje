-- =====================================================================
-- SÜREN BORSA — SEED VERİSİ
-- schema.sql UYGULANDIKTAN SONRA çalıştırın.
--   sqlite3 database.sqlite < backend/seed.sql
--
-- DEMO GİRİŞ:  demo@surenborsa.com  /  Demo1234
-- (password sütunu gerçek bcrypt hash'tir, bcryptjs ile doğrulanmıştır)
-- =====================================================================

-- Tekrar çalıştırılabilir olması için önce temizle
DELETE FROM bids;
DELETE FROM orders;
DELETE FROM offers;
DELETE FROM listings;
DELETE FROM invoices;
DELETE FROM users;
DELETE FROM price_history;
DELETE FROM price_indexes;
DELETE FROM material_indices;
DELETE FROM external_market_prices;
DELETE FROM sqlite_sequence;

-- ---------------------------------------------------------------------
-- users — id=1 ZORUNLU
-- Frontend /api/profile/1 adresini sabit çağırıyor (ayarlar/page.tsx:39)
-- ve listings.js:156 yeni ilanları user_id=1 ile yazıyor.
-- ---------------------------------------------------------------------
INSERT INTO users (id, name, email, password, phone, company_name, tax_number, tax_office, address) VALUES
 (1, 'Demo Kullanıcı', 'demo@surenborsa.com',
     '$2a$10$RA.X1qB.cgSZ4TL6gvn.H.5OM0VJ5ayYG634O.SCJMB678wtYX/KK',
     '0532 000 00 00', 'Süren Demir Çelik A.Ş.', '1234567890', 'Kocaeli VD',
     'Kocaeli 1. OSB, Çelik Cad. No:14'),
 (2, 'Test Alıcı', 'alici@surenborsa.com',
     '$2a$10$RA.X1qB.cgSZ4TL6gvn.H.5OM0VJ5ayYG634O.SCJMB678wtYX/KK',
     '0532 111 11 11', 'Anadolu Metal Ltd. Şti.', '9876543210', 'Sakarya VD',
     'Sakarya OSB, Demir Sok. No:7');

-- ---------------------------------------------------------------------
-- listings — snake_case ve camelCase alanlar birlikte doldurulur,
-- çünkü farklı endpoint'ler farklı adları sorguluyor.
-- ---------------------------------------------------------------------
INSERT INTO listings
 (user_id, categoryId, title, description, material_type, materialType, category,
  usageStatus, weight, unit, price, city, locationCity, locationDistrict,
  imageUrls, status, is_archived) VALUES
 (1, 1, 'DKP Sac Kesim Artığı - Temiz',
     'Üretim hattından çıkan temiz DKP sac kesim artığı. Yağ ve pas içermez.',
     'DKP', 'DKP', 'Sac & Levha', 'Temiz', 12500, 'kg', 13.40,
     'Kocaeli', 'Kocaeli', 'Gebze',
     '["/uploads/MD-TEMIZ-01.jpg","/uploads/MD-TEMIZ-02.jpg"]', 'Aktif', 0),

 (1, 2, 'Ekstra Hurda - Preslenmiş Balya',
     'Preslenmiş balya halinde ekstra kalite hurda. Sevkiyata hazır.',
     'Ekstra', 'Ekstra', 'Endüstriyel Hurda', 'Temiz', 24000, 'kg', 12.10,
     'Sakarya', 'Sakarya', 'Adapazarı',
     '["/uploads/PB-BALYA-01.jpg","/uploads/PB-BALYA-02.jpg"]', 'Aktif', 0),

 (1, 3, 'İmalat Artığı Profil - Yağlı',
     'Profil imalatından çıkan yağlı-kontamine artık. Temizlik gerektirir.',
     'Toplama', 'Toplama', 'Profiller & Borular', 'Yağlı-Kontamine', 8300, 'kg', 10.20,
     'Gaziantep', 'Gaziantep', 'Şehitkamil',
     '["/uploads/MD-KESIMISLEME-01.jpg"]', 'Aktif', 0),

 (2, 4, 'Stok Fazlası Alüminyum Levha',
     'Orijinal ambalajında, kullanılmamış alüminyum levha. Sertifikalı.',
     'Alüminyum', 'Alüminyum', 'Alüminyum', 'Temiz', 5400, 'kg', 42.75,
     'Bursa', 'Bursa', 'Nilüfer',
     '["/uploads/MD-ORIJINALAMBALAJ-01.jpg"]', 'Aktif', 0),

 (2, 5, 'Pik Döküm Hurdası',
     'Döküm tesisi çıkışı pik hurda. Parça boyutu 30-50 cm.',
     'Pik', 'Pik', 'Endüstriyel Hurda', 'Standart', 16700, 'kg', 13.85,
     'İzmir', 'İzmir', 'Çiğli',
     '["/uploads/MD-URETIMFAZLASI-01.jpg"]', 'Aktif', 0);

-- ---------------------------------------------------------------------
-- bids — teklifler sayfası için (gelen + giden teklif senaryosu)
-- ---------------------------------------------------------------------
INSERT INTO bids
 (listingId, buyerId, buyerCompanyName, amount, unit, price, totalPrice,
  incoterm, paymentType, buyerNote, expiresIn, status, hasCertificate) VALUES
 (1, 2, 'Anadolu Metal Ltd. Şti.', 12500, 'kg', 13.10, 163750,
     'FOB', 'Peşin', 'Tamamını almak istiyoruz, kamyon bizden.', '24 Saat', 'bekleyen', 1),
 (2, 2, 'Anadolu Metal Ltd. Şti.', 10000, 'kg', 11.90, 119000,
     'CIF', 'Vadeli', 'Kısmi alım yapabilir miyiz?', '48 Saat', 'bekleyen', 0),
 (4, 1, 'Süren Demir Çelik A.Ş.',  5400, 'kg', 41.50, 224100,
     'FOB', 'Peşin', 'Sertifika fotokopisi rica ederiz.', '24 Saat', 'onaylandi', 1);

-- ---------------------------------------------------------------------
-- offers — gösterge panelindeki "bekleyen teklif" sayacı için
-- ---------------------------------------------------------------------
INSERT INTO offers (listing_id, buyer_id, offered_price_per_kg, status) VALUES
 (1, 2, 13.10, 'pending'),
 (2, 2, 11.90, 'pending'),
 (3, 2,  9.80, 'accepted');

-- ---------------------------------------------------------------------
-- material_indices — /api/indices/current
-- ---------------------------------------------------------------------
INSERT INTO material_indices (material_type, reference_price, daily_change_percent, confidence_level) VALUES
 ('DKP',     13.40,  1.2, 'Yüksek'),
 ('Ekstra',  12.10, -0.5, 'Yüksek'),
 ('Bonus',   12.55,  0.8, 'Orta'),
 ('Toplama', 10.20,  0.0, 'Orta'),
 ('Pik',     13.85,  2.1, 'Yüksek');

-- ---------------------------------------------------------------------
-- price_indexes — /api/market/indexes ve fiyat önerisi motoru
-- Bu tablo BOŞ kalırsa market.js:119 sabit 12.5'e düşer ve tüm
-- malzemeler için aynı fiyat önerilir.
-- ---------------------------------------------------------------------
INSERT INTO price_indexes
 (materialType, referencePrice, basePrice, trend, dailyChangePercent,
  minPrice, maxPrice, transactionCount, trustLevel) VALUES
 ('DKP',       13.40, 13.40, 'up',     1.2, 12.70, 14.05, 42, 'Yüksek'),
 ('Ekstra',    12.10, 12.10, 'down',  -0.5, 11.50, 12.70, 31, 'Yüksek'),
 ('Bonus',     12.55, 12.55, 'up',     0.8, 11.90, 13.20, 18, 'Orta'),
 ('Toplama',   10.20, 10.20, 'stable', 0.0,  9.70, 10.70, 12, 'Orta'),
 ('Pik',       13.85, 13.85, 'up',     2.1, 13.15, 14.55, 27, 'Yüksek'),
 ('Alüminyum', 42.75, 42.75, 'up',     1.7, 40.60, 44.90, 9,  'Orta');

-- ---------------------------------------------------------------------
-- price_history — 7/30 günlük grafik (malzeme başına 10 gün)
-- ---------------------------------------------------------------------
INSERT INTO price_history (materialType, price, recordedDate) VALUES
 ('DKP', 12.90, date('now','-9 day')), ('DKP', 13.05, date('now','-8 day')),
 ('DKP', 12.98, date('now','-7 day')), ('DKP', 13.15, date('now','-6 day')),
 ('DKP', 13.22, date('now','-5 day')), ('DKP', 13.10, date('now','-4 day')),
 ('DKP', 13.28, date('now','-3 day')), ('DKP', 13.35, date('now','-2 day')),
 ('DKP', 13.31, date('now','-1 day')), ('DKP', 13.40, date('now')),

 ('Ekstra', 12.55, date('now','-9 day')), ('Ekstra', 12.48, date('now','-8 day')),
 ('Ekstra', 12.40, date('now','-7 day')), ('Ekstra', 12.44, date('now','-6 day')),
 ('Ekstra', 12.31, date('now','-5 day')), ('Ekstra', 12.25, date('now','-4 day')),
 ('Ekstra', 12.19, date('now','-3 day')), ('Ekstra', 12.22, date('now','-2 day')),
 ('Ekstra', 12.16, date('now','-1 day')), ('Ekstra', 12.10, date('now')),

 ('Pik', 13.10, date('now','-9 day')), ('Pik', 13.22, date('now','-8 day')),
 ('Pik', 13.35, date('now','-7 day')), ('Pik', 13.28, date('now','-6 day')),
 ('Pik', 13.44, date('now','-5 day')), ('Pik', 13.52, date('now','-4 day')),
 ('Pik', 13.61, date('now','-3 day')), ('Pik', 13.70, date('now','-2 day')),
 ('Pik', 13.78, date('now','-1 day')), ('Pik', 13.85, date('now')),

 ('Toplama', 10.05, date('now','-4 day')), ('Toplama', 10.12, date('now','-3 day')),
 ('Toplama', 10.18, date('now','-2 day')), ('Toplama', 10.15, date('now','-1 day')),
 ('Toplama', 10.20, date('now')),

 ('Bonus', 12.30, date('now','-4 day')), ('Bonus', 12.38, date('now','-3 day')),
 ('Bonus', 12.45, date('now','-2 day')), ('Bonus', 12.50, date('now','-1 day')),
 ('Bonus', 12.55, date('now'));

-- ---------------------------------------------------------------------
-- external_market_prices
-- ---------------------------------------------------------------------
INSERT INTO external_market_prices (materialType, usdRate, globalPriceTL) VALUES
 ('DKP', 38.5, 14.20), ('Ekstra', 38.5, 12.80), ('Pik', 38.5, 14.60);

-- ---------------------------------------------------------------------
-- invoices — ayarlar sayfası fatura sekmesi
-- ---------------------------------------------------------------------
INSERT INTO invoices (user_id, date, amount, status, pdf_url) VALUES
 (1, date('now','-60 day'), 2500.00, 'Ödendi',   '/uploads/fatura-001.pdf'),
 (1, date('now','-30 day'), 2500.00, 'Ödendi',   '/uploads/fatura-002.pdf'),
 (1, date('now'),           2500.00, 'Bekliyor', NULL);
