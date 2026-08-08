"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

// 81 İl ve İlçeler Verisi (Hata almamak için doğrudan dosyaya gömüldü)
const cityAndDistrictData = [
  { il: "Adana", ilceleri: ["Seyhan", "Yüreğir", "Çukurova", "Sarıçam", "Ceyhan", "Kozan"] },
  { il: "Adıyaman", ilceleri: ["Merkez", "Kahta", "Besni", "Gölbaşı"] },
  { il: "Afyonkarahisar", ilceleri: ["Merkez", "Sandıklı", "Dinar", "Bolvadin"] },
  { il: "Ağrı", ilceleri: ["Merkez", "Doğubayazıt", "Patnos"] },
  { il: "Amasya", ilceleri: ["Merkez", "Merzifon", "Suluova"] },
  { il: "Ankara", ilceleri: ["Çankaya", "Keçiören", "Yenimahalle", "Mamuk", "Etimesgut", "Sincan", "Kahramankazan", "Ostim OSB"] },
  { il: "Antalya", ilceleri: ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat"] },
  { il: "Artvin", ilceleri: ["Merkez", "Hopa", "Borçka"] },
  { il: "Aydın", ilceleri: ["Efeler", "Nazilli", "Söke", "Kuşadası"] },
  { il: "Balıkesir", ilceleri: ["Karesi", "Altıeylül", "Bandırma", "Edremit"] },
  { il: "Bilecik", ilceleri: ["Merkez", "Bozüyük"] },
  { il: "Bingöl", ilceleri: ["Merkez", "Genç"] },
  { il: "Bitlis", ilceleri: ["Merkez", "Tatvan"] },
  { il: "Bolu", ilceleri: ["Merkez", "Gerede"] },
  { il: "Burdur", ilceleri: ["Merkez", "Bucak"] },
  { il: "Bursa", ilceleri: ["Osmangazi", "Nilüfer", "Yıldırım", "İnegöl", "Gemlik", "Gürsu"] },
  { il: "Çanakkale", ilceleri: ["Merkez", "Biga", "Çan"] },
  { il: "Çankırı", ilceleri: ["Merkez"] },
  { il: "Çorum", ilceleri: ["Merkez", "Sungurlu"] },
  { il: "Denizli", ilceleri: ["Pamukkale", "Merkezefendi"] },
  { il: "Diyarbakır", ilceleri: ["Bağlar", "Kayapınar", "Yenişehir", "Sur"] },
  { il: "Edirne", ilceleri: ["Merkez", "Keşan"] },
  { il: "Elazığ", ilceleri: ["Merkez"] },
  { il: "Erzincan", ilceleri: ["Merkez"] },
  { il: "Erzurum", ilceleri: ["Yakutiye", "Palandöken", "Aziziye"] },
  { il: "Eskişehir", ilceleri: ["Odunpazarı", "Tepebaşı"] },
  { il: "Gaziantep", ilceleri: ["Şahinbey", "Şehitkamil", "Nizip"] },
  { il: "Giresun", ilceleri: ["Merkez", "Bulancak"] },
  { il: "Gümüşhane", ilceleri: ["Merkez"] },
  { il: "Hakkari", ilceleri: ["Merkez", "Yüksekova"] },
  { il: "Hatay", ilceleri: ["Antakya", "İskenderun", "Defne"] },
  { il: "Isparta", ilceleri: ["Merkez"] },
  { il: "Mersin", ilceleri: ["Akdeniz", "Toroslar", "Yenişehir", "Mezitli", "Tarsus"] },
  { il: "İstanbul", ilceleri: ["Tuzla OSB", "Dilovası Yakını", "İkitelli OSB", "Esenyurt", "Pendik", "Ümraniye", "Çatalca", "Hadımköy"] },
  { il: "İzmir", ilceleri: ["Aliağa OSB", "Bornova", "Buca", "Karabağlar", "Çiğli", "Torbalı"] },
  { il: "Kars", ilceleri: ["Merkez"] },
  { il: "Kastamonu", ilceleri: ["Merkez"] },
  { il: "Kayseri", ilceleri: ["Melikgazi", "Kocasinan", "Talas"] },
  { il: "Kırklareli", ilceleri: ["Merkez", "Lüleburgaz"] },
  { il: "Kırşehir", ilceleri: ["Merkez"] },
  { il: "Kocaeli", ilceleri: ["Gebze OSB", "Dilovası OSB", "İzmit", "Körfez", "Çayırova", "Darıca", "Gölcük"] },
  { il: "Konya", ilceleri: ["Selçuklu", "Karatay", "Meram"] },
  { il: "Kütahya", ilceleri: ["Merkez", "Tavşanlı"] },
  { il: "Malatya", ilceleri: ["Battalgazi", "Yeşilyurt"] },
  { il: "Manisa", ilceleri: ["Yunusemre", "Şehzadeler", "Turgutlu", "Akhisar"] },
  { il: "Kahramanmaraş", ilceleri: ["Onikişubat", "Dulkadiroğlu"] },
  { il: "Mardin", ilceleri: ["Artuklu", "Kızıltepe"] },
  { il: "Muğla", ilceleri: ["Bodrum", "Fethiye", "Menteşe"] },
  { il: "Muş", ilceleri: ["Merkez"] },
  { il: "Nevşehir", ilceleri: ["Merkez"] },
  { il: "Niğde", ilceleri: ["Merkez"] },
  { il: "Ordu", ilceleri: ["Altınordu", "Ünye", "Fatsa"] },
  { il: "Rize", ilceleri: ["Merkez", "Çayeli"] },
  { il: "Sakarya", ilceleri: ["Adapazarı", "Serdivan", "Arifiye OSB", "Erenler", "Hendek"] },
  { il: "Samsun", ilceleri: ["Atakum", "İlkadım", "Tekkeköy OSB"] },
  { il: "Siirt", ilceleri: ["Merkez"] },
  { il: "Sinop", ilceleri: ["Merkez"] },
  { il: "Sivas", ilceleri: ["Merkez"] },
  { il: "Tekirdağ", ilceleri: ["Çorlu OSB", "Çerkezköy OSB", "Süleymanpaşa"] },
  { il: "Tokat", ilceleri: ["Merkez", "Erbaa"] },
  { il: "Trabzon", ilceleri: ["Ortahisar", "Akçaabat"] },
  { il: "Tunceli", ilceleri: ["Merkez"] },
  { il: "Şanlıurfa", ilceleri: ["Haliliye", "Eyyübiye", "Karaköprü"] },
  { il: "Uşak", ilceleri: ["Merkez"] },
  { il: "Van", ilceleri: ["Ipekyolu", "Tuşba"] },
  { il: "Yozgat", ilceleri: ["Merkez"] },
  { il: "Zonguldak", ilceleri: ["Merkez", "Ereğli"] },
  { il: "Aksaray", ilceleri: ["Merkez"] },
  { il: "Bayburt", ilceleri: ["Merkez"] },
  { il: "Karaman", ilceleri: ["Merkez"] },
  { il: "Kırıkkale", ilceleri: ["Merkez"] },
  { il: "Batman", ilceleri: ["Merkez"] },
  { il: "Şırnak", ilceleri: ["Merkez", "Cizre"] },
  { il: "Bartın", ilceleri: ["Merkez"] },
  { il: "Ardahan", ilceleri: ["Merkez"] },
  { il: "Iğdır", ilceleri: ["Merkez"] },
  { il: "Yalova", ilceleri: ["Merkez", "Altınova"] },
  { il: "Karabük", ilceleri: ["Merkez", "Safranbolu"] },
  { il: "Kilis", ilceleri: ["Merkez"] },
  { il: "Osmaniye", ilceleri: ["Merkez", "Kadirli"] },
  { il: "Düzce", ilceleri: ["Merkez"] }
];

interface Listing {
  id: number;
  title: string;
  category: string;
  amountKg: string;
  condition: string;
  price: string;
  city: string;
  district: string;
  hasCertificate: boolean;
  status: "Aktif" | "Pasif";
  date: string;
  images: string[];
}

export default function IlanVer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Yüklenen görseller
  const [images, setImages] = useState<string[]>([]);

  // Form State'i
  const [formData, setFormData] = useState({
    title: "",
    category: "Metal",
    amountKg: "",
    condition: "Stok Fazlası (Sıfır)",
    price: "",
    city: "Kocaeli",
    district: "Gebze OSB",
    hasCertificate: false,
    description: "",
  });

  // Varsayılan İlanlar
  const [listings, setListings] = useState<Listing[]>([
    {
      id: 1,
      title: "10mm S235JR Levha Sac (Stok Fazlası)",
      category: "Metal",
      amountKg: "12.500 kg",
      condition: "Stok Fazlası (Sıfır)",
      price: "₺ 24.500 / Ton",
      city: "Kocaeli",
      district: "Gebze OSB",
      hasCertificate: true,
      status: "Aktif",
      date: "02 Ağustos 2026",
      images: [
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: 2,
      title: "Granül PP Plastik Çapak (Geri Dönüşüm)",
      category: "Plastik",
      amountKg: "4.800 kg",
      condition: "İmalat Artığı / Fire",
      price: "₺ 14.500 / Ton",
      city: "İzmir",
      district: "Aliağa OSB",
      hasCertificate: false,
      status: "Aktif",
      date: "01 Ağustos 2026",
      images: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
      ],
    },
  ]);

  // Şehir Değişimi
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    const cityObj = cityAndDistrictData.find((item) => item.il === selectedCity);
    const firstDistrict = cityObj && cityObj.ilceleri.length > 0 ? cityObj.ilceleri[0] : "";

    setFormData({
      ...formData,
      city: selectedCity,
      district: firstDistrict,
    });
  };

  // Fotoğraf Yükleme
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Fotoğraf Silme
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Input Değişimi
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // İlan Kaydet / Güncelle
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.amountKg || !formData.price || !formData.city || !formData.district) {
      alert("Lütfen İlan Başlığı, Kilosu, Fiyatı, Şehir ve İlçe alanlarını doldurun.");
      return;
    }

    const finalImages =
      images.length > 0
        ? images
        : [
            "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
          ];

    if (editingId !== null) {
      // GÜNCELLEME
      setListings((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title,
                category: formData.category,
                amountKg: formData.amountKg,
                condition: formData.condition,
                price: formData.price,
                city: formData.city,
                district: formData.district,
                hasCertificate: formData.hasCertificate,
                images: finalImages,
              }
            : item
        )
      );
      setEditingId(null);
      alert("İlanınız başarıyla güncellendi! ✨");
    } else {
      // EKLEME
      const newListing: Listing = {
        id: Date.now(),
        title: formData.title,
        category: formData.category,
        amountKg: formData.amountKg,
        condition: formData.condition,
        price: formData.price,
        city: formData.city,
        district: formData.district,
        hasCertificate: formData.hasCertificate,
        status: "Aktif",
        date: "Bugün",
        images: finalImages,
      };

      setListings([newListing, ...listings]);
      alert("Yeni ilanınız başarıyla yayınlandı! 🚀");
    }

    // Formu Sıfırla
    setFormData({
      title: "",
      category: "Metal",
      amountKg: "",
      condition: "Stok Fazlası (Sıfır)",
      price: "",
      city: "Kocaeli",
      district: "Gebze OSB",
      hasCertificate: false,
      description: "",
    });
    setImages([]);
  };

  // Düzenle
  const handleEdit = (item: Listing) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      amountKg: item.amountKg,
      condition: item.condition,
      price: item.price,
      city: item.city,
      district: item.district,
      hasCertificate: item.hasCertificate,
      description: "",
    });
    setImages(item.images || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sil
  const handleDelete = (id: number) => {
    if (confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      setListings((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // İptal
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Metal",
      amountKg: "",
      condition: "Stok Fazlası (Sıfır)",
      price: "",
      city: "Kocaeli",
      district: "Gebze OSB",
      hasCertificate: false,
      description: "",
    });
    setImages([]);
  };

  const selectedCityObj = cityAndDistrictData.find((item) => item.il === formData.city);
  const districtList = selectedCityObj ? selectedCityObj.ilceleri : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      {/* SOL MENÜ */}
      <Sidebar />

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Kendi ilanlarında ara..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔 <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </button>

            <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" 
                      alt="Profil" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">Ahmet Yılmaz</p>
                    <p className="text-[10px] text-slate-400">Döngü Metal A.Ş.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/giris-yap" 
                    className="font-bold text-slate-700 hover:text-emerald-600 transition px-3 py-2 rounded-xl hover:bg-slate-100"
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/kayit-ol" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ANA İÇERİK */}
        <main className="p-6 space-y-8 overflow-y-auto">
          
          {/* İLAN FORMU */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {editingId !== null ? "✏️ İlanı Düzenle" : "➕ Yeni Malzeme İlanı Ver"}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kilosu, Kullanım Durumu, Fiyatı ve Şehir/İlçe detaylarını eksiksiz doldurun.
                </p>
              </div>
              {editingId !== null && (
                <button
                  onClick={handleCancelEdit}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl"
                >
                  ✕ İptal Et
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* FOTOĞRAF YÜKLEME */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Malzeme Fotoğrafları</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer transition text-center p-2 group">
                    <span className="text-2xl group-hover:scale-110 transition">📷</span>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-600 mt-1">Görsel Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {images.map((imgSrc, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={imgSrc} alt="Görsel" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FORM ALANLARI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* İlan Başlığı */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block font-bold text-slate-700">İlan Başlığı *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Örn: 10mm S235JR Levha Sac Parçaları"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium transition"
                  />
                </div>

                {/* KİLOSU / MİKTARI */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">⚖️ Kilosu / Miktarı *</label>
                  <input
                    type="text"
                    name="amountKg"
                    required
                    placeholder="Örn: 12.500 kg veya 15 Ton"
                    value={formData.amountKg}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium transition"
                  />
                </div>

                {/* KULLANIM DURUMU */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">🏷️ Kullanım Durumu *</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium cursor-pointer"
                  >
                    <option value="Stok Fazlası (Sıfır)">Stok Fazlası (Sıfır)</option>
                    <option value="İmalat Artığı / Fire">İmalat Artığı / Fire</option>
                    <option value="İkinci El / Deforme">İkinci El / Deforme</option>
                    <option value="Geri Dönüşüm / Hurda">Geri Dönüşüm / Hurda</option>
                  </select>
                </div>

                {/* FİYATI */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">💰 Fiyatı (TL) *</label>
                  <input
                    type="text"
                    name="price"
                    required
                    placeholder="Örn: ₺ 24.500 / Ton veya ₺ 15 / kg"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium transition"
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Malzeme Kategorisi</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium cursor-pointer"
                  >
                    <option value="Metal">Demir - Çelik / Metal</option>
                    <option value="Plastik">Plastik & Polimer</option>
                    <option value="Alüminyum">Alüminyum</option>
                    <option value="Kağıt">Kağıt & Karton</option>
                    <option value="Ahşap">Ahşap & Palet</option>
                  </select>
                </div>

                {/* KONUM: ŞEHİR (81 İL) */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">📍 Şehir (81 İl) *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleCityChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium cursor-pointer"
                  >
                    {cityAndDistrictData.map((item) => (
                      <option key={item.il} value={item.il}>
                        {item.il}
                      </option>
                    ))}
                  </select>
                </div>

                {/* KONUM: İLÇE */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">📍 İlçe *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium cursor-pointer"
                  >
                    {districtList.map((ilce) => (
                      <option key={ilce} value={ilce}>
                        {ilce}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sertifika Durumu */}
                <div className="space-y-1 flex items-center pt-2 md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="hasCertificate"
                      checked={formData.hasCertificate}
                      onChange={handleChange}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <span className="font-bold text-slate-700">3.1 MTR Analiz Sertifikası Var mı?</span>
                  </label>
                </div>

              </div>

              {/* AÇIKLAMA */}
              <div className="space-y-1 pt-2">
                <label className="block font-bold text-slate-700">Açıklama (İsteğe Bağlı)</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Paketleme biçimi, nakliye durumu vb. detaylar..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 p-3 rounded-xl outline-none font-medium transition resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition"
                >
                  {editingId !== null ? "İlanı Güncelle ✓" : "İlanı Yayınla 🚀"}
                </button>
              </div>
            </form>
          </div>

          {/* İLANLAR LİSTESİ TABLOSU */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-sm text-slate-900">
                Yayındaki İlanlarım ({listings.length})
              </h2>
              <span className="text-xs text-slate-400">Anlık Güncellenir</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium pb-3">
                    <th className="pb-3">Görsel</th>
                    <th className="pb-3">İlan Başlığı</th>
                    <th className="pb-3">⚖️ Kilosu</th>
                    <th className="pb-3">🏷️ Kullanım Durumu</th>
                    <th className="pb-3">💰 Fiyatı</th>
                    <th className="pb-3">📍 Konumu</th>
                    <th className="pb-3">Sertifika</th>
                    <th className="pb-3 text-right">Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {listings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 font-bold text-slate-900">{item.title}</td>
                      <td className="py-3 font-bold text-slate-800 bg-slate-50/80 px-2 rounded-lg">{item.amountKg}</td>
                      <td className="py-3">
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold">
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-3 font-black text-emerald-600">{item.price}</td>
                      <td className="py-3 text-slate-700">📍 {item.city} / {item.district}</td>
                      <td className="py-3">
                        {item.hasCertificate ? (
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">✓ Var</span>
                        ) : (
                          <span className="text-slate-400">Yok</span>
                        )}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition text-[11px]"
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-xl transition text-[11px]"
                        >
                          🗑️ Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {listings.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Henüz aktif bir ilanınız bulunmuyor.
              </div>
            )}
          </div>

        </main>
      </div>

    </div>
  );
}