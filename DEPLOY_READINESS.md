# Yayına Alma Hazırlık Raporu (Deploy Readiness)

**Hedef mimari:** Frontend → Vercel · Backend → Google Cloud Run · Veritabanı → Turso (libSQL)
**Tarih:** 2026-09-11 · **Durum:** `main` @ `01c5fbd` (çalışma ağacı temiz)
**Kapsam:** Yalnızca inceleme. Bu rapor kapsamında **hiçbir kod değiştirilmemiştir.**

---

## Yönetici Özeti

Proje bugünkü haliyle **deploy edilemez.** Ancak iyi haber şu: korkulan en büyük iş kalemi yok.

**İyi haberler:**
- `better-sqlite3` **kullanılmıyor.** Backend, `sqlite` (sqlite3 üzerine promise sarmalayıcı) kullanıyor; tüm DB çağrıları **zaten `async/await`**. Yani "senkron → asenkron dönüşüm kaskadı" diye bir iş kalemi **yok**. Bu normalde işin en büyük parçasıdır ve burada devre dışı.
- `express-session`/MemoryStore, `setInterval`, `node-cron`, Socket.io, WebSocket **hiçbiri yok.** Scale-to-zero ve çok-instance senaryosunu bozacak in-memory state yok.
- Native derleme gerektiren modül yok (`bcryptjs` saf JS; `sharp`/`canvas`/`bcrypt` yok). `sqlite3` native ama Turso'ya geçişte zaten kaldırılacak.
- `.env` dosyası repoya **hiç commit edilmemiş** (git geçmişinde de yok).

**Kötü haberler (asıl iş burada):**
1. **Üretilebilir bir şema yok.** Tablolar 4 ayrı dosyada, istek anında `CREATE TABLE IF NOT EXISTS` ile yaratılıyor. `bids` ve `invoices` tabloları **hiçbir yerde yaratılmıyor** ama sorgulanıyor. `users` tablosunda sorgulanan 7 kolon `CREATE TABLE`'da yok. Boş bir Turso veritabanına bağlandığında uygulama **anında patlar.**
2. **Üç farklı veritabanı dosyasına** işaret eden 4 ayrı bağlantı fabrikası var; aynı anda iki ayrı `.db` dosyası kullanılıyor.
3. **Hiçbir endpoint'te kimlik doğrulama yok.** JWT üretiliyor ama frontend onu hiç göndermiyor, backend hiç doğrulamıyor.
4. **Şifre değiştirmede kimlik doğrulama atlatma açığı var** ve şifre düz metin yazılıyor.
5. Frontend'de **34 adet** hardcoded `http://localhost:5000` var.

**Tahmini toplam efor: 26–37 saat.** Detaylı döküm raporun sonunda.

---

## 0. Depo Yapısı — Hangi Kod Canlı?

Depoda **4 backend kopyası** ve **3 frontend kopyası** var. Deploy öncesi bunun netleşmesi şart, aksi halde yanlış klasör container'a girer.

| Dizin | Durum | Karar |
|---|---|---|
| `backend/` | **CANLI.** En güncel, 11 route mount edilmiş, controller yapısı var. | **Deploy edilecek olan bu.** |
| `frontend/` | **CANLI.** Next.js 16.2.12, React 19. `anasayfa`, `odeme`, `nasil-calisir` sayfaları sadece burada. | **Deploy edilecek olan bu.** |
| `demir-celik-backend/` | Ölü. Eski şema; commit edilmiş `.sqlite` dosyaları burada. | Sil |
| `suren-borsa-backend/` | Boş/kırık (yalnızca `demir-celik-backend` adında bir girdi). | Sil |
| `suren-borsa-frontend/`, `suren-borsa-frontend-eski/` | Ölü kopyalar. | Sil |
| Kök `server.js`, `routes/`, `seed,js`, `seed_market.js`, `patch_server_reports.js` | Ölü. Kök `package.json` Express 5, `backend/` Express 4 — çelişiyor. | Sil |

> **BLOCKER — Depo kökü belirsiz**
> Cloud Run buildpack'i kök `package.json`'ı görürse **yanlış uygulamayı** (Express 5 + kök `server.js`) build eder. Kök `package.json`'da `start` script'i bile yok.
> **Çözüm:** Cloud Run build context'ini `backend/` olarak sabitle (`gcloud run deploy --source ./backend`) **ve** ölü dizinleri sil.

---

## 1. Cloud Run Uyumluluğu (Backend)

### 1.1 Port ve bind — SORUN YOK

`backend/server.js:9` ve `backend/server.js:58`:

```js
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { ... });
```

`process.env.PORT` okunuyor. Host parametresi verilmemiş; Express/Node varsayılan olarak `::`/`0.0.0.0` üzerinden dinler, dolayısıyla Cloud Run'da **sorun çıkarmaz**. İstenirse açık hale getirilebilir (NICE TO HAVE):

```js
app.listen(PORT, '0.0.0.0', () => { ... });
```

### 1.2 Dosya sistemine yazan her yer

> **BLOCKER — SQLite dosyası efemeral diskte**
> `backend/db.js:7` → `path.join(__dirname, '../database.sqlite')`
> `backend/routes/market.js:8`, `backend/routes/orders.js:8`, `backend/controllers/homeController.js:7` → `'./database.sqlite'`
>
> **Ne bozulur:** Cloud Run konteyneri kapanınca tüm yazılanlar silinir. Scale-to-zero'da her soğuk başlangıç **boş veritabanı** demektir. Çok instance'da her instance kendi kopyasını tutar — kullanıcı bir istekte ilan ekler, sonraki istekte ilan yoktur.
> **Çözüm:** Bölüm 2'deki Turso geçişi (bu kalemi tamamen ortadan kaldırır).

> **MUST FIX — `uploads/` dizini**
> `backend/server.js:23-27`:
> ```js
> const uploadsDir = path.join(__dirname, 'uploads');
> if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); }
> app.use('/uploads', express.static(uploadsDir));
> ```
> **Nüans:** `backend/uploads/` altındaki 20 JPG **repoya commit edilmiş** durumda. Dolayısıyla container imajına gömülürler ve `GET /uploads/MD-TEMIZ-01.jpg` Cloud Run'da **çalışır**. Mevcut görseller bozulmaz.
> **Bozulan:** *Yeni* yüklemeler. `backend/routes/listings.js:9-29`'daki multer diskStorage `'uploads/'` (CWD-göreli) hedefine yazar — bu yazma kaybolur.
> **Ancak:** Multer hiçbir route'a bağlanmamış (bkz. 1.6), yani bugün yükleme özelliği zaten çalışmıyor.
> **Çözüm (kısa vade, önerilen):** `uploads/` salt-okunur statik varlık olarak kalsın; `fs.mkdirSync` çağrısını kaldır (imajda dizin zaten var).
> **Çözüm (yükleme özelliği istenirse):** Google Cloud Storage'a geç:
> ```js
> // backend/routes/listings.js — diskStorage yerine
> const multer = require('multer');
> const { Storage } = require('@google-cloud/storage');
> const bucket = new Storage().bucket(process.env.GCS_BUCKET);
>
> const upload = multer({
>   storage: multer.memoryStorage(),
>   limits: { fileSize: 5 * 1024 * 1024 },
>   fileFilter: (req, file, cb) => {
>     const ok = /jpeg|jpg|png|webp/.test(file.mimetype);
>     cb(ok ? null : new Error('Sadece JPG, PNG, WEBP'), ok);
>   }
> });
>
> async function uploadToGcs(file) {
>   const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
>   await bucket.file(name).save(file.buffer, { contentType: file.mimetype });
>   return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${name}`;
> }
> ```

> **NICE TO HAVE — Kaynak dosyasını değiştiren patch script'leri**
> `backend/patch_auth.js:18`, `backend/patch_server.js:27`, `patch_server_reports.js:14` çalışma anında `.js` dosyalarının **üzerine yazıyor**. Bunlar geliştirme sırasında kullanılmış tek seferlik araçlar; container'da çalıştırılırlarsa salt-okunur/efemeral katmanda beklenmedik davranış üretirler.
> **Çözüm:** Sil. (Etkileri zaten kalıcı olarak uygulanmış durumda.)

### 1.3 Instance-içi state — TEMİZ

Tarandı, **hiçbiri bulunmadı**: `express-session`, `MemoryStore`, `setInterval`, zamanlayıcı olarak `setTimeout`, `node-cron`, `socket.io`, WebSocket, global Map/cache.
Scale-to-zero ve çok-instance için **bu açıdan engel yok.** Tek istisna aşağıda:

> **MUST FIX — İstek başına yeni DB bağlantısı + DDL**
> `backend/routes/market.js:6-58` her HTTP isteğinde yeni bağlantı açıyor **ve** 3 `CREATE TABLE`, 1 `PRAGMA`, koşullu 1 `ALTER TABLE` çalıştırıyor. `backend/routes/orders.js:6-34` ve `backend/controllers/homeController.js:5-10` aynı deseni izliyor. Açılan bağlantıların hiçbiri `close()` edilmiyor.
> **Ne bozulur:** SQLite'ta descriptor sızıntısı. **Turso'da çok daha kötü:** her istek, veri sorgusundan önce 4–5 ağ gidiş-dönüşü yapar. Endpoint gecikmesi birkaç ms'den yüzlerce ms'ye çıkar; Turso kota tüketimi katlanır.
> **Çözüm:** Modül seviyesinde tek paylaşılan istemci (Bölüm 2.2); DDL'i istek yolundan tamamen çıkar.

### 1.4 Graceful shutdown — YOK

> **MUST FIX**
> `SIGTERM`/`SIGINT` handler'ı ve `server.close()` çağrısı hiçbir yerde yok.
> **Ne bozulur:** Cloud Run scale-to-zero veya yeni revizyon deploy'unda `SIGTERM` gönderir ve ~10 sn sonra `SIGKILL` eder. Handler olmadan uçuştaki istekler yarıda kesilir — kullanıcı 502 görür. Jüri demo sırasında bunu yakalayabilir.
> **Çözüm:** `backend/server.js` sonuna:
> ```js
> const server = app.listen(PORT, '0.0.0.0', () => {
>   console.log(`Sunucu ${PORT} portunda çalışıyor`);
> });
>
> function shutdown(signal) {
>   console.log(`${signal} alındı, sunucu kapatılıyor...`);
>   server.close(() => {
>     console.log('HTTP sunucusu kapandı.');
>     process.exit(0);
>   });
>   // Cloud Run 10 sn veriyor; 8 sn'de zorla kapat
>   setTimeout(() => process.exit(1), 8000).unref();
> }
>
> process.on('SIGTERM', () => shutdown('SIGTERM'));
> process.on('SIGINT',  () => shutdown('SIGINT'));
> ```

### 1.5 package.json: engines ve start script

`backend/package.json` — `start` script'i **var** (`node server.js`), `engines` **yok**.

> **MUST FIX — `engines.node` tanımlı değil**
> **Ne bozulur:** Buildpack varsayılan (muhtemelen eski) bir Node sürümü seçer. Next.js 16 / React 19 tarafıyla tutarsız bir runtime sessiz davranış farkları üretir.
> **Çözüm:** `backend/package.json`:
> ```json
> {
>   "engines": { "node": ">=22.0.0" },
>   "scripts": {
>     "start": "node server.js",
>     "dev": "nodemon server.js"
>   }
> }
> ```

> **MUST FIX — `nodemon` üretim imajına giriyor**
> `devDependencies` altında ama buildpack `npm install` ile tüm bağımlılıkları kurabilir. Dockerfile'da `npm ci --omit=dev` kullanılmalı (aşağıda).

### 1.6 Ölü kod: multer hiç bağlanmamış

> **NICE TO HAVE**
> `backend/routes/listings.js:17-29`'da `upload` tanımlanıyor, ancak hiçbir route'ta `upload.single(...)`/`upload.array(...)` kullanılmıyor. `POST /api/listings` (satır 139) multipart kabul etmiyor; `image_url` daima `null` yazılıyor (satır 162).
> **Sonuç:** Görsel yükleme özelliği **bugün mevcut değil.** Deploy'u engellemez, ama jüriye "görsel yükleyebilirsiniz" denmemeli.

### 1.7 Dockerfile / buildpacks

> **BLOCKER — Dockerfile yok, buildpack yanlış kökü seçer**
> `Dockerfile`, `.dockerignore`, `cloudbuild.yaml` — **hiçbiri yok.**
> **Ne bozulur:** `gcloud run deploy --source .` kök dizini alır; kökte `start` script'i olmayan bir `package.json` bulur → build başarısız olur veya yanlış uygulama deploy edilir.
> **Çözüm:** `backend/Dockerfile`:
> ```dockerfile
> FROM node:22-slim
>
> ENV NODE_ENV=production
> WORKDIR /app
>
> COPY package*.json ./
> RUN npm ci --omit=dev
>
> COPY . .
>
> # Cloud Run PORT'u enjekte eder; EXPOSE yalnızca dokümantasyon amaçlı
> EXPOSE 8080
> CMD ["node", "server.js"]
> ```
> `backend/.dockerignore`:
> ```
> node_modules
> npm-debug.log
> *.sqlite
> *.sqlite-journal
> patch_*.js
> test_*.js
> dynamic-test.js
> migrate_backend2.js
> .git
> ```
> Deploy komutu:
> ```bash
> gcloud run deploy suren-borsa-api \
>   --source ./backend \
>   --region europe-west1 \
>   --allow-unauthenticated \
>   --set-env-vars NODE_ENV=production,TURSO_DATABASE_URL=libsql://...,CORS_ORIGIN=https://<vercel-domain> \
>   --set-secrets TURSO_AUTH_TOKEN=turso-token:latest,JWT_SECRET=jwt-secret:latest
> ```

### 1.8 Native modüller

| Modül | Native? | Cloud Run etkisi |
|---|---|---|
| `sqlite3` ^6.0.1 | **Evet** (node-gyp/prebuild) | Turso geçişinde **kaldırılacak** — sorun ortadan kalkar |
| `bcryptjs` ^2.4.3 | Hayır (saf JS) | Sorun yok |
| `jsonwebtoken` | Hayır | Sorun yok |
| `multer` ^1.4.5-lts.1 | Hayır | Sorun yok (ama bkz. 1.6; 1.x artık bakımda değil, 2.x önerilir) |
| `xlsx` ^0.18.5 | Hayır | Bilinen güvenlik danışmanlıkları var; `backend/` içinde **kullanılmıyor**, bağımlılıktan çıkarılabilir |
| `cors`, `express` | Hayır | Sorun yok |

`sharp`, `canvas`, native `bcrypt`, `node-gyp` bağımlılığı **yok**. Turso geçişi sonrası backend'de native derleme **kalmıyor** — imaj build'i hızlı ve güvenilir olur.

---

## 2. SQLite → Turso Migrasyonu

### 2.1 Veritabanına dokunan HER dosya

| Dosya:Satır | Katman | Bağlantı hedefi | Çağrı sayısı |
|---|---|---|---|
| `backend/db.js:1-10` | `sqlite` + `sqlite3` | `__dirname/../database.sqlite` (**kök**) | fabrika |
| `backend/db.js:16-100` | DDL + migration + UPDATE | " | 5 |
| `backend/routes/market.js:3-58` | `sqlite` + `sqlite3` (**kendi fabrikası**) | `./database.sqlite` (**CWD**) | 9 |
| `backend/routes/orders.js:3-34` | `sqlite` + `sqlite3` (**kendi fabrikası**) | `./database.sqlite` (**CWD**) | 7 |
| `backend/controllers/homeController.js:1-10` | `sqlite` + `sqlite3` (**kendi fabrikası**) | `./database.sqlite` (**CWD**) | 3 |
| `backend/routes/listings.js:6,183,212` | `db.js` üzerinden | kök | 8 |
| `backend/routes/bids.js:3` | `db.js` üzerinden | kök | 7 |
| `backend/routes/reports.js:3` | `db.js` üzerinden | kök | 2 |
| `backend/controllers/authController.js:1` | `db.js` üzerinden | kök | 4 |
| `backend/controllers/profileController.js:1` | `db.js` üzerinden | kök | 6 |
| `backend/controllers/dashboardController.js:1` | `db.js` üzerinden | kök | 6 |
| `backend/controllers/companyAnalysisController.js:1` | `db.js` üzerinden | kök | 6 |
| `backend/controllers/indexController.js:1` | `db.js` üzerinden | kök | 3 |
| `backend/migrate_backend2.js:5` | tek seferlik script | `./database.sqlite` | — |
| `backend/dynamic-test.js:1` | test script'i | kök | — |
| `backend/test_home.js` | test script'i | — | — |

**Toplam: 66 DB çağrı noktası, 4 ayrı bağlantı fabrikası, 2 farklı dosya yolu.**

> **BLOCKER — Aynı anda İKİ farklı veritabanı kullanılıyor**
> `backend/db.js:7` → `backend/../database.sqlite` = **depo kökü**
> `market.js:8`, `orders.js:8`, `homeController.js:7` → `./database.sqlite` = **CWD**, yani `npm start` `backend/` içinden çalıştırıldığında `backend/database.sqlite`
>
> **Ne bozulur:** `orders.js` `listings` ve `bids` tablolarını sorguluyor (satır 61, 71) — ama bunlar **diğer** veritabanında. `POST /api/orders/checkout` üretimde "İşlem yapılacak ilan bulunamadı!" döner. Aynı şekilde `homeController` arama sonuçlarını boş DB'den okur ve sessizce `SAMPLE_SEARCH_DATA` sahte verisine düşer (satır 49-51) — hata bile göstermez.
> **Çözüm:** Tek `db.js` modülü; tüm dosyalar oradan import etsin (2.2).

### 2.2 Kullanılan katman: ORM YOK — ve bu iyi haber

Prisma, Drizzle, Sequelize, Knex, TypeORM **kullanılmıyor**. Ham SQL + `sqlite` promise sarmalayıcısı var.

> **`better-sqlite3` KULLANILMIYOR — senkron→asenkron kaskadı YOK**
> Tüm 66 çağrı noktası zaten `await db.get(...)` / `await db.all(...)` / `await db.run(...)` biçiminde. Tüm controller ve route handler'ları zaten `async`. Normalde bu işin en büyük kalemi olurdu; **burada tamamen devre dışı.**

Gerçekte değişmesi gereken **API yüzeyi** çok daha dar:

| `sqlite` (mevcut) | `@libsql/client` (hedef) |
|---|---|
| `db.get(sql, params)` → satır veya `undefined` | `db.execute({sql, args})` → `res.rows[0]` |
| `db.all(sql, params)` → dizi | `db.execute({sql, args})` → `res.rows` |
| `db.run(sql, params)` → `{lastID, changes}` | `db.execute({sql, args})` → `{lastInsertRowid (BigInt), rowsAffected}` |
| `db.exec(multiSql)` | `db.executeMultiple(multiSql)` veya `db.batch([...])` |

**Önerilen yaklaşım: uyumluluk katmanı.** 66 çağrı noktasını tek tek yeniden yazmak yerine, `db.js`'i `get/all/run` imzasını koruyan ince bir sarmalayıcı yap. Böylece **çağrı noktalarının %95'i hiç değişmez.**

```js
// backend/db.js — TAMAMEN DEĞİŞTİRİLECEK
const { createClient } = require('@libsql/client');

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL tanımlı değil.');
}

// Modül seviyesinde TEK istemci — istek başına bağlantı açılmaz
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// BigInt -> Number (lastInsertRowid BigInt döner, JSON.stringify bunu serialize edemez)
const toNum = (v) => (typeof v === 'bigint' ? Number(v) : v);

const db = {
  async get(sql, params = []) {
    const r = await client.execute({ sql, args: params });
    return r.rows[0];               // yoksa undefined — mevcut davranışla aynı
  },
  async all(sql, params = []) {
    const r = await client.execute({ sql, args: params });
    return r.rows;
  },
  async run(sql, params = []) {
    const r = await client.execute({ sql, args: params });
    return {
      lastID:  toNum(r.lastInsertRowid),   // eski isimler korunuyor
      changes: toNum(r.rowsAffected),
    };
  },
  async exec(sql) {
    return client.executeMultiple(sql);
  },
  batch: (stmts) => client.batch(stmts, 'write'),
  raw: client,
};

// getDb() artık ağ işi yapmıyor; sadece paylaşılan nesneyi döndürüyor.
// Mevcut `const db = await getDb();` satırlarının HEPSİ değişmeden çalışır.
async function getDb() { return db; }

module.exports = { getDb, db };
```

**Bu sarmalayıcı ile değişmesi gereken noktalar (tam liste):**

1. **`db.js`'in kendisi** — yukarıdaki gibi yeniden yazılır. `initDb()` ve satır 103'teki `initDb().catch()` **kaldırılır** (DDL migration dosyasına taşınır, 2.5).
2. **4 ayrı fabrikayı tekilleştir** — aşağıdaki üç dosyadaki yerel `getDb` tanımlarını sil, `db.js`'ten import et:
   - `backend/routes/market.js:3-58` → `const { getDb } = require('../db');` (DDL migration'a taşınır)
   - `backend/routes/orders.js:3-34` → aynı
   - `backend/controllers/homeController.js:1-10` → `const { getDb } = require('../db');`
3. **`backend/routes/listings.js:183` ve `:212`** — fonksiyon içindeki tekrarlı `require('../db')` satırlarını sil (satır 6'daki import zaten var).
4. **`lastID` kullanan 4 canlı nokta** — sarmalayıcı ismi koruduğu için **değişiklik gerekmez**:
   `authController.js:43`, `bids.js:113`, `listings.js:171`, `orders.js:116`
   (Yalnızca `dynamic-test.js:26,32` test script'i kullanıyor, o da silinecek.)
5. **`db.all()` dönüş tipi** — libSQL `rows` dizisi, düz obje gibi davranan `Row` nesneleri içerir. `{...item}` spread (`listings.js:69`, `bids.js:41`) ve `.map()` çalışır. `JSON.stringify` öncesi BigInt kolon varsa sorun çıkar — bu şemada `INTEGER PRIMARY KEY` dışında BigInt üretecek kolon yok, `lastInsertRowid` da yukarıda dönüştürülüyor.

**`await` eklenmesi gereken yeni fonksiyon: YOK. `async` yapılması gereken fonksiyon: YOK.** Kaskad zaten mevcut.

### 2.3 Transaction ve prepared statement kullanımı

**Mevcut durum:** `BEGIN`, `COMMIT`, `ROLLBACK`, `db.transaction()` — **hiçbiri kullanılmıyor.** `db.prepare()` de kullanılmıyor; her sorgu tek seferlik parametreli `execute`.

> **MUST FIX — `POST /api/orders/checkout` atomik değil**
> `backend/routes/orders.js:76, 88, 110` — üç ayrı yazma, transaction dışında:
> 1. satır 76: `UPDATE bids SET status='Onaylandı'`
> 2. satır 88: `INSERT INTO orders (...)`
> 3. satır 110: `UPDATE listings SET status='Sold'`
>
> **Ne bozulur:** SQLite'ta yereldi, gecikme mikrosaniyeydi; risk düşüktü. **Turso'da her adım ayrı bir ağ çağrısıdır.** Adım 2 ile 3 arasında bağlantı koparsa: sipariş kaydedilmiş ama ilan hâlâ "Aktif" görünür → aynı ilan ikinci kez satılabilir. Demo sırasında tutarsız veri anlamına gelir.
> **Çözüm:** libSQL `batch` ile atomik hale getir:
> ```js
> // orders.js — satır 76, 88, 110 yerine tek atomik batch
> const stmts = [];
> if (bidId) {
>   stmts.push({ sql: "UPDATE bids SET status = 'Onaylandı' WHERE id = ?", args: [bidId] });
> }
> stmts.push({
>   sql: `INSERT INTO orders (bidId, listingId, buyerId, sellerId, agreedPrice, amount,
>          paymentMethod, deliveryAddress, shippingDate, contractAccepted,
>          savedCarbon, savedTrees, status)
>         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed')`,
>   args: [bidId || null, listingId, buyerId || 1, listing.user_id || 1, finalPrice,
>          finalAmount, paymentMethod, deliveryAddress || 'Sakarya 1. OSB, Çelik Cad. No:14',
>          shippingDate || new Date().toISOString().split('T')[0],
>          contractAccepted ? 1 : 0, savedCarbonTon, savedTrees]
> });
> stmts.push({ sql: "UPDATE listings SET status = 'Sold' WHERE id = ?", args: [listingId] });
>
> const results = await db.batch(stmts);          // hepsi ya da hiçbiri
> const orderId = Number(results[stmts.length - 2].lastInsertRowid);
> ```
> (Not: satır 98'deki `listing.userId` da hatalı — şemada kolon `user_id`. Bu yüzden `sellerId` daima `1` yazılıyor. Aynı düzeltmede giderilmeli.)

### 2.4 libSQL'de farklı davranabilecek SQLite yapıları

| Yapı | Nerede | Turso'da durum |
|---|---|---|
| `AUTOINCREMENT` | `db.js:18,31,47,56,65`; `market.js:15,26,41`; `orders.js:15` | Desteklenir |
| `PRAGMA table_info(...)` | `db.js:74`, `market.js:49`, `migrate_backend2.js:11` | Desteklenir, **ama** her istekte çalıştırılması ağ maliyeti yaratır → istek yolundan çıkarılmalı |
| `CURRENT_TIMESTAMP` | `db.js:27,43,52,61`; `market.js:19,34`; `orders.js:29` | Desteklenir — **UTC** üretir |
| `date('now')` | `market.js:44` (kolon default'u) | Desteklenir — **UTC** |
| **`DATE('now','localtime')`** | **`dashboardController.js:30`** | **DAVRANIŞ DEĞİŞİR** — aşağıya bakınız |
| `strftime('%m', created_at)` | `dashboardController.js:36,53,54` | Desteklenir |
| `INSERT OR IGNORE` | `indexController.js:24` | Desteklenir |
| `INSERT OR REPLACE` | Kullanılmıyor | — |
| `ATTACH` | Kullanılmıyor | (Turso'da desteklenmez — kullanılmadığı için sorun yok) |
| Kullanıcı tanımlı fonksiyon | Kullanılmıyor | (Turso'da desteklenmez — sorun yok) |
| `LOWER()` Türkçe karakterlerle | `homeController.js:92-96`, `dashboardController.js:25` | SQLite `LOWER()` yalnızca ASCII'yi çevirir; `İ`, `Ş`, `Ğ` dokunulmadan kalır. Turso'da **aynı** davranış — regresyon yok, ama arama zaten Türkçe karakterlerde eksik çalışıyor. Kod bunu satır 63-71'de JS tarafında normalize ederek kısmen telafi ediyor. |
| Boolean'ların 0/1 saklanması | `bids.js:110`, `orders.js:104`, `profileController.js:73-78`, `db.js:26,42` | Sorun yok — `INTEGER` olarak okunur/yazılır, JS tarafında `? 1 : 0` dönüşümü zaten yapılıyor |
| Tip afinitesi (`REAL`, `TEXT`) | Genel | libSQL aynı afinite kurallarını uygular |

> **MUST FIX — `DATE('now','localtime')` Cloud Run/Turso'da UTC'ye kayar**
> `backend/controllers/dashboardController.js:30`:
> ```sql
> SELECT COUNT(*) as addedToday FROM listings WHERE DATE(created_at) = DATE('now','localtime')
> ```
> **Ne bozulur:** `'localtime'` değerlendirmeyi yapan sunucunun saat dilimine göre çözülür. Geliştirme makinesi UTC+3 (Türkiye), Turso ve Cloud Run **UTC**. Gece yarısı ile 03:00 TSİ arasında "bugün eklenen ilan" sayacı yanlış gün sınırını kullanır ve **0 veya eksik** gösterir. Demo akşam saatlerinde yapılırsa fark edilir.
> **Çözüm:** Saat dilimini açıkça sabitle:
> ```sql
> SELECT COUNT(*) AS addedToday
> FROM listings
> WHERE DATE(created_at, '+3 hours') = DATE('now', '+3 hours')
> ```
> (Daha temizi: `created_at`'i UTC ISO-8601 olarak saklayıp sunum katmanında dönüştürmek — demo için yukarısı yeterli.)

### 2.5 Şema / migration / seed — EN KRİTİK BÖLÜM

> ### BLOCKER — Üretilebilir bir şema tanımı YOK
>
> Kalıcı bir `schema.sql`, migration klasörü veya ORM şeması **yok.** Tablolar isteğe bağlı olarak, farklı dosyalarda, çalışma anında yaratılıyor:
>
> | Tablo | Nerede yaratılıyor |
> |---|---|
> | `users`, `listings`, `offers`, `material_indices`, `index_history` | `backend/db.js:17-69` (modül yüklenirken) |
> | `external_market_prices`, `price_indexes`, `price_history` | `backend/routes/market.js:14-46` (**her istekte**) |
> | `orders` | `backend/routes/orders.js:14-31` (**her istekte**) |
> | **`bids`** | **HİÇBİR YERDE** |
> | **`invoices`** | **HİÇBİR YERDE** |
>
> **Boş bir Turso veritabanında anında patlayacak endpoint'ler:**
>
> | Endpoint | Hata | Kaynak |
> |---|---|---|
> | `GET /api/bids` | `no such table: bids` | `bids.js:16` |
> | `POST /api/bids` | `no such table: bids` | `bids.js:93` |
> | `PATCH /api/bids/:id/status` | `no such table: bids` | `bids.js:128` |
> | `DELETE /api/bids/:id` | `no such table: bids` | `bids.js:142` |
> | `GET /api/profile/:id/invoices` | `no such table: invoices` | `profileController.js:97` |
> | `GET /api/profile/:id` | `no such column: tax_office` | `profileController.js:9` |
> | `PUT /api/profile/:id` | `no such column: tax_office` | `profileController.js:44` |
> | `PUT /api/profile/:id/settings` | `no such column: email_offers` | `profileController.js:66` |
> | `GET /api/listings?search=...` | `no such column: description` | `listings.js:44` |
> | `GET /api/listings?materialType=...` | `no such column: usageStatus` | `listings.js:49` |
> | `GET /api/listings?city=...` | `no such column: locationCity` | `listings.js:55` |
> | `GET /api/home/search` | `no such column: description` | `homeController.js:93` |
>
> Bugün lokalde çalışmasının tek sebebi, geliştirme veritabanının zaman içinde `migrate_backend2.js` ve elle çalıştırılan script'lerle **kademeli olarak mutasyona uğramış** olması. O dosya `.gitignore`'da (`database.sqlite`) ve **repoda yok**; bugün diskte de yok (kontrol edildi: kökte `database.sqlite` mevcut değil). Yani o şema **hiçbir yerde kayıtlı değil.**
>
> **`users` tablosunda eksik kolonlar** (sorgulanıyor ama `CREATE TABLE`'da yok): `tax_office`, `address`, `email_offers`, `email_market`, `sms_alerts`, `subscription_plan`, `subscription_features`
> **`listings` tablosunda eksik olanlar:** `description`, `usageStatus`, `locationCity`, `locationDistrict`, `imageUrls`, `unit`, `categoryId`
> (`migrate_backend2.js` bunların bir kısmını ekliyor ama `imageUrls` **hiçbir yerde** eklenmiyor — `listings.js:70` ve `:129` bu kolonu okuyor.)
>
> **Çözüm:** Tek otoriter `backend/schema.sql` yaz ve Turso'ya bir kez uygula. Tüm çalışma-anı DDL'ini koddan kaldır.
>
> ```sql
> -- backend/schema.sql — tüm tablolar, tüm kolonlar, tek kaynak
>
> CREATE TABLE IF NOT EXISTS users (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   name TEXT NOT NULL,
>   email TEXT UNIQUE NOT NULL,
>   password TEXT NOT NULL,
>   phone TEXT,
>   company_name TEXT,
>   tax_number TEXT,
>   tax_office TEXT,
>   address TEXT,
>   theme TEXT DEFAULT 'light',
>   notifications_enabled INTEGER DEFAULT 1,
>   email_offers INTEGER DEFAULT 1,
>   email_market INTEGER DEFAULT 1,
>   sms_alerts INTEGER DEFAULT 0,
>   subscription_plan TEXT DEFAULT 'free',
>   subscription_features TEXT,
>   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
> );
>
> CREATE TABLE IF NOT EXISTS listings (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   user_id INTEGER REFERENCES users(id),
>   categoryId INTEGER,
>   title TEXT NOT NULL,
>   description TEXT,
>   material_type TEXT NOT NULL,
>   materialType TEXT,
>   category TEXT,
>   usageStatus TEXT,
>   weight REAL NOT NULL,
>   unit TEXT DEFAULT 'kg',
>   price REAL NOT NULL,
>   city TEXT,
>   locationCity TEXT,
>   locationDistrict TEXT,
>   image_url TEXT,
>   imageUrls TEXT,                       -- JSON dizi metni olarak saklanır
>   status TEXT DEFAULT 'Aktif',
>   is_archived INTEGER DEFAULT 0,
>   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
> );
>
> -- EKSİK OLAN TABLO — bids hiçbir yerde yaratılmıyordu
> CREATE TABLE IF NOT EXISTS bids (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   listingId INTEGER REFERENCES listings(id),
>   buyerId INTEGER REFERENCES users(id),
>   buyerCompanyName TEXT,
>   amount REAL NOT NULL,
>   unit TEXT DEFAULT 'kg',
>   price REAL NOT NULL,
>   totalPrice REAL,
>   incoterm TEXT DEFAULT 'FOB',
>   paymentType TEXT DEFAULT 'Peşin',
>   buyerNote TEXT,
>   expiresIn TEXT DEFAULT '24 Saat',
>   status TEXT DEFAULT 'bekleyen',
>   hasCertificate INTEGER DEFAULT 0,
>   createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
> );
>
> -- EKSİK OLAN TABLO — invoices hiçbir yerde yaratılmıyordu
> CREATE TABLE IF NOT EXISTS invoices (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   user_id INTEGER REFERENCES users(id),
>   date DATE,
>   amount REAL,
>   status TEXT DEFAULT 'Ödendi',
>   pdf_url TEXT
> );
>
> CREATE TABLE IF NOT EXISTS orders (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   bidId INTEGER,
>   listingId INTEGER NOT NULL,
>   buyerId INTEGER DEFAULT 1,
>   sellerId INTEGER DEFAULT 1,
>   agreedPrice REAL NOT NULL,
>   amount REAL NOT NULL,
>   paymentMethod TEXT DEFAULT 'Kurumsal Havale / EFT',
>   deliveryAddress TEXT,
>   shippingDate DATE,
>   contractAccepted INTEGER DEFAULT 1,
>   savedCarbon REAL,
>   savedTrees INTEGER,
>   status TEXT DEFAULT 'Completed',
>   createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
> );
>
> CREATE TABLE IF NOT EXISTS offers (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   listing_id INTEGER,
>   buyer_id INTEGER,
>   offered_price_per_kg REAL,
>   status TEXT DEFAULT 'pending',
>   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
> );
>
> CREATE TABLE IF NOT EXISTS material_indices (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   material_type TEXT UNIQUE,
>   reference_price REAL,
>   daily_change_percent REAL,
>   confidence_level TEXT,
>   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
> );
>
> CREATE TABLE IF NOT EXISTS index_history (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   material_type TEXT,
>   price REAL,
>   recorded_date DATE
> );
>
> CREATE TABLE IF NOT EXISTS price_indexes (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   materialType TEXT UNIQUE NOT NULL,
>   referencePrice REAL NOT NULL,
>   dailyChangePercent REAL DEFAULT 0.0,
>   minPrice REAL DEFAULT 0,
>   maxPrice REAL DEFAULT 0,
>   transactionCount INTEGER DEFAULT 0,
>   trustLevel TEXT DEFAULT 'Yüksek',
>   updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
> );
>
> CREATE TABLE IF NOT EXISTS price_history (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   materialType TEXT NOT NULL,
>   price REAL NOT NULL,
>   recordedDate DATE DEFAULT (date('now'))
> );
>
> CREATE TABLE IF NOT EXISTS external_market_prices (
>   id INTEGER PRIMARY KEY AUTOINCREMENT,
>   materialType TEXT NOT NULL,
>   usdRate REAL DEFAULT 38.5,
>   globalPriceTL REAL NOT NULL,
>   updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
> );
>
> -- Sorgulanan alanlar için indeksler
> CREATE INDEX IF NOT EXISTS idx_listings_archived ON listings(is_archived);
> CREATE INDEX IF NOT EXISTS idx_listings_user     ON listings(user_id);
> CREATE INDEX IF NOT EXISTS idx_bids_listing      ON bids(listingId);
> CREATE INDEX IF NOT EXISTS idx_bids_buyer        ON bids(buyerId);
> CREATE INDEX IF NOT EXISTS idx_orders_listing    ON orders(listingId);
> ```
>
> Turso'ya uygulama:
> ```bash
> turso db create suren-borsa
> turso db shell suren-borsa < backend/schema.sql
> turso db show suren-borsa --url          # TURSO_DATABASE_URL
> turso db tokens create suren-borsa       # TURSO_AUTH_TOKEN
> ```

> **BLOCKER — Seed dosyaları boş veya uyumsuz**
> - `backend/seed_market.js` — **0 byte**. `demir-celik-backend/seed_market.js` ve kök `seed_market.js` de **0 byte**.
>   **Sonuç:** `price_indexes` ve `price_history` tabloları boş kalır. `GET /api/market/indexes` boş dizi döner; `POST /api/market/calculate-recommendation` `index` bulamaz ve satır 119'daki sabit `12.5` değerine düşer — tüm malzemeler için aynı fiyat önerilir. Endeks grafiği ve fiyat önerisi **demo'da boş görünür.**
> - `demir-celik-backend/seed.js` — **eski şemaya** seed yapıyor (`DROP TABLE listings` + `fullName`/`categoryId` yapısı) ve yalnızca `demir-celik-backend/` içindeki iki `.xlsx` dosyasına bağımlı. `backend/` ile **uyumsuz**.
> **Çözüm:** `backend/seed.sql` (veya `backend/seed.js`) yaz; `material_indices`, `price_indexes`, `price_history` ve birkaç örnek `listings`/`users` kaydını doldur:
> ```bash
> turso db shell suren-borsa < backend/seed.sql
> ```

> **MUST FIX — Çalışma anındaki DDL kaldırılmalı**
> Şema dosyası uygulandıktan sonra şunlar silinmeli:
> - `backend/db.js:12-103` (`initDb` ve otomatik çağrısı)
> - `backend/routes/market.js:12-55` (3 CREATE + PRAGMA + ALTER)
> - `backend/routes/orders.js:12-31` (CREATE orders)
>
> **Neden:** Her istekte Turso'ya gereksiz DDL round-trip'i gider. Ayrıca `db.js:92-97`'deki UTF-8 onarım `UPDATE`'i **sunucu her açıldığında tüm `listings` tablosunu tarayıp yazıyor** — Cloud Run'da her soğuk başlangıçta tekrarlanır, yazma kotası tüketir ve veriyi beklenmedik biçimde değiştirebilir. Tek seferlik bir düzeltme script'i olmalıydı.

### 2.6 `.db` dosyası repoya commit edilmiş mi? — EVET

> **MUST FIX**
> Takip edilen dosyalar:
> - `demir-celik-backend/database.sqlite` (24 KB)
> - `demir-celik-backend/database-backup.sqlite` (45 KB)
>
> 5 commit'te geçmişte mevcut: `002e773`, `f29d8be`, `42c27f9`, `e2b23b7`, `585e840`.
>
> `.gitignore`'da `database.sqlite` satırı **var** ama dosyalar ignore kuralından **önce** commit edildiği için Git onları takip etmeye devam ediyor (`.gitignore` yalnızca takip edilmeyen dosyalara uygulanır).
>
> **Veri sızıntısı riski: DÜŞÜK.** İçerik denetlendi — `users: 0 satır`, `listings: 0 satır`, `categories: 5 satır`. Kimlik bilgisi veya kişisel veri **yok**. Şema da eski (`fullName`, `categoryId`) ve `backend/` ile uyumsuz. Bu nedenle git geçmişini yeniden yazmak (filter-repo) **gerekmiyor**.
>
> **Çözüm:**
> ```bash
> git rm --cached demir-celik-backend/database.sqlite demir-celik-backend/database-backup.sqlite
> printf '\n*.sqlite\n*.sqlite-journal\n*.sqlite-wal\n*.db\n' >> .gitignore
> git commit -m "chore: sqlite dosyalarini takipten cikar"
> ```
> Ölü `demir-celik-backend/` dizini tamamen silinirse bu da çözülür.

---

## 3. Vercel Uyumluluğu (Frontend)

### 3.1 Hardcoded backend URL'leri — 34 nokta

> **BLOCKER**
> Frontend'de `process.env` kullanımı **hiç yok**. Tüm backend çağrıları `http://localhost:5000` sabitine gidiyor.
>
> **Ne bozulur:** Vercel'de yayına alındığında tarayıcı **kullanıcının kendi makinesindeki** 5000 portuna istek atar. Tüm veri çekme işlemleri başarısız olur. Ayrıca sayfa HTTPS'ten sunulduğu için tarayıcı `http://` çağrılarını **mixed content** olarak engeller. Uygulama tamamen boş/çalışmaz görünür.
>
> **Tam liste:**
>
> | Dosya:Satır | Endpoint |
> |---|---|
> | `frontend/app/ayarlar/page.tsx:39` | `GET /api/profile/1` |
> | `frontend/app/ayarlar/page.tsx:193` | `PUT /api/profile/1` |
> | `frontend/app/ayarlar/page.tsx:218` | `PUT /api/profile/1/settings` |
> | `frontend/app/ayarlar/page.tsx:241` | `PUT /api/profile/1` |
> | `frontend/app/giris-yap/page.tsx:21` | `POST /api/auth/login` |
> | `frontend/app/kayit-ol/page.tsx:37` | `POST /api/auth/register` |
> | `frontend/app/ilan-ver/page.tsx:139` | `POST /api/listings` |
> | `frontend/app/ilanlar-paneli/page.tsx:45` | `GET /api/listings` |
> | `frontend/app/ilanlar-paneli/page.tsx:90` | `PUT /api/listings/:id` |
> | `frontend/app/ilanlar-paneli/page.tsx:120` | `DELETE /api/listings/:id` |
> | `frontend/app/malzemeler/detay/page.tsx:54` | `POST /api/bids` |
> | `frontend/app/malzemeler/detay/page.tsx:78-99` | 16 adet `/uploads/*.jpg` görsel URL'i |
> | `frontend/app/raporlar/page.tsx:16` | `GET /api/reports/esg` |
> | `frontend/app/teklifler/page.tsx:16` | `GET /api/bids` |
> | `frontend/app/teklifler/page.tsx:81` | `PATCH /api/bids/:id/status` |
> | `frontend/app/teklifler/page.tsx:256` | `PATCH /api/bids/:id/status` |
> | `frontend/app/teklifler/page.tsx:268` | `DELETE /api/bids/:id` |
> | `frontend/app/teklifler/page.tsx:286` | `DELETE /api/bids/:id` |
> | `frontend/app/teklifler/page.tsx:308` | `DELETE /api/bids/:id` |
> | `frontend/app/teklifler/page.tsx:365` | `POST /api/bids` |
>
> **Çözüm:** Merkezi bir API yardımcısı ekle:
> ```ts
> // frontend/lib/api.ts  (YENİ DOSYA)
> export const API_BASE =
>   process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
>
> export function apiUrl(path: string) {
>   return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
> }
>
> export async function apiFetch(path: string, init?: RequestInit) {
>   const res = await fetch(apiUrl(path), {
>     ...init,
>     headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
>   });
>   if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
>   return res.json();
> }
> ```
> Ardından 34 çağrının hepsini dönüştür:
> ```ts
> // ÖNCE  — frontend/app/teklifler/page.tsx:16
> const res = await fetch("http://localhost:5000/api/bids");
>
> // SONRA
> import { apiUrl } from "@/lib/api";
> const res = await fetch(apiUrl("/api/bids"));
> ```
> Görseller için (`malzemeler/detay/page.tsx:78-99`):
> ```ts
> import { apiUrl } from "@/lib/api";
> const GORSELLER = {
>   temiz: [
>     apiUrl("/uploads/MD-TEMIZ-01.jpg"),
>     apiUrl("/uploads/MD-TEMIZ-02.jpg"),
>     // ...
>   ],
> };
> ```
> Vercel ortam değişkeni: `NEXT_PUBLIC_API_URL=https://suren-borsa-api-xxxx.a.run.app`
>
> Dikkat: `NEXT_PUBLIC_*` değişkenleri **build sırasında** gömülür. Cloud Run URL'i değişirse Vercel'de **yeniden deploy** gerekir.

> **BLOCKER — `/api/reports/esg` backend'de mount edilmemiş**
> `frontend/app/raporlar/page.tsx:16` bu endpoint'i çağırıyor. `backend/routes/reports.js` dosyası **var** ama `backend/server.js`'te `require` edilmemiş ve `app.use` ile bağlanmamış (satır 30-53 kontrol edildi). Kökteki `patch_server_reports.js` bunu eklemek için yazılmış ama hiç çalıştırılmamış — ve zaten yanlış değişken adı (`listingsRouter`) arıyor; mevcut ad `listingRoutes`.
> **Ne bozulur:** Raporlar/ESG sayfası **404** alır. ESG jüri sunumunun öne çıkan parçasıysa bu kritik.
> **Çözüm:** `backend/server.js`'e elle ekle:
> ```js
> // satır 40 civarı, diğer require'ların yanına
> const reportsRoutes = require('./routes/reports');
>
> // satır 53 civarı, diğer app.use'ların yanına
> app.use('/api/reports', reportsRoutes);
> ```

### 3.2 `NEXT_PUBLIC_` içinde gizli kalması gereken değer var mı? — HAYIR

Frontend'de `process.env` kullanımı hiç yok, dolayısıyla sızdırılan `NEXT_PUBLIC_` sırrı da yok.

**İleriye dönük uyarı:** `TURSO_AUTH_TOKEN` ve `JWT_SECRET` **asla** `NEXT_PUBLIC_` önekiyle tanımlanmamalı — bu değişkenler JS paketine gömülür ve tarayıcıda okunabilir. Bunlar yalnızca Cloud Run tarafında kalmalı.

### 3.3 Server component / server action çağrıları ve fetch cache — YOK

`frontend/app` altındaki **17 sayfanın 16'sı** `'use client'` ile başlıyor (`layout.tsx` hariç, o da fetch yapmıyor). Tüm `components/*.tsx` de client.

**Sonuç:**
- Server component'ten backend'e çağrı **yok**.
- Server action **yok**.
- `fetch` cache / `revalidate` / `next: { revalidate }` ayarı **yok** ve gerekmiyor — tüm çağrılar tarayıcıda çalıştığı için Next.js data cache'inden geçmiyor.
- Vercel Edge/Node runtime seçimi gerekmiyor; sayfalar statik build edilir, veriler istemcide yüklenir.

**Yan etki:** Her şey client-side olduğu için **CORS zorunlu** (Bölüm 4.2) ve ilk yüklemede içerik boş görünür (SEO/ilk boyama zayıf). Demo için kabul edilebilir; mimari not olarak düşülmeli.

### 3.4 `next.config.ts`

```ts
// frontend/next.config.ts — mevcut hali
import type { NextConfig } from "next";
const nextConfig: NextConfig = { /* config options here */ };
export default nextConfig;
```

- `ignoreBuildErrors` / `ignoreDuringBuilds` — **YOK.** Gerçek build hatalarını maskeleyen bir ayar bulunmuyor. TypeScript `strict: true` aktif. Bu iyi.
- `rewrites` / proxy — yok. **Gerekmiyor**, çünkü doğrudan Cloud Run'a çağrı yapılacak.
- `images.remotePatterns` — yok.

> **NICE TO HAVE — `next/image` kullanılacaksa domain tanımı gerekir**
> Şu an görseller düz `<img>` ile geliyor, o yüzden **zorunlu değil.** `next/image`'a geçilirse:
> ```ts
> const nextConfig: NextConfig = {
>   images: {
>     remotePatterns: [
>       { protocol: 'https', hostname: '*.run.app', pathname: '/uploads/**' },
>     ],
>   },
> };
> ```

> **NICE TO HAVE — Alternatif: rewrite ile CORS'u tamamen atlatmak**
> Backend'i aynı origin altına almak isterseniz:
> ```ts
> const nextConfig: NextConfig = {
>   async rewrites() {
>     return [{
>       source: '/api/:path*',
>       destination: `${process.env.BACKEND_URL}/api/:path*`,
>     }];
>   },
> };
> ```
> Bu durumda `NEXT_PUBLIC_API_URL` gerekmez (göreli `/api/...` yeterli) ve CORS sorunu ortadan kalkar. Bedeli: her istek Vercel üzerinden geçer (ek gecikme + Vercel fonksiyon kullanımı). **Demo ölçeğinde geçerli bir seçenek.**

---

## 4. Güvenlik

Uygulama herkese açık olacak ve jüri kullanacak. Aşağıdakiler bu bağlamda değerlendirildi.

### 4.1 `.env` ve git geçmişi

| Kontrol | Sonuç |
|---|---|
| `.env` commit edilmiş mi? | **Hayır.** Git geçmişinin tamamı tarandı, hiç `.env` eklenmemiş. |
| Diskte `.env` var mı? | **Hayır** — hiç oluşturulmamış. Bu yüzden sırlar koda gömülü. |
| Kök `.gitignore` | `node_modules/`, `database.sqlite`, `uploads/*`, `!.gitkeep`, `.env` — temelde doğru. |
| `frontend/.gitignore` | Next.js standardı; `.env*` ve `.vercel` dahil. |
| Geçmişte sızan sır | **Yok** — tek hardcoded sır `authController.js:5` (bkz. 4.5). |

> **MUST FIX — `.gitignore` eksikleri**
> `*.sqlite` (joker) yok, bu yüzden `database-backup.sqlite` yakalanmamış.
> ```gitignore
> # kök .gitignore'a eklenecek
> *.sqlite
> *.sqlite-journal
> *.sqlite-wal
> *.db
> .env
> .env.*
> !.env.example
> ```

### 4.2 CORS — tamamen açık

> **MUST FIX**
> `backend/server.js:12`:
> ```js
> app.use(cors());
> ```
> Bu `Access-Control-Allow-Origin: *` üretir — **internetteki her site** API'nize istek atabilir.
> **Ne bozulur:** Deploy "çalışır" (bu yüzden BLOCKER değil), ama hiçbir koruma yoktur. Kimlik doğrulama eklendiğinde (4.4) wildcard ile `credentials` birlikte kullanılamayacağı için **o zaman kırılır**.
> **Çözüm:**
> ```js
> const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
>   .split(',')
>   .map(s => s.trim());
>
> app.use(cors({
>   origin(origin, cb) {
>     // origin yoksa (curl, sunucu-sunucu) izin ver
>     if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
>     cb(new Error('CORS: izin verilmeyen origin'));
>   },
>   credentials: true,
>   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
> }));
> ```
> Cloud Run env: `CORS_ORIGIN=https://<proje>.vercel.app,https://<özel-alan-adı>`

### 4.3 helmet / rate limiting / input validation — HİÇBİRİ YOK

> **MUST FIX — Güvenlik başlıkları yok**
> `helmet` bağımlılıklarda yok, kullanılmıyor. `X-Content-Type-Options`, `X-Frame-Options`, HSTS vb. gönderilmiyor. Express ayrıca `X-Powered-By: Express` başlığıyla sürüm bilgisi sızdırıyor.
> ```bash
> npm i helmet --prefix backend
> ```
> ```js
> // backend/server.js — cors'tan önce
> const helmet = require('helmet');
> app.disable('x-powered-by');
> app.use(helmet({
>   crossOriginResourcePolicy: { policy: 'cross-origin' }, // /uploads görselleri Vercel'den yüklenebilsin
> }));
> ```

> **MUST FIX — Rate limiting yok**
> Hiçbir endpoint sınırlandırılmamış. `POST /api/auth/login` sınırsız denemeye açık (brute force). Ayrıca her istek Turso'ya sorgu attığı için **kota tüketimi üzerinden maliyet saldırısı** mümkün — Cloud Run scale-to-zero ile birlikte fatura riski.
> ```bash
> npm i express-rate-limit --prefix backend
> ```
> ```js
> const rateLimit = require('express-rate-limit');
>
> app.set('trust proxy', 1);   // Cloud Run proxy arkasında; gerçek IP için ŞART
>
> app.use('/api', rateLimit({
>   windowMs: 15 * 60 * 1000,
>   max: 300,
>   standardHeaders: true,
>   legacyHeaders: false,
> }));
>
> app.use('/api/auth', rateLimit({
>   windowMs: 15 * 60 * 1000,
>   max: 10,
>   message: { error: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.' },
> }));
> ```
> `app.set('trust proxy', 1)` olmadan tüm istekler aynı proxy IP'sinden geliyor görünür ve limit **tüm kullanıcıları birlikte** engeller.

> **MUST FIX — Şema tabanlı doğrulama yok**
> `zod`, `joi`, `express-validator` — hiçbiri yok. Doğrulama elle ve dağınık:
> - İyi örnek: `indexController.js:44-77` (kapsamlı aralık kontrolleri)
> - Zayıf: `listings.js:144-149` — her alan sessizce varsayılana düşüyor; `parseFloat(b.weight) || 0` negatif ağırlık ve fiyatı kabul eder
> - Yok: `bids.js:72-84` — `amount`/`price` tip veya işaret kontrolü yok; `totalPrice` (satır 90) `NaN` olabilir
> - Yok: `profileController.js:25` — tüm alanlar doğrulanmadan yazılıyor
> ```bash
> npm i zod --prefix backend
> ```
> ```js
> // backend/validators.js (YENİ)
> const { z } = require('zod');
>
> const bidSchema = z.object({
>   listingId: z.coerce.number().int().positive(),
>   buyerId:   z.coerce.number().int().positive().optional(),
>   amount:    z.coerce.number().positive().max(1_000_000),
>   price:     z.coerce.number().positive().max(1_000_000),
>   unit:      z.string().max(10).default('kg'),
>   incoterm:  z.string().max(20).optional(),
>   buyerNote: z.string().max(1000).optional(),
> });
>
> const validate = (schema) => (req, res, next) => {
>   const r = schema.safeParse(req.body);
>   if (!r.success) {
>     return res.status(400).json({ error: 'Geçersiz veri', details: r.error.flatten() });
>   }
>   req.body = r.data;
>   next();
> };
>
> module.exports = { bidSchema, validate };
> ```
> ```js
> // backend/routes/bids.js:69
> const { bidSchema, validate } = require('../validators');
> router.post('/', validate(bidSchema), async (req, res) => { ... });
> ```

### 4.4 Kimlik doğrulama — hiç yok

> ### BLOCKER (güvenlik) — Tüm endpoint'ler korumasız
>
> - `backend/` içinde kimlik doğrulama middleware'i **yok**. `jwt.verify(...)` çağrısı **hiçbir yerde** geçmiyor.
> - Frontend JWT'yi `localStorage`'a kaydediyor (`giris-yap/page.tsx:33`) ama **hiçbir istekte göndermiyor** — kod tabanının tamamında tek bir `Authorization` başlığı yok.
> - Frontend, profil endpoint'lerini **sabit `/api/profile/1`** ile çağırıyor (`ayarlar/page.tsx:39,193,218,241`) — giriş yapan kullanıcı kim olursa olsun 1 numaralı kullanıcı.
>
> **Sonuç:** Cloud Run URL'ini bilen herkes, giriş yapmadan:
> - `DELETE /api/listings/:id` ile **herhangi bir ilanı silebilir** (`listings.js:210`)
> - `PUT /api/listings/:id` ile **fiyatları değiştirebilir** (`listings.js:181`)
> - `DELETE /api/bids/:id` ile **teklifleri silebilir** (`bids.js:138`)
> - `PATCH /api/bids/:id/status` ile **teklif durumunu değiştirebilir** (`bids.js:122`)
> - `GET /api/profile/:userId` ile **herhangi bir kullanıcının** e-posta, telefon, vergi no, adres bilgisini okuyabilir (`profileController.js:9`)
> - `POST /api/orders/checkout` ile **sahte satış kaydı** oluşturabilir
>
> Jüri karşısında canlı bir demoda bu, güvenlik bulgusundan öte **demoyu bozabilecek** bir risk.
>
> **Çözüm:**
> ```js
> // backend/middleware/auth.js (YENİ DOSYA)
> const jwt = require('jsonwebtoken');
>
> function requireAuth(req, res, next) {
>   const header = req.headers.authorization || '';
>   const token = header.startsWith('Bearer ') ? header.slice(7) : null;
>   if (!token) return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' });
>
>   try {
>     req.user = jwt.verify(token, process.env.JWT_SECRET);
>     next();
>   } catch {
>     return res.status(401).json({ error: 'Oturum geçersiz veya süresi dolmuş.' });
>   }
> }
>
> // Kaynak sahipliği kontrolü (IDOR koruması)
> function requireSelf(req, res, next) {
>   if (Number(req.params.userId) !== Number(req.user.userId)) {
>     return res.status(403).json({ error: 'Bu kayda erişim yetkiniz yok.' });
>   }
>   next();
> }
>
> module.exports = { requireAuth, requireSelf };
> ```
> ```js
> // backend/routes/profile.js — tamamı
> const { requireAuth, requireSelf } = require('../middleware/auth');
> router.get('/:userId',           requireAuth, requireSelf, getProfile);
> router.put('/:userId',           requireAuth, requireSelf, updateProfile);
> router.put('/:userId/settings',  requireAuth, requireSelf, updateSettings);
> router.get('/:userId/invoices',  requireAuth, requireSelf, getInvoices);
> ```
> ```js
> // backend/routes/listings.js — yazma işlemlerini koru
> router.post('/',      requireAuth, async (req, res) => { ... });
> router.put('/:id',    requireAuth, async (req, res) => { ... });
> router.delete('/:id', requireAuth, async (req, res) => { ... });
> ```
> Ayrıca `listings.js:156`'daki hardcoded `user_id = 1` yerine `req.user.userId` kullanılmalı.
>
> Frontend tarafında token gönderimi (`frontend/lib/api.ts`'e eklenecek):
> ```ts
> export function authHeaders(): Record<string, string> {
>   if (typeof window === 'undefined') return {};
>   const token = localStorage.getItem('token');
>   return token ? { Authorization: `Bearer ${token}` } : {};
> }
>
> // kullanım
> const res = await fetch(apiUrl('/api/listings'), {
>   method: 'POST',
>   headers: { 'Content-Type': 'application/json', ...authHeaders() },
>   body: JSON.stringify(payload),
> });
> ```

> ### BLOCKER (güvenlik) — Şifre değiştirmede kimlik doğrulama atlatma + düz metin şifre
>
> `backend/controllers/profileController.js:30-36`:
> ```js
> if (newPassword) {
>   const user = await db.get('SELECT password FROM users WHERE id = ?', [userId]);
>   if (user && user.password && currentPassword && user.password !== currentPassword) {
>     return res.status(400).json({ success: false, error: "Mevcut şifreniz hatalı!" });
>   }
>   await db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
> }
> ```
>
> **İki ayrı kritik hata:**
>
> **(a) Kimlik doğrulama atlatma.** Koşul `currentPassword &&` içeriyor. İstek gövdesinde `currentPassword` **hiç gönderilmezse** koşul kısa devre yapar, kontrol atlanır ve şifre değiştirilir. Kimlik doğrulama middleware'i de olmadığı için (yukarıdaki bulgu), tek bir istekle **herhangi bir hesap ele geçirilebilir**:
> ```bash
> curl -X PUT https://<api>/api/profile/1 \
>   -H 'Content-Type: application/json' \
>   -d '{"newPassword":"saldirgan123"}'
> ```
>
> **(b) Şifre düz metin saklanıyor.** Satır 35 `bcrypt.hash` çağırmadan doğrudan yazıyor. Satır 32'deki karşılaştırma da düz metin (`user.password !== currentPassword`) — oysa kayıt akışı bcrypt hash'i saklıyor (`authController.js:32`). Yani meşru bir kullanıcı şifresini değiştirdiğinde hash düz metinle **üzerine yazılır** ve `authController.js:72`'deki `bcrypt.compare` bir daha eşleşmez — **kullanıcı kendi hesabından kalıcı olarak kilitlenir.** Bu aynı zamanda işlevsel bir hata.
>
> **Çözüm:**
> ```js
> // backend/controllers/profileController.js:30-36 yerine
> const bcrypt = require('bcryptjs');
>
> if (newPassword) {
>   if (typeof newPassword !== 'string' || newPassword.length < 6) {
>     return res.status(400).json({ success: false, error: 'Yeni şifre en az 6 karakter olmalıdır.' });
>   }
>   if (!currentPassword) {
>     return res.status(400).json({ success: false, error: 'Mevcut şifrenizi girmelisiniz.' });
>   }
>
>   const user = await db.get('SELECT password FROM users WHERE id = ?', [userId]);
>   if (!user) {
>     return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });
>   }
>
>   const ok = await bcrypt.compare(currentPassword, user.password);
>   if (!ok) {
>     return res.status(400).json({ success: false, error: 'Mevcut şifreniz hatalı!' });
>   }
>
>   const hashed = await bcrypt.hash(newPassword, 10);
>   await db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
> }
> ```

### 4.5 Varsayılan / zayıf JWT sırrı

> **BLOCKER (güvenlik)**
> `backend/controllers/authController.js:5`:
> ```js
> const JWT_SECRET = process.env.JWT_SECRET || 'suren-borsa-gizli-anahtar-2026';
> ```
> **Ne bozulur:** Bu fallback **herkese açık depoda** duruyor. Cloud Run'da `JWT_SECRET` tanımlanmazsa uygulama sessizce bu bilinen değere düşer. Depoya erişen herkes geçerli token üretip herhangi bir kullanıcı gibi davranabilir (kimlik doğrulama eklendikten sonra da).
> **Çözüm:** Fallback'i kaldır, yokluğunda başlatmayı durdur:
> ```js
> // backend/controllers/authController.js:5 yerine
> const JWT_SECRET = process.env.JWT_SECRET;
> if (!JWT_SECRET) {
>   throw new Error('JWT_SECRET ortam değişkeni tanımlı değil. Sunucu başlatılamıyor.');
> }
> ```
> Güçlü sır üret ve Secret Manager'a koy:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> gcloud secrets create jwt-secret --data-file=-
> ```

### 4.6 Hata yönetimi — stack trace ve iç detay sızıntısı

> **MUST FIX**
> `NODE_ENV` kontrolü **hiçbir yerde yok.** Merkezi hata middleware'i de yok. Bunun yerine her handler ham hata mesajını istemciye döndürüyor — **28 farklı noktada**:
>
> `authController.js:46,94,119` · `profileController.js:18,53,87,103` · `dashboardController.js:107` · `companyAnalysisController.js:153` · `indexController.js:35` · `homeController.js:135` · `listings.js:75,111,132,175,205,227` · `bids.js:49,64,117,132,146` · `orders.js:129,147` · `market.js:69,93,169` · `reports.js`
>
> Tipik biçim:
> ```js
> res.status(500).json({ message: "...", error: error.message });
> ```
>
> **Ne sızar:** SQLite/libSQL hata metinleri tablo ve kolon adlarını, SQL parçalarını açığa çıkarır (`SQLITE_ERROR: no such column: tax_office`). Bu, saldırgana şemanın haritasını verir. Dosya yolları da bazı hata türlerinde görünebilir.
> **Çözüm:** Merkezi hata middleware'i ekle (tüm route'lardan **sonra**, `server.js` sonunda) ve handler'lardaki `error: err.message` alanlarını kaldır:
> ```js
> // backend/server.js — tüm app.use(route) satırlarından SONRA
>
> // 404
> app.use((req, res) => {
>   res.status(404).json({ error: 'Endpoint bulunamadı.' });
> });
>
> // Merkezi hata yakalayıcı
> app.use((err, req, res, next) => {
>   const isProd = process.env.NODE_ENV === 'production';
>   console.error('[HATA]', req.method, req.originalUrl, err);   // Cloud Logging'e gider
>
>   res.status(err.status || 500).json({
>     error: isProd ? 'Sunucu hatası oluştu.' : err.message,
>     ...(isProd ? {} : { stack: err.stack }),
>   });
> });
> ```
> Cloud Run'da `NODE_ENV=production` **mutlaka** tanımlanmalı.

### 4.7 SQL injection riski

> **DÜŞÜK RİSK — ancak bir istisna var**
>
> Denetlenen 66 sorgunun **tamamı** parametreli (`?` yer tutucusu + args dizisi). Kullanıcı girdisinin doğrudan SQL'e birleştirildiği **hiçbir nokta bulunmadı.**
>
> Dinamik olarak kurulan sorgularda bile (`listings.js:40-64`, `bids.js:11-37`, `homeController.js:89-108`) yalnızca **sabit SQL parçaları** birleştiriliyor; değerler her zaman `params` dizisine gidiyor. Bu doğru desen.
>
> **Tek istisna — MUST FIX (injection değil, veri bütünlüğü):**
> `backend/migrate_backend2.js:22`:
> ```js
> await db.run(`ALTER TABLE listings ADD COLUMN ${col.name} ${col.type};`);
> ```
> Burada tablo/kolon adı string interpolasyonu var. `col.name` sabit bir dizide tanımlı olduğu için **sömürülebilir değil**, ama bu dosya zaten silinecek (tek seferlik migration script'i).
>
> `db.js:92-97`'deki `UPDATE ... REPLACE(...)` de sabit metinlerle çalışıyor, kullanıcı girdisi almıyor.

### 4.8 Açıkta kalan test / debug / seed endpoint'leri ve varsayılan hesaplar

| Kontrol | Sonuç |
|---|---|
| Debug/test HTTP endpoint'i | **Yok.** Route'lar arasında `/debug`, `/test`, `/seed` yok. |
| Test **script'leri** (HTTP değil) | `backend/test_home.js`, `backend/dynamic-test.js`, `demir-celik-backend/test_*.js` — yalnızca CLI, mount edilmemiş. Yine de imajdan çıkarılmalı (`.dockerignore`). |
| Varsayılan admin hesabı | **Yok.** Commit edilmiş DB'de `users` tablosu 0 satır; seed script'lerinin hiçbiri kullanıcı oluşturmuyor. |
| Zayıf varsayılan şifre | **Yok.** |

> **MUST FIX — `POST /api/auth/forgot-password` kullanıcı numaralandırma (enumeration)**
> `backend/controllers/authController.js:110-112`:
> ```js
> if (!user) {
>   return res.status(404).json({ error: "Bu e-posta adresine ait kullanıcı bulunamadı." });
> }
> ```
> **Ne bozulur:** Farklı yanıtlar sayesinde saldırgan hangi e-postaların sistemde kayıtlı olduğunu tespit edebilir. Ayrıca fonksiyon **hiçbir e-posta göndermiyor** ama "gönderildi" diyor (satır 116) — kullanıcıyı yanıltıyor.
> **Çözüm:** Kullanıcı bulunsun bulunmasın aynı yanıtı ver:
> ```js
> exports.forgotPassword = async (req, res) => {
>   const { email } = req.body;
>   if (!email) return res.status(400).json({ error: "E-posta adresi zorunludur." });
>
>   // Kayıt olsun olmasın aynı yanıt (enumeration engeli)
>   res.json({
>     success: true,
>     message: "Eğer bu e-posta kayıtlıysa, sıfırlama bağlantısı gönderildi."
>   });
> };
> ```

> **NICE TO HAVE — İstek gövdesi boyut limiti açıkça tanımlı değil**
> `backend/server.js:13` — `express.json()` varsayılan 100 KB limitiyle gelir, kabul edilebilir. Açık tanımlamak daha iyi:
> ```js
> app.use(express.json({ limit: '1mb' }));
> app.use(express.urlencoded({ extended: true, limit: '1mb' }));
> ```

---

## 5. Ortam Değişkenleri

### Cloud Run (backend)

| Değişken | Zorunlu | Örnek / Not |
|---|---|---|
| `TURSO_DATABASE_URL` | Evet | `libsql://suren-borsa-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | Evet | **Secret Manager'a koyun**, düz env var olarak değil |
| `JWT_SECRET` | Evet | 48+ byte rastgele hex. **Secret Manager.** Fallback kaldırıldığı için yoksa uygulama başlamaz |
| `NODE_ENV` | Evet | `production` — hata detaylarının gizlenmesi buna bağlı |
| `CORS_ORIGIN` | Evet | `https://<proje>.vercel.app` (virgülle çoklu) |
| `PORT` | Hayır | Cloud Run otomatik enjekte eder (`8080`). **Elle tanımlamayın.** |
| `GCS_BUCKET` | Opsiyonel | Yalnızca görsel yükleme GCS'e taşınırsa |

```bash
# Sırları Secret Manager'a koy
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))" \
  | tr -d '\n' | gcloud secrets create jwt-secret --data-file=-
echo -n "<turso-token>" | gcloud secrets create turso-token --data-file=-
```

### Vercel (frontend)

| Değişken | Zorunlu | Örnek / Not |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Evet | `https://suren-borsa-api-xxxx.a.run.app` — **build sırasında gömülür**, değişirse yeniden deploy gerekir |

Vercel'e **asla** `TURSO_AUTH_TOKEN` veya `JWT_SECRET` eklemeyin. Frontend bu değerlere ihtiyaç duymuyor; `NEXT_PUBLIC_` önekiyle eklenirlerse tarayıcı paketine gömülür ve herkes okuyabilir.

### `backend/.env.example` (repoya eklenecek — `.env` değil)

```bash
TURSO_DATABASE_URL=libsql://localhost:8080
TURSO_AUTH_TOKEN=
JWT_SECRET=gelistirme-icin-rastgele-deger-uretin
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 6. Sıralı Migrasyon Kontrol Listesi

### Aşama 0 — Depo temizliği (1–2 sa)
- [ ] `demir-celik-backend/`, `suren-borsa-backend/`, `suren-borsa-frontend/`, `suren-borsa-frontend-eski/` sil
- [ ] Kök `server.js`, `routes/`, `seed,js`, `seed_market.js`, `package.json`, `package-lock.json`, `patch_server_reports.js` sil
- [ ] `backend/patch_auth.js`, `backend/patch_server.js`, `backend/migrate_backend2.js`, `backend/dynamic-test.js`, `backend/test_home.js` sil
- [ ] `git rm --cached` ile `.sqlite` dosyalarını takipten çıkar; `.gitignore`'a `*.sqlite`, `*.db` ekle
- [ ] Doğrula: `backend/` ve `frontend/` dışında kod kalmadı

### Aşama 1 — Şema ve Turso (4–6 sa)
- [ ] `backend/schema.sql` yaz (2.5'teki tam sürüm — `bids` ve `invoices` dahil)
- [ ] `turso db create suren-borsa` · `turso db shell suren-borsa < backend/schema.sql`
- [ ] `backend/seed.sql` yaz (`material_indices`, `price_indexes`, `price_history` + örnek ilanlar) ve uygula
- [ ] Doğrula: `turso db shell suren-borsa ".tables"` → 11 tablo listelenmeli

### Aşama 2 — Backend veri katmanı (6–8 sa)
- [ ] `npm i @libsql/client --prefix backend` · `npm rm sqlite sqlite3 xlsx --prefix backend`
- [ ] `backend/db.js`'i uyumluluk sarmalayıcısıyla değiştir (2.2)
- [ ] `market.js`, `orders.js`, `homeController.js` içindeki yerel `getDb` fabrikalarını sil, `../db`'den import et
- [ ] Tüm çalışma-anı `CREATE TABLE` / `ALTER TABLE` / `PRAGMA` çağrılarını sil
- [ ] `db.js`'teki UTF-8 onarım `UPDATE`'ini kaldır
- [ ] `orders.js` checkout'u `db.batch()` ile atomik yap; `listing.userId` → `listing.user_id` düzelt
- [ ] `dashboardController.js:30` `'localtime'` → açık saat dilimi offset'i
- [ ] Lokalde Turso'ya bağlı test: her endpoint'i tek tek dene

### Aşama 3 — Güvenlik (6–8 sa)
- [ ] `authController.js:5` JWT fallback'ini kaldır, yoksa hata fırlat
- [ ] `profileController.js:30-36` şifre değiştirme açığını düzelt (bcrypt + zorunlu `currentPassword`)
- [ ] `backend/middleware/auth.js` oluştur; profil ve tüm yazma route'larına uygula
- [ ] `listings.js:156` hardcoded `user_id: 1` → `req.user.userId`
- [ ] `helmet` + `express-rate-limit` + `app.set('trust proxy', 1)` ekle
- [ ] `cors()` → origin allowlist
- [ ] Merkezi hata middleware'i + 404 handler; 28 noktadaki `error: err.message` alanlarını kaldır
- [ ] `zod` ile en az `bids`, `listings`, `profile` POST/PUT gövdelerini doğrula
- [ ] `forgot-password` enumeration yanıtını düzelt
- [ ] Frontend: `Authorization: Bearer` başlığını tüm isteklere ekle

### Aşama 4 — Cloud Run (3–4 sa)
- [ ] `backend/Dockerfile` + `backend/.dockerignore` oluştur
- [ ] `backend/package.json`'a `engines.node: ">=22"` ekle
- [ ] `server.js`: `0.0.0.0` bind + SIGTERM graceful shutdown
- [ ] `server.js`: `/api/reports` route'unu mount et
- [ ] `fs.mkdirSync(uploadsDir)` satırını kaldır
- [ ] Secret Manager'da `jwt-secret` ve `turso-token` oluştur
- [ ] `gcloud run deploy --source ./backend` · env değişkenlerini bağla
- [ ] Doğrula: `curl https://<api>/api/listings` → 200 + JSON

### Aşama 5 — Vercel (2–3 sa)
- [ ] `frontend/lib/api.ts` oluştur (`apiUrl`, `apiFetch`, `authHeaders`)
- [ ] 34 hardcoded `localhost:5000` noktasını dönüştür (3.1 tablosu)
- [ ] Vercel projesi oluştur, **Root Directory = `frontend`** ayarla
- [ ] `NEXT_PUBLIC_API_URL` tanımla, deploy et
- [ ] Cloud Run `CORS_ORIGIN`'i gerçek Vercel alan adıyla güncelle ve backend'i yeniden deploy et

### Aşama 6 — Uçtan uca doğrulama (4–6 sa)
- [ ] Kayıt ol → giriş yap → token `localStorage`'da
- [ ] İlan oluştur → listede görünüyor → detay sayfası açılıyor
- [ ] Teklif ver → teklifler sayfasında görünüyor → durum güncelle → sil
- [ ] Checkout akışı → sipariş kaydı oluşuyor + ilan `Sold` oluyor
- [ ] Raporlar/ESG sayfası veri gösteriyor
- [ ] Gösterge paneli ve firma analizi KPI'ları doluyor
- [ ] Endeks/piyasa grafiği veri gösteriyor (seed doğrulaması)
- [ ] **Scale-to-zero testi:** 15 dk bekle, tekrar aç → veri hâlâ orada (Turso kalıcılık doğrulaması)
- [ ] Token'sız `DELETE /api/listings/1` → 401 dönüyor
- [ ] İzinsiz origin'den CORS isteği → engelleniyor

---

## 7. Efor Tahmini

| Aşama | Saat | Kritiklik |
|---|---|---|
| 0 · Depo temizliği | 1–2 | Deploy için zorunlu |
| 1 · Şema + Turso kurulumu | 4–6 | **BLOCKER** |
| 2 · Backend veri katmanı | 6–8 | **BLOCKER** |
| 3 · Güvenlik | 6–8 | 2 BLOCKER + 8 MUST FIX |
| 4 · Cloud Run | 3–4 | **BLOCKER** |
| 5 · Vercel | 2–3 | **BLOCKER** |
| 6 · Uçtan uca test | 4–6 | Zorunlu |
| **TOPLAM** | **26–37 sa** | |

**Planlama notları:**

- Tek kişi, tam mesai: **4–5 iş günü.** Akşam/hafta sonu çalışmasıyla: **8–10 gün.**
- **Minimum yayına alma yolu (sadece BLOCKER'lar): 16–21 saat.** Aşama 3'ün (güvenlik) büyük kısmı çıkarılabilir — ama uygulama herkese açık ve jüri kullanacaksa 4.4 (kimlik doğrulama) ve 4.5 (JWT sırrı) **pazarlığa açık değil.** Bu ikisi ~3 saat.
- **Kritik yol:** Aşama 1 → 2 → 4. Aşama 5 (Vercel) bunlara paralel yürütülebilir; yalnızca son adımda Cloud Run URL'i gerekir.
- **En büyük belirsizlik Aşama 1.** Şema hiçbir yerde kayıtlı olmadığı ve `bids`/`invoices` tabloları ile 7 `users` kolonu eksik olduğu için, ilk uçtan uca testte **sorgulanan ama tanımsız başka kolonlar** çıkabilir. 2.5'teki tabloda listelenen 12 kırık endpoint bunun göstergesi. Bu aşama için tampon süre ayırın.
- **Risk:** Aşama 2'de 66 çağrı noktası var ama uyumluluk sarmalayıcısı sayesinde bunların ~63'ü **değişmeden** çalışır. Sarmalayıcı yerine her çağrıyı `client.execute()` ile yeniden yazma yolu seçilirse bu aşama **6–8 saatten 16–20 saate** çıkar. Sarmalayıcı yaklaşımını öneriyorum.

---

## Ek: Bulgu Özeti

**BLOCKER (deploy çalışmaz) — 9**

1. Depo kökü belirsiz; buildpack yanlış uygulamayı build eder
2. Dockerfile yok
3. SQLite dosyası efemeral diskte — veri her soğuk başlangıçta kaybolur
4. Aynı anda iki farklı veritabanı dosyası kullanılıyor
5. Üretilebilir şema yok; `bids` ve `invoices` tabloları hiç yaratılmıyor → 12 endpoint kırık
6. Seed dosyaları boş → endeks ve fiyat önerisi çalışmaz
7. Frontend'de 34 hardcoded `localhost:5000`
8. `/api/reports/esg` backend'de mount edilmemiş → Raporlar sayfası 404
9. *(güvenlik)* Kimlik doğrulama yok + şifre değiştirme atlatma açığı + hardcoded JWT sırrı

**MUST FIX (çalışır ama riskli) — 15**

Graceful shutdown yok · `engines.node` yok · `nodemon` üretim imajında · istek başına DB bağlantısı + DDL · checkout atomik değil · `DATE('now','localtime')` UTC'ye kayıyor · çalışma-anı DDL kaldırılmalı · `.sqlite` repoda takipli · `.gitignore` eksikleri · CORS wildcard · helmet yok · rate limiting yok · input validation yok · hata yanıtları iç detay sızdırıyor · forgot-password enumeration

**NICE TO HAVE — 6**

Açık `0.0.0.0` bind · patch script'lerini sil · multer ölü kod (veya GCS'e taşı) · `next/image` domain tanımı · Vercel rewrite alternatifi · istek gövdesi boyut limiti
