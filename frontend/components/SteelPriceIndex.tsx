"use client";

import { useState } from "react";

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
  completedTransactionPrices: number[], // Sadece tamamlanmış işlemlerin fiyat dizisi
  adminManualExternalPrice: number,     // Yönetici panelinden manuel girilen dış piyasa fiyatı
  exchangeRateFactor: number,           // Döviz kuru etkisi
  regionalPrice: number                 // Bölgesel endeks
): { referencePrice: number; isSufficientData: boolean } {
  const minRequiredTx = 5; // MVP için minimum tamamlanmış işlem eşiği
  const isSufficientData = completedTransactionPrices.length >= minRequiredTx;

  const medianPrice = isSufficientData
    ? calculateMedian(completedTransactionPrices)
    : adminManualExternalPrice; // Yetersiz veride geçici baz olarak admin verisi alınır

  // Ağırlıklar: %40 Medyan İşlem | %25 Admin Dış Piyasa | %20 Döviz | %15 Bölge
  const weighted =
    medianPrice * 0.40 +
    adminManualExternalPrice * 0.25 +
    exchangeRateFactor * 0.20 +
    regionalPrice * 0.15;

  return {
    referencePrice: Number(weighted.toFixed(2)),
    isSufficientData,
  };
}

// MVP Borsa Veri Seti (Excel'deki resmi başlıklarla birebir eşleştirildi)
const indexData = [
  {
    id: "DEM-01",
    name: "DKP (Soğuk Haddelenmiş Sac Artığı)",
    category: "Demir-Çelik",
    price: "11.80",
    unit: "TL/kg",
    change: "+0.85%",
    isUp: true,
    minPrice: "11.20",
    maxPrice: "12.10",
    txCount: 142, // Yeterli işlem var
    isSufficientData: true,
    confidenceLabel: "Yüksek (Medyan)",
    confidenceScore: "%98",
    lastUpdated: "11:45:10",
    chart7d: [11.2, 11.3, 11.25, 11.45, 11.6, 11.7, 11.8],
    chart30d: [10.6, 10.8, 10.9, 11.1, 11.2, 11.5, 11.8],
  },
  {
    id: "DEM-02",
    name: "İmalat Artığı Profil",
    category: "Demir-Çelik",
    price: "13.60",
    unit: "TL/kg",
    change: "+1.20%",
    isUp: true,
    minPrice: "12.90",
    maxPrice: "14.10",
    txCount: 98, // Yeterli işlem var
    isSufficientData: true,
    confidenceLabel: "Yüksek (Medyan)",
    confidenceScore: "%95",
    lastUpdated: "11:44:45",
    chart7d: [13.0, 13.1, 13.15, 13.3, 13.4, 13.5, 13.6],
    chart30d: [12.4, 12.6, 12.8, 13.0, 13.2, 13.4, 13.6],
  },
  {
    id: "DEM-03",
    name: "Talaş / Kırpıntı",
    category: "Demir-Çelik",
    price: "8.90",
    unit: "TL/kg",
    change: "-0.45%",
    isUp: false,
    minPrice: "8.50",
    maxPrice: "9.20",
    txCount: 76, // Yeterli işlem var
    isSufficientData: true,
    confidenceLabel: "Orta (Medyan)",
    confidenceScore: "%89",
    lastUpdated: "11:42:05",
    chart7d: [9.15, 9.1, 9.05, 9.0, 8.95, 8.92, 8.9],
    chart30d: [9.6, 9.4, 9.3, 9.2, 9.1, 9.0, 8.9],
  },
  {
    id: "DEM-04",
    name: "Kalıp Fazlası Parça",
    category: "Demir-Çelik",
    price: "8.30",
    unit: "TL/kg",
    change: "0.00%",
    isUp: false,
    minPrice: "7.80",
    maxPrice: "8.60",
    txCount: 3, // EŞİK ALTI: Sadece 3 tamamlanmış işlem var!
    isSufficientData: false, // Yetersiz Veri uyarısı tetiklenecek
    confidenceLabel: "Yetersiz Veri",
    confidenceScore: "Admin Bazlı",
    lastUpdated: "Manuel Giriş",
    chart7d: [8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3],
    chart30d: [8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3],
  },
];

// SVG Tabanlı Mini Trend Grafiği (Sparkline)
function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 110;
  const height = 28;

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

export default function SteelPriceIndex() {
  const [period, setPeriod] = useState<"7d" | "30d">("7d");
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      
      {/* ÜST BAR & PERİYOT SEÇİMİ */}
      <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-white uppercase">
                Dinamik Demir-Çelik Referans Fiyat Endeksi
              </h3>
              <button
                onClick={() => setShowFormulaModal(!showFormulaModal)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-2.5 py-0.5 rounded-full transition font-semibold"
              >
                ℹ️ MVP Medyan Hesaplama Kriterleri
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
              period === "7d"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Son 7 Günlük Trend
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-3 py-1.5 rounded-lg transition ${
              period === "30d"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Son 30 Günlük Trend
          </button>
        </div>
      </div>

      {/* MVP ŞEFFAF ALGORİTMA & FORMÜL AÇIKLAMA ALANI */}
      {showFormulaModal && (
        <div className="bg-slate-950/95 p-5 border-b border-emerald-500/30 text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-emerald-400 uppercase text-[11px] tracking-wider">
              ⚙️ MVP Referans Fiyat & Medyan Hesaplama Mimarisi
            </h4>
            <button
              onClick={() => setShowFormulaModal(false)}
              className="text-slate-400 hover:text-white text-sm font-bold"
            >
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
            <span><strong>Formül:</strong> Referans Fiyat = (Tamamlanan_İşlem_Medyanı × 0.40) + (Admin_Dış_Piyasa × 0.25) + (Döviz × 0.20) + (Bölge × 0.15)</span>
            <span className="text-amber-400 font-bold">*5 İşlem Altında &quot;Yetersiz Veri&quot; Gösterilir</span>
          </div>
        </div>
      )}

      {/* DETAYLI BORSA ENDEKS TABLOSU */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Malzeme Türü</th>
              <th className="py-3.5 px-4 text-right">Referans Fiyat</th>
              <th className="py-3.5 px-4 text-right">Günlük Değişim</th>
              <th className="py-3.5 px-4 text-center">Fiyat Aralığı (Alt - Üst)</th>
              <th className="py-3.5 px-4 text-center">
                Fiyat Grafiği ({period === "7d" ? "7G" : "30G"})
              </th>
              <th className="py-3.5 px-4 text-center">Tamamlanan İşlem</th>
              <th className="py-3.5 px-4 text-center">Veri Durumu / Güven</th>
              <th className="py-3.5 px-4 text-right">Son Güncelleme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {indexData.map((item) => {
              const activeChart = period === "7d" ? item.chart7d : item.chart30d;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition duration-150"
                >
                  {/* 1. Malzeme Türü */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-white block text-sm">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Kodu: {item.id} • {item.category}
                    </span>
                  </td>

                  {/* 2. Güncel TL/kg Referans Fiyatı */}
                  <td className="py-4 px-4 text-right">
                    <span className="text-base font-black text-white block">
                      {item.price}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {item.unit}
                    </span>
                  </td>

                  {/* 3. Günlük Değişim Yüzdesi */}
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`inline-flex items-center font-bold px-2 py-1 rounded-md text-xs ${
                        item.isUp
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {item.isUp ? "▲" : "▼"} {item.change}
                    </span>
                  </td>

                  {/* 4. Alt ve Üst Fiyat Aralığı */}
                  <td className="py-4 px-4 text-center font-mono">
                    <div className="inline-block bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                      <span className="text-red-400">{item.minPrice}</span>
                      <span className="text-slate-600 mx-1.5">—</span>
                      <span className="text-emerald-400">{item.maxPrice}</span>
                      <span className="text-[9px] text-slate-400 ml-1">TL</span>
                    </div>
                  </td>

                  {/* 5. Son 7 / 30 Günlük Fiyat Grafiği */}
                  <td className="py-4 px-4 text-center">
                    <Sparkline data={activeChart} isUp={item.isUp} />
                  </td>

                  {/* 6. Hesaplamada Kullanılan İşlem Sayısı */}
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold text-white block">
                      {item.txCount}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tamamlanmış İşlem
                    </span>
                  </td>

                  {/* 7. Veri Durumu & "Yetersiz Veri" Uyarısı */}
                  <td className="py-4 px-4 text-center">
                    {item.isSufficientData ? (
                      <div className="inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                        <span className="font-bold text-slate-200">
                          {item.confidenceLabel}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          ({item.confidenceScore})
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-400">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="font-bold text-xs">
                          ⚠️ Yetersiz Veri
                        </span>
                        <span className="text-[9px] text-amber-300 font-mono">
                          (Admin Manuel)
                        </span>
                      </div>
                    )}
                  </td>

                  {/* 8. Son Güncelleme Zamanı */}
                  <td className="py-4 px-4 text-right font-mono text-slate-300 text-xs">
                    {item.lastUpdated}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ALT BİLGİ VE AÇIKLAMA BARI */}
      <div className="bg-slate-950/90 px-5 py-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div>
          <span>📌 Not:</span> Platform içi fiyat verileri yalnızca <strong>tamamlanmış işlemlerin medyanı</strong> üzerinden hesaplanır. Yetersiz işlem hacminde admin referansı baz alınır.
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span>Hesaplama: Medyan Algoritması</span>
          <span>Birim: TL / Kilogram</span>
        </div>
      </div>

    </div>
  );
}