"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
export default function MalzemeDetayPage() {
  const [activeImage, setActiveImage] = useState(
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
  );

  const thumbnails = [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER: SADECE GERİ DÖN VE BAŞLIK */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/malzemeler"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition"
            >
              ←
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[#1E314A] bg-[#1E314A]/10 px-2.5 py-0.5 rounded border border-[#1E314A]/20">
                  T-00001
                </span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded border border-blue-100">
                  ✓ 3.1 MTR Analizli
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded">
                  1. Kalite Temiz Fire
                </span>
              </div>
              <h1 className="font-bold text-slate-900 text-lg mt-1">
                10mm S235JR Levha Sac Kesim Artığı (12.5 Ton) - Teknik Spesifikasyon Kartı
              </h1>
            </div>
          </div>

          <Link
            href="/malzemeler"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            ← Listeye Dön
          </Link>
        </header>

        {/* ANA DETAY İÇERİĞİ: SADECE ÖZELLİKLER VE TEKNİK VERİLER */}
        <main className="p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
          
          {/* 1. GÖRSEL GALERİSİ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              📸 Malzeme Sahası ve Fotoğraf Galerisi
            </h3>
            <div className="h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={activeImage} alt="Malzeme Görseli" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(thumb)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    activeImage === thumb ? "border-[#1E314A] scale-105" : "border-transparent opacity-70"
                  }`}
                >
                  <img src={thumb} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* 2. DETAYLI TEKNİK VE TİCARİ ÖZELLİKLER TABLOSU */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              📦 Detaylı Teknik ve Fiziksel Özellikler
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Kalite Standardı</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">S235JR (EN 10025-2)</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Stok Miktarı</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">12.500 kg (12.5 Ton)</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Teslimat Biçimi</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">EXW - Fabrika Teslim</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Et Kalınlığı / Ebat</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">10 mm (Karışık Levha)</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Malzeme Durumu</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">Paslanmaz / Temiz Fire</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Depo / Sahası</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">📍 Gebze / Kocaeli</strong>
              </div>
            </div>
          </div>

          {/* 3. 3.1 MTR KİMYASAL BİLEŞİM VE MEKANİK ANALİZ TABLOSU */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  🔬 3.1 MTR Laboratuvar & Kimyasal Analiz Raporu
                </h3>
                <p className="text-xs text-slate-400">Üretici fabrika tarafından onaylı kimyasal bileşim oranları</p>
              </div>
              <button
                onClick={() => alert("3.1 MTR Sertifikası (PDF) indiriliyor...")}
                className="text-xs font-bold text-[#1E314A] bg-[#1E314A]/10 px-3 py-1.5 rounded-lg border border-[#1E314A]/20 hover:bg-[#1E314A] hover:text-white transition"
              >
                📄 Belgeyi İndir (PDF)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="p-3">Karbon (%C)</th>
                    <th className="p-3">Mangan (%Mn)</th>
                    <th className="p-3">Silisyum (%Si)</th>
                    <th className="p-3">Fosfor (%P)</th>
                    <th className="p-3">Kükürt (%S)</th>
                    <th className="p-3">Çekme Dayanımı (MPa)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono font-bold text-slate-800">
                  <tr>
                    <td className="p-3">max. 0.17%</td>
                    <td className="p-3">1.40%</td>
                    <td className="p-3">0.035%</td>
                    <td className="p-3">0.025%</td>
                    <td className="p-3">0.025%</td>
                    <td className="p-3 text-[#1E314A]">360 - 510 MPa</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. MALZEME SAHASI VE AÇIKLAMA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">📝 Saha Açıklaması ve Fiziksel Durum</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Malzemeler fabrikamızın lazer kesim hattından artan 1. kalite S235JR sac levhalarıdır. Pas, yağ veya kontaminasyon bulunmamaktadır. Açık sahadan vince yükleme fabrikamıza aittir; nakliye alıcı firma tarafından karşılanacaktır (EXW). Ürünler kantar teslimati ile tesise sevk edilir.
            </p>
          </div>

          {/* 5. SATICI FİRMA KÜNYESİ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                İlan Sahibi Tesis
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Döngü Metal San. ve Tic. A.Ş.</h4>
              <p className="text-xs text-slate-500">📍 Gebze Organize Sanayi Bölgesi / Kocaeli</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-200">
                ✓ Doğrulanmış Üretici
              </span>
              <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl">
                ⭐ 4.9 Puan
              </span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}