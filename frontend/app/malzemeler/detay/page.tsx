"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import baseData from "../../data/islemler.json";

// Excel ve sistem veri setine uygun sabitler
const excelAltTurler = ["İmalat Artığı Profil", "Ekstra Hurda", "Talaş / Kırpıntı", "DKP Hurda", "Mahalle (Karışık)", "Standart Dışı Sac / Levha"];
const companyList = Array.from({ length: 60 }, (_, i) => `Firma ${1001 + i} San. Tic. Ltd. Şti.`);
const cityList = ["Adana", "Bursa", "Eskişehir", "Gaziantep", "İstanbul", "İzmir", "Kocaeli", "Konya", "Manisa", "Sakarya"];

export default function MalzemeDetayPage() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || "00001";
  const numericId = parseInt(rawId.replace("T-", ""), 10) || 1;
  const index = (numericId - 1) % baseData.length;
  
  const original: any = (baseData as any[])[index] || {};
  const itemTitle = excelAltTurler[index % excelAltTurler.length];
  const itemCompany = companyList[index % companyList.length];
  const itemLocation = original.location || cityList[index % cityList.length];
  const itemId = `T-${String(numericId).padStart(5, "0")}`;

  // Karbon tasarrufu hesaplama (Örn: Her ton başına ~1.5 ton CO2e)
  const estimatedKg = (numericId * 147) % 4500 + 300;
  const carbonSavedTon = ((estimatedKg / 1000) * 1.52).toFixed(2);

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
        {/* HEADER */}
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
                <span className="text-[11px] font-mono font-bold text-[#123873] bg-[#123873]/10 px-2.5 py-0.5 rounded border border-[#123873]/20">
                  {itemId}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded border" style={{ backgroundColor: "rgba(18, 56, 115, 0.08)", color: "#123873", borderColor: "rgba(18, 56, 115, 0.2)" }}>
                  ✓ ISO 14064 Doğrulamalı
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded">
                  1. Kalite İkincil Hammadde
                </span>
              </div>
              <h1 className="font-bold text-slate-900 text-lg mt-1">
                {itemTitle} ({estimatedKg.toLocaleString("tr-TR")} kg) - Teknik Spesifikasyon Kartı
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

        {/* ANA DETAY İÇERİĞİ */}
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
                    activeImage === thumb ? "border-[#123873] scale-105" : "border-transparent opacity-70"
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
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">{estimatedKg.toLocaleString("tr-TR")} kg ({ (estimatedKg / 1000).toFixed(2) } Ton)</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Teslimat Biçimi</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">EXW - Fabrika Teslim</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Paketleme Biçimi</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">Preslenmiş-Balya / Gevşek</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Malzeme Durumu</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">Temiz / Üretim Fazlası</strong>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Depo / Sahası</span>
                <strong className="text-slate-900 font-black text-sm mt-0.5 block">📍 {itemLocation}</strong>
              </div>
            </div>
          </div>

          {/* 3. KURUMSAL KARBON & ÇEVRESEL ETKİ KARNESİ (TEKNOFEST VİZYONU) */}
          <div className="p-6 rounded-2xl border space-y-3 relative overflow-hidden bg-white shadow-sm" style={{ borderColor: "rgba(18, 56, 115, 0.2)" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <h4 className="font-black text-sm tracking-wide" style={{ color: "#123873" }}>Kurumsal Karbon & Çevresel Etki Analizi</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Bu ilandaki ikincil hammadde ve metal atıkların yeniden üretime kazandırılmasıyla, birincil cevher üretim süreçlerine kıyasla doğaya salınacak sera gazı emisyonu önlenmektedir.
            </p>
            <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: "rgba(18, 56, 115, 0.03)", borderColor: "rgba(18, 56, 115, 0.15)" }}>
              <span className="text-xs font-bold text-slate-700">Bu İlanın Sağladığı Net Karbon Tasarrufu:</span>
              <span className="text-base font-black" style={{ color: "#123873" }}>{carbonSavedTon} Ton CO₂e</span>
            </div>
          </div>

          {/* 4. 3.1 MTR KİMYASAL BİLEŞİM VE MEKANİK ANALİZ TABlosu */}
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
                style={{ backgroundColor: "rgba(18, 56, 115, 0.1)", color: "#123873", borderColor: "rgba(18, 56, 115, 0.2)" }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border transition hover:opacity-80"
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
                    <td className="p-3" style={{ color: "#123873" }}>360 - 510 MPa</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. SATICI FİRMA KÜNYESİ */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                İlan Sahibi Tesis
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{itemCompany}</h4>
              <p className="text-xs text-slate-500">📍 {itemLocation} Organize Sanayi Bölgesi</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-bold text-xs px-3 py-1.5 rounded-xl border" style={{ backgroundColor: "rgba(18, 56, 115, 0.05)", color: "#123873", borderColor: "rgba(18, 56, 115, 0.2)" }}>
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