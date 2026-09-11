"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { MarketIndex, MarketHistoryPoint } from "@/lib/types";

// --- MVP ALGORİTMİK REFERANS FİYAT HESAPLAMA MOTORU ---
// 1. Dizi içerisindeki tamamlanmış işlemlerden "Medyan" hesaplayan fonksiyon
export function calculateMedian(prices: number[]): number {
  if (!prices || prices.length === 0) return 0;
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }
  return Number(sorted[mid].toFixed(2));
}

// 2. MVP Ağırlıklı Referans Fiyat Motoru
export function calculateMVPReferencePrice(
  completedTransactionPrices: number[],
  adminManualExternalPrice: number,
  exchangeRateFactor: number,
  regionalPrice: number
): { referencePrice: number; isSufficientData: boolean } {
  const minRequiredTx = 5;
  const isSufficientData = completedTransactionPrices.length >= minRequiredTx;

  const medianPrice = isSufficientData
    ? calculateMedian(completedTransactionPrices)
    : adminManualExternalPrice;

  const weighted =
    medianPrice * 0.4 + adminManualExternalPrice * 0.25 + exchangeRateFactor * 0.2 + regionalPrice * 0.15;

  return { referencePrice: Number(weighted.toFixed(2)), isSufficientData };
}

/** MVP eşiği: bu sayının altındaki işlem adedinde "Yetersiz Veri" gösterilir. */
const MIN_TX_FOR_CONFIDENCE = 5;

// SVG Tabanlı Mini Trend Grafiği (Sparkline)
function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  const width = 110;
  const height = 28;

  // Bazı malzemelerin fiyat geçmişi hiç yok (örn. Alüminyum) ya da tek nokta
  // içeriyor; bu durumda polyline çizilemez.
  if (!data || data.length < 2) {
    return <span className="text-[10px] text-slate-500 font-mono">veri yok</span>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke={isUp ? "#10b981" : "#ef4444"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/** Tabloda gösterilecek, API'den türetilmiş satır. */
type IndexRow = MarketIndex & { history: number[] };

export default function SteelPriceIndex() {
  const [period, setPeriod] = useState<"7d" | "30d">("7d");
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const [rows, setRows] = useState<IndexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Endeksler
        const indexes = await apiFetch<MarketIndex[]>("/api/market/indexes");

        // 2) Her malzeme için fiyat geçmişi (paralel).
        //    Geçmişi olmayan malzeme boş dizi ile devam eder, tablo yine çizilir.
        const withHistory = await Promise.all(
          indexes.map(async (idx) => {
            try {
              const h = await apiFetch<MarketHistoryPoint[]>(
                `/api/market/history/${encodeURIComponent(idx.materialType)}`
              );
              return { ...idx, history: h.map((p) => Number(p.price)).filter((n) => !Number.isNaN(n)) };
            } catch {
              return { ...idx, history: [] as number[] };
            }
          })
        );

        if (!cancelled) setRows(withHistory);
      } catch (err) {
        console.error("Piyasa endeksleri çekilemedi:", err);
        if (!cancelled) {
          // Sahte endekse DÜŞÜLMEZ.
          setRows([]);
          setError("Piyasa endeksleri alınamadı.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg text-slate-200">
      {/* ÜST BAŞLIK */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-sm tracking-tight">📊 Canlı İkincil Hammadde Endeksi</h3>
              <button
                onClick={() => setShowFormulaModal((v) => !v)}
                className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-md hover:bg-emerald-500/20 transition"
              >
                Formül Nasıl Çalışır?
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Tamamlanmış işlemlerin medyanı ile yönetici paneli dış piyasa verilerinin sentezi
            </p>
          </div>
        </div>

        {/* 7 Gün / 30 Gün Grafik Geçiş Butonu */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setPeriod("7d")}
            className={`px-3 py-1.5 rounded-lg transition ${
              period === "7d" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Son 7 Günlük Trend
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-3 py-1.5 rounded-lg transition ${
              period === "30d" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Son 30 Günlük Trend
          </button>
        </div>
      </div>

      {/* MVP ŞEFFAF ALGORİTMA & FORMÜL AÇIKLAMA ALANI */}
      {showFormulaModal && (
        <div className="bg-slate-950/95 p-5 border-b border-emerald-500/30 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-emerald-400 uppercase text-[11px] tracking-wider">
              ⚙️ MVP Referans Fiyat &amp; Medyan Hesaplama Mimarisi
            </h4>
            <button onClick={() => setShowFormulaModal(false)} className="text-slate-400 hover:text-white text-sm font-bold">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-black text-sm">%40 Ağırlık (Medyan)</div>
              <div className="font-bold text-white mt-0.5">Tamamlanmış İşlem Medyanı</div>
              <p className="text-[10px] text-slate-400 mt-1">Uç fiyatlardan etkilenmemek için normal ortalama yerine medyan alınır.</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-black text-sm">%25 Ağırlık (Admin)</div>
              <div className="font-bold text-white mt-0.5">Manuel Dış Piyasa Verisi</div>
              <p className="text-[10px] text-slate-400 mt-1">MVP aşamasında LME ve global metal fiyatları yönetici panelinden manuel girilir.</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-black text-sm">%20 Ağırlık</div>
              <div className="font-bold text-white mt-0.5">Döviz Kuru Etkisi</div>
              <p className="text-[10px] text-slate-400 mt-1">USD/TRY kuru dalgalanmasının emtia parite yansıması.</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-black text-sm">%15 Ağırlık</div>
              <div className="font-bold text-white mt-0.5">Bölgesel Endeks</div>
              <p className="text-[10px] text-slate-400 mt-1">Sanayi havzaları nakliye ve lokal fabrika arz/talep endeksi.</p>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-300 flex items-center justify-between">
            <span>
              <strong>Formül:</strong> Referans Fiyat = (Tamamlanan_İşlem_Medyanı × 0.40) + (Admin_Dış_Piyasa × 0.25) + (Döviz × 0.20) +
              (Bölge × 0.15)
            </span>
            <span className="text-amber-400 font-bold">*{MIN_TX_FOR_CONFIDENCE} İşlem Altında &quot;Yetersiz Veri&quot; Gösterilir</span>
          </div>
        </div>
      )}

      {/* YÜKLENİYOR */}
      {loading && (
        <div className="px-5 py-10 text-center space-y-2">
          <div className="inline-block w-5 h-5 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 pt-1">Piyasa endeksleri yükleniyor...</p>
        </div>
      )}

      {/* HATA */}
      {!loading && error && (
        <div className="px-5 py-10 text-center space-y-1">
          <span className="text-2xl">⚠️</span>
          <p className="text-xs font-bold text-red-400">{error}</p>
          <p className="text-[11px] text-slate-500">Endeks servisine şu anda ulaşılamıyor.</p>
        </div>
      )}

      {/* BOŞ */}
      {!loading && !error && rows.length === 0 && (
        <div className="px-5 py-10 text-center">
          <p className="text-xs text-slate-400">Henüz tanımlı bir piyasa endeksi yok.</p>
        </div>
      )}

      {/* DETAYLI BORSA ENDEKS TABLOSU */}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Malzeme Türü</th>
                <th className="py-3.5 px-4 text-right">Referans Fiyat</th>
                <th className="py-3.5 px-4 text-right">Günlük Değişim</th>
                <th className="py-3.5 px-4 text-center">Fiyat Aralığı (Alt - Üst)</th>
                <th className="py-3.5 px-4 text-center">Fiyat Grafiği ({period === "7d" ? "7G" : "30G"})</th>
                <th className="py-3.5 px-4 text-center">Tamamlanan İşlem</th>
                <th className="py-3.5 px-4 text-center">Veri Durumu / Güven</th>
                <th className="py-3.5 px-4 text-right">Son Güncelleme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {rows.map((item) => {
                const isUp = Number(item.dailyChangePercent) >= 0;
                // Geçmiş uç noktası sunucuda LIMIT 30 uyguluyor; ayrı bir dönem
                // parametresi YOK. 7G için son 7 noktayı alıyoruz.
                const activeChart = period === "7d" ? item.history.slice(-7) : item.history;
                const isSufficientData = Number(item.transactionCount) >= MIN_TX_FOR_CONFIDENCE;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition duration-150">
                    {/* 1. Malzeme Türü */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-white block text-sm">{item.materialType}</span>
                      <span className="text-[10px] text-slate-400">
                        Trend: {item.trend ?? "—"}
                      </span>
                    </td>

                    {/* 2. Güncel TL/kg Referans Fiyatı */}
                    <td className="py-4 px-4 text-right">
                      <span className="text-base font-black text-white block">
                        {Number(item.referencePrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">TL/kg</span>
                    </td>

                    {/* 3. Günlük Değişim Yüzdesi */}
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`inline-flex items-center font-bold px-2 py-1 rounded-md text-xs ${
                          isUp
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {isUp ? "▲" : "▼"} {Math.abs(Number(item.dailyChangePercent)).toFixed(2)}%
                      </span>
                    </td>

                    {/* 4. Alt ve Üst Fiyat Aralığı */}
                    <td className="py-4 px-4 text-center font-mono">
                      <div className="inline-block bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                        <span className="text-red-400">{Number(item.minPrice).toFixed(2)}</span>
                        <span className="text-slate-600 mx-1.5">—</span>
                        <span className="text-emerald-400">{Number(item.maxPrice).toFixed(2)}</span>
                        <span className="text-[9px] text-slate-400 ml-1">TL</span>
                      </div>
                    </td>

                    {/* 5. Fiyat Geçmişi Grafiği */}
                    <td className="py-4 px-4 text-center">
                      <Sparkline data={activeChart} isUp={isUp} />
                    </td>

                    {/* 6. Hesaplamada Kullanılan İşlem Sayısı */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-white block">{item.transactionCount}</span>
                      <span className="text-[10px] text-slate-400">Tamamlanmış İşlem</span>
                    </td>

                    {/* 7. Veri Durumu & "Yetersiz Veri" Uyarısı */}
                    <td className="py-4 px-4 text-center">
                      {isSufficientData ? (
                        <div className="inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          <span className="font-bold text-slate-200">{item.trustLevel ?? "Bilinmiyor"}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-400">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                          <span className="font-bold text-xs">⚠️ Yetersiz Veri</span>
                        </div>
                      )}
                    </td>

                    {/* 8. Son Güncelleme Zamanı */}
                    <td className="py-4 px-4 text-right font-mono text-slate-300 text-xs">
                      {item.updatedAt ? new Date(item.updatedAt.replace(" ", "T") + "Z").toLocaleString("tr-TR") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ALT BİLGİ VE AÇIKLAMA BARI */}
      <div className="bg-slate-950/90 px-5 py-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div>
          <span>📌 Not:</span> Platform içi fiyat verileri yalnızca <strong>tamamlanmış işlemlerin medyanı</strong> üzerinden hesaplanır.
          Yetersiz işlem hacminde admin referansı baz alınır.
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span>Kaynak: /api/market/indexes</span>
          <span>Birim: TL / Kilogram</span>
        </div>
      </div>
    </div>
  );
}
