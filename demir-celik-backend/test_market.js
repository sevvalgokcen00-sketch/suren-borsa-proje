const http = require('http');

function request(options, data) {
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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runMarketTests() {
  console.log("🚀 MARKET & REFERANS FİYAT TESTLERİ BAŞLIYOR...\n");

  // 1. Endeks Listesi Testi
  const indexRes = await request({ host: 'localhost', port: 5001, path: '/api/market/indexes', method: 'GET' });
  const indexValid = indexRes.status === 200 && Array.isArray(indexRes.body) && indexRes.body.length > 0;
  console.log(`1. Market Endeksleri: ${indexValid ? '✅ BAŞARILI' : '❌ HATA'} (Yüklü Endeks Sayısı: ${indexRes.body.length || 0})`);

  // 2. Fiyat Geçmişi (History) Testi
  const historyRes = await request({ host: 'localhost', port: 5001, path: '/api/market/history/Profil', method: 'GET' });
  const historyValid = historyRes.status === 200 && Array.isArray(historyRes.body) && historyRes.body.length > 0;
  console.log(`2. Fiyat Geçmişi (Profil): ${historyValid ? '✅ BAŞARILI' : '❌ HATA'} (Geçmiş Noktaları: ${historyRes.body.length || 0})`);

  // 3. Fiyat Öneri & Medyan Hesaplama Testi
  const recRes = await request({
    host: 'localhost', port: 5001, path: '/api/market/calculate-recommendation', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    materialType: "Profil",
    usageStatus: "Temiz",
    hasCertificate: true,
    userPrice: 16.0
  });

  const recValid = recRes.status === 200 && recRes.body.recommendedPrice > 0 && recRes.body.comparisonNote !== "";
  console.log(`3. Fiyat Öneri Algoritması: ${recValid ? '✅ BAŞARILI' : '❌ HATA'} (Önerilen: ${recRes.body.recommendedPrice} TL, Not: ${recRes.body.comparisonNote})`);

  // 4. Zorunlu Alan Kontrolü (Malzeme türü eksik)
  const invalidRes = await request({
    host: 'localhost', port: 5001, path: '/api/market/calculate-recommendation', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { usageStatus: "Temiz" });
  console.log(`4. Eksik Veri Validasyonu: ${invalidRes.status === 400 ? '✅ BAŞARILI (Engellendi)' : '❌ HATA'}`);

  console.log("\n🏁 MARKET TESTLERİ TAMAMLANDI.");
}

runMarketTests();
