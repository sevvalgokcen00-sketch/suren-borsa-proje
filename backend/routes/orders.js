const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// --------------------------------------------------------------------------
// 1. TESCİLLİ İŞLEMİ VE ÖDEMEYİ ONAYLA (POST /api/orders/checkout)
// --------------------------------------------------------------------------
router.post('/checkout', async (req, res) => {
  try {
    const db = await getDb();
    const { 
      bidId, 
      listingId, 
      buyerId, 
      deliveryAddress, 
      shippingDate, 
      paymentMethod = 'Kurumsal Havale / EFT',
      contractAccepted 
    } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: "İlan ID (listingId) zorunludur!" });
    }

    if (!contractAccepted) {
      return res.status(400).json({ message: "B2B Satış Şartnamesini onaylamalısınız!" });
    }

    // İlanı getir
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', [listingId]);
    if (!listing) {
      return res.status(404).json({ message: "İşlem yapılacak ilan bulunamadı!" });
    }

    // Teklif varsa teklif fiyatı/miktarı, yoksa ilanın kendi fiyatı/miktarı
    let finalPrice = listing.price;
    let finalAmount = listing.weight || 1000;

    // Teklif varsa değerlerini al. Teklifin durum güncellemesi AŞAĞIDAKİ
    // atomik batch'e dahil edilir — burada ayrı yazma yapılmaz.
    let approvedBidId = null;
    if (bidId) {
      const bid = await db.get('SELECT * FROM bids WHERE id = ?', [bidId]);
      if (bid) {
        finalPrice = bid.price;
        finalAmount = bid.amount;
        approvedBidId = bidId;
      }
    }

    // Çevresel Etki Hesaplaması (Görsel 1):
    // 1 kg geri dönüştürülen çelik yaklaşık 1.5 kg CO2 salınımını önler.
    // 1 yetişkin ağaç yılda yaklaşık 22 kg CO2 emer.
    const weightInKg = finalAmount;
    const savedCarbonTon = Number(((weightInKg * 1.5) / 1000).toFixed(2));
    const savedTrees = Math.round((savedCarbonTon * 1000) / 22);

    // ATOMİK YAZMA (Turso/libSQL batch): teklif onayı + sipariş kaydı +
    // ilanın 'Sold' işaretlenmesi TEK işlemde yapılır (hepsi ya da hiçbiri).
    // Aksi halde adımlar arasında ağ hatası olursa sipariş kaydedilir ama
    // ilan 'Aktif' kalır ve aynı ilan ikinci kez satılabilir.
    const statements = [];

    if (approvedBidId) {
      statements.push({
        sql: "UPDATE bids SET status = 'Onaylandı' WHERE id = ?",
        args: [approvedBidId],
      });
    }

    const insertIndex = statements.length; // sipariş INSERT'inin batch içindeki sırası
    statements.push({
      sql: `
        INSERT INTO orders (
          bidId, listingId, buyerId, sellerId, agreedPrice, amount,
          paymentMethod, deliveryAddress, shippingDate, contractAccepted,
          savedCarbon, savedTrees, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed')
      `,
      args: [
        bidId || null,
        listingId,
        buyerId || 1,
        // DÜZELTME: şemadaki kolon adı user_id (eskiden listing.userId okunuyordu
        // ve daima undefined olduğu için sellerId hep 1'e düşüyordu).
        listing.user_id || 1,
        finalPrice,
        finalAmount,
        paymentMethod,
        deliveryAddress || 'Sakarya 1. OSB, Çelik Cad. No:14',
        shippingDate || new Date().toISOString().split('T')[0],
        contractAccepted ? 1 : 0,
        savedCarbonTon,
        savedTrees,
      ],
    });

    statements.push({
      sql: "UPDATE listings SET status = 'Sold' WHERE id = ?",
      args: [listingId],
    });

    const batchResults = await db.batch(statements);

    // lastInsertRowid BigInt döner -> Number'a çevir (JSON BigInt serialize edemez)
    const newOrderId = Number(batchResults[insertIndex].lastInsertRowid);

    // Frontend modalının son adımında (3. Onay) gösterilecek veriler
    res.status(201).json({
      success: true,
      message: "Ticari İşlem Başarıyla Onaylandı!",
      orderId: newOrderId,
      environmentalImpact: {
        savedCarbonTon: `~${savedCarbonTon} Ton CO₂e`,
        savedTrees: `~${savedTrees} Yetişkin Ağaç`,
        standardNote: "ISO 14064 Kapsam 3 Raporunuza Otomatik İşlendi"
      },
      logistics: {
        deliveryAddress: deliveryAddress || 'Sakarya 1. OSB, Çelik Cad. No:14',
        shippingDate: shippingDate || new Date().toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error("[routes/orders.js]", error);
    res.status(500).json({ message: "İşlem onaylanırken bir hata oluştu!" });
  }
});

// --------------------------------------------------------------------------
// 2. ONAYLANAN PROTOKOLLERİ / SİPARİŞLERİ LİSTELE (GET /api/orders)
// --------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const orders = await db.all(`
      SELECT o.*, l.title as listingTitle, l.materialType 
      FROM orders o
      LEFT JOIN listings l ON o.listingId = l.id
      ORDER BY o.createdAt DESC
    `);
    res.json(orders);
  } catch (error) {
    console.error("[routes/orders.js]", error);
    res.status(500).json({ message: "Siparişler alınamadı!" });
  }
});

module.exports = router;