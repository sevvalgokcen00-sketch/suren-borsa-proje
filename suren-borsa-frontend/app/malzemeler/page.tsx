"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function Malzemeler() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hepsi");
  const [selectedCity, setSelectedCity] = useState("Hepsi");

  // Excel (Ham_Veri) Sekmesinden Çekilen Gerçek İşlem Listesi
  const materials = [
    {
      id: "T-00001",
      title: "İmalat Artığı Profil Demir",
      category: "Demir-Çelik",
      company: "Firma 1001 San. Tic. Ltd. Şti.",
      amount: "931.9 kg",
      price: "₺ 13.58 / kg",
      location: "Gaziantep",
      status: "Yağlı-Kontamine (Gevşek)",
      hasCertificate: true,
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00002",
      title: "Ekstra Hurda Çelik Levha",
      category: "Demir-Çelik",
      company: "Firma 1001 San. Tic. Ltd. Şti.",
      amount: "1.100.6 kg",
      price: "₺ 12.07 / kg",
      location: "Gaziantep",
      status: "Temiz (Preslenmiş-Balya)",
      hasCertificate: true,
      image: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00003",
      title: "Talaş / Kırpıntı Hurda Metal",
      category: "Demir-Çelik",
      company: "Firma 1002 San. Tic. Ltd. Şti.",
      amount: "176.1 kg",
      price: "₺ 10.46 / kg",
      location: "İstanbul",
      status: "Temiz (Preslenmiş-Balya)",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00004",
      title: "Ekstra Hurda Çelik Parçaları",
      category: "Demir-Çelik",
      company: "Firma 1002 San. Tic. Ltd. Şti.",
      amount: "300.0 kg",
      price: "₺ 11.46 / kg",
      location: "İstanbul",
      status: "Temiz (Preslenmiş-Balya)",
      hasCertificate: true,
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00005",
      title: "DKP Hurda Sac Artıkları",
      category: "Demir-Çelik",
      company: "Firma 1003 San. Tic. Ltd. Şti.",
      amount: "1.349.8 kg",
      price: "₺ 14.26 / kg",
      location: "İstanbul",
      status: "Temiz (Parçalanmış)",
      hasCertificate: true,
      image: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00006",
      title: "Ağır Paslı Talaş & Kırpıntı",
      category: "Demir-Çelik",
      company: "Firma 1003 San. Tic. Ltd. Şti.",
      amount: "1.732.2 kg",
      price: "₺ 8.82 / kg",
      location: "İstanbul",
      status: "Ağır Paslı (Parçalanmış)",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00007",
      title: "Mahalle Karışık Hurda Demir",
      category: "Demir-Çelik",
      company: "Firma 1003 San. Tic. Ltd. Şti.",
      amount: "1.100.1 kg",
      price: "₺ 8.30 / kg",
      location: "İstanbul",
      status: "Yağlı-Kontamine (Gevşek)",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00008",
      title: "Preslenmiş Ekstra Çelik Hurda",
      category: "Demir-Çelik",
      company: "Firma 1003 San. Tic. Ltd. Şti.",
      amount: "406.4 kg",
      price: "₺ 11.72 / kg",
      location: "İstanbul",
      status: "Temiz (Preslenmiş-Balya)",
      hasCertificate: true,
      image: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00009",
      title: "Ağır Paslı Talaş Kırpıntıları",
      category: "Demir-Çelik",
      company: "Firma 1003 San. Tic. Ltd. Şti.",
      amount: "1.765.6 kg",
      price: "₺ 8.51 / kg",
      location: "İstanbul",
      status: "Ağır Paslı (Parçalanmış)",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00010",
      title: "DKP Hurda Sac (Yağlı-Kontamine)",
      category: "Demir-Çelik",
      company: "Firma 1004 San. Tic. Ltd. Şti.",
      amount: "992.4 kg",
      price: "₺ 12.94 / kg",
      location: "İstanbul",
      status: "Yağlı-Kontamine (Preslenmiş-Balya)",
      hasCertificate: true,
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00011",
      title: "Granül PP Plastik Çapak",
      category: "Plastik",
      company: "Yeşil Polimer San. Ltd.",
      amount: "4.800 kg",
      price: "₺ 14.50 / kg",
      location: "İzmir",
      status: "İmalat Artığı / Fire",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00012",
      title: "Alüminyum 6063 Profil Kırpıntı",
      category: "Alüminyum",
      company: "AluTek Alüminyum A.Ş.",
      amount: "3.200 kg",
      price: "₺ 56.00 / kg",
      location: "Bursa",
      status: "İkinci El / Deforme",
      hasCertificate: true,
      image: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00013",
      title: "Balya Presli Karton Ambalaj",
      category: "Kağıt",
      company: "EcoKağıt Geri Dön. A.Ş.",
      amount: "9.100 kg",
      price: "₺ 3.90 / kg",
      location: "Ankara",
      status: "Geri Dönüşüm / Hurda",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: "T-00014",
      title: "Euro Palet 80x120 Ahşap",
      category: "Ahşap",
      company: "Saha Lojistik Ltd.",
      amount: "650 Adet",
      price: "₺ 95.00 / Adet",
      location: "Sakarya",
      status: "Stok Fazlası (Sıfır)",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80",
    }
  ];

  // Filtrelenmiş Malzeme Listesi
  const filteredMaterials = materials.filter((item) => {
    const matchesCategory = selectedCategory === "Hepsi" || item.category === selectedCategory;
    const matchesCity = selectedCity === "Hepsi" || item.location === selectedCity;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      {/* SOL MENÜ (SIDEBAR) */}
      <Sidebar />

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ÜST HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Malzeme adı, İlan ID veya firma ara (Örn: Talaş, T-00001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔 <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">4</span>
            </button>

            {/* DİNAMİK GİRİŞ / KAYIT VEYA PROFİL */}
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

        {/* ANA MALZEMELER İÇERİĞİ */}
        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* Başlık ve İlan Ekle Butonu */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Endüstriyel Malzeme Kataloğu ({filteredMaterials.length})</h1>
              <p className="text-xs text-slate-400 mt-0.5">Fabrikalardan arta kalan demir-çelik, plastik ve metal stoklarını inceleyin.</p>
            </div>

            <Link href="/ilan-ver" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5">
              <span>+</span> Malzeme İlanı Ekle
            </Link>
          </div>

          {/* FİLTRELER (Kategori ve Şehir) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Kategori Filtre Butonları */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              {["Hepsi", "Demir-Çelik", "Plastik", "Alüminyum", "Kağıt", "Ahşap"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Şehir Filtresi Dropdown */}
            <div className="text-xs">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl font-medium outline-none shadow-sm cursor-pointer"
              >
                <option value="Hepsi">📍 Tüm Şehirler</option>
                <option value="Gaziantep">Gaziantep</option>
                <option value="İstanbul">İstanbul</option>
                <option value="İzmir">İzmir</option>
                <option value="Bursa">Bursa</option>
                <option value="Sakarya">Sakarya</option>
                <option value="Ankara">Ankara</option>
              </select>
            </div>

          </div>

          {/* MALZEME KARTLARI GRİDİ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
              >
                {/* Resim Alanı */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md">
                    {item.category}
                  </span>
                  {item.hasCertificate && (
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                      ✓ 3.1 MTR Sertifikalı
                    </span>
                  )}
                </div>

                {/* İçerik */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">{item.id}</span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Aktif İhale</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition line-clamp-1 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">🏢 {item.company}</p>
                  </div>

                  {/* 4 Ana Bilgi Kutusu */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">⚖️ Kilosu / Miktar:</span>
                      <span className="font-bold text-slate-800">{item.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">🏷️ Durumu:</span>
                      <span className="font-medium text-slate-700">{item.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">📍 Konum:</span>
                      <span className="font-medium text-slate-700">{item.location}</span>
                    </div>
                  </div>

                  {/* Fiyat ve Teklif Butonu */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Birim Fiyat</span>
                      <span className="text-sm font-black text-slate-900">{item.price}</span>
                    </div>
                    <button className="bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold px-4 py-2 rounded-xl text-xs transition">
                      Teklif Ver →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
              <span className="text-3xl">🔍</span>
              <h3 className="font-bold text-slate-800 text-sm">Aradığınız kriterde malzeme bulunamadı.</h3>
              <p className="text-xs text-slate-400">Farklı bir arama terimi, şehir veya kategori seçmeyi deneyin.</p>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}