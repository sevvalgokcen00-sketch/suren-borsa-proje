"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { MarketIndex } from "@/lib/types";

/**
 * Canlı fiyat şeridi — GET /api/market/indexes
 *
 * Alan eşlemesi:
 *   materialType       -> şerit etiketi
 *   referencePrice     -> "13,40 TL/kg"
 *   dailyChangePercent -> yüzde + yön (işaretinden türetilir; API'de isUp yok)
 *
 * NOT: Eski sabit listede "LME Küresel Çelik Endeksi" gibi dış piyasa kalemleri
 * vardı. /api/market/indexes yalnızca platform içi 6 malzemeyi döndürüyor;
 * external_market_prices tablosu dolu olmasına rağmen onu sunan bir uç yok.
 */

type TickerItem = {
  name: string;
  price: string;
  change: string;
  isUp: boolean;
};

export default function SteelTickerBar() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await apiFetch<MarketIndex[]>("/api/market/indexes");
        if (cancelled) return;

        setItems(
          data.map((m) => {
            const change = Number(m.dailyChangePercent);
            return {
              name: m.materialType,
              price: `${Number(m.referencePrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL/kg`,
              change: `${change >= 0 ? "+" : "-"}${Math.abs(change).toFixed(2)}%`,
              isUp: change >= 0,
            };
          })
        );
      } catch (err) {
        console.error("Fiyat şeridi çekilemedi:", err);
        // Sahte fiyat gösterilmez; şerit boş/uyarılı kalır.
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Yüklenirken veya hata durumunda şeridi tek satırlık bir durum mesajına indir
  if (items.length === 0) {
    return (
      <div className="bg-[#334155] text-white border-y border-slate-600/80 py-2.5 overflow-hidden select-none relative z-40 shadow-md">
        <div className="text-center text-xs text-slate-300 font-semibold">
          {error ? "⚠️ Canlı fiyat verisi alınamadı" : "Canlı fiyatlar yükleniyor..."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#334155] text-white border-y border-slate-600/80 py-2.5 overflow-hidden select-none relative z-40 shadow-md">
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: marquee 28s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="animate-ticker flex flex-nowrap items-center w-max whitespace-nowrap">
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs px-5 shrink-0">
            <span className="font-semibold text-slate-200">{item.name}:</span>

            <span className="font-black text-white font-mono text-[13px] tracking-tight">{item.price}</span>

            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-mono ${
                item.isUp
                  ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40"
                  : "bg-red-500/25 text-red-300 border border-red-400/40"
              }`}
            >
              <span>{item.isUp ? "▲" : "▼"}</span>
              <span>{item.change}</span>
            </span>

            <span className="text-slate-400 ml-3 font-bold">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
