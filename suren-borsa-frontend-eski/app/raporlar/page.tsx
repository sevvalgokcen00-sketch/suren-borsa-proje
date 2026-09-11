"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function Raporlar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dateRange, setDateRange] = useState("2026-Q2");

  // Örnek Rapor Geçmişi
  const reportHistory = [
    {
      id: "R-2026-05",
      title: "2026 Mayıs Ayı İşlem ve Hacim Raporu",
      type: "Mali & Ticari",
      date: "01 Haziran 2026",
      fileSize: "2.4 MB",
      format: "PDF",
    },
    {
      id: "R-2026-04",
      title: "2026 Nisan Sürdürülebilirlik & Karbon Ayak İzi Analizi",
      type: "ESG / Çevre",
      date: "01 Mayıs 2026",
      fileSize: "4.1 MB",
      format: "PDF",
    },
    {
      id: "R-2026-03",
      title: "2026 Q1 Detaylı Malzeme Stok ve Hurda Dökümü",
      type: "Stok Analizi",
      date: "01 Nisan 2026",
      fileSize: "1.8 MB",
      format: "XLSX",
    },
    {
      id: "R-2025-12",
      title: "2025 Yıllık Dönüşüm Raporu",
      type: "Yıllık Özet",
      date: "10 Ocak 2026",
      fileSize: "8.5 MB",
      format: "PDF",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      {/* SOL MENÜ (SIDEBAR BİLEŞENİ) */}
      <Sidebar />

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ÜST HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Raporlarda ara..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔 <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
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

        {/* ANA RAPORLAR İÇERİĞİ */}
        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* Başlık ve Filtre */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Raporlar & Analiz Dökümleri</h1>
              <p className="text-xs text-slate-400 mt-0.5">Mali performans, sürdürülebilirlik metrikleri ve stok dökümlerinizi indirin.</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl font-medium outline-none shadow-sm cursor-pointer"
              >
                <option value="2026-Q2">2026 - 2. Çeyrek (Q2)</option>
                <option value="2026-Q1">2026 - 1. Çeyrek (Q1)</option>
                <option value="2025-ALL">2025 Yılı Tamamı</option>
              </select>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5">
                <span>📄</span> Yeni Rapor Oluştur
              </button>
            </div>
          </div>

          {/* 1. ÖZET METRİK KARTLARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Toplam İşlem Hacmi</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">₺</div>
              </div>
              <p className="text-2xl font-black text-slate-900">₺ 18,7M</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %12,4 <span className="text-slate-400 font-normal">geçen çeyreğe göre</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Karbon Tasarrufu</span>
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg font-bold">🌱</div>
              </div>
              <p className="text-2xl font-black text-slate-900">420 Ton CO₂</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %15,8 <span className="text-slate-400 font-normal">ESG verimliliği</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Dönüştürülen Malzeme</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">♻️</div>
              </div>
              <p className="text-2xl font-black text-slate-900">1.250 Ton</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %8,2 <span className="text-slate-400 font-normal">artış</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Tamamlanan İhale/İşlem</span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">🤝</div>
              </div>
              <p className="text-2xl font-black text-slate-900">128 Adet</p>
              <p className="text-[11px] text-slate-400 font-normal">Başarılı eşleşme</p>
            </div>

          </div>

          {/* 2. RAPOR İNDİRME HIZLI AKSİYON KARTLARI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                  📊
                </div>
                <h3 className="font-bold text-sm text-slate-900">Finansal İşlem Özeti</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Faturalandırılan ve tamamlanan tüm B2B ticaretlerin mali ve vergi dökümü.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition">
                  PDF İndir
                </button>
                <button className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-xl text-xs transition">
                  Excel (.xlsx)
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg">
                  🌱
                </div>
                <h3 className="font-bold text-sm text-slate-900">ESG & Karbon Ayak İzi</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fabrikanızın geri dönüşüm katkısı ve AB standartlarında CO₂ tasarruf sertifikası.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition">
                  Sertifika İndir (PDF)
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  📦
                </div>
                <h3 className="font-bold text-sm text-slate-900">Stok & Envanter Raporu</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  İlanı açılmış veya depolarda bekleyen tüm hurda ve stok ham maddelerin listesi.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-xl text-xs transition">
                  Excel (.xlsx) İndir
                </button>
              </div>
            </div>

          </div>

          {/* 3. RAPOR GEÇMİŞİ TABLOSU */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Geçmiş Raporlar ve Arşiv</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium pb-3">
                    <th className="pb-3">Rapor Kodu</th>
                    <th className="pb-3">Rapor Başlığı</th>
                    <th className="pb-3">Kategori</th>
                    <th className="pb-3">Oluşturulma Tarihi</th>
                    <th className="pb-3">Dosya Boyutu</th>
                    <th className="pb-3 text-right">İndir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3.5 font-bold text-slate-500">{item.id}</td>
                      <td className="py-3.5 font-bold text-slate-900">{item.title}</td>
                      <td className="py-3.5"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold">{item.type}</span></td>
                      <td className="py-3.5 text-slate-500">{item.date}</td>
                      <td className="py-3.5 text-slate-500">{item.fileSize}</td>
                      <td className="py-3.5 text-right">
                        <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl text-[11px] transition">
                          ⬇️ {item.format} İndir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}