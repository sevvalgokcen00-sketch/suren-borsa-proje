"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function GostergePaneli() {
  // Giriş durumunu kontrol eden state (Geliştirme aşamasında test etmek için true/false değiştirebilirsin)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const marketTrendData = [
    { month: "Ocak", volume: 18.2 },
    { month: "Şubat", volume: 22.4 },
    { month: "Mart", volume: 29.1 },
    { month: "Nisan", volume: 34.8 },
    { month: "Mayıs", volume: 42.5 },
    { month: "Haziran", volume: 48.0 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      {/* SOL MENÜ (SIDEBAR) */}
      <Sidebar />

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ÜST HEADER (SAĞ ÜSTTE GİRİŞ/KAYIT VEYA PROFİL ALANI) */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* ARAMA ÇUBUĞU */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Firma, malzeme veya ilan ara..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          {/* SAĞ AKSİYON & GİRİŞ/KAYIT BÖLÜMÜ */}
          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔 <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">5</span>
            </button>
            <button className="text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              💬
            </button>
            
            {/* DİNAMİK GİRİŞ / KAYIT VEYA KULLANICI PROFİLİ */}
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
        <main className="p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Gösterge Paneli</h1>
              <p className="text-xs text-slate-400 mt-0.5">Pazar özeti ve genel sistem performansınız.</p>
            </div>
            <Link href="/ilan-ver" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5">
              <span>+</span> Yeni İlan Oluştur
            </Link>
          </div>

          {/* İSTATİSTİK KARTLARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Toplam İşlem Hacmi</span>
              <p className="text-2xl font-black text-slate-900">₺ 48,0M</p>
              <p className="text-[11px] text-emerald-600 font-bold">↗ %14,2 artış</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Geri Dönüştürülen</span>
              <p className="text-2xl font-black text-slate-900">18.420 ton</p>
              <p className="text-[11px] text-emerald-600 font-bold">↗ %9,8 artış</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Aktif İlanlarınız</span>
              <p className="text-2xl font-black text-slate-900">12 İlan</p>
              <p className="text-[11px] text-slate-400">3 tanesi öne çıkarıldı</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Gelen Teklifler</span>
              <p className="text-2xl font-black text-slate-900">8 Yanıtsız</p>
              <p className="text-[11px] text-amber-600 font-bold">Yanıt bekleniyor ⏳</p>
            </div>
          </div>

          {/* BORSA TREND GRAFİĞİ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Piyasa İşlem Hacmi Trendi (Milyon ₺)</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}