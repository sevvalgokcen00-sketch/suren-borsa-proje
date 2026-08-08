"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function Teklifler() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"gelen" | "verilen">("gelen");

  // Örnek Gelen Teklifler Verisi
  const gelenTeklifler = [
    {
      id: 101,
      listingTitle: "10mm S235JR Levha Sac (12.500 kg)",
      offeredBy: "AluTek Alüminyum A.Ş.",
      offerAmount: "₺ 24.500 / Ton",
      totalPrice: "₺ 306.250",
      date: "Bugün, 14:20",
      status: "bekleyen",
    },
    {
      id: 102,
      listingTitle: "Granül PP Plastik Çapak (4.800 kg)",
      offeredBy: "EcoKağıt Geri Dönüşüm A.Ş.",
      offerAmount: "₺ 14.000 / Ton",
      totalPrice: "₺ 67.200",
      date: "Dün, 18:45",
      status: "onaylanan",
    },
    {
      id: 103,
      listingTitle: "Endüstriyel Ahşap Palet (650 Adet)",
      offeredBy: "Saha Lojistik Ltd.",
      offerAmount: "₺ 85 / Adet",
      totalPrice: "₺ 55.250",
      date: "29 Mayıs 2026",
      status: "reddedilen",
    },
  ];

  // Örnek Verilen Teklifler Verisi
  const verilenTeklifler = [
    {
      id: 201,
      listingTitle: "Alüminyum Profil Fire (3.200 kg)",
      ownerCompany: "AluTek A.Ş.",
      myOffer: "₺ 55.000 / Ton",
      totalPrice: "₺ 176.000",
      date: "Bugün, 11:10",
      status: "bekleyen",
    },
    {
      id: 202,
      listingTitle: "Balya Presli Karton Ambalaj (9.100 kg)",
      ownerCompany: "EcoKağıt A.Ş.",
      myOffer: "₺ 3.800 / Ton",
      totalPrice: "₺ 34.580",
      date: "28 Mayıs 2026",
      status: "onaylanan",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      {/* SOL MENÜ (SIDEBAR BİLEŞENİ) */}
      <Sidebar />

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ÜST HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tekliflerde ara (İlan adı veya firma)..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-xs px-4 py-2.5 rounded-xl outline-none transition"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              🔔 <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </button>
            <button className="text-base p-2 bg-slate-100/80 rounded-xl hover:bg-slate-200/60 transition">
              💬
            </button>

            {/* DİNAMİK GİRİŞ / KAYIT VEYA PROFİL */}
            <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" 
                      alt="Profil" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">Ahmet Yılmaz</p>
                    <p className="text-[10px] text-slate-400">Döngü Metal A.Ş.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/giris-yap" 
                    className="font-bold text-slate-700 hover:text-emerald-600 transition px-3 py-2 rounded-xl hover:bg-slate-100"
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/kayit-ol" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ANA TEKLİFLER İÇERİĞİ */}
        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* Başlık ve Özet */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Teklif Yönetim Paneli</h1>
              <p className="text-xs text-slate-400 mt-0.5">İlanlarınıza verilen teklifleri değerlendirin veya verdiğiniz teklifleri takip edin.</p>
            </div>
          </div>

          {/* TAB SEÇİMİ (GELEN TEKLİFLER / VERDİĞİM TEKLİFLER) */}
          <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
            <button
              onClick={() => setActiveTab("gelen")}
              className={`pb-3 border-b-2 transition ${
                activeTab === "gelen"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📥 Gelen Teklifler ({gelenTeklifler.length})
            </button>
            <button
              onClick={() => setActiveTab("verilen")}
              className={`pb-3 border-b-2 transition ${
                activeTab === "verilen"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📤 Verdiğim Teklifler ({verilenTeklifler.length})
            </button>
          </div>

          {/* TAB 1: GELEN TEKLİFLER */}
          {activeTab === "gelen" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">İlanlarınıza Gelen Son Teklifler</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium pb-3">
                      <th className="pb-3">İlan Adı</th>
                      <th className="pb-3">Teklif Veren Firma</th>
                      <th className="pb-3">Birim Fiyat Teklifi</th>
                      <th className="pb-3">Toplam Tutar</th>
                      <th className="pb-3">Tarih</th>
                      <th className="pb-3">Durum</th>
                      <th className="pb-3 text-right">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gelenTeklifler.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 font-bold text-slate-900">{item.listingTitle}</td>
                        <td className="py-4 text-slate-600">🏢 {item.offeredBy}</td>
                        <td className="py-4 font-bold text-emerald-600">{item.offerAmount}</td>
                        <td className="py-4 font-black text-slate-900">{item.totalPrice}</td>
                        <td className="py-4 text-slate-400">{item.date}</td>
                        <td className="py-4">
                          {item.status === "bekleyen" && (
                            <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ⏳ Bekliyor
                            </span>
                          )}
                          {item.status === "onaylanan" && (
                            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ✓ Onaylandı
                            </span>
                          )}
                          {item.status === "reddedilen" && (
                            <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ✕ Reddedildi
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right space-x-2">
                          {item.status === "bekleyen" ? (
                            <>
                              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm">
                                Onayla
                              </button>
                              <button className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition">
                                Reddet
                              </button>
                            </>
                          ) : (
                            <button className="text-slate-400 text-[11px] font-medium" disabled>
                              İşlem Tamamlandı
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: VERDİĞİM TEKLİFLER */}
          {activeTab === "verilen" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Diğer İlanlara Verdiğiniz Teklifler</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium pb-3">
                      <th className="pb-3">İlan Adı</th>
                      <th className="pb-3">İlan Sahibi Firma</th>
                      <th className="pb-3">Verdiğiniz Teklif</th>
                      <th className="pb-3">Toplam Tutar</th>
                      <th className="pb-3">Tarih</th>
                      <th className="pb-3">Durum</th>
                      <th className="pb-3 text-right">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {verilenTeklifler.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 font-bold text-slate-900">{item.listingTitle}</td>
                        <td className="py-4 text-slate-600">🏢 {item.ownerCompany}</td>
                        <td className="py-4 font-bold text-emerald-600">{item.myOffer}</td>
                        <td className="py-4 font-black text-slate-900">{item.totalPrice}</td>
                        <td className="py-4 text-slate-400">{item.date}</td>
                        <td className="py-4">
                          {item.status === "bekleyen" && (
                            <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ⏳ Yanıt Bekleniyor
                            </span>
                          )}
                          {item.status === "onaylanan" && (
                            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
                              ✓ Kabul Edildi
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          {item.status === "bekleyen" && (
                            <button className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition">
                              Teklifi Geri Çek
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}