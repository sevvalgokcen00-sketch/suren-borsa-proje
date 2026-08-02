"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from "recharts";

export default function FirmaAnalizi() {
  const [activeAnalysis, setActiveAnalysis] = useState<"malzeme" | "firma">("firma");
  
  // Giriş durumunu kontrol eden state (Geliştirme aşamasında test etmek için true/false değiştirebilirsin)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Alt Bar Grafik Verisi (Firma Bazlı İşlem Hacmi)
  const barData = [
    { name: "Döngü Metal A.Ş.", volume: 74.25 },
    { name: "Yeşil Polimer San.", volume: 47.60 },
    { name: "AluTek Alüminyum", volume: 38.90 },
    { name: "EcoKağıt Geri Dön.", volume: 27.30 },
    { name: "Sürdürülebilir Kimya", volume: 19.80 },
  ];

  // Alt Donut Grafik Verisi & Yüzdelik Detayları
  const pieData = [
    { name: "Demir - Çelik", percentage: "%42,1", amount: "54.040 ton", value: 54040, color: "#2563eb" },
    { name: "Plastik", percentage: "%24,7", amount: "31.720 ton", value: 31720, color: "#10b981" },
    { name: "Alüminyum", percentage: "%15,3", amount: "19.620 ton", value: 19620, color: "#06b6d4" },
    { name: "Kağıt", percentage: "%10,6", amount: "13.590 ton", value: 13590, color: "#f59e0b" },
    { name: "Diğer", percentage: "%7,3", amount: "9.480 ton", value: 9480, color: "#94a3b8" },
  ];

  // Tablodaki Firmalar İçin Mini Trend (Gidişat) Çizgisi Verileri
  const trendUp = [{ v: 20 }, { v: 45 }, { v: 35 }, { v: 60 }, { v: 80 }];
  const trendMid = [{ v: 40 }, { v: 30 }, { v: 50 }, { v: 40 }, { v: 55 }];
  const trendDown = [{ v: 70 }, { v: 50 }, { v: 60 }, { v: 40 }, { v: 30 }];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      {/* ------------------------------------------------------------------ */}
      {/* SOL MENÜ (SIDEBAR) */}
      {/* ------------------------------------------------------------------ */}
      <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-emerald-600">
            <span className="text-2xl">♻️</span> DöngüBorsa
          </Link>

          <nav className="space-y-1 text-sm font-semibold">
            <Link href="/gosterge-paneli" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
              <span>🏠</span> Gösterge Paneli
            </Link>
            <Link href="/firma-analizi" className="flex items-center gap-3 px-3 py-2.5 bg-emerald-50/80 text-emerald-600 rounded-xl transition">
              <span>📊</span> Firma Analizi
            </Link>
            <Link href="/ilanlar-paneli" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
              <span>📄</span> İlanlar
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
              <span>📦</span> Malzemeler
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
              <span>🏷️</span> Teklifler
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
              <span>📈</span> Raporlar
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition">
              <span>⚙️</span> Ayarlar
            </Link>
          </nav>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl text-xs space-y-2">
          <p className="font-bold text-emerald-950">Döngüsel ekonomiye katkı sağla</p>
          <p className="text-emerald-700 text-[11px] leading-relaxed">Atıkları kaynağa dönüştür, değeri birlikte büyütelim.</p>
          <button className="text-emerald-600 font-bold hover:underline block pt-1">Daha Fazla Bilgi →</button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* SAĞ İÇERİK ALANI */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Üst Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Firma, malzeme veya ilan ara..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          {/* SAĞ ÜST KISIM (GİRİŞ YAP / KAYIT OL VEYA PROFİL) */}
          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl">
              🔔 <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </button>
            <button className="text-base p-2 bg-slate-100/80 rounded-xl">💬</button>

            {/* DİNAMİK GİRİŞ / KAYIT / PROFİL ALANI */}
            <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" alt="Profil" className="w-full h-full object-cover" />
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

        {/* Ana Analiz İçeriği */}
        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* Başlık ve Filtre Barı */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-slate-900">Firma Merkezli Analiz Paneli</h1>
            <div className="flex items-center gap-3 text-xs">
              <select className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl font-medium outline-none shadow-sm cursor-pointer">
                <option>01 Mayıs 2024 - 31 Mayıs 2024</option>
              </select>
              <button className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl font-semibold hover:bg-slate-50 shadow-sm flex items-center gap-1">
                <span>≡</span> Filtrele
              </button>
            </div>
          </div>

          {/* 1. ÖZET KARTLAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Toplam Firma</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">🏢</div>
              </div>
              <p className="text-2xl font-black text-slate-900">1.248</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %8,6 <span className="text-slate-400 font-normal">geçen aya göre</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Aktif İlan</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">📄</div>
              </div>
              <p className="text-2xl font-black text-slate-900">3.562</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %12,3 <span className="text-slate-400 font-normal">geçen aya göre</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Toplam İşlem Hacmi</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">₺</div>
              </div>
              <p className="text-2xl font-black text-slate-900">₺ 285,4M</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %15,7 <span className="text-slate-400 font-normal">geçen aya göre</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Geri Kazanılan Malzeme</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">♻️</div>
              </div>
              <p className="text-2xl font-black text-slate-900">128.450 ton</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %11,4 <span className="text-slate-400 font-normal">geçen aya göre</span>
              </p>
            </div>
          </div>

          {/* 2. TABLO VE ÖNE ÇIKAN FİRMA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-sm text-slate-900">Firma Performans Listesi</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium pb-3">
                      <th className="pb-3">Firma</th>
                      <th className="pb-3">Ana Malzeme Türü</th>
                      <th className="pb-3">Ortalama İşlem Hacmi (₺)</th>
                      <th className="pb-3">Toplam İşlem</th>
                      <th className="pb-3">Bölge</th>
                      <th className="pb-3">Performans ℹ️</th>
                      <th className="pb-3 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">D</span>
                        Döngü Metal A.Ş.
                      </td>
                      <td className="py-3.5 text-slate-600">Demir - Çelik</td>
                      <td className="py-3.5 font-bold text-slate-800">₺ 18.750.000</td>
                      <td className="py-3.5 text-slate-600">128</td>
                      <td className="py-3.5 text-slate-600">Marmara</td>
                      <td className="py-3.5"><span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[11px] font-bold">Yüksek</span></td>
                      <td className="py-3.5 w-16">
                        <div className="h-6 w-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendUp}><Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">Y</span>
                        Yeşil Polimer San. Ltd.
                      </td>
                      <td className="py-3.5 text-slate-600">Plastik</td>
                      <td className="py-3.5 font-bold text-slate-800">₺ 9.430.000</td>
                      <td className="py-3.5 text-slate-600">96</td>
                      <td className="py-3.5 text-slate-600">Ege</td>
                      <td className="py-3.5"><span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[11px] font-bold">Yüksek</span></td>
                      <td className="py-3.5 w-16">
                        <div className="h-6 w-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendUp}><Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">A</span>
                        AluTek Alüminyum A.Ş.
                      </td>
                      <td className="py-3.5 text-slate-600">Alüminyum</td>
                      <td className="py-3.5 font-bold text-slate-800">₺ 14.200.000</td>
                      <td className="py-3.5 text-slate-600">87</td>
                      <td className="py-3.5 text-slate-600">Marmara</td>
                      <td className="py-3.5"><span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[11px] font-bold">Orta</span></td>
                      <td className="py-3.5 w-16">
                        <div className="h-6 w-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendMid}><Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} /></LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-center pt-2">
                <button className="text-xs text-blue-600 font-bold hover:underline">Tüm Firmaları Görüntüle →</button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 relative">
              <span className="absolute top-5 right-5 w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs shadow-sm">★</span>
              <h3 className="font-bold text-sm text-slate-900">Öne Çıkan Firma</h3>
              
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center text-xl font-black shadow-sm">D</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Döngü Metal A.Ş.</h4>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">✓ Doğrulanmış</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Demir-çelik geri dönüşümünde lider, yüksek işlem hacmi ve güvenilir iş ortağı.
              </p>

              <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600"><span className="text-slate-400">Ana Malzeme Türü</span><span className="font-bold text-slate-800">Demir - Çelik</span></div>
                <div className="flex justify-between text-slate-600"><span className="text-slate-400">Toplam İşlem Hacmi</span><span className="font-bold text-slate-800">₺ 74.250.000</span></div>
                <div className="flex justify-between text-slate-600"><span className="text-slate-400">Toplam İşlem</span><span className="font-bold text-slate-800">128</span></div>
              </div>

              <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 rounded-xl text-xs transition">
                Firma Profilini Görüntüle →
              </button>
            </div>
          </div>

          {/* 3. GRAFİKLER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-900">Firma Bazlı İşlem Hacmi (₺)</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">İlk 5 Firma ▾</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-900">Malzeme Dağılımı</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2">
                <div className="h-44 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={42} outerRadius={68} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <p className="text-[9px] text-slate-400">Toplam</p>
                    <p className="text-[11px] font-black text-slate-800">128.450 ton</p>
                  </div>
                </div>

                <div className="space-y-2 text-[11px]">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{item.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-900">Analiz Yaklaşımı ℹ️</h3>
              
              <div 
                onClick={() => setActiveAnalysis("malzeme")}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${activeAnalysis === "malzeme" ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"}`}
              >
                <div>
                  <p className="font-bold text-xs text-slate-900">1. Malzeme-Merkezli:</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Her ilan/işlem bir satır</p>
                </div>
                <input type="radio" checked={activeAnalysis === "malzeme"} readOnly className="accent-emerald-600" />
              </div>

              <div 
                onClick={() => setActiveAnalysis("firma")}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${activeAnalysis === "firma" ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"}`}
              >
                <div>
                  <p className="font-bold text-xs text-slate-900">2. Firma-Merkezli:</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Her firma bir satır</p>
                </div>
                <input type="radio" checked={activeAnalysis === "firma"} readOnly className="accent-emerald-600" />
              </div>

              <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50/80 p-2.5 rounded-xl text-center border border-emerald-100">
                ✓ Seçili yaklaşım aktif olarak kullanılmaktadır.
              </p>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}