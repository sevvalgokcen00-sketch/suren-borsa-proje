const { getDb } = require('../db');

// Gösterge Paneli Verilerini Getir
exports.getDashboardData = async (req, res) => {
  try {
    const db = await getDb();

    // 1. Toplam İşlem Hacmi (Fiyat * Ağırlık)
    const volumeResult = await db.get(
      `SELECT COALESCE(SUM(price * weight), 0) as totalVolume FROM listings`
    );

    // 2. Toplam İşlenen / Geri Dönüştürülen Ağırlık (Kg)
    const amountResult = await db.get(
      `SELECT COALESCE(SUM(weight), 0) as totalAmount FROM listings`
    );

    // 3. Aktif İlan Sayısı (DB varsayılanı: 'Aktif')
    const listingsResult = await db.get(
      `SELECT COUNT(*) as activeCount FROM listings WHERE status = 'Aktif'`
    );

    // 4. Bekleyen Teklif Sayısı
    const offersResult = await db.get(
      `SELECT COUNT(*) as pendingCount FROM offers WHERE status = 'pending'`
    );

    // 5. Aylık İşlem Hacmi Trendi
    const monthlyTrend = await db.all(
      `SELECT 
        CASE strftime('%m', created_at)
          WHEN '01' THEN 'Ocak'
          WHEN '02' THEN 'Şubat'
          WHEN '03' THEN 'Mart'
          WHEN '04' THEN 'Nisan'
          WHEN '05' THEN 'Mayıs'
          WHEN '06' THEN 'Haziran'
          WHEN '07' THEN 'Temmuz'
          WHEN '08' THEN 'Ağustos'
          WHEN '09' THEN 'Eylül'
          WHEN '10' THEN 'Ekim'
          WHEN '11' THEN 'Kasım'
          WHEN '12' THEN 'Aralık'
        END as month,
        COALESCE(SUM(price * weight) / 1000000, 0) as volume
       FROM listings
       WHERE created_at IS NOT NULL
       GROUP BY strftime('%m', created_at)
       ORDER BY strftime('%m', created_at) ASC`
    );

    const totalVolumeVal = volumeResult.totalVolume;
    const totalAmountVal = amountResult.totalAmount; // Kg cinsinden
    const totalAmountTon = Math.round(totalAmountVal / 1000); // Kg -> Ton dönüşümü
    const activeListingsCount = listingsResult.activeCount;
    const pendingOffersCount = offersResult.pendingCount;

    const dashboardData = {
      kpi: {
        totalVolume: { 
          raw: totalVolumeVal,
          value: totalVolumeVal >= 1000000 
            ? `₺ ${(totalVolumeVal / 1000000).toFixed(1)}M` 
            : `₺ ${totalVolumeVal.toLocaleString('tr-TR')}`
        },
        recycledAmount: { 
          raw: totalAmountVal,
          value: `${totalAmountTon.toLocaleString('tr-TR')} ton`
        },
        activeListings: { 
          raw: activeListingsCount,
          value: `${activeListingsCount} İlan`, 
          note: "Aktif yayında olanlar" 
        },
        incomingOffers: { 
          raw: pendingOffersCount,
          value: `${pendingOffersCount} Yanıtsız`, 
          note: "Yanıt bekliyor ⏳" 
        }
      },
      trendChart: monthlyTrend
    };

    return res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Dashboard verisi alınamadı:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Gösterge paneli verileri alınamadı.", 
      error: error.message 
    });
  }
};