"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";

export default function IlanlarPaneli() {
  // Giriş durumunu kontrol eden state (true/false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Alt Bar Grafik Verisi (Malzeme Türüne Göre İlan Sayısı)
  const barData = [
    { name: "Metal", count: 1248 },
    { name: "Plastik", count: 876 },
    { name: "Alüminyum", count: 542 },
    { name: "Kağıt", count: 456 },
    { name: "Ahşap", count: 268 },
    { name: "Kimyasal", count: 172 },
  ];

  // Alt Donut Grafik Verisi (İlan Durumu Dağılımı)
  const pieData = [
    { name: "Aktif", percentage: "%82,8", count: "2.948", value: 2948, color: "#10b981" },
    { name: "Öne Çıkan", percentage: "%10,0", count: "356", value: 356, color: "#f59e0b" },
    { name: "Teklifte", percentage: "%6,9", count: "246", value: 246, color: "#3b82f6" },
    { name: "Pasif", percentage: "%0,3", count: "12", value: 12, color: "#94a3b8" },
    { name: "Süresi Dolmuş", percentage: "%0,0", count: "0", value: 0, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      {/* SOL MENÜ (SIDEBAR BİLEŞENİ) */}
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
              🔔 <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
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

        {/* ANA İLAN YÖNETİM İÇERİĞİ */}
        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* Başlık ve Filtre Barı */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">İlan Yönetim Paneli</h1>
              <p className="text-xs text-slate-400 mt-0.5">Aktif ilanlarınızı yönetin, geri dönüştürülebilir malzemelerinizi keşfedin.</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <select className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl font-medium outline-none shadow-sm cursor-pointer">
                <option>01 Mayıs 2024 - 31 Mayıs 2024</option>
              </select>
              <button className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl font-semibold hover:bg-slate-50 shadow-sm flex items-center gap-1">
                <span>≡</span> Filtrele
              </button>
              <Link href="/ilan-ver" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5">
                <span className="text-sm">+</span> Yeni İlan Oluştur
              </Link>
            </div>
          </div>

          {/* 1. İLAN İSTATİSTİK KARTLARI (GEÇEN AYA GÖRE ARTIŞLAR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Toplam İlan</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">📄</div>
              </div>
              <p className="text-2xl font-black text-slate-900">3.562</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %18,7 <span className="text-slate-400 font-normal">geçen aya göre</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Aktif İlan</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">✓</div>
              </div>
              <p className="text-2xl font-black text-slate-900">2.948</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %15,3 <span className="text-slate-400 font-normal">geçen aya göre</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Bugün Eklenen</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">➕</div>
              </div>
              <p className="text-2xl font-black text-slate-900">128</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %9,2 <span className="text-slate-400 font-normal">dün'e göre</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Bekleyen Teklif</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">⏳</div>
              </div>
              <p className="text-2xl font-black text-slate-900">246</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>↗</span> %12,1 <span className="text-slate-400 font-normal">geçen aya göre</span>
              </p>
            </div>

          </div>

          {/* 2. GÜNCEL İLANLAR TABLOSU VE SAĞ FİLTRE PANELİ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-9 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-sm text-slate-900">Güncel İlanlar</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium pb-3">
                      <th className="pb-3">İlan Adı</th>
                      <th className="pb-3">Firma</th>
                      <th className="pb-3">Malzeme Türü</th>
                      <th className="pb-3">Miktar</th>
                      <th className="pb-3">Konum</th>
                      <th className="pb-3">Fiyat</th>
                      <th className="pb-3">Durum</th>
                      <th className="pb-3 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <img src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=80&q=80" className="w-9 h-9 rounded-lg object-cover" alt="İlan" />
                        Demir-Çelik Kırıntısı
                      </td>
                      <td className="py-3.5 text-slate-600">Döngü Metal A.Ş.</td>
                      <td className="py-3.5 text-slate-600">Metal</td>
                      <td className="py-3.5 text-slate-600">12.500 kg</td>
                      <td className="py-3.5 text-slate-600">📍 Kocaeli</td>
                      <td className="py-3.5 font-bold text-slate-900">₺ 8,20/kg</td>
                      <td className="py-3.5"><span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold">Aktif</span></td>
                      <td className="py-3.5 text-right"><button className="border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg text-[11px] font-semibold">Detay</button></td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=80&q=80" className="w-9 h-9 rounded-lg object-cover" alt="İlan" />
                        Granül Plastik Üretim Fazlası
                      </td>
                      <td className="py-3.5 text-slate-600">Yeşil Polimer San. Ltd.</td>
                      <td className="py-3.5 text-slate-600">Plastik</td>
                      <td className="py-3.5 text-slate-600">4.800 kg</td>
                      <td className="py-3.5 text-slate-600">📍 İzmir</td>
                      <td className="py-3.5 font-bold text-slate-900">₺ 14,50/kg</td>
                      <td className="py-3.5"><span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold">Aktif</span></td>
                      <td className="py-3.5 text-right"><button className="border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg text-[11px] font-semibold">Detay</button></td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <img src="https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=80&q=80" className="w-9 h-9 rounded-lg object-cover" alt="İlan" />
                        Alüminyum Profil Artığı
                      </td>
                      <td className="py-3.5 text-slate-600">AluTek A.Ş.</td>
                      <td className="py-3.5 text-slate-600">Alüminyum</td>
                      <td className="py-3.5 text-slate-600">3.200 kg</td>
                      <td className="py-3.5 text-slate-600">📍 Bursa</td>
                      <td className="py-3.5 font-bold text-slate-900">₺ 56,00/kg</td>
                      <td className="py-3.5"><span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold">Öne Çıkan</span></td>
                      <td className="py-3.5 text-right"><button className="border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg text-[11px] font-semibold">Detay</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-center pt-2">
                <button className="text-xs text-blue-600 font-bold hover:underline">Tüm İlanlarımı Görüntüle →</button>
              </div>
            </div>

            {/* Sağ: İlan Filtreleri Yan Paneli */}
            <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">İlan Filtreleri</h3>
                <span className="text-slate-400 text-base cursor-pointer">≡</span>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-500 font-bold text-[11px]">Malzeme Türü</label>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="accent-emerald-600" /> Metal</label>
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="accent-emerald-600" /> Plastik</label>
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" className="accent-emerald-600" /> Alüminyum</label>
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="accent-emerald-600" /> Kağıt</label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-500 font-bold text-[11px]">Konum</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer">
                  <option>Tüm Bölgeler</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition text-xs">
                  Filtrele
                </button>
              </div>
            </div>

          </div>

          {/* 3. ALT BÖLÜM: GRAFİKLER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-900">Malzeme Türüne Göre İlan Sayısı ℹ️</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-900">İlan Durumu Dağılımı ℹ️</h3>
              
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
                </div>

                <div className="space-y-2 text-[11px]">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative flex flex-col justify-between">
              <span className="absolute top-5 right-5 w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs shadow-sm">★</span>
              
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-slate-900">Öne Çıkan İlan</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black">D</div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Alüminyum Profil Artığı</h4>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">AluTek A.Ş. ✓</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <p className="flex items-center gap-1 text-[11px]">⚖️ 3.200 kg</p>
                  <p className="flex items-center gap-1 text-[11px]">📍 Bursa</p>
                  <p className="flex items-center gap-1 text-sm font-black text-slate-900 mt-1">₺ 56,00/kg</p>
                </div>
              </div>

              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition">
                İlanı Görüntüle →
              </button>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}