const { getDb } = require('../db');

// Firma Merkezli Analiz Paneli Verilerini Getir (4. Madde Çözümü)
exports.getCompanyAnalysis = async (req, res) => {
  try {
    const db = await getDb();

    // 1. KPI Toplam İstatistik Sorguları
    const totalCompaniesRes = await db.get(
      `SELECT COUNT(DISTINCT company_name) as count FROM users WHERE company_name IS NOT NULL AND company_name != ''`
    );
    const activeListingsRes = await db.get(
      `SELECT COUNT(*) as count FROM listings WHERE status = 'active'`
    );
    const totalVolumeRes = await db.get(
      `SELECT COALESCE(SUM(price * quantity), 0) as total FROM listings`
    );
    const recycledMaterialRes = await db.get(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM listings`
    );

    // 2. Firma Performans Tablosu (Users + Listings JOIN)
    const companiesRes = await db.all(
      `SELECT 
        u.id, 
        u.company_name as name, 
        COALESCE(SUM(l.price * l.quantity), 0) as totalVolumeNum,
        COALESCE(AVG(l.price * l.quantity), 0) as avgVolumeNum,
        COUNT(l.id) as totalTransactions,
        MAX(l.category) as mainMaterial
       FROM users u
       LEFT JOIN listings l ON u.id = l.user_id
       WHERE u.company_name IS NOT NULL AND u.company_name != ''
       GROUP BY u.id
       ORDER BY totalVolumeNum DESC
       LIMIT 10`
    );

    const companies = companiesRes.map((c) => ({
      id: c.id,
      name: c.name,
      mainMaterial: c.mainMaterial || "Genel Hurda / Metal",
      avgVolume: `₺ ${Math.round(c.avgVolumeNum).toLocaleString('tr-TR')}`,
      totalTransactions: c.totalTransactions,
      totalVolumeNum: c.totalVolumeNum
    }));

    // 3. Öne Çıkan Firma (İşlem hacmi en yüksek ilk firma)
    const topCompany = companiesRes[0];
    const featuredCompany = (topCompany && topCompany.totalVolumeNum > 0) ? {
      name: topCompany.name,
      verified: true,
      description: "Yüksek işlem hacmi ve dinamik portföyü ile sistemde öne çıkan firma.",
      mainMaterial: topCompany.mainMaterial || "Genel Hurda / Metal",
      totalVolume: topCompany.totalVolumeNum >= 1000000 
        ? `₺ ${(topCompany.totalVolumeNum / 1000000).toFixed(1)}M`
        : `₺ ${topCompany.totalVolumeNum.toLocaleString('tr-TR')}`,
      totalTransactions: topCompany.totalTransactions
    } : {
      name: "Henüz Veri Yok",
      verified: false,
      description: "Sistemde öne çıkan firma tespiti için işlem hacmi bekleniyor.",
      mainMaterial: "-",
      totalVolume: "₺ 0",
      totalTransactions: 0
    };

    // 4. Grafik 1: Firma Hacim Grafiği (Top 5 Firma)
    const companyVolumeChart = companiesRes.slice(0, 5).map((c) => ({
      company: c.name,
      volume: c.totalVolumeNum >= 1000000 
        ? parseFloat((c.totalVolumeNum / 1000000).toFixed(2)) 
        : c.totalVolumeNum
    }));

    // 5. Grafik 2: Malzeme Dağılımı (Kategori Bazlı)
    const materialDistRes = await db.all(
      `SELECT 
        COALESCE(category, 'Diğer') as name,
        SUM(quantity) as weight
       FROM listings
       GROUP BY category`
    );

    const totalWeightSum = materialDistRes.reduce((acc, curr) => acc + curr.weight, 0) || 1;
    const colors = ["#1e6091", "#10b981", "#3b82f6", "#f59e0b", "#9ca3af"];

    const materialDistributionItems = materialDistRes.map((item, index) => ({
      name: item.name,
      percentage: parseFloat(((item.weight / totalWeightSum) * 100).toFixed(1)),
      color: colors[index % colors.length]
    }));

    const totalVol = totalVolumeRes.total;

    // Sabit metinler kaldırılmış tamamen dinamik yanıt
    const analysisData = {
      kpi: {
        totalCompanies: { 
          raw: totalCompaniesRes.count,
          value: totalCompaniesRes.count.toLocaleString('tr-TR')
        },
        activeListings: { 
          raw: activeListingsRes.count,
          value: activeListingsRes.count.toLocaleString('tr-TR')
        },
        totalVolume: { 
          raw: totalVol,
          value: totalVol >= 1000000 
            ? `₺ ${(totalVol / 1000000).toFixed(1)}M` 
            : `₺ ${totalVol.toLocaleString('tr-TR')}`
        },
        recycledMaterial: { 
          raw: recycledMaterialRes.total,
          value: `${recycledMaterialRes.total.toLocaleString('tr-TR')} ton`
        }
      },
      companies,
      featuredCompany,
      charts: {
        companyVolume: companyVolumeChart,
        materialDistribution: {
          totalWeight: `${recycledMaterialRes.total.toLocaleString('tr-TR')} ton`,
          items: materialDistributionItems
        }
      }
    };

    return res.status(200).json({ success: true, data: analysisData });
  } catch (error) {
    console.error("Analiz verileri alınırken hata:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Analiz verileri alınamadı.", 
      error: error.message 
    });
  }
};