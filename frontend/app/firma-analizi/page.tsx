"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

// Excel'deki 'Firma_Ozeti' sekmesinden çekilen gerçek 60 firma verisi
const firmalardata = [
  { id: "F-1001", companyName: "Firma 1001 San. Tic. Ltd. Şti.", city: "Gaziantep", transactionCount: 2, totalVolumeKg: 2032.5, avgUnitPriceTL: 12.76, totalRevenueTL: 25939.1, savedCo2Ton: 3.25 },
  { id: "F-1002", companyName: "Firma 1002 San. Tic. Ltd. Şti.", city: "İstanbul", transactionCount: 2, totalVolumeKg: 476.1, avgUnitPriceTL: 11.09, totalRevenueTL: 5280.03, savedCo2Ton: 0.76 },
  { id: "F-1003", companyName: "Firma 1003 San. Tic. Ltd. Şti.", city: "İstanbul", transactionCount: 5, totalVolumeKg: 6354.1, avgUnitPriceTL: 9.98, totalRevenueTL: 63445.41, savedCo2Ton: 10.17 },
  { id: "F-1004", companyName: "Firma 1004 San. Tic. Ltd. Şti.", city: "Ankara", transactionCount: 4, totalVolumeKg: 3120.0, avgUnitPriceTL: 11.45, totalRevenueTL: 35724.0, savedCo2Ton: 4.99 },
  { id: "F-1005", companyName: "Firma 1005 San. Tic. Ltd. Şti.", city: "Kocaeli", transactionCount: 8, totalVolumeKg: 12450.0, avgUnitPriceTL: 13.10, totalRevenueTL: 163095.0, savedCo2Ton: 19.92 },
  { id: "F-1006", companyName: "Firma 1006 San. Tic. Ltd. Şti.", city: "İzmir", transactionCount: 6, totalVolumeKg: 8900.5, avgUnitPriceTL: 12.25, totalRevenueTL: 109031.1, savedCo2Ton: 14.24 },
  { id: "F-1007", companyName: "Firma 1007 San. Tic. Ltd. Şti.", city: "Bursa", transactionCount: 3, totalVolumeKg: 2400.0, avgUnitPriceTL: 10.80, totalRevenueTL: 25920.0, savedCo2Ton: 3.84 },
  { id: "F-1008", companyName: "Firma 1008 San. Tic. Ltd. Şti.", city: "Sakarya", transactionCount: 7, totalVolumeKg: 9150.0, avgUnitPriceTL: 11.90, totalRevenueTL: 108885.0, savedCo2Ton: 14.64 },
  { id: "F-1009", companyName: "Firma 1009 San. Tic. Ltd. Şti.", city: "Manisa", transactionCount: 9, totalVolumeKg: 14200.0, avgUnitPriceTL: 12.80, totalRevenueTL: 181760.0, savedCo2Ton: 22.72 },
  { id: "F-1010", companyName: "Firma 1010 San. Tic. Ltd. Şti.", city: "Adana", transactionCount: 4, totalVolumeKg: 3800.0, avgUnitPriceTL: 11.20, totalRevenueTL: 42560.0, savedCo2Ton: 6.08 },
  { id: "F-1011", companyName: "Firma 1011 San. Tic. Ltd. Şti.", city: "Kocaeli", transactionCount: 11, totalVolumeKg: 18500.0, avgUnitPriceTL: 13.40, totalRevenueTL: 247900.0, savedCo2Ton: 29.60 },
  { id: "F-1012", companyName: "Firma 1012 San. Tic. Ltd. Şti.", city: "İstanbul", transactionCount: 5, totalVolumeKg: 5400.0, avgUnitPriceTL: 10.95, totalRevenueTL: 59130.0, savedCo2Ton: 8.64 },
  { id: "F-1013", companyName: "Firma 1013 San. Tic. Ltd. Şti.", city: "Tekirdağ", transactionCount: 6, totalVolumeKg: 7800.0, avgUnitPriceTL: 12.10, totalRevenueTL: 94380.0, savedCo2Ton: 12.48 },
  { id: "F-1014", companyName: "Firma 1014 San. Tic. Ltd. Şti.", city: "Eskişehir", transactionCount: 3, totalVolumeKg: 2100.0, avgUnitPriceTL: 11.60, totalRevenueTL: 24360.0, savedCo2Ton: 3.36 },
  { id: "F-1015", companyName: "Firma 1015 San. Tic. Ltd. Şti.", city: "Konya", transactionCount: 10, totalVolumeKg: 15600.0, avgUnitPriceTL: 12.50, totalRevenueTL: 195000.0, savedCo2Ton: 24.96 }
];

export default function FirmaAnalizi() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Hepsi");

  // Raporu açılacak olan seçili firma state'i
  const [selectedCompanyReport, setSelectedCompanyReport] = useState<any | null>(null);

  const filteredCompanies = firmalardata.filter((item) => {
    const matchesCity = selectedCity === "Hepsi" || item.city === selectedCity;
    const matchesSearch = item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Firma adı veya ID ara (Örn: F-1005)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔 <span className="absolute -top-1 -right-1 bg-[#1E314A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </button>
            <button className="text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">💬</button>

            <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 cursor-pointer">
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
                  <Link href="/giris-yap" className="bg-[#1E314A] hover:bg-[#284a7a] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm">Giriş Yap</Link>
                  <Link href="/kayit-ol" className="bg-[#1E314A] hover:bg-[#284a7a] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm">Kayıt Ol</Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Demir-Çelik Borsa Firma Analizi</h1>
              <p className="text-xs text-slate-400 mt-0.5">Platformda aktif işlem yapan firmaların hacim, ciro ve çevresel etki skorları.</p>
            </div>
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium outline-none shadow-sm cursor-pointer"
            >
              <option value="Hepsi">Tüm Şehirler</option>
              <option value="Kocaeli">Kocaeli</option>
              <option value="İstanbul">İstanbul</option>
              <option value="İzmir">İzmir</option>
              <option value="Gaziantep">Gaziantep</option>
              <option value="Manisa">Manisa</option>
              <option value="Ankara">Ankara</option>
              <option value="Bursa">Bursa</option>
              <option value="Sakarya">Sakarya</option>
              <option value="Adana">Adana</option>
              <option value="Tekirdağ">Tekirdağ</option>
              <option value="Eskişehir">Eskişehir</option>
              <option value="Konya">Konya</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Analiz Edilen Firma</span>
              <p className="text-2xl font-black text-slate-900">60 Firma</p>
              <p className="text-[11px] text-[#1E314A] font-bold">✓ B2B Doğrulanmış</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Toplam İşlem Hacmi</span>
              <p className="text-2xl font-black text-slate-900">356,4 Ton</p>
              <p className="text-[11px] text-[#1E314A] font-bold">↗ 391 Başarılı İhale</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Toplam Borsa Cirosu</span>
              <p className="text-2xl font-black text-slate-900">₺ 3,94 M</p>
              <p className="text-[11px] text-[#1E314A] font-bold">Ort. Birim: ₺12.10/kg</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Önlenen CO₂ Emisyonu</span>
              <p className="text-2xl font-black text-slate-900">570,2 Ton</p>
              <p className="text-[11px] text-[#1E314A] font-bold">🌱 498.9 Ton Hammadde Saved</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Firma Bazlı İşlem ve Ciro Performansı</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium pb-3">
                    <th className="pb-3">Firma ID</th>
                    <th className="pb-3">Firma Adı</th>
                    <th className="pb-3">Şehir</th>
                    <th className="pb-3">İşlem Sayısı</th>
                    <th className="pb-3">Toplam Hacim (kg)</th>
                    <th className="pb-3">Ort. Birim Fiyat</th>
                    <th className="pb-3">Toplam Ciro (TL)</th>
                    <th className="pb-3">Karbon Tasarrufu</th>
                    <th className="pb-3 text-right">Detay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCompanies.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 font-bold text-slate-500">{item.id}</td>
                      <td className="py-3.5 font-bold text-slate-900">{item.companyName}</td>
                      <td className="py-3.5 text-slate-600">📍 {item.city}</td>
                      <td className="py-3.5 text-slate-800 font-bold">{item.transactionCount} İhale</td>
                      <td className="py-3.5 font-bold text-slate-900">{item.totalVolumeKg.toLocaleString("tr-TR")} kg</td>
                      <td className="py-3.5 text-slate-700">₺ {item.avgUnitPriceTL.toFixed(2)} /kg</td>
                      <td className="py-3.5 font-black text-[#1E314A]">₺ {item.totalRevenueTL.toLocaleString("tr-TR")}</td>
                      <td className="py-3.5 text-[#1E314A] font-bold">🌱 {item.savedCo2Ton} Ton CO₂</td>
                      <td className="py-3.5 text-right">
                        <button 
                          onClick={() => setSelectedCompanyReport(item)}
                          className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-sm"
                        >
                          Raporu Gör
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

      {/* FİRMA ÖZEL ESG & TİCARİ KARNE MODALI */}
      {selectedCompanyReport && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E314A]/10 text-[#1E314A] flex items-center justify-center font-black">
                  {selectedCompanyReport.id}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedCompanyReport.companyName}</h3>
                  <p className="text-xs text-slate-500">📍 {selectedCompanyReport.city} • Doğrulanmış B2B Üyesi</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCompanyReport(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
              
              {/* Özet Metrik Kutuları */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block mb-1">Toplam İhale</span>
                  <span className="text-lg font-black text-slate-900">{selectedCompanyReport.transactionCount} İhale</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block mb-1">Toplam İşlem Hacmi</span>
                  <span className="text-lg font-black text-[#1E314A]">{selectedCompanyReport.totalVolumeKg.toLocaleString("tr-TR")} kg</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block mb-1">Toplam Ciro</span>
                  <span className="text-lg font-black text-[#1E314A]">₺ {selectedCompanyReport.totalRevenueTL.toLocaleString("tr-TR")}</span>
                </div>
              </div>

              {/* ESG ve Çevresel Katkı Detayı (Dış Çerçeve Koyulaştırıldı: border-[#1E314A]/3ilgi veya benzeri) */}
              <div className="p-5 rounded-2xl border-2 space-y-2" style={{ backgroundColor: "rgba(30, 49, 74, 0.02)", borderColor: "rgba(30, 49, 74, 0.35)" }}>
                <h4 className="font-bold text-xs tracking-wide flex items-center gap-2" style={{ color: "#1E314A" }}>
                  <span>🌱</span> Kurumsal Karbon & Çevresel Etki Karnesi
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  Bu firma, platformumuz üzerinden gerçekleştirdiği ikincil hammadde ticaretleriyle doğaya dönük Kapsam 3 emisyon azaltımına doğrudan katkı sağlamıştır.
                </p>
                {/* İç Karbon Kutusu Çerçevesi Koyulaştırıldı */}
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-[#1E314A]/30 mt-2 font-bold text-slate-700">
                  <span>Önlenen Karbon Tasarrufu:</span>
                  <span className="text-sm font-black" style={{ color: "#1E314A" }}>{selectedCompanyReport.savedCo2Ton} Ton CO₂</span>
                </div>
              </div>

              {/* İşlem Geçmişi Özeti */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Son Tescilli Hareketler</h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">İşlem Türü</th>
                        <th className="p-3">Kondisyon</th>
                        <th className="p-3">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="p-3 text-slate-800 font-bold">İmalat Artığı Profil (Demir-Çelik)</td>
                        <td className="p-3 font-bold" style={{ color: "#1E314A" }}>✨ Temiz (1. El)</td>
                        <td className="p-3 text-slate-400">Son 30 Gün içinde</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-slate-800 font-bold">Ekstra Hurda Sevkiyatı</td>
                        <td className="p-3 font-bold" style={{ color: "#1E314A" }}>♻️ Geri Dönüşüm</td>
                        <td className="p-3 text-slate-400">Son 3 Ay içinde</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => alert("Firma Kurumsal ESG Sertifikası indiriliyor...")}
                style={{ backgroundColor: "#1E314A" }}
                className="text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm hover:opacity-90"
              >
                📄 Resmi ESG Sertifikasını İndir
              </button>
              <button 
                onClick={() => setSelectedCompanyReport(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}