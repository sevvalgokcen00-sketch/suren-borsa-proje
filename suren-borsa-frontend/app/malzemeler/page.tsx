"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function Malzemeler() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hepsi");

  // Örnek Malzeme Verileri
  const materials = [
    {
      id: 1,
      title: "10mm S235JR Levha Sac",
      category: "Metal",
      company: "Döngü Metal A.Ş.",
      amount: "12.500 kg",
      price: "₺ 24.500 / Ton",
      location: "Kocaeli, Gebze",
      status: "Stok Fazlası (Sıfır)",
      hasCertificate: true,
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 2,
      title: "Granül PP Plastik Çapak",
      category: "Plastik",
      company: "Yeşil Polimer San. Ltd.",
      amount: "4.800 kg",
      price: "₺ 14.500 / Ton",
      location: "İzmir, Aliağa",
      status: "Lazer / Giyotin İmalat Artığı",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 3,
      title: "Alüminyum 6063 Profil Fire",
      category: "Alüminyum",
      company: "AluTek Alüminyum A.Ş.",
      amount: "3.200 kg",
      price: "₺ 56.000 / Ton",
      location: "Bursa, Gemlik",
      status: "İkinci El / Deforme",
      hasCertificate: true,
      image: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 4,
      title: "Balya Presli Karton Ambalaj",
      category: "Kağıt",
      company: "EcoKağıt Geri Dön. A.Ş.",
      amount: "9.100 kg",
      price: "₺ 3.900 / Ton",
      location: "Ankara, Sincan",
      status: "Geri Dönüşüm / Hurda",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 5,
      title: "Euro Palet 80x120 Ahmşap",
      category: "Ahşap",
      company: "Saha Lojistik Ltd.",
      amount: "650 adet",
      price: "₺ 95 / Adet",
      location: "Sakarya, Arifiye",
      status: "Stok Fazlası (Sıfır)",
      hasCertificate: false,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80",
    },
  ];

  // Filtrelenmiş Malzeme Listesi
  const filteredMaterials = materials.filter((item) => {
    const matchesCategory = selectedCategory === "Hepsi" || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
              placeholder="Malzeme, firma veya standart ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔 <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">4</span>
            </button>
            <button className="text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              💬
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
          
          {/* Başlık ve Aksiyon */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Malzeme Kataloğu</h1>
              <p className="text-xs text-slate-400 mt-0.5">Fabrikalardan arta kalan tüm endüstriyel ham maddeleri inceleyin ve teklif verin.</p>
            </div>

            <Link href="/ilan-ver" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5">
              <span>+</span> Malzeme İlanı Ekle
            </Link>
          </div>

          {/* KATEGORİ FİLTRE HIZLI BUTONLARI */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            {["Hepsi", "Metal", "Plastik", "Alüminyum", "Kağıt", "Ahşap"].map((cat) => (
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
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">🏢 {item.company}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Miktar:</span>
                      <span className="font-bold text-slate-800">{item.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Durum:</span>
                      <span className="font-medium text-slate-700">{item.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Konum:</span>
                      <span className="font-medium text-slate-700">📍 {item.location}</span>
                    </div>
                  </div>

                  {/* Fiyat ve Teklif Butonu */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Birim Fiyat</span>
                      <span className="text-sm font-black text-slate-900">{item.price}</span>
                    </div>
                    <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-4 py-2 rounded-xl text-xs transition">
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
              <p className="text-xs text-slate-400">Farklı bir arama terimi veya kategori seçmeyi deneyin.</p>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}