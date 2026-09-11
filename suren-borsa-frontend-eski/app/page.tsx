"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function AnaSayfa() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Sayfa yüklendiğinde oturum durumunu ve giriş yapan kullanıcıyı kontrol et
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserName(user.fullName || user.companyName || "Kullanıcı");
      } catch (e) {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const categories = [
    { name: "Profiller & Borular", count: "1.234 ilan", icon: "🏗️" },
    { name: "Sac & Levha", count: "2.345 ilan", icon: "🔲" },
    { name: "Plastik & Granül", count: "856 ilan", icon: "♻️" },
    { name: "Alüminyum", count: "1.098 ilan", icon: "⚙️" },
    { name: "Kağıt & Karton", count: "987 ilan", icon: "📦" },
    { name: "Ahşap & Palet", count: "654 ilan", icon: "🪵" },
    { name: "Endüstriyel Hurda", count: "543 ilan", icon: "🔩" },
    { name: "Diğer", count: "321 ilan", icon: "💬" },
  ];

  const featuredListings = [
    {
      id: 1,
      title: "10mm S235JR Levha Sac",
      location: "Kocaeli, Gebze",
      price: "₺ 24.500 / Ton",
      date: "Bugün",
      badge: "Öne Çıkan",
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 2,
      title: "Granül PP Plastik Çapak",
      location: "İzmir, Aliağa",
      price: "₺ 14.500 / Ton",
      date: "Bugün",
      badge: "Yeni",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 3,
      title: "Alüminyum 6063 Profil Fire",
      location: "Bursa, Gemlik",
      price: "₺ 56.000 / Ton",
      date: "Dün",
      badge: "Öne Çıkan",
      image: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 4,
      title: "Balya Presli Karton Ambalaj",
      location: "Ankara, Sincan",
      price: "₺ 3.900 / Ton",
      date: "Dün",
      badge: "Yeni",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 5,
      title: "Euro Palet 80x120 Ahşap",
      location: "Sakarya, Arifiye",
      price: "₺ 95 / Adet",
      date: "2 Gün Önce",
      badge: "Fırsat",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col justify-between">
      
      {/* ------------------------------------------------------------------ */}
      {/* 1. HEADER (ÜST BARI) */}
      {/* ------------------------------------------------------------------ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
              ♻️
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Döngü<span className="text-emerald-600">Borsa</span>
            </span>
          </Link>

          {/* ARAMA ÇUBUĞU */}
          <div className="flex-1 max-w-2xl flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-1 focus-within:border-emerald-500 transition">
            <input
              type="text"
              placeholder="Firma, malzeme türü veya ilan adı arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-1.5 text-xs text-slate-800 bg-transparent focus:outline-none font-medium"
            />
            <select className="bg-transparent text-slate-500 text-xs px-3 py-1.5 border-l border-slate-200 cursor-pointer focus:outline-none hidden sm:block">
              <option value="">Tüm Kategoriler</option>
            </select>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition text-xs font-bold">
              🔍 Ara
            </button>
          </div>

          {/* SAĞ AKSİYON & GİRİŞ/KAYIT KONTROLÜ */}
          <div className="flex items-center gap-4 text-xs">
            <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                    👤
                  </div>
                  <span className="font-bold text-slate-900">
                    Merhaba, <span className="text-emerald-600">{userName}</span>
                  </span>
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
        </div>

        {/* ALT NAVİGASYON BARI (SİMGELİ MENÜLER) */}
        <div className="bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-2.5 text-xs font-semibold overflow-x-auto">
            <div className="flex items-center gap-5 shrink-0">
              <Link href="/gosterge-paneli" className="text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 font-bold">
                <span>🏠</span> Gösterge Paneli
              </Link>
              <Link href="/firma-analizi" className="text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 font-bold">
                <span>📊</span> Firma Analizi
              </Link>
              <Link href="/ilanlar-paneli" className="text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 font-bold">
                <span>📄</span> İlanlar
              </Link>
              <Link href="/malzemeler" className="text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 font-bold">
                <span>📦</span> Malzemeler
              </Link>
              <Link href="#" className="text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 font-bold">
                <span>🏷️</span> Teklifler
              </Link>
              <Link href="#" className="text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 font-bold">
                <span>📈</span> Raporlar
              </Link>
            </div>

            <Link 
              href="/ilan-ver" 
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ml-4"
            >
              <span>+</span> İlan Ver
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO KARŞILAMA BÖLÜMÜ */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3.5 py-1.5 rounded-full inline-block">
              🌱 B2B Sürdürülebilir Ekonomi Pazaryeri
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              Fabrikanızın Atık Malzemesini <br />
              <span className="text-emerald-400">Değere Dönüştürün.</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Üretim fazlası ham maddelerinizi, hurda metallerinizi ve geri dönüştürülebilir atıklarınızı güvenli borsa altyapımızda pazarlayın.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs font-bold">
              <Link href="/malzemeler" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition">
                Malzemeleri Keşfet →
              </Link>
              <Link href="/kayit-ol" className="border border-slate-700 hover:bg-slate-800 text-slate-200 px-6 py-3 rounded-xl transition">
                Kurumsal Hesap Aç
              </Link>
            </div>
          </div>

          {/* SAĞ AVANTAJ KARTLARI */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 bg-slate-800/50 p-5 rounded-3xl border border-slate-700/60 backdrop-blur-sm">
            <div className="p-3.5 space-y-1 bg-slate-800/40 rounded-2xl border border-slate-700/40">
              <div className="text-emerald-400 text-xl">🛡️</div>
              <h4 className="font-bold text-xs text-white">Doğrulanmış Firmalar</h4>
              <p className="text-[11px] text-slate-400">Güvenli B2B ticaret ağı</p>
            </div>
            <div className="p-3.5 space-y-1 bg-slate-800/40 rounded-2xl border border-slate-700/40">
              <div className="text-emerald-400 text-xl">📊</div>
              <h4 className="font-bold text-xs text-white">Canlı Piyasa Analizi</h4>
              <p className="text-[11px] text-slate-400">Güncel fiyat takibi</p>
            </div>
            <div className="p-3.5 space-y-1 bg-slate-800/40 rounded-2xl border border-slate-700/40">
              <div className="text-emerald-400 text-xl">📦</div>
              <h4 className="font-bold text-xs text-white">3.1 MTR Sertifikası</h4>
              <p className="text-[11px] text-slate-400">Kalite onaylı malzeme</p>
            </div>
            <div className="p-3.5 space-y-1 bg-slate-800/40 rounded-2xl border border-slate-700/40">
              <div className="text-emerald-400 text-xl">⚡</div>
              <h4 className="font-bold text-xs text-white">Hızlı İlan & Teklif</h4>
              <p className="text-[11px] text-slate-400">Anında alıcı bulma</p>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. KATEGORİ SLIDER & ÖNE ÇIKAN İLANLAR */}
      {/* ------------------------------------------------------------------ */}
      <main className="max-w-7xl mx-auto px-4 -mt-8 relative z-20 pb-16 space-y-10 w-full">
        
        {/* KATEGORİ KARTLARI */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex-1 min-w-[110px] flex flex-col items-center text-center p-3 hover:bg-slate-50 rounded-2xl transition cursor-pointer group border border-transparent hover:border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition border border-slate-200/60">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-slate-900">{cat.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">{cat.count}</span>
            </div>
          ))}
        </div>

        {/* ÖNE ÇIKAN İLANLAR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Öne Çıkan İlanlar</h2>
              <p className="text-xs text-slate-400">Platformda en çok ilgi gören son malzemeler</p>
            </div>
            <Link href="/malzemeler" className="text-xs font-bold text-emerald-600 hover:underline">
              Tümünü Gör →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredListings.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white shadow">
                    {item.badge}
                  </span>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition line-clamp-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">📍 {item.location}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900">{item.price}</p>
                      <p className="text-[10px] text-slate-400">{item.date}</p>
                    </div>
                    <Link href="/malzemeler" className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition">
                      Detay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ------------------------------------------------------------------ */}
      {/* 4. FOOTER (ALT BİLGİ) */}
      {/* ------------------------------------------------------------------ */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-base font-bold">
                ♻️
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Döngü<span className="text-emerald-400">Borsa</span>
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              B2B döngüsel ekonomi pazaryeri platformu. Atıkları kaynağa dönüştürün.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Yönetim & Paneller</h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li><Link href="/gosterge-paneli" className="hover:text-white transition">🏠 Gösterge Paneli</Link></li>
              <li><Link href="/firma-analizi" className="hover:text-white transition">📊 Firma Analizi</Link></li>
              <li><Link href="/ilanlar-paneli" className="hover:text-white transition">📄 İlanlar</Link></li>
              <li><Link href="/malzemeler" className="hover:text-white transition">📦 Malzemeler</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Kurumsal</h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li><Link href="/giris-yap" className="hover:text-white transition">Giriş Yap</Link></li>
              <li><Link href="/kayit-ol" className="hover:text-white transition">Kayıt Ol</Link></li>
              <li><Link href="#" className="hover:text-white transition">Gizlilik Politikası</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">İletişim</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Kocaeli Sanayi Bölgesi / Türkiye<br />
              destek@donguborsa.com
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-[10px] border-t border-slate-800/80 mt-8 pt-6">
          © 2026 DöngüBorsa • Tüm Hakları Saklıdır.
        </div>
      </footer>

    </div>
  );
}