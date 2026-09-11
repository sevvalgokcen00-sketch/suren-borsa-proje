# ♻️ Döngüsel Borsa - B2B İkincil Hammadde ve ESG Ticaret Platformu

Sanayi tesislerinin atıl kaynaklarını, üretim artıklarını ve döngüsel malzemelerini ekonomiye kazandıran; yeşil dönüşüm standartlarına (ISO 14064, Scope 3) uygun karbon yutak ve emisyon tasarrufu hesaplayan B2B ikincil hammadde pazaryeri.

---

## 🚀 Proje Mimarisi & Geliştirilen Katmanlar

`	ext
[ Next.js 14 Frontend (App Router, Tailwind CSS) ]
                        │
                  RESTful API (JSON)
                        │
    [ Node.js / Express Backend & Rota Katmanı ]
                        │
           [ SQLite Veritabanı Modelleri ]
   (users, listings, invoices, settings, reports)
`

---

## 🛠️ Teknik Katkılar ve Geliştirilen Modüller

### 1. Veri Mimarisi ve Veritabanı Entegrasyonu
* **Excel Veri Boru Hattı (ETL):** 380+ satırlık endüstriyel malzeme verisi analiz edilerek SQLite veritabanı şemasına aktarıldı.
* **ID & CRUD Tutarlılığı:** Hem frontend formatını (T-XXXXX) hem de veritabanı IDlerini destekleyen esnek silme/güncelleme APIleri entegre edildi.
* **Terminoloji Standardizasyonu:** Döngüsel ekonomi standartları gereği tüm hurda terimleri temizlenerek İkincil Hammadde terminolojisine geçirildi.

### 2. ESG Sürdürülebilirlik & Karbon Yutak Analiz Motoru
* **Dinamik Emisyon Modeli:** Veritabanındaki tonajlara bağlı olarak Scope 3 CO2 tasarrufu ve kümülatif enerji tasarrufunu hesaplayan dinamik endpoint kuruldu.
* **Ekolojik Eşdeğer Algoritması:** Ağaç eşdeğeri, orman alanı ve araç eşdeğeri metrikleri dinamik bağlandı.

### 3. Kullanıcı Ayarları & Fatura Modülü
* Kurumsal profil, firma bilgileri, bildirim ayarları ve faturalar backend ile çift yönlü senkronize edildi.

---

## 💻 Kullanılan Teknolojiler
* **Frontend:** Next.js (TypeScript, React), Tailwind CSS
* **Backend:** Node.js, Express.js, Multer
* **Veritabanı:** SQLite3 / sqlite promise API
