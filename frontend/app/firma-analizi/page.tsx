"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { apiFetch } from "@/lib/api";
import { CompanyAnalysisData } from "@/lib/types";

export default function FirmaAnalizi() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyReport, setSelectedCompanyReport] =
    useState<CompanyAnalysisData["companies"][number] | null>(null);

  const [data, setData] = useState<CompanyAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<{ success: boolean; data: CompanyAnalysisData }>("/api/company-analysis");
        if (!cancelled) setData(res.data);
      } catch (err) {
        console.error("Firma analizi verisi çekilemedi:", err);
        if (!cancelled) {
          setData(null);
          setError("Firma analizi verileri alınamadı. Lütfen birkaç saniye sonra tekrar deneyin.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const companies = data?.companies ?? [];

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (item) => (item.name ?? "").toLowerCase().includes(q) || String(item.id).includes(q)
    );
  }, [companies, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col lg:flex-row text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Firma adı veya ID ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E314A] focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-4 text-xs">
            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <button onClick={() => setIsLoggedIn(false)} className="font-bold text-slate-500 hover:text-red-500 transition">
                  Çıkış
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Link href="/giris-yap" className="font-bold text-slate-600 hover:text-[#1E314A] transition px-3 py-2">
                    Giriş Yap
                  </Link>
                  <Link href="/kayit-ol" className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-4 py-2 rounded-xl transition shadow-sm">
                    Üye Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Demir-Çelik Borsa Firma Analizi</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Platformda aktif işlem yapan firmaların ilan hacmi ve ciro performansı.
              </p>
            </div>
          </div>

          {/* YÜKLENİYOR */}
          {loading && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
              <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[#1E314A] rounded-full animate-spin" />
              <h3 className="font-bold text-slate-800 text-sm pt-2">Firma analizi yükleniyor...</h3>
              <p className="text-xs text-slate-400">Sunucu bir süredir boştaysa ilk yanıt birkaç saniye sürebilir.</p>
            </div>
          )}

          {/* HATA */}
          {!loading && error && (
            <div className="bg-white p-12 text-center rounded-2xl border border-red-200 space-y-2">
              <span className="text-3xl">⚠️</span>
              <h3 className="font-bold text-red-700 text-sm">{error}</h3>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* KPI KARTLARI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs text-slate-500 font-semibold">Analiz Edilen Firma</span>
                  <p className="text-2xl font-black text-slate-900">{data.kpi.totalCompanies.value} Firma</p>
                  <p className="text-[11px] text-[#1E314A] font-bold">✓ Kayıtlı kurumsal üye</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs text-slate-500 font-semibold">Aktif İlan</span>
                  <p className="text-2xl font-black text-slate-900">{data.kpi.activeListings.value}</p>
                  <p className="text-[11px] text-[#1E314A] font-bold">↗ Yayındaki ilan sayısı</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs text-slate-500 font-semibold">Toplam Borsa Cirosu</span>
                  <p className="text-2xl font-black text-slate-900">{data.kpi.totalVolume.value}</p>
                  <p className="text-[11px] text-[#1E314A] font-bold">İlan bazlı toplam hacim</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs text-slate-500 font-semibold">İşlenen İkincil Hammadde</span>
                  <p className="text-2xl font-black text-slate-900">{data.kpi.recycledMaterial.value}</p>
                  <p className="text-[11px] text-[#1E314A] font-bold">🌱 Toplam tonaj</p>
                </div>
              </div>

              {/* ÖNE ÇIKAN FİRMA */}
              {data.featuredCompany && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E314A]/10 text-[#1E314A] flex items-center justify-center text-xl shrink-0">🏆</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900 text-sm">{data.featuredCompany.name}</h3>
                        {data.featuredCompany.verified && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            ✓ Doğrulanmış
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{data.featuredCompany.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 text-left lg:text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Ana Malzeme</span>
                      <span className="text-sm font-bold text-slate-800">{data.featuredCompany.mainMaterial}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Toplam Hacim</span>
                      <span className="text-sm font-black text-[#1E314A]">{data.featuredCompany.totalVolume}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-bold block">İşlem</span>
                      <span className="text-sm font-bold text-slate-800">{data.featuredCompany.totalTransactions}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MALZEME DAĞILIMI */}
              {data.charts?.materialDistribution?.items?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">Malzeme Dağılımı</h3>
                    <span className="text-[11px] font-bold text-slate-400">
                      Toplam {data.charts.materialDistribution.totalWeight}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {data.charts.materialDistribution.items.map((m) => (
                      <div key={m.name} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <span className="text-[11px] font-bold text-slate-600 sm:w-28 truncate">{m.name}</span>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${m.percentage}%`, backgroundColor: m.color }} />
                        </div>
                        <span className="text-[11px] font-black text-slate-700 sm:w-12 text-right">%{m.percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FİRMA TABLOSU */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Firma Bazlı İşlem ve Ciro Performansı</h3>

                {filteredCompanies.length === 0 ? (
                  <div className="py-10 text-center space-y-1">
                    <span className="text-2xl">🔍</span>
                    <p className="text-xs font-bold text-slate-700">
                      {companies.length === 0
                        ? "Henüz analiz edilecek firma verisi yok."
                        : "Aramanıza uyan firma bulunamadı."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                      <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-medium pb-3">
                            <th className="pb-3 pr-4">Firma ID</th>
                            <th className="pb-3 pr-4">Firma Adı</th>
                            <th className="pb-3 pr-4">Ana Malzeme</th>
                            <th className="pb-3 pr-4">İşlem Sayısı</th>
                            <th className="pb-3 pr-4">Ort. İşlem Hacmi</th>
                            <th className="pb-3 pr-4">Toplam Ciro (TL)</th>
                            <th className="pb-3 text-right">Detay</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredCompanies.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition">
                              <td className="py-3.5 pr-4 font-bold text-slate-500 whitespace-nowrap">#{item.id}</td>
                              <td className="py-3.5 pr-4 font-bold text-slate-900 whitespace-nowrap">{item.name}</td>
                              <td className="py-3.5 pr-4 text-slate-600 whitespace-nowrap">{item.mainMaterial}</td>
                              <td className="py-3.5 pr-4 text-slate-800 font-bold whitespace-nowrap">{item.totalTransactions} İlan</td>
                              <td className="py-3.5 pr-4 text-slate-700 whitespace-nowrap">{item.avgVolume}</td>
                              <td className="py-3.5 pr-4 font-black text-[#1E314A] whitespace-nowrap">
                                ₺ {Number(item.totalVolumeNum).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                              </td>
                              <td className="py-3.5 text-right whitespace-nowrap">
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
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* FİRMA TİCARİ KARNE MODALI */}
      {selectedCompanyReport && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E314A]/10 text-[#1E314A] flex items-center justify-center font-black shrink-0">
                  #{selectedCompanyReport.id}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedCompanyReport.name}</h3>
                  <p className="text-xs text-slate-500">Ana malzeme: {selectedCompanyReport.mainMaterial}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompanyReport(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center transition shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block mb-1">Toplam İlan</span>
                  <span className="text-lg font-black text-slate-900">{selectedCompanyReport.totalTransactions}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block mb-1">Ort. İşlem Hacmi</span>
                  <span className="text-lg font-black text-[#1E314A]">{selectedCompanyReport.avgVolume}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold block mb-1">Toplam Ciro</span>
                  <span className="text-lg font-black text-[#1E314A]">
                    ₺ {Number(selectedCompanyReport.totalVolumeNum).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div
                className="p-5 rounded-2xl border-2 space-y-2"
                style={{ backgroundColor: "rgba(30, 49, 74, 0.02)", borderColor: "rgba(30, 49, 74, 0.35)" }}
              >
                <h4 className="font-bold text-xs tracking-wide flex items-center gap-2" style={{ color: "#1E314A" }}>
                  <span>🌱</span> Çevresel Etki
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  Firma bazında karbon tasarrufu backend tarafından hesaplanmıyor. Sistem geneli ESG ve karbon
                  analizini Raporlar sayfasında görebilirsiniz.
                </p>
                <Link
                  href="/raporlar"
                  className="inline-block mt-1 text-[11px] font-bold text-[#1E314A] hover:underline"
                >
                  → ESG & Karbon Raporuna Git
                </Link>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
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