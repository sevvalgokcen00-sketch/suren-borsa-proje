"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function RaporlarPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2026 - Yıllık Özet");
  const [showFormula, setShowFormula] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      {/* SOL MENÜ */}
      <Sidebar />

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ÜST HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span>📈</span> ESG & Çevresel Sürdürülebilirlik Etki Raporu
            </h1>
            <p className="text-xs text-slate-400">
              Döngüsel ekonomi işlemlerinizin Kapsam 3 (Scope 3) karbon yutak ve ekolojik eşdeğer analizleri
            </p>
          </div>

          <div className="flex items-center gap-3">
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
              onClick={() => alert("ESG Sürdürülebilirlik Raporu (PDF/XLSX) formatında hazırlanıyor...")}
              className="bg-[#1E314A] hover:bg-[#152336] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <span>📥</span> Raporu İndir
            </button>
          </div>
        </header>

        {/* ANA İÇERİK ALANI */}
        <main className="p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          
          {/* 🌲 AĞAÇ EŞDEĞERİ VE EKOLOJİK ETKİ MODÜLÜ */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden space-y-6">
            
            {/* Arka Plan Dekoratif Efekt (#1E314A Tonuna Çevrildi) */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#1E314A]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1E314A]/40 border border-[#1E314A]/60 flex items-center justify-center text-2xl shrink-0">
                  🌲
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                    EKOLOJİK AĞAÇ EŞDEĞERİ VE KARBON YUTAK ANALİZİ
                  </h2>
                  <p className="text-xs text-slate-300">
                    Önlenen <strong className="text-[#82A8D9]">2.860 ton CO₂e</strong> emisyonunun doğadaki net karşılığı
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFormula(!showFormula)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-[#82A8D9] border border-slate-700 px-3.5 py-1.5 rounded-xl transition font-bold"
              >
                {showFormula ? "✕ Formülü Gizle" : "ℹ️ Nasıl Hesaplandı?"}
              </button>
            </div>

            {/* Şeffaf Bilimsel Hesaplama Açıklaması (Toggle) */}
            {showFormula && (
              <div className="bg-slate-950/90 p-4 rounded-2xl border border-[#1E314A] text-xs text-slate-300 space-y-2 relative z-10">
                <div className="font-bold text-[#82A8D9] uppercase tracking-wider text-[11px]">
                  🔬 Bilimsel Karbon Eşdeğerlik Formülü (IPCC & EPA Standartları)
                </div>
                <p className="leading-relaxed">
                  Yetişkin bir çam veya orman ağacı yılda ortalama <strong>~22 kg CO₂</strong> (0,022 ton) karbon absorbe eder.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-white">
                  Ağaç Eşdeğeri = 2.860.000 kg CO₂e ÷ 22 kg/ağaç = <strong>130.000 Yetişkin Ağaç (1 Yıllık Yutak Kapasitesi)</strong>
                </div>
              </div>
            )}

            {/* Çarpıcı Ekolojik Rakamlar Gridi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              
              {/* Kart 1: Ağaç Eşdeğeri */}
              <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-2">
                <span className="text-xs font-bold text-[#82A8D9] uppercase">
                  Yıllık Ağaç Eşdeğeri
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    130.000
                  </span>
                  <span className="text-sm font-bold text-slate-400">Ağaç</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  130 bin yetişkin ağacın 1 tam yıl boyunca atmosferden temizlediği sera gazı miktarına eşdeğerdir.
                </p>
              </div>

              {/* Kart 2: Orman Alanı Eşdeğeri */}
              <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-2">
                <span className="text-xs font-bold text-[#82A8D9] uppercase">
                  Korunan Orman Alanı
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    325
                  </span>
                  <span className="text-sm font-bold text-slate-400">Hektar</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Yaklaşık <strong>450 futbol sahası</strong> büyüklüğünde tam teşekküllü bir çam ormanının ekolojik katkısıdır.
                </p>
              </div>

              {/* Kart 3: Trafikten Çekilen Araç Eşdeğeri */}
              <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-2">
                <span className="text-xs font-bold text-[#82A8D9] uppercase">
                  Trafikten Çekilen Araç
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    1.150
                  </span>
                  <span className="text-sm font-bold text-slate-400">Binek Araç</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  1.150 benzinli/dizel aracın 1 yıl boyunca trafikten tamamen men edilmesiyle sağlanacak emisyon tasarrufudur.
                </p>
              </div>

            </div>

            {/* Alt Bilgi & Kapsam 3 Bildirimi */}
            <div className="bg-slate-950/80 px-5 py-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[#82A8D9] font-bold">✓ ISO 14064 & Kapsam 3 Uyumlu:</span>
                <span>Bu veriler firmaların sürdürülebilirlik ve karbon nötr hedeflerinde doğrudan kullanılabilir.</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                Endeks: DöngüBorsa ESG v2.4
              </span>
            </div>

          </div>

          {/* MALZEME BAZLI ATIK KAZANIM DAĞILIMI (ALT ÖZET TABLO) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Kategori Bazlı Geri Kazanım Dağılımı
                </h3>
                <p className="text-xs text-slate-400">
                  18.420 tonluk toplam malzemenin sektörel hacim ve emisyon tasarruf oranları
                </p>
              </div>
              <span className="text-xs font-bold text-[#1E314A] bg-[#1E314A]/10 px-3 py-1 rounded-full border border-[#1E314A]/20">
                %100 Doğrulanmış Eşleşme
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-800">🏗️ Demir-Çelik (İkincil Hammadde/Fire)</div>
                <div className="text-lg font-black text-slate-900 mt-1">11.450 Ton (%62)</div>
                <div className="text-[11px] text-[#1E314A] font-bold mt-0.5">~1.950 Ton CO₂e Tasarrufu</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-800">⚙️ Alüminyum & Alaşım</div>
                <div className="text-lg font-black text-slate-900 mt-1">3.120 Ton (%17)</div>
                <div className="text-[11px] text-[#1E314A] font-bold mt-0.5">~580 Ton CO₂e Tasarrufu</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-800">♻️ Plastik & Granül (PP/PE)</div>
                <div className="text-lg font-black text-slate-900 mt-1">2.380 Ton (%13)</div>
                <div className="text-[11px] text-[#1E314A] font-bold mt-0.5">~240 Ton CO₂e Tasarrufu</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-800">📦 Kağıt, Karton & Palet</div>
                <div className="text-lg font-black text-slate-900 mt-1">1.470 Ton (%8)</div>
                <div className="text-[11px] text-[#1E314A] font-bold mt-0.5">~90 Ton CO₂e Tasarrufu</div>
              </div>
            </div>
          </div>

          {/* YENİ EKLENEN KISIM: ESG METRİKLERİ VE HESAPLAMA FORMÜLLERİ */}
          <div className="space-y-4 pt-2 border-t border-slate-200/60 mt-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Uluslararası ESG Uyumluluk Metrikleri & Sabit Çarpanlar</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. Karbon Tasarrufu */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">💨</div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Karbon Emisyonu Tasarrufu</h4>
                  </div>
                  
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900">27.630</span>
                    <span className="text-xs font-bold text-slate-400">Ton CO₂e</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 mb-4">Sıfırdan üretim yerine atıl stok kullanımından elde edilen tasarruf.</p>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                      <span>Uygulanan Formül</span>
                      <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Sabit</span>
                    </div>
                    <p className="font-mono text-xs font-bold text-[#1E314A] pt-1">İşlem Hacmi (Ton) × 1.5</p>
                    <p className="text-[9px] text-slate-500">Kabul gören standart: 1 Ton ikincil hammadde çelik, ortalama 1.5 ton sera gazı salınımını önler.</p>
                  </div>
                </div>
              </div>

              {/* 2. Enerji Verimliliği */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">⚡</div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Kümülatif Enerji Tasarrufu</h4>
                  </div>
                  
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900">82.890</span>
                    <span className="text-xs font-bold text-slate-400">MWh</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 mb-4">Cevherden eritmeye kıyasla sağlanan net elektrik/ısı enerjisi kazancı.</p>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                      <span>Uygulanan Formül</span>
                      <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Sabit</span>
                    </div>
                    <p className="font-mono text-xs font-bold text-[#1E314A] pt-1">İşlem Hacmi (Ton) × 4.5</p>
                    <p className="text-[9px] text-slate-500">Kabul gören standart: 1 Ton ikincil hammadde kullanımı madencilik ve izabeye göre 4.5 MWh tasarruf sağlar.</p>
                  </div>
                </div>
              </div>

              {/* 3. Döngüsel Ekonomi Skoru */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">🔄</div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Ort. Döngüsellik Oranı</h4>
                  </div>
                  
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900">%82.4</span>
                    <span className="text-xs font-bold text-slate-400">Başarı</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 mb-4">Platformdaki firmaların atıklarını çöpe atmak yerine ekonomiye kazandırma skoru.</p>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                      <span>Uygulanan Formül</span>
                      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Değişken</span>
                    </div>
                    <p className="font-mono text-[11px] font-bold text-[#1E314A] pt-1">(Satılan Atık / Toplam Atık) × 100</p>
                    <p className="text-[9px] text-slate-500">Firmaların platformda sattığı malzemenin, beyan edilen toplam fireye oranıdır.</p>
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