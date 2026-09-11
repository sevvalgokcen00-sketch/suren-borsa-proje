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

async function runOrderTests() {
  console.log("🚀 ÖDEME VE TESCİLLİ İŞLEM (ORDERS) TESTLERİ BAŞLIYOR...\n");

  // 1. Önce tescil edilecek bir test ilanı açalım
  const listingRes = await request({
    host: 'localhost', port: 5001, path: '/api/listings', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    userId: 1,
    companyName: "Referans Demir Çelik A.Ş.",
    materialType: "Profil",
    title: "Ödeme ve Protokol Test İlanı",
    price: 20.0,
    weight: 2000,
    locationCity: "Sakarya",
    locationDistrict: "Serdivan"
  });

  const listingId = listingRes.body.listingId;
  console.log(`0. Satış İlanı Oluşturuldu (İlan ID: ${listingId})`);

  // 2. Sözleşme Onaysız Satış Denemesi (Engellenmeli)
  const noContractRes = await request({
    host: 'localhost', port: 5001, path: '/api/orders/checkout', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    listingId: listingId,
    contractAccepted: false
  });
  console.log(`1. Sözleşme Onayı Zorunluluğu: ${noContractRes.status === 400 ? '✅ BAŞARILI (Engellendi)' : '❌ HATA'}`);

  // 3. Tescilli İşlem ve Kurumsal Ödeme Tamamlama
  const checkoutRes = await request({
    host: 'localhost', port: 5001, path: '/api/orders/checkout', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    listingId: listingId,
    buyerId: 2,
    deliveryAddress: "Sakarya 1. OSB, Çelik Cad. No:14",
    paymentMethod: "Kurumsal Havale / EFT",
    contractAccepted: true
  });

  const orderSuccess = checkoutRes.status === 201 && checkoutRes.body.success === true;
  console.log(`2. Ödeme ve Protokol Onayı: ${orderSuccess ? '✅ BAŞARILI' : '❌ HATA'}`);
  if (orderSuccess) {
    console.log(`   - Kurtarılan Karbon: ${checkoutRes.body.environmentalImpact.savedCarbonTon}`);
    console.log(`   - Kurtarılan Ağaç: ${checkoutRes.body.environmentalImpact.savedTrees}`);
  }

  // 4. Satılan İlanın Pazar Listesinden Kalktığını Doğrulama (status != 'Active')
  const checkListing = await request({ host: 'localhost', port: 5001, path: '/api/listings', method: 'GET' });
  const isSoldHidden = Array.isArray(checkListing.body) && !checkListing.body.some(item => item.id === listingId);
  console.log(`3. Satılan İlanın Pazardan Kaldırılması: ${isSoldHidden ? '✅ BAŞARILI' : '❌ HATA'}`);

  // 5. Siparişler / Protokoller Listeleme Testi
  const ordersListRes = await request({ host: 'localhost', port: 5001, path: '/api/orders', method: 'GET' });
  const listValid = ordersListRes.status === 200 && Array.isArray(ordersListRes.body) && ordersListRes.body.length > 0;
  console.log(`4. Sipariş & Protokol Listeleme: ${listValid ? '✅ BAŞARILI' : '❌ HATA'}`);

  console.log("\n🏁 ÖDEME VE İŞLEM PROTOKOLÜ TESTLERİ TAMAMLANDI.");
}

runOrderTests();
