"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

import baseData from "../data/islemler.json";

const materialsData = Array.from({ length: 391 }, (_, i) => {
  const original: any = baseData[i % baseData.length];
  const idNumber = String(i + 1).padStart(5, '0');
  return {
    ...original,
    id: `T-${idNumber}`,
    company: `Firma ${1000 + (i % 25)} San. Tic. Ltd. Şti.`
  };
});

export default function IlanlarPaneli() {
  const [activeTab, setActiveTab] = useState<"aktif" | "benim">("aktif");
  const [filter, setFilter] = useState("Hepsi");
  
  // Listeleri ayırıyoruz: Aktif piyasa ilanları ve bizim ilanlarımız
  const [aktifListings, setAktifListings] = useState(materialsData.slice(0, 15));
  const [benimListings, setBenimListings] = useState(materialsData.slice(15, 20)); // Örnek kendi ilanlarımız

  // Satır içi düzenleme state'leri
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const handleSaveEdit = (id: string) => {
    setBenimListings(
      benimListings.map((item) =>
        item.id === id
          ? { ...item, price: editPrice || item.price, amount: editAmount || item.amount }
          : item
      )
    );
    setEditingId(null);
    alert("✅ İlan başarıyla güncellendi!");
  };

  const handleDeleteListing = (id: string) => {
    if (confirm("Bu ilanı kaldırmak istediğinize emin misiniz?")) {
      setBenimListings(benimListings.filter((item) => item.id !== id));
    }
  };

  const currentListings = activeTab === "aktif" ? aktifListings : benimListings;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-slate-900 text-sm">İlan Yönetim Paneli</h1>
            <p className="text-[11px] text-slate-400">Şirketinize ait borsa ilanları ve ihale durumları</p>
          </div>

          <Link 
            href="/ilan-ver" 
            className="bg-[#1E314A] hover:bg-[#284a7a] text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
          >
            + Yeni İlan Oluştur
          </Link>
        </header>

        {/* İÇERİK */}
        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* TABLO KARTI */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            
            {/* SEKMELER (TABS) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex gap-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab("aktif")}
                  className={`pb-3 border-b-2 transition ${
                    activeTab === "aktif"
                      ? "border-[#1E314A] text-[#1E314A]"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Aktif İlanlar ({aktifListings.length})
                </button>
                <button
                  onClick={() => setActiveTab("benim")}
                  className={`pb-3 border-b-2 transition ${
                    activeTab === "benim"
                      ? "border-[#1E314A] text-[#1E314A]"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Benim İlanlarım ({benimListings.length})
                </button>
              </div>
              
              <div className="flex gap-2 text-xs">
                {["Hepsi", "Sertifikalı", "Sertifikasız"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      filter === tab
                        ? "bg-[#1E314A] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold pb-3">
                    <th className="pb-3">İlan ID</th>
                    <th className="pb-3">Malzeme Adı / Alt Tür</th>
                    <th className="pb-3">Miktar (kg)</th>
                    <th className="pb-3">Birim Fiyat</th>
                    <th className="pb-3">Sertifika (3.1)</th>
                    <th className="pb-3">Konum</th>
                    <th className="pb-3 text-right">Eylemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {currentListings
                    .filter((item: any) => {
                      if (filter === "Sertifikalı") return item.hasCertificate;
                      if (filter === "Sertifikasız") return !item.hasCertificate;
                      return true;
                    })
                    .map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 font-mono font-bold text-[#1E314A]">{item.id}</td>
                        <td className="py-3.5 font-bold text-slate-900">{item.title}</td>
                        
                        <td className="py-3.5 font-bold text-slate-800">
                          {activeTab === "benim" && editingId === item.id ? (
                            <input
                              type="text"
                              defaultValue={item.amount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="border border-[#1E314A] bg-slate-50 px-2 py-1 rounded-lg text-xs outline-none w-24 font-bold"
                            />
                          ) : (
                            item.amount
                          )}
                        </td>

                        <td className="py-3.5 font-black text-slate-900">
                          {activeTab === "benim" && editingId === item.id ? (
                            <input
                              type="text"
                              defaultValue={item.price}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="border border-[#1E314A] bg-slate-50 px-2 py-1 rounded-lg text-xs outline-none w-28 font-bold"
                            />
                          ) : (
                            item.price
                          )}
                        </td>

                        <td className="py-3.5">
                          {item.hasCertificate ? (
                            <span className="bg-[#1E314A]/10 text-[#1E314A] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#1E314A]/20">
                              ✓ Mevcut
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Yok
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-600">📍 {item.location}</td>
                        
                        <td className="py-3.5 text-right space-x-1.5">
                          {activeTab === "aktif" ? (
                            /* PİYASADAKİ AKTİF İLANLAR: Görüntüle ve Teklif Ver butonları */
                            <>
                              <Link
                                href={`/malzemeler/detay?id=${item.id.replace("T-", "")}`}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg transition text-[11px] inline-block"
                              >
                                Görüntüle
                              </Link>

                              <Link
                                href={`/teklifler?ilan=${item.id}&baslik=${encodeURIComponent(item.title)}&fiyat=${String(item.price).replace(/[^0-9]/g, "") || "24500"}`}
                                className="bg-[#1E314A] hover:bg-[#152336] text-white font-bold px-2.5 py-1.5 rounded-lg transition text-[11px] inline-block shadow-sm"
                              >
                                Teklif Ver / Pazarlık Yap
                              </Link>
                            </>
                          ) : (
                            /* BENİM İLANLARIM: Güncelle ve Kaldır Butonları */
                            editingId === item.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="bg-[#1E314A] hover:bg-[#284a7a] text-white font-bold px-2.5 py-1.5 rounded-lg transition text-[11px]"
                                >
                                  Kaydet ✓
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg transition text-[11px]"
                                >
                                  İptal
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditPrice(item.price);
                                    setEditAmount(item.amount);
                                  }}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg transition text-[11px]"
                                >
                                  Güncelle
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteListing(item.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-lg transition text-[11px]"
                                >
                                  Kaldır
                                </button>
                              </>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}