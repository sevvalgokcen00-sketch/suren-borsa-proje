// Gösterge Paneli Verilerini Getir
exports.getDashboardData = async (req, res) => {
  try {
    const dashboardData = {
      // Özet KPI Kartları
      kpi: {
        totalVolume: { value: "₺ 48,0M", change: "%14,2 artış" },
        recycledAmount: { value: "18.420 ton", change: "%9,8 artış" },
        activeListings: { value: "12 İlan", note: "3 tanesi öne çıkarıldı" },
        incomingOffers: { value: "8 Yanıtsız", note: "Yanıt bekleniyor ⏳" }
      },

      // Piyasa İşlem Hacmi Trend Grafiği (Aylık)
      trendChart: [
        { month: "Ocak", volume: 18 },
        { month: "Şubat", volume: 22 },
        { month: "Mart", volume: 28 },
        { month: "Nisan", volume: 34 },
        { month: "Mayıs", volume: 42 },
        { month: "Haziran", volume: 48 }
      ]
    };

    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gösterge paneli verileri alınamadı.", error: error.message });
  }
};