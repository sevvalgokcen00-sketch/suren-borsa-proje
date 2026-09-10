"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SteelTickerBar from "../../components/SteelTickerBar";

// %100 DEMİR-ÇELİK VE METAL SEKTÖRÜNE ÖZEL GENİŞLETİLMİŞ BORSA VERİSİ
const marketData = [
  {
    id: "DEM-01",
    code: "DKP-HRD",
    name: "Temiz Demir-Çelik Kırpıntısı (DKP - Ekstra)",
    category: "Temiz Kırpıntı",
    lastPrice: "11,80",
    high: "12,10",
    low: "11,40",
    change: "+0,10",
    changePercent: "+0,85%",
    isUp: true,
    volume: "14,2M kg",
    txCount: 142,
  },
  {
    id: "DEM-02",
    code: "PRF-ART",
    name: "Profil ve Levha İmalat Artığı (ST37/ST44)",
    category: "Profil & Boru",
    lastPrice: "13,60",
    high: "13,90",
    low: "13,20",
    change: "+0,16",
    changePercent: "+1,20%",
    isUp: true,
    volume: "8,5M kg",
    txCount: 98,
  },
  {
    id: "DEM-03",
    code: "TLS-DMR",
    name: "Demir-Çelik Talaşı (Temiz / Paslı)",
    category: "Talaş & Toz",
    lastPrice: "8,90",
    high: "9,10",
    low: "8,70",
    change: "-0,04",
    changePercent: "-0,45%",
    isUp: false,
    volume: "11,4M kg",
    txCount: 76,
  },
  {
    id: "DEM-04",
    code: "KRN-HRD",
    name: "Karışık / Kontamine Demir Üretim Artığı",
    category: "Üretim Artığı",
    lastPrice: "8,30",
    high: "8,50",
    low: "8,10",
    change: "-0,07",
    changePercent: "-0,80%",
    isUp: false,
    volume: "5,1M kg",
    txCount: 41,
  },
  {
    id: "DEM-05",
    code: "S235-SAC",
    name: "S235JR / S275JR Levha Sac Kesim Artığı",
    category: "Sac & Levha",
    lastPrice: "24,50",
    high: "25,10",
    low: "24,00",
    change: "+0,45",
    changePercent: "+1,85%",
    isUp: true,
    volume: "19,8M kg",
    txCount: 164,
  },
  {
    id: "DEM-06",
    code: "HMB-INL",
    name: "HME / IPE / HEB Ağır Yapı Profilleri Fire",
    category: "Profil & Boru",
    lastPrice: "18,20",
    high: "18,60",
    low: "17,90",
    change: "+0,20",
    changePercent: "+1,10%",
    isUp: true,
    volume: "7,3M kg",
    txCount: 52,
  },
  {
    id: "DEM-07",
    code: "DMR-NVR",
    name: "İnşaat Demir Ucu ve NPI/NPU Kesim Fireleri",
    category: "Temiz Kırpıntı",
    lastPrice: "14,10",
    high: "14,40",
    low: "13,80",
    change: "-0,15",
    changePercent: "-1,05%",
    isUp: false,
    volume: "26,1M kg",
    txCount: 210,
  },
  {
    id: "DEM-08",
    code: "PAS-304",
    name: "Paslanmaz Çelik Kırpıntı (304 / 316 Kalite)",
    category: "Sac & Levha",
    lastPrice: "42,80",
    high: "43,50",
    low: "41,90",
    change: "+0,80",
    changePercent: "+1,90%",
    isUp: true,
    volume: "4,9M kg",
    txCount: 88,
  },
];

export default function AnaSayfa() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    window.location.reload();
  };

  const filteredData = marketData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col justify-between">
      {/* 1. HEADER & KAYAN BORSA ŞERİDİ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          {/* LOGO - Artık tıklandığında en dıştaki app/page.tsx sayfasına (/) gider */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 flex items-center justify-center text-[#1E314A] text-xl group-hover:scale-105 transition">
              ♻️
            </div>
            <span className="text-xl font-black tracking-tight text-[#1E314A]">
              DöngüBorsa
            </span>
          </Link>

          <div className="flex-1 max-w-2xl flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-1 focus-within:border-[#1E314A] transition">
            <input
              type="text"
              placeholder="S235JR, DKP Kırpıntı, ST37 profil, talaş veya firma ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-1.5 text-xs text-slate-800 bg-transparent focus:outline-none font-medium"
            />
            <Link
              href={`/malzemeler?ara=${encodeURIComponent(searchQuery)}`}
              className="bg-white hover:bg-slate-100 text-[#1E314A] px-4 py-2 rounded-xl transition text-xs font-bold shrink-0"
            >
              🔍 Ara
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/gosterge-paneli"
                    className="flex items-center gap-2 group hover:opacity-80 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1E314A]/10 text-[#1E314A] flex items-center justify-center font-bold text-xs border border-[#1E314A]/20">
                      👤
                    </div>
                    <span className="font-bold text-slate-900">
                      Merhaba,{" "}
                      <span className="text-[#1E314A] group-hover:underline">
                        {userName}
                      </span>
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-600 font-bold ml-2 transition"
                    title="Çıkış Yap"
                  >
                    🚪 Çıkış
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/giris-yap"
                    className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit-ol"
                    className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-2.5 text-xs font-semibold overflow-x-auto">
            <div className="flex items-center gap-5 shrink-0">
              <Link
                href="/anasayfa"
                className="text-[#1E314A] hover:text-[#1E314A] transition flex items-center gap-1.5 font-bold"
              >
                <span>🌐</span> Ana Sayfa
              </Link>
              <Link
                href="/gosterge-paneli"
                className="text-slate-700 hover:text-[#1E314A] transition flex items-center gap-1.5 font-bold"
              >
                <span>🏠</span> Gösterge Paneli
              </Link>
              <Link
                href="/firma-analizi"
                className="text-slate-700 hover:text-[#1E314A] transition flex items-center gap-1.5 font-bold"
              >
                <span>📊</span> Firma Analizi
              </Link>
              <Link
                href="/ilanlar-paneli"
                className="text-slate-700 hover:text-[#1E314A] transition flex items-center gap-1.5 font-bold"
              >
                <span>📄</span> İlanlar
              </Link>
              <Link
                href="/malzemeler"
                className="text-slate-700 hover:text-[#1E314A] transition flex items-center gap-1.5 font-bold"
              >
                <span>📦</span> Malzemeler
              </Link>
              <Link
                href="/teklifler"
                className="text-slate-700 hover:text-[#1E314A] transition flex items-center gap-1.5 font-bold"
              >
                <span>🏷️</span> Teklifler
              </Link>
              <Link
                href="/raporlar"
                className="text-slate-700 hover:text-[#1E314A] transition flex items-center gap-1.5 font-bold"
              >
                <span>📈</span> Raporlar
              </Link>
            </div>

            <Link
              href="/ilan-ver"
              className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ml-4 shadow-sm"
            >
              <span>+</span> İlan Ver
            </Link>
          </div>
        </div>

        <SteelTickerBar />
      </header>

      {/* 2. COMPACT HERO SECTION */}
      <section className="relative text-white py-16 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/metalyigini.jpg')` }}
        ></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <span className="bg-[#1E314A]/90 text-white border border-[#1E314A] text-[11px] font-bold px-3.5 py-1 rounded-full inline-block backdrop-blur-md">
              🦾 B2B Endüstriyel Demir-Çelik & Metal Pazaryeri
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-md text-white">
              Atığı Değere, <br />
              <span className="text-white">
                Kaynağı Döngüye Dönüştürün.
              </span>
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed drop-shadow">
              <strong className="text-white">
                Türkiye&apos;nin Sanayi Atık ve Geri Dönüşüm Borsa Tahtası.
            </strong>{" "}
              Demir-Çelik fabrikalarından arta kalan henüz işlenmemiş ham üretim artığı stokları ve metalleri
              şeffaf medyan endeks fiyatlarıyla anlık pazarlayın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-black shrink-0">
            <Link
              href="/ilanlar-paneli"
              className="bg-white hover:bg-slate-100 text-[#1E314A] px-5 py-3 rounded-xl shadow-lg shadow-black/20 transition"
            >
              Tüm İlanları İncele →
            </Link>
            <Link
              href="/ilan-ver"
              className="bg-white hover:bg-slate-100 text-[#1E314A] px-5 py-3 rounded-xl shadow-lg shadow-black/20 transition"
            >
              + İlan Ver
            </Link>
            <Link
              href="/iletisim"
              className="bg-white hover:bg-slate-100 text-[#1E314A] px-5 py-3 rounded-xl shadow-lg shadow-black/20 transition flex items-center gap-1.5"
            >
              <span>💬</span>
              <span>İletişime Geçin</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. DEMİR-ÇELİK BORSA İŞLEM TAHTASI (ORTALANMIŞ) */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>📈</span> Canlı Demir-Çelik ve Metal Piyasası
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider select-none">
                  <th className="py-3.5 px-4">İsim / Sembol</th>
                  <th className="py-3.5 px-4 text-right">Son (Medyan)</th>
                  <th className="py-3.5 px-4 text-right">Yüksek</th>
                  <th className="py-3.5 px-4 text-right">Düşük</th>
                  <th className="py-3.5 px-4 text-right">Fark</th>
                  <th className="py-3.5 px-4 text-right">Fark %</th>
                  <th className="py-3.5 px-4 text-right">Hacim</th>
                  <th className="py-3.5 px-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition duration-150 group cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#1E314A] shrink-0"></span>
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-[#1E314A] transition block text-sm">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.code} • {item.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm font-mono">
                      {item.lastPrice}{" "}
                      <span className="text-[10px] font-normal text-slate-400">
                        TL
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {item.high}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {item.low}
                    </td>

                    <td
                      className={`py-3.5 px-4 text-right font-bold font-mono ${
                        item.isUp ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {item.change}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block font-bold font-mono text-[11px] px-1.5 py-0.5 rounded ${
                          item.isUp
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {item.changePercent}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {item.volume}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href="/ilanlar-paneli"
                        className="bg-slate-100 hover:bg-[#1E314A] hover:text-white text-slate-700 font-bold px-3 py-1.5 rounded-lg transition text-[11px] inline-block"
                      >
                        İlanlar ({item.txCount})
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              📌 Fiyatlar tamamlanmış borsa işlemlerinin medyanı alınarak 15 dakikada bir güncellenir.
            </span>
            <Link
              href="/ilanlar-paneli"
              className="font-bold text-[#1E314A] hover:underline"
            >
              Tüm Piyasayı ve İlanları Gör →
            </Link>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 text-xs py-10 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            {/* FOOTER LOGO - Tıklandığında en dıştaki app/page.tsx sayfasına (/) gider */}
            <Link href="/" className="flex items-center gap-2 group inline-flex">
              <div className="w-8 h-8 flex items-center justify-center text-white text-base">
                ♻️
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Döngü<span className="text-[#729CD4]">Borsa</span>
            </span>
            </Link>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              B2B endüstriyel demir-çelik ve metal geri dönüşüm borsası.
              Atıkları kaynağa dönüştürün.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Yönetim & Paneller</h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li><Link href="/anasayfa" className="hover:text-white transition">🌐 Ana Sayfa</Link></li>
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
              <li><Link href="/iletisim" className="hover:text-white transition">İletişime Geçin</Link></li>
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