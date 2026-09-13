"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function OdemeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bidId = searchParams.get("bidId") || "";
  const listingTitle = searchParams.get("title") || "Hammadde / Ürün Alımı";
  const amount = searchParams.get("amount") || "0";
  const unit = searchParams.get("unit") || "Ton";
  const price = searchParams.get("price") || "0";
  const incoterm = searchParams.get("incoterm") || "FOB";
  const paymentTerm = searchParams.get("payment") || "Peşin";

  const [paymentMethod, setPaymentMethod] = useState("escrow");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalAmount = Number(amount) * Number(price);

  const handleCompleteOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
    }, 1500);
  };

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 text-center mx-4 sm:mx-auto">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✓
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">İşlem Başarıyla Başlatıldı!</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
          Güvenli Ticaret & Emanet (Escrow) hesabına ödeme provizyonu alındı. Mal teslimi ve kantar onayından sonra tutar satıcıya aktarılacaktır.
        </p>
        <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-left text-xs text-slate-600 space-y-1.5">
          <p><strong className="text-slate-800">Referans Kodu:</strong> TR-{Math.floor(100000 + Math.random() * 900000)}</p>
          <p className="truncate"><strong className="text-slate-800">İşlem Kalemi:</strong> {listingTitle}</p>
          <p><strong className="text-slate-800">Tutar:</strong> {totalAmount > 0 ? `${totalAmount.toLocaleString("tr-TR")} TL` : `${price} TL/Birim`}</p>
        </div>
        <Link
          href="/teklifler"
          className="inline-block mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md"
        >
          Teklifler Sayfasına Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Ticari Süreç & Güvenli Ödeme</h1>
          <p className="text-xs text-slate-500 mt-0.5">Onaylanan teklifinizin resmi sözleşme ve ödeme adımı</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg transition self-start sm:self-auto"
        >
          ← Vazgeç & Geri Dön
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol / Orta Panel: Sipariş ve Şartlar Özeti */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 border-b pb-2 mb-3">Anlaşma Özeti</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">İlan / Ürün</span>
                <span className="font-bold text-slate-800 truncate block">{listingTitle}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Miktar</span>
                <span className="font-bold text-slate-800">{amount} {unit}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Birim Fiyat</span>
                <span className="font-bold text-emerald-600">{price} TL</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Teslim & Ödeme</span>
                <span className="font-bold text-slate-800">{incoterm} / {paymentTerm}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 border-b pb-2 mb-3">Ödeme Yöntemi Seçimi</h3>
            <div className="space-y-2.5">
              <label className={`flex items-start sm:items-center justify-between p-3.5 rounded-xl border cursor-pointer transition gap-3 ${paymentMethod === "escrow" ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" : "border-slate-200 hover:bg-slate-50"}`}>
                <div className="flex items-start sm:items-center gap-3">
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "escrow"}
                    onChange={() => setPaymentMethod("escrow")}
                    className="text-emerald-600 focus:ring-emerald-500 mt-0.5 sm:mt-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Süren Borsa Güvenli Havuz (Escrow)</p>
                    <p className="text-[11px] text-slate-500">Para kantar onayı verilene kadar güvende tutulur.</p>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded shrink-0">Tavsiye Edilen</span>
              </label>

              <label className={`flex items-start sm:items-center justify-between p-3.5 rounded-xl border cursor-pointer transition gap-3 ${paymentMethod === "direct" ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500" : "border-slate-200 hover:bg-slate-50"}`}>
                <div className="flex items-start sm:items-center gap-3">
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "direct"}
                    onChange={() => setPaymentMethod("direct")}
                    className="text-emerald-600 focus:ring-emerald-500 mt-0.5 sm:mt-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Banka Havalesi / Doğrudan EFT</p>
                    <p className="text-[11px] text-slate-500">Satıcının cari IBAN hesabına doğrudan transfer.</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Sağ Panel: Tutar & Onay */}
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Ödeme Dökümü</h3>
              <div className="space-y-2 text-xs border-b pb-3 text-slate-600">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span className="font-semibold">{totalAmount.toLocaleString("tr-TR")} TL</span>
                </div>
                <div className="flex justify-between">
                  <span>Borsa Güvence Payı (%0):</span>
                  <span className="text-emerald-600 font-semibold">Ücretsiz</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 mb-4">
                <span className="text-xs font-bold text-slate-800">Toplam:</span>
                <span className="text-base sm:text-lg font-black text-emerald-700">{totalAmount.toLocaleString("tr-TR")} TL</span>
              </div>
            </div>

            <button
              onClick={handleCompleteOrder}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              {isProcessing ? "İşleniyor..." : "Süreci Başlat & Onayla 🤝"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OdemePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Yükleniyor...</div>}>
      <OdemeContent />
    </Suspense>
  );
}