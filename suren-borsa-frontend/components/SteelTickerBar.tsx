"use client";

// Yalnızca Demir-Çelik ve Metal Sektörü Kalemleri
const tickerItems = [
  { name: "Temiz Demir-Çelik Kırpıntısı (DKP)", price: "11,80 TL/kg", change: "+0,85%", isUp: true },
  { name: "ST37/ST44 Profil ve Levha Artığı", price: "13,60 TL/kg", change: "+1,20%", isUp: true },
  { name: "Demir-Çelik Talaşı (Temiz/Paslı)", price: "8,90 TL/kg", change: "-0,45%", isUp: false },
  { name: "Karışık / Kontamine Hurda", price: "8,30 TL/kg", change: "-0,80%", isUp: false },
  { name: "S235JR Levha Sac Kesim Artığı", price: "24,50 TL/kg", change: "+1,85%", isUp: true },
  { name: "304 Kalite Paslanmaz Kırpıntı", price: "42,80 TL/kg", change: "+1,90%", isUp: true },
  { name: "LME Küresel Çelik Endeksi", price: "$545,00 / Ton", change: "+0,50%", isUp: true },
];

export default function SteelTickerBar() {
  return (
    // TİTANYUM GRİSİ: bg-[#334155] & overflow-hidden ile dışarı taşma gizlenir
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

      {/* KRİTİK DÜZELTME: flex, flex-nowrap, w-max ve whitespace-nowrap doğrudan Tailwind class'ı olarak verildi! */}
      <div className="animate-ticker flex flex-nowrap items-center w-max whitespace-nowrap">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-xs px-5 shrink-0"
          >
            {/* Malzeme Adı: Açık Gümüş */}
            <span className="font-semibold text-slate-200">{item.name}:</span>

            {/* Fiyatlar: Bembeyaz ve Kalın Fontla Maksimum Okunabilirlik */}
            <span className="font-black text-white font-mono text-[13px] tracking-tight">
              {item.price}
            </span>

            {/* Günlük Değişim Rozetleri */}
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

            {/* Ayırıcı Nokta */}
            <span className="text-slate-400 ml-3 font-bold">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}