/**
 * Turso (libSQL) veritabanı katmanı.
 *
 * Bu modül, eski `sqlite` paketinin get/all/run/exec imzalarını BİLEREK korur;
 * böylece 66 çağrı noktasının tamamı değişmeden çalışmaya devam eder.
 *
 * Eski (sqlite)                 -> Yeni (buradaki sarmalayıcı)
 *   await db.get(sql, params)   -> aynı, satır nesnesi veya undefined
 *   await db.all(sql, params)   -> aynı, düz JS nesnelerinden dizi
 *   await db.run(sql, params)   -> aynı, { lastID, changes }  (BigInt -> Number)
 *   await db.exec(multiSql)     -> aynı, çoklu DDL/DML
 *
 * EK: db.batch(stmts)
 *   Birden fazla yazmayı TEK ATOMİK işlemde çalıştırır (hepsi ya da hiçbiri).
 *   stmts: [{ sql: string, args: any[] }, ...]
 *   Dönüş: her ifade için bir ResultSet dizisi; ekleme yapan ifadelerde
 *          sonuç.lastInsertRowid (BigInt) bulunur — Number() ile çevirin.
 *
 *   Kullanım:
 *     const res = await db.batch([
 *       { sql: 'UPDATE bids SET status = ? WHERE id = ?', args: ['onaylandi', 5] },
 *       { sql: 'INSERT INTO orders (listingId, amount) VALUES (?, ?)', args: [7, 900] },
 *       { sql: "UPDATE listings SET status = 'Sold' WHERE id = ?", args: [7] },
 *     ]);
 *     const orderId = Number(res[1].lastInsertRowid);
 */

require('dotenv').config({ quiet: true });
const { createClient } = require('@libsql/client');

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL ortam değişkeni tanımlı değil. Sunucu başlatılamıyor.');
}

// Modül seviyesinde TEK istemci. İstek başına bağlantı AÇILMAZ:
// Turso'da her bağlantı/ifade bir ağ gidiş-dönüşüdür.
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// libSQL INTEGER kolonları BigInt döndürebilir; JSON.stringify BigInt'i
// serialize edemez ("Do not know how to serialize a BigInt" hatası).
const toNum = (v) => (typeof v === 'bigint' ? Number(v) : v);

// libSQL satırları düz nesne DEĞİLDİR (dizi benzeri indeksli özellikler taşır).
// { ...row } spread'i bu yüzden yanıta sayısal anahtarlar sızdırabilir.
// Burada her satırı gerçek bir düz nesneye çeviriyoruz.
function plain(row) {
  if (!row) return row;
  const out = {};
  for (const key of Object.keys(row)) {
    if (/^\d+$/.test(key)) continue; // sayısal indeksleri at
    out[key] = toNum(row[key]);
  }
  return out;
}

/**
 * Bağlama parametrelerini libSQL'in kabul ettiği biçime normalize eder.
 *
 * ÖNEMLİ: Eski `sqlite` paketi `undefined` değerleri sessizce NULL'a çeviriyordu.
 * libSQL bunu yapmaz ve "TypeError: Unsupported type of value" fırlatır.
 * `COALESCE(?, kolon)` deseniyle isteğe bağlı alan güncelleyen her handler
 * (profil güncelleme, tercihler, ilan güncelleme...) bu yüzden 500 veriyordu.
 * Dönüşüm burada merkezî olarak yapılır; çağrı noktalarına dokunmaya gerek kalmaz.
 */
function normalizeArgs(params) {
  if (!Array.isArray(params)) return params;
  return params.map((v) => {
    if (v === undefined) return null;
    if (v instanceof Date) return v.toISOString();
    if (typeof v === 'boolean') return v ? 1 : 0;
    return v;
  });
}

const db = {
  async get(sql, params = []) {
    const r = await client.execute({ sql, args: normalizeArgs(params) });
    return r.rows.length ? plain(r.rows[0]) : undefined;
  },

  async all(sql, params = []) {
    const r = await client.execute({ sql, args: normalizeArgs(params) });
    return r.rows.map(plain);
  },

  async run(sql, params = []) {
    const r = await client.execute({ sql, args: normalizeArgs(params) });
    return {
      lastID: toNum(r.lastInsertRowid),
      changes: toNum(r.rowsAffected),
    };
  },

  async exec(sql) {
    return client.executeMultiple(sql);
  },

  // Atomik çoklu yazma — ayrıntı için dosya başındaki açıklamaya bakın.
  async batch(stmts) {
    const normalized = stmts.map((s) =>
      typeof s === 'string' ? s : { sql: s.sql, args: normalizeArgs(s.args || []) }
    );
    return client.batch(normalized, 'write');
  },

  // Ham libSQL istemcisi (nadir durumlar için kaçış kapağı)
  raw: client,
};

/**
 * Geriye dönük uyumluluk: mevcut kod her handler'da
 *   const db = await getDb();
 * yazıyor. Burada artık ağ işi YAPILMAZ; paylaşılan nesne döner.
 */
async function getDb() {
  return db;
}

module.exports = { getDb, db };
