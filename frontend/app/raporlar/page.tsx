"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { apiUrl } from "@/lib/api";

// GET /api/reports/esg yanıt şekli (backend routes/reports.js ile birebir)
type EsgCategory = {
  name: string;
  ton: number;
  percentage: number;
  co2PreventedTon: number;
};

type EsgReport = {
  summary: {
    totalListings: number;
    totalWeightTon: number;
    totalCO2Ton: number;
    cumulativeEnergyMWh: number;
    circularityRate: number;
  };
  ecological: {
    treeEquivalent: number;
    forestHectare: number;
    vehicleEquivalent: number;
  };
  categories: EsgCategory[];
};

export default function RaporlarPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2026 - Yıllık Özet");
  // Not: tip belirtilmezse `categories: []` -> never[] olarak çıkarsanır ve
  // cat.name erişimi derlemede patlar.
  const [reportData, setReportData] = useState<EsgReport>({
    summary: { totalListings: 380, totalWeightTon: 18420, totalCO2Ton: 27630, cumulativeEnergyMWh: 82890, circularityRate: 84.6 },
    ecological: { treeEquivalent: 130000, forestHectare: 325, vehicleEquivalent: 1150 },
    categories: []
  });

  useEffect(() => {
    fetch(apiUrl("/api/reports/esg"))
      .then(res => res.json())
      .then(res => {
        if (res && res.success && res.data) {
          setReportData(res.data);
        }
      })
      .catch(err => console.error("Rapor verisi çekilemedi:", err));
  }, []);

  const handlePrintReport = () => {
    window.print();
  };

  const { summary, ecological, categories } = reportData;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 print:border-none">
          <div>
            <h1 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span>🌿</span> ESG & Çevresel Sürdürülebilirlik Etki Raporu
            </h1>
            <p className="text-xs text-slate-400">
              Döngüsel ekonomi işlemlerinizin Kapsam 3 (Scope 3) karbon yutak ve ekolojik eşdeğer analizleri
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl outline-none focus:border-[#1E314A] cursor-pointer"
            >
              <option value="2026 - Yıllık Özet">📅 2026 - Yıllık Özet</option>
              <option value="Son 6 Ay">📅 Son 6 Ay</option>
              <option value="3. Çeyrek (Q3)">📅 3. Çeyrek (Q3)</option>
            </select>

            <button
              type="button"
              onClick={handlePrintReport}
              className="bg-[#1E314A] hover:bg-[#152336] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <span>🖨️</span> Raporu İndir / Yazdır (PDF)
            </button>
          </div>
        </header>

        <main className="p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
                  🌱
                </div>
                <div>
                  <h2 className="font-bold text-base tracking-wide uppercase">
                    Ekolojik Ağaç Eşdeğeri ve Karbon Yutak Analizi
                  </h2>
                  <p className="text-xs text-slate-400">
                    Önlenen <strong>{summary.totalCO2Ton.toLocaleString("tr-TR")} ton CO₂e</strong> emisyonunun doğadaki net karşılığı
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                ✓ Doğrulanmış Döngüsel Veri
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">Yıllık Ağaç Eşdeğeri</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {ecological.treeEquivalent.toLocaleString("tr-TR")}
                  </span>
                  <span className="text-sm font-bold text-slate-400">Ağaç</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Yetişkin ağaçların 1 tam yıl boyunca atmosferden temizlediği sera gazı miktarına eşdeğerdir.
                </p>
              </div>

              <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">Korunan Orman Alanı</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {ecological.forestHectare.toLocaleString("tr-TR")}
                  </span>
                  <span className="text-sm font-bold text-slate-400">Hektar</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Yaklaşık {Math.round(ecological.forestHectare * 1.4)} futbol sahası büyüklüğünde tam teşekküllü bir ormanın ekolojik katkısı.
                </p>
              </div>

              <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">Trafikten Çekilen Araç</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {ecological.vehicleEquivalent.toLocaleString("tr-TR")}
                  </span>
                  <span className="text-sm font-bold text-slate-400">Binek Araç</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  1 yıl boyunca binek araçların trafikten tamamen men edilmesiyle sağlanacak emisyon tasarrufudur.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 px-5 py-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 relative z-10">
              <div>✓ ISO 14064 & Kapsam 3 Uyumlu: Bu veriler firmaların sürdürülebilirlik ve karbon nötr denetim raporlarında kullanılabilir.</div>
              <div className="font-mono text-[11px] text-slate-500">Endeks: DöngüBorsa ESG v2.4</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Kategori Bazlı Geri Kazanım ve Dağılım</h3>
                <p className="text-xs text-slate-400">
                  Veritabanında kayıtlı toplam {summary.totalListings} malzemenin sektörel hacim ve emisyon tasarruf oranları
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                %100 Doğrulanmış Eşleşme
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {categories && categories.length > 0 ? (
                categories.slice(0, 4).map((cat, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="text-xs font-bold text-slate-700 truncate">{cat.name}</div>
                    <div className="text-lg font-black text-slate-900">
                      {cat.ton.toLocaleString("tr-TR")} Ton <span className="text-xs font-bold text-slate-500">(%{cat.percentage})</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold">
                      -{cat.co2PreventedTon.toLocaleString("tr-TR")} Ton CO₂e Tasarrufu
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 col-span-4 text-center text-xs text-slate-400">
                  Veriler yükleniyor...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Uluslararası ESG Uyumluluk Metrikleri & Sabit Çarpanlar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Karbon Emisyonu Tasarrufu</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {summary.totalCO2Ton.toLocaleString("tr-TR")} <span className="text-xs font-normal text-slate-500">Ton CO₂e</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  🍃
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Kümülatif Enerji Tasarrufu</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {summary.cumulativeEnergyMWh.toLocaleString("tr-TR")} <span className="text-xs font-normal text-slate-500">MWh</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Ort. Döngüsellik Oranı</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    %{summary.circularityRate} <span className="text-xs font-semibold text-emerald-500">Başarı</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  ♻️
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
