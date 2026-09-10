const http = require('http');

function request(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runHomeTests() {
  console.log("🚀 BACKEND 2 - HOME & SEARCH TESTLERİ BAŞLIYOR...\n");
  const PORT = 5000;

  // 1. Kategoriler Listesi Testi (/api/home/categories)
  const catRes = await request({ host: 'localhost', port: PORT, path: '/api/home/categories', method: 'GET' });
  const catValid = catRes.status === 200 && catRes.body.success && catRes.body.data.length > 0;
  console.log(`1. Kategori Listesi: ${catValid ? '✅ BAŞARILI' : '❌ HATA'} (Kategori Sayısı: ${catRes.body?.data?.length || 0})`);

  // 2. Öne Çıkan İlanlar Testi (/api/home/featured-listings)
  const featRes = await request({ host: 'localhost', port: PORT, path: '/api/home/featured-listings', method: 'GET' });
  const featValid = featRes.status === 200 && featRes.body.success && featRes.body.results.length > 0;
  console.log(`2. Öne Çıkan İlanlar: ${featValid ? '✅ BAŞARILI' : '❌ HATA'} (Dönen İlan: ${featRes.body?.results?.length || 0})`);

  // 3. Genel Arama Testi (Keyword: "profil")
  const searchRes1 = await request({ host: 'localhost', port: PORT, path: '/api/home/search?q=profil', method: 'GET' });
  const searchValid1 = searchRes1.status === 200 && searchRes1.body.success && searchRes1.body.results.length > 0;
  console.log(`3. Kelime Araması (q=profil): ${searchValid1 ? '✅ BAŞARILI' : '❌ HATA'} (Bulunan Sonuç: ${searchRes1.body?.count || 0})`);

  // 4. Türkçe Karakterli Arama Testi (Keyword: "Çelik")
  const searchRes2 = await request({ host: 'localhost', port: PORT, path: '/api/home/search?keyword=%C3%87elik', method: 'GET' });
  const searchValid2 = searchRes2.status === 200 && searchRes2.body.success && searchRes2.body.results.length > 0;
  console.log(`4. Türkçe Karakter Arama (keyword=Çelik): ${searchValid2 ? '✅ BAŞARILI' : '❌ HATA'}`);

  // 5. Boş Arama / Tümünü Getirme Testi
  const emptySearchRes = await request({ host: 'localhost', port: PORT, path: '/api/home/search', method: 'GET' });
  const emptyValid = emptySearchRes.status === 200 && emptySearchRes.body.success && emptySearchRes.body.results.length > 0;
  console.log(`5. Parametresiz Genel Arama: ${emptyValid ? '✅ BAŞARILI' : '❌ HATA'}`);

  console.log("\n🏁 HOME & SEARCH TESTLERİ TAMAMLANDI.");
}

runHomeTests();
