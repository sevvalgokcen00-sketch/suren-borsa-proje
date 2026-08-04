// Firma Merkezli Analiz Paneli Verilerini Getir
exports.getCompanyAnalysis = async (req, res) => {
  try {
    const analysisData = {
      // Toplam İstatistik Kartları (KPI)
      kpi: {
        totalCompanies: { value: "1.248", change: "%8,6 geçen aya göre" },
        activeListings: { value: "3.562", change: "%12,3 geçen aya göre" },
        totalVolume: { value: "₺ 285,4M", change: "%15,7 geçen aya göre" },
        recycledMaterial: { value: "128.450 ton", change: "%11,4 geçen aya göre" }
      },

      // Firma Performans Tablosu
      companies: [
        {
          id: 1,
          name: "Döngü Metal A.Ş.",
          mainMaterial: "Demir - Çelik",
          avgVolume: "₺ 18.750.000",
          totalTransactions: 128,
          region: "Marmara",
          performance: "Yüksek",
          trend: "up"
        },
        {
          id: 2,
          name: "Yeşil Polimer San. Ltd.",
          mainMaterial: "Plastik",
          avgVolume: "₺ 9.430.000",
          totalTransactions: 96,
          region: "Ege",
          performance: "Yüksek",
          trend: "up"
        },
        {
          id: 3,
          name: "AluTek Alüminyum A.Ş.",
          mainMaterial: "Alüminyum",
          avgVolume: "₺ 14.200.000",
          totalTransactions: 87,
          region: "Marmara",
          performance: "Orta",
          trend: "stable"
        }
      ],

      // Öne Çıkan Firma Kutusu
      featuredCompany: {
        name: "Döngü Metal A.Ş.",
        verified: true,
        description: "Demir-çelik geri dönüşümünde lider, yüksek işlem hacmi ve güvenilir iş ortağı.",
        mainMaterial: "Demir - Çelik",
        totalVolume: "₺ 74.250.000",
        totalTransactions: 128
      },

      // Grafik Verileri
      charts: {
        companyVolume: [
          { company: "Döngü Metal A.Ş.", volume: 80 },
          { company: "Yeşil Polimer San. Ltd.", volume: 52 },
          { company: "AluTek Alüminyum A.Ş.", volume: 48 },
          { company: "Eko Kağıt A.Ş.", volume: 32 },
          { company: "Geri Dönüşüm A.Ş.", volume: 24 }
        ],
        materialDistribution: {
          totalWeight: "128.450 ton",
          items: [
            { name: "Demir - Çelik", percentage: 42.1, color: "#1e6091" },
            { name: "Plastik", percentage: 24.7, color: "#10b981" },
            { name: "Alüminyum", percentage: 15.3, color: "#3b82f6" },
            { name: "Kağıt", percentage: 10.6, color: "#f59e0b" },
            { name: "Diğer", percentage: 7.3, color: "#9ca3af" }
          ]
        }
      }
    };

    res.status(200).json({ success: true, data: analysisData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Analiz verileri alınamadı.", error: error.message });
  }
};