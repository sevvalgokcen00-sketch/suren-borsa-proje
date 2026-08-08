// 1. Kategoriler ve İlan Sayıları (Sayfanın Ortasındaki Alan)
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 1, name: "Profiller & Borular", count: 1234, icon: "pipe" },
      { id: 2, name: "Sac & Levha", count: 2345, icon: "sheet" },
      { id: 3, name: "Plastik & Granül", count: 856, icon: "plastic" },
      { id: 4, name: "Alüminyum", count: 1098, icon: "aluminum" },
      { id: 5, name: "Kağıt & Karton", count: 987, icon: "paper" },
      { id: 6, name: "Ahşap & Palet", count: 654, icon: "wood" },
      { id: 7, name: "Endüstriyel Hurda", count: 543, icon: "scrap" },
      { id: 8, name: "Diğer", count: 321, icon: "other" }
    ];

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Öne Çıkan İlanlar (Sayfanın Altındaki Kartlar)
exports.getFeaturedListings = async (req, res) => {
  try {
    const featuredListings = [
      {
        id: 101,
        title: "Paslanmaz Çelik Profil Hurdası",
        category: "Profiller & Borular",
        badge: "Öne Çıkan",
        badgeColor: "green",
        imageUrl: "/images/sample1.jpg",
        company: "Demir Çelik A.Ş.",
        city: "İstanbul"
      },
      {
        id: 102,
        title: "Geri Dönüştürülebilir PET Granül",
        category: "Plastik & Granül",
        badge: "Yeni",
        badgeColor: "blue",
        imageUrl: "/images/sample2.jpg",
        company: "Polimer Plastik",
        city: "Kocaeli"
      },
      {
        id: 103,
        title: "Endüstriyel Bakır Kablo Atığı",
        category: "Endüstriyel Hurda",
        badge: "Öne Çıkan",
        badgeColor: "green",
        imageUrl: "/images/sample3.jpg",
        company: "Ege Metal",
        city: "İzmir"
      },
      {
        id: 104,
        title: "Stok Fazlası Alüminyum Levha",
        category: "Sac & Levha",
        badge: "Fırsat",
        badgeColor: "orange",
        imageUrl: "/images/sample4.jpg",
        company: "Anadolu Alüminyum",
        city: "Bursa"
      }
    ];

    res.status(200).json({ success: true, data: featuredListings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Üst Arama Çubuğu (Arama ve Kategori Filtresi)
exports.searchListings = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    
    res.status(200).json({
      success: true,
      query: { keyword: keyword || "", category: category || "Tüm Kategoriler" },
      results: []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};