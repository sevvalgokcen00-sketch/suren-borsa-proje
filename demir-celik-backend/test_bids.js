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

async function runBidsTest() {
  console.log("🚀 BIDS (TEKLİF) ENDPOINT TESTLERİ BAŞLIYOR...\n");

  // 1. Önce aktif bir test ilanı açalım (Satıcı: userId: 1)
  const listingRes = await request({
    host: 'localhost', port: 5001, path: '/api/listings', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    userId: 1,
    companyName: "Satıcı Metal A.Ş.",
    materialType: "DKP",
    title: "Bids Test İlanı",
    price: 25.0,
    weight: 1000,
    locationCity: "Sakarya",
    locationDistrict: "Serdivan"
  });

  const listingId = listingRes.body.listingId;
  console.log(`0. Test İlanı Hazırlandı: (İlan ID: ${listingId})`);

  // 2. Teklif Oluşturma Testi (Alıcı: buyerId: 2)
  const createBidRes = await request({
    host: 'localhost', port: 5001, path: '/api/bids', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    listingId: listingId,
    buyerId: 2,
    buyerCompanyName: "Alıcı Hurda Ltd.",
    price: 24.0,
    amount: 500,
    unit: "kg"
  });

  const bidId = createBidRes.body.bidId;
  console.log(`1. Yeni Teklif Oluşturma: ${createBidRes.status === 201 ? '✅ BAŞARILI' : '❌ HATA'} (Bid ID: ${bidId})`);

  // 3. l.userId ve JOIN Hatasının Çözüm Kontrolü (Gelen Teklifler - userId: 1)
  const incomingRes = await request({ host: 'localhost', port: 5001, path: '/api/bids?userId=1&type=incoming', method: 'GET' });
  const incomingValid = incomingRes.status === 200 && Array.isArray(incomingRes.body) && incomingRes.body.some(b => b.id === bidId);
  console.log(`2. Gelen Teklifler (Satıcı userId=1): ${incomingValid ? '✅ BAŞARILI' : '❌ HATA'}`);

  // 4. Giden Teklifler Kontrolü (Alıcı - userId: 2)
  const outgoingRes = await request({ host: 'localhost', port: 5001, path: '/api/bids?userId=2&type=outgoing', method: 'GET' });
  const outgoingValid = outgoingRes.status === 200 && Array.isArray(outgoingRes.body) && outgoingRes.body.some(b => b.id === bidId && b.totalPrice === 12000);
  console.log(`3. Giden Teklifler & TotalPrice (Alıcı userId=2): ${outgoingValid ? '✅ BAŞARILI' : '❌ HATA'}`);

  // 5. Durum Güncelleme Testi (PATCH)
  const statusRes = await request({
    host: 'localhost', port: 5001, path: `/api/bids/${bidId}/status`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, { status: "Kabul Edildi" });
  console.log(`4. Teklif Durumu Kabul Edildi Yapma: ${statusRes.status === 200 ? '✅ BAŞARILI' : '❌ HATA'}`);

  // 6. Yanlış Kullanıcı Teklif Silme Yetki Kontrolü
  const unauthDelete = await request({
    host: 'localhost', port: 5001, path: `/api/bids/${bidId}`, method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  }, { buyerId: 999 });
  console.log(`5. Yetkisiz Teklif Silme Engeli: ${unauthDelete.status === 403 ? '✅ BAŞARILI' : '❌ HATA'}`);

  // 7. Teklifi Geri Çekme/Silme Testi
  const deleteRes = await request({
    host: 'localhost', port: 5001, path: `/api/bids/${bidId}`, method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  }, { buyerId: 2 });
  console.log(`6. Teklif Silme/Geri Çekme: ${deleteRes.status === 200 ? '✅ BAŞARILI' : '❌ HATA'}`);

  console.log("\n🏁 BIDS TESTLERİ TAMAMLANDI.");
}

runBidsTest();
