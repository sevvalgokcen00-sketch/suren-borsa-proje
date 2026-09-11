"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import baseData from "../data/islemler.json";

const materialsData = Array.from({ length: 391 }, (_, i) => {
  const original = (baseData as any[])[i % baseData.length];
  const idNumber = String(i + 1).padStart(5, '0');
  return { 
    ...original, 
    id: `T-${idNumber}`, 
    company: `Firma ${1000 + (i % 25)} San. Tic. Ltd. Şti.` 
  };
});

export default function GostergePaneli() {
  const materials = materialsData;
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

  const [chartPeriod, setChartPeriod] = useState("30 Gün");
  const chartData = {
    "7 Gün": [70, 65, 75, 80, 78, 85, 90],
    "30 Gün": [40, 50, 45, 60, 55, 65, 50, 70, 75, 65, 85, 80, 95, 90, 100],
    "3 Ay": [85, 75, 65, 55, 60, 70, 65, 80, 75, 85, 90, 95],
    "1 Yıl": [30, 35, 40, 38, 45, 55, 50, 65, 60, 75, 85, 100]
  };

  const analytics = useMemo(() => {
    let totalVolume = 0;
    let totalValue = 0;
    
    materials.forEach((m: any) => {
      const amount = parseFloat(String(m.amount).replace(/[^0-9.]/g, "")) || 0;
      const price = parseFloat(String(m.price).replace(/[^0-9.]/g, "")) || 0;
      totalVolume += amount;
      totalValue += (amount * price);
    });

    return {
      totalVolumeTon: (totalVolume / 1000).toFixed(1),
      totalTransactionVolume: (totalValue / 1000000).toFixed(2),
      avgPrice: (totalValue / totalVolume).toFixed(2),
      conversionRate: "72.4%",
      avgSalesTime: "4.2 Gün",
      recycledMaterial: (totalVolume / 1000 * 0.85).toFixed(1)
    };
  }, [materials]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER (Giriş Yap ve Kayıt Ol Butonları Eklendi) */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Demir-Çelik Borsa Performans ve Analiz Paneli</h1>
            <p className="text-[11px] text-slate-400">Demir-çelik ikincil hammadde ve üretim fazlası stoklarının yıllık verimlilik göstergeleri</p>
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
        </header>

        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* ANALİZ KARTLARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Toplam Demir-Çelik İlanı", val: analytics.totalVolumeTon, unit: "Ton", desc: "✓ Yıllık Kümülatif Veri" },
              { title: "Toplam İşlem Hacmi", val: analytics.totalTransactionVolume, unit: "Milyon TL", desc: "📈 Demir-Çelik Piyasası Ciro" },
              { title: "Ortalama Demir Fiyatı", val: analytics.avgPrice, unit: "TL/kg", desc: "⚖️ Sektörel Piyasa Medyanı" },
              { title: "İlan Dönüşüm Oranı", val: analytics.conversionRate, unit: "", desc: "Tekliften satışa dönen oran" },
              { title: "Ortalama Satış Süresi", val: analytics.avgSalesTime, unit: "", desc: "İlan yayın / Eşleşme hızı" },
              { title: "Ekonomiye Kazandırılan", val: analytics.recycledMaterial, unit: "Ton", desc: "♻️ Net Demir-Çelik Kazanımı" },
            ].map((card, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#1E314A]/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <div className="text-2xl font-black text-slate-900">{card.val} <span className="text-sm font-bold text-slate-400">{card.unit}</span></div>
                <p style={{ color: "#1E314A" }} className="font-bold text-[11px] pt-1">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* BORSA EKRANI VE FIRSATLAR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SOL SÜTUN */}
            <div className="flex flex-col gap-6 lg:col-span-7">
              
              {/* 1. PİYASA FİYAT ENDEKSİ */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-sm text-slate-900">Piyasa Fiyat Endeksi</h3>
                  <span className="text-[10px] font-bold text-[#1E314A] bg-[#1E314A]/10 px-2.5 py-1 rounded-md">Canlı Veri</span>
                </div>
                
                <div className="h-24 w-full bg-slate-50 rounded-xl border border-slate-100 flex items-end px-2 pb-2 space-x-1 relative overflow-hidden">
                  <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-400">₺/Ton</div>
                  {chartData[chartPeriod as keyof typeof chartData].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-[#1E314A]/80 to-[#1E314A]/30 rounded-t-sm transition-all duration-500 hover:opacity-75 cursor-pointer" 
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>

                <div className="flex justify-between text-[11px] font-bold text-slate-500 pt-1 px-1">
                  {["7 Gün", "30 Gün", "3 Ay", "1 Yıl"].map((period) => (
                    <button 
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`transition px-3 py-1 rounded-lg ${
                        chartPeriod === period 
                          ? "text-white bg-[#1E314A] shadow-sm" 
                          : "hover:text-[#1E314A]"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. FIRSAT ÜRÜNLERİ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/60 rounded-full blur-3xl -mr-8 -mt-8"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 flex items-center gap-1">
                        🔥 Fırsat
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">10mm S235JR Levha Sac</h4>
                    <div className="mt-2.5 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-900">₺13,58<span className="text-xs text-slate-500 font-bold">/kg</span></span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 mt-1">
                      Piyasa ortalaması: <span className="line-through">₺14,20/kg</span>
                    </p>
                    <p className="text-xs font-bold text-red-600 mt-1.5">
                      %4,4 piyasanın altında
                    </p>
                  </div>
                  <div className="mt-5 relative z-10">
                    <Link href="/ilanlar-paneli" className="block text-center text-[11px] font-bold text-white bg-[#1E314A] hover:bg-[#152336] py-2.5 rounded-xl transition shadow-sm">
                      İlanı İncele →
                    </Link>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/60 rounded-full blur-3xl -mr-8 -mt-8"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 flex items-center gap-1">
                        🔥 Fırsat
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">Granül PP Plastik Çapak</h4>
                    <div className="mt-2.5 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-900">₺11,40<span className="text-xs text-slate-500 font-bold">/kg</span></span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 mt-1">
                      Piyasa ortalaması: <span className="line-through">₺12,50/kg</span>
                    </p>
                    <p className="text-xs font-bold text-red-600 mt-1.5">
                      %8,8 piyasanın altında
                    </p>
                  </div>
                  <div className="mt-5 relative z-10">
                    <Link href="/ilanlar-paneli" className="block text-center text-[11px] font-bold text-white bg-[#1E314A] hover:bg-[#152336] py-2.5 rounded-xl transition shadow-sm">
                      İlanı İncele →
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            {/* SAĞ SÜTUN */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              
              {/* 1. PİYASA ÖZETİ */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-sm text-slate-900">Piyasa Özeti</h3>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <span className="font-black text-sm" style={{ color: "#1E314A" }}>Pozitif Seyir</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Demir-çelik piyasasında son 24 saatte ortalama fiyatlar <span className="font-bold" style={{ color: "#1E314A" }}>%3,8 yükseldi</span>. DKP ikincil hammadde ve profil ürünlerinde sanayi kaynaklı güçlü bir talep artışı gözlemleniyor.
                  </p>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 text-[10px] font-bold">
                    <div className="flex flex-col items-center"><span className="text-slate-400">Talep</span><span className="text-xs" style={{ color: "#1E314A" }}>↑ %12</span></div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="flex flex-col items-center"><span className="text-slate-400">Fiyat</span><span className="text-xs" style={{ color: "#1E314A" }}>↑ %3,8</span></div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="flex flex-col items-center"><span className="text-slate-400">İşlem</span><span className="text-xs" style={{ color: "#1E314A" }}>↑ %8,4</span></div>
                  </div>
                </div>
              </div>

              {/* 2. EN ÇOK YÜKSELENLER VE DÜŞENLER */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full blur-xl -mr-4 -mt-4"></div>
                  <h4 className="text-[10px] font-bold text-emerald-600 border-b border-emerald-50 pb-2">EN ÇOK YÜKSELENLER</h4>
                  <div className="space-y-2.5 text-xs font-bold relative z-10">
                    <div className="flex justify-between items-center"><span className="text-slate-700">DKP</span><div className="text-right"><span className="text-[10px] text-slate-400 mr-1.5">₺14,26/kg</span><span className="text-emerald-600">+6.4%</span></div></div>
                    <div className="flex justify-between items-center"><span className="text-slate-700">Profil</span><div className="text-right"><span className="text-[10px] text-slate-400 mr-1.5">₺18,20/kg</span><span className="text-emerald-600">+4.8%</span></div></div>
                    <div className="flex justify-between items-center"><span className="text-slate-700">Levha</span><div className="text-right"><span className="text-[10px] text-slate-400 mr-1.5">₺13,58/kg</span><span className="text-emerald-600">+2.1%</span></div></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-full blur-xl -mr-4 -mt-4"></div>
                  <h4 className="text-[10px] font-bold text-red-500 border-b border-red-50 pb-2">EN ÇOK DÜŞENLER</h4>
                  <div className="space-y-2.5 text-xs font-bold relative z-10">
                    <div className="flex justify-between items-center"><span className="text-slate-700">Talaş</span><div className="text-right"><span className="text-[10px] text-slate-400 mr-1.5">₺8,90/kg</span><span className="text-red-500">-3.7%</span></div></div>
                    <div className="flex justify-between items-center"><span className="text-slate-700">Karışık</span><div className="text-right"><span className="text-[10px] text-slate-400 mr-1.5">₺7,45/kg</span><span className="text-red-500">-2.1%</span></div></div>
                    <div className="flex justify-between items-center"><span className="text-slate-700">Ekstra</span><div className="text-right"><span className="text-[10px] text-slate-400 mr-1.5">₺12,07/kg</span><span className="text-red-500">-1.8%</span></div></div>
                  </div>
                </div>
              </div>

              {/* 3. ARZ / TALEP DENGESİ */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Arz / Talep & İşlem Hacmi</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-4 flex flex-col justify-center">
                    <div>
                      <div className="flex justify-between mb-1 text-[11px] font-bold">
                        <span className="text-slate-600">Piyasa Arzı</span>
                        <span className="text-[#1E314A]">%68</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1E314A] rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-[11px] font-bold">
                        <span className="text-slate-600">Piyasa Talebi</span>
                        <span className="text-amber-600">%49</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{width: '49%'}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l border-slate-100 pl-4 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">24s İşlem Hacmi</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-lg font-black text-slate-900">₺842.500</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      ↑ %12,4
                    </span>
                    
                    <div className="flex items-end gap-[1px] mt-2 h-6 opacity-80">
                      {[30, 40, 25, 50, 45, 60, 80, 65, 90, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-emerald-500 rounded-t-[1px]" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}