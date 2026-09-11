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

async function runTests() {
  console.log("🚀 LISTINGS ENDPOINT TESTLERİ BAŞLIYOR...\n");
  let createdId = null;

  // 1. İlan Listeleme Testi
  const listRes = await request({ host: 'localhost', port: 5001, path: '/api/listings', method: 'GET' });
  console.log(`1. İlan Listeleme: ${listRes.status === 200 ? '✅ BAŞARILI' : '❌ HATA'} (Mevcut İlan Sayısı: ${listRes.body.length})`);

  // 2. Yeni Kolonlarla İlan Ekleme Testi
  const newListing = {
    userId: 1,
    companyName: "Test Çelik Sanayi",
    materialType: "Profil",
    title: "Test Profil Satışı",
    price: 18.5,
    weight: 1200,
    locationCity: "Sakarya",
    locationDistrict: "Serdivan",
    qualityStandard: "DIN 2395",
    deliveryType: "Fabrika Teslim",
    wallThickness: "2.5mm",
    chemicalAnalysis: "Fe %98, C %0.2"
  };
  const createRes = await request({
    host: 'localhost', port: 5001, path: '/api/listings', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, newListing);

  if (createRes.status === 201) {
    createdId = createRes.body.listingId;
    console.log(`2. İlan Oluşturma (Yeni Kolonlar Dahil): ✅ BAŞARILI (ID: ${createdId})`);
  } else {
    console.log(`2. İlan Oluşturma: ❌ HATA - ${JSON.stringify(createRes.body)}`);
  }

  // 3. Negatif Fiyat Validasyon Testi
  const invalidRes = await request({
    host: 'localhost', port: 5001, path: '/api/listings', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { ...newListing, price: -5 });
  console.log(`3. Negatif Fiyat Kontrolü: ${invalidRes.status === 400 ? '✅ BAŞARILI (Engellendi)' : '❌ HATA'}`);

  // 4. İlan Detay & Yeni Kolonların Dönüş Testi
  if (createdId) {
    const detailRes = await request({ host: 'localhost', port: 5001, path: `/api/listings/${createdId}`, method: 'GET' });
    const hasColumns = detailRes.body.qualityStandard === 'DIN 2395' && detailRes.body.deliveryType === 'Fabrika Teslim';
    console.log(`4. İlan Detayı ve Kolon Eşleşmesi: ${hasColumns ? '✅ BAŞARILI' : '❌ HATA'}`);

    // 5. Filtreleme Testi (materialType & city)
    const filterRes = await request({ host: 'localhost', port: 5001, path: '/api/listings?materialType=Profil&city=Sakarya', method: 'GET' });
    const filterMatch = Array.isArray(filterRes.body) && filterRes.body.some(item => item.id === createdId);
    console.log(`5. materialType & City Filtresi: ${filterMatch ? '✅ BAŞARILI' : '❌ HATA'}`);

    // 6. Yanlış Kullanıcı Güncelleme Yetki Testi
    const unauthUpdate = await request({
      host: 'localhost', port: 5001, path: `/api/listings/${createdId}`, method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, { userId: 999, price: 20 });
    console.log(`6. Yetkisiz Güncelleme Engeli: ${unauthUpdate.status === 403 ? '✅ BAŞARILI' : '❌ HATA'}`);

    // 7. Soft Delete Testi
    const deleteRes = await request({
      host: 'localhost', port: 5001, path: `/api/listings/${createdId}`, method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }, { userId: 1 });
    console.log(`7. İlan Silme (Soft Delete): ${deleteRes.status === 200 ? '✅ BAŞARILI' : '❌ HATA'}`);
  }

  console.log("\n🏁 TEST TAMAMLANDI.");
}

runTests();
