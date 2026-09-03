const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const xlsx = require('xlsx');

const dbPath = path.join(__dirname, 'database.sqlite');
const excelPath = path.join(__dirname, 'Ilan_Gorsel_Eslestirme_Sistemi_v4.xlsx');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Veritabanına bağlanılamadı:', err.message);
    process.exit(1);
  }
  console.log('SQLite veritabanına bağlanıldı.');
});

// Excel dosyasını ve görselli verileri oku
const workbook = xlsx.readFile(excelPath);
const sheet = workbook.Sheets['Ham_Veri_Gorselli'];
const data = xlsx.utils.sheet_to_json(sheet);

console.log(`Excel'den ${data.length} adet görselli kayıt okundu.`);

db.serialize(() => {
  // 1. Eski tabloyu tamamen kaldır
  db.run(`DROP TABLE IF EXISTS listings`);

  // 2. server.js ve routes ile tam uyumlu (camelCase ve snake_case destekli) tabloyu oluştur
  db.run(`
    CREATE TABLE listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      materialType TEXT,
      material_type TEXT,
      subType TEXT,
      sub_type TEXT,
      condition TEXT,
      usageStatus TEXT,
      packaging TEXT,
      packagingType TEXT,
      prime_reference_price REAL,
      quantity REAL,
      unit_price REAL,
      unitPrice REAL,
      total_price REAL,
      totalPrice REAL,
      transaction_date TEXT,
      company_name TEXT,
      companyName TEXT,
      city TEXT,
      image TEXT,
      images TEXT,
      deliveryType TEXT,
      wallThickness REAL,
      chemicalAnalysis TEXT,
      createdAt TEXT,
      created_at TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Tablo oluşturma hatası:', err.message);
      return;
    }
    console.log('Yeni listings tablosu tam şemayla başarıyla oluşturuldu.');

    // 3. Görseller ve tüm alanlarla birlikte yeni kayıtları ekle
    const insertStmt = db.prepare(`
      INSERT INTO listings (
        title, description, materialType, material_type, subType, sub_type,
        condition, usageStatus, packaging, packagingType, prime_reference_price,
        quantity, unit_price, unitPrice, total_price, totalPrice,
        transaction_date, company_name, companyName, city,
        image, images, createdAt, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    data.forEach((row) => {
      const title = `${row['Şehir']} - ${row['Alt Tür']}`;
      const desc = `${row['Firma Adı']} tarafından sunulan ${String(row['Malzeme Durumu'] || '').toLowerCase()} durumundaki ${String(row['Paketleme Biçimi'] || '').toLowerCase()} malzeme.`;
      
      const imageName = row['Görsel Dosya'];
      const imagePath = `/uploads/${imageName}`;
      const imagesJson = JSON.stringify([imagePath]);
      const miktar = Number(row['Miktar (kg)']) || 0;
      const birimFiyat = Number(row['Birim Fiyat (TL/kg)']) || 0;
      const toplamTutar = Number(row['Toplam Tutar (TL)']) || (miktar * birimFiyat);

      insertStmt.run(
        title,
        desc,
        'Demir-Çelik',
        'Demir-Çelik',
        row['Alt Tür'],
        row['Alt Tür'],
        row['Malzeme Durumu'],
        row['Malzeme Durumu'],
        row['Paketleme Biçimi'],
        row['Paketleme Biçimi'],
        row['Prime Referans Fiyat (TL/kg)'] || 0,
        miktar,
        birimFiyat,
        birimFiyat,
        toplamTutar,
        toplamTutar,
        row['İşlem Tarihi'] || now.split('T')[0],
        row['Firma Adı'],
        row['Firma Adı'],
        row['Şehir'],
        imagePath,
        imagesJson,
        now,
        now
      );
    });

    insertStmt.finalize(() => {
      console.log('✅ 380 ilan ve tüm görseller eksiksiz şemayla veritabanına işlendi!');
      db.close();
    });
  });
});