"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import {  useSearchParams , useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import baseData from "../../data/islemler.json";
import { apiUrl } from "@/lib/api";

// Excel ve sistem veri setine uygun sabitler
const excelAltTurler = ["İmalat Artığı Profil", "Ekstra İkincil Hammadde", "Talaş / Kırpıntı", "DKP İkincil Hammadde", "Mahalle (Karışık)", "Standart Dışı Sac / Levha"];
const companyList = Array.from({ length: 60 }, (_, i) => `Firma ${1001 + i} San. Tic. Ltd. Şti.`);
const cityList = ["Adana", "Bursa", "Eskişehir", "Gaziantep", "İstanbul", "İzmir", "Kocaeli", "Konya", "Manisa", "Sakarya"];

function MalzemeDetayContent() {
  const router = useRouter();
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

  const [showBidModal, setShowBidModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("4500");
  const [offerAmount, setOfferAmount] = useState(estimatedKg ? estimatedKg.toString() : "1000");
  const [incoterm, setIncoterm] = useState("EXW");
  const [paymentType, setPaymentType] = useState("Peşin");
  const [buyerNote, setBuyerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSendBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        listingId: numericId || 1,
        buyerId: 2,
        price: Number(offerPrice),
        amount: Number(offerAmount),
        incoterm,
        paymentType,
        buyerNote: buyerNote || "Detay sayfasından iletilen doğrudan teklif.",
        expiresIn: "48s"
      };

      const res = await fetch(apiUrl("/api/bids"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Teklifiniz basariyla iletildi!");
        setShowBidModal(false);
        window.location.href = "/teklifler";
      } else {
        alert("Teklif iletilirken bir sorun olustu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu baglanti hatasi!");
    } finally {
      setSubmitting(false);
    }
  };

      // Farklı ilanlar için backend arkadaşının yüklediği özel görsel setleri
  const imageSets: Record<string, string[]> = {
    "1": [
      apiUrl("/uploads/MD-TEMIZ-01.jpg"),
      apiUrl("/uploads/MD-TEMIZ-02.jpg"),
      apiUrl("/uploads/MD-TEMIZ-03.jpg"),
      apiUrl("/uploads/MD-TEMIZ-04.jpg")
    ],
    "2": [
      apiUrl("/uploads/MD-KESIMISLEME-01.jpg"),
      apiUrl("/uploads/MD-KESIMISLEME-02.jpg"),
      apiUrl("/uploads/MD-KESIMISLEME-03.jpg"),
      apiUrl("/uploads/MD-TEMIZ-05.jpg")
    ],
    "3": [
      apiUrl("/uploads/PB-BALYA-01.jpg"),
      apiUrl("/uploads/PB-BALYA-02.jpg"),
      apiUrl("/uploads/PB-BALYA-03.jpg"),
      apiUrl("/uploads/PB-GEVSEK-01.jpg")
    ],
    "4": [
      apiUrl("/uploads/MD-URETIMFAZLASI-01.jpg"),
      apiUrl("/uploads/MD-URETIMFAZLASI-02.jpg"),
      apiUrl("/uploads/MD-URETIMFAZLASI-03.jpg"),
      apiUrl("/uploads/MD-ORIJINALAMBALAJ-01.jpg")
    ]
  };

  // URL'deki ?id= parametresini güvenli çek ve T-00001 gibi ön ekleri temizle
  const rawIdParam = searchParams ? searchParams.get("id") : null;
  const cleanId = (rawIdParam || "1").replace(/[^0-9]/g, "") || "1";
  const idKey = cleanId;
  const selectedSet = imageSets[idKey] || imageSets[String(((Number(idKey) || 1) % 4) + 1)] || imageSets["1"];

  const [activeImage, setActiveImage] = useState(selectedSet[0]);
  const thumbnails = selectedSet;

  

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition">
              ←
            </button>
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

          <button type="button" onClick={() => router.back()} className="text-xs font-bold text-slate-500 hover:text-slate-800 transition">
            ← Listeye Dön
          </button>
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

        
        {/* 6. TEKLİF VER AKSİYON KARTI */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Bu Malzeme İçin Teklif İletin</h4>
            <p className="text-xs text-slate-500 mt-0.5">Doğrudan üretici firma ile pazarlık başlatın ve tekliflerinizi yönetin.</p>
          </div>
          <button
            onClick={() => setShowBidModal(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#123873] hover:bg-[#0e2c5a] shadow transition active:scale-95"
          >
            Teklif Ver
          </button>
        </div>
      </main>

      {/* TEKLİF VERME MODALI */}
      {showBidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Teklif Ver</h3>
              <button 
                onClick={() => setShowBidModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBid} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Birim Fiyat (₺/Birim)</label>
                <input
                  type="number"
                  required
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#123873]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Miktar (Kg / Ton / Adet)</label>
                <input
                  type="number"
                  required
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#123873]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teslimat (Incoterm)</label>
                  <select
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#123873]"
                  >
                    <option value="EXW">EXW - Fabrika Teslim</option>
                    <option value="FCA">FCA - Taşıyıcıya Teslim</option>
                    <option value="CPT">CPT - Taşıma Ödenmiş</option>
                    <option value="DAP">DAP - Belirlenen Yerde</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ödeme Türü</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#123873]"
                  >
                    <option value="Peşin">Peşin</option>
                    <option value="Vade (30 Gün)">Vade (30 Gün)</option>
                    <option value="Vade (60 Gün)">Vade (60 Gün)</option>
                    <option value="Akreditif">Akreditif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teklif Notu</label>
                <textarea
                  rows={2}
                  value={buyerNote}
                  onChange={(e) => setBuyerNote(e.target.value)}
                  placeholder="Opsiyonel açıklama veya şartlarınızı ekleyin..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#123873]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Hesaplanan Toplam:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {((Number(offerPrice) || 0) * (Number(offerAmount) || 0)).toLocaleString("tr-TR")} ₺
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-[#123873] text-white text-xs font-bold hover:bg-[#0e2c5a] transition disabled:opacity-50"
                >
                  {submitting ? "Gönderiliyor..." : "Teklifi İlet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

// useSearchParams() bir Suspense sınırı gerektirir; aksi halde bu sayfa
// prerender sırasında "missing-suspense-with-csr-bailout" hatasıyla build'i
// düşürür. İçerik tamamen istemci tarafında yüklendiği için sarmalayıcı
// davranışı değiştirmez, yalnızca ilk boyamada fallback gösterir.
export default function MalzemeDetayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-500 text-sm">
          Malzeme detayı yükleniyor...
        </div>
      }
    >
      <MalzemeDetayContent />
    </Suspense>
  );
}
