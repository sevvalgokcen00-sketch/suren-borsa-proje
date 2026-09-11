"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { apiUrl, apiFetch } from "@/lib/api";
import { Listing, listingMaterial, listingCity } from "@/lib/types";

export default function IlanlarPaneli() {
  const [activeTab, setActiveTab] = useState<"aktif" | "benim">("aktif");
  const [filter, setFilter] = useState("Hepsi");
  
  
  const [aktifListings, setAktifListings] = useState<any[]>([]);
  const [benimListings, setBenimListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawList = await apiFetch<Listing[]>("/api/listings");
      const formatted = (Array.isArray(rawList) ? rawList : []).map((item) => ({
        id: String(item.id),
        title: item.title || listingMaterial(item),
        amount: item.weight ?? 0,
        price: item.price ?? 0,
        location: listingCity(item),
        status: item.status || "Aktif",
        material_type: listingMaterial(item),
      }));

      // En yeni ilan en üstte
      formatted.sort((a, b) => Number(b.id) - Number(a.id));

      setAktifListings(formatted);
      setBenimListings(formatted);
    } catch (err) {
      // SESSİZ MOCK FALLBACK KALDIRILDI: var olmayan ilanları gerçekmiş gibi
      // göstermek, hatayı göstermekten çok daha kötüdür (çalışan sayfa ile
      // bozuk sayfa ayırt edilemez hale gelir).
      console.error("İlanlar çekilemedi:", err);
      setAktifListings([]);
      setBenimListings([]);
      setError("İlanlar sunucudan alınamadı. Lütfen birkaç saniye sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);


  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/listings/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: editPrice ? parseFloat(editPrice) : undefined,
          amount: editAmount ? parseFloat(editAmount) : undefined
        })
      });
      if (res.ok) {
        setBenimListings((prev: any[]) =>
          prev.map((item: any) =>
            String(item.id) === String(id)
              ? { ...item, price: editPrice || item.price, amount: editAmount || item.amount }
              : item
          )
        );
        setEditingId(null);
        alert("✅ İlan başarıyla güncellendi!");
      } else {
        alert("İlan güncellenirken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Bu ilanı kalıcı olarak kaldırmak istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(apiUrl(`/api/listings/${id}`), {
        method: "DELETE"
      });
      if (res.ok) {
        setBenimListings((prev: any[]) => prev.filter((item: any) => String(item.id) !== String(id)));
        setAktifListings((prev: any[]) => prev.filter((item: any) => String(item.id) !== String(id)));
        alert("✅ İlan veritabanından kalıcı olarak silindi.");
      } else {
        alert("İlan silinirken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucuya bağlanılamadı.");
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
            style={{ backgroundColor: "#123873" }}
            className="hover:opacity-90 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
          >
            + Yeni İlan Oluştur
          </Link>
        </header>

        {/* İÇERİK (ENİNE GENİŞLETİLDİ) */}
        <main className="w-full px-4 md:px-8 py-8 space-y-6 flex-1">
          
          {/* TABLO KARTI */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 w-full">
            
            {/* SEKMELER (TABS) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex gap-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab("aktif")}
                  style={{ borderColor: activeTab === "aktif" ? "#123873" : "transparent", color: activeTab === "aktif" ? "#123873" : "#94a3b8" }}
                  className={`pb-3 border-b-2 transition`}
                >
                  Aktif İlanlar ({aktifListings.length})
                </button>
                <button
                  onClick={() => setActiveTab("benim")}
                  style={{ borderColor: activeTab === "benim" ? "#123873" : "transparent", color: activeTab === "benim" ? "#123873" : "#94a3b8" }}
                  className={`pb-3 border-b-2 transition`}
                >
                  Benim İlanlarım ({benimListings.length})
                </button>
              </div>
              
              <div className="flex gap-2 text-xs">
                {["Hepsi", "Sertifikalı", "Sertifikasız"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    style={{ backgroundColor: filter === tab ? "#123873" : "#f1f5f9", color: filter === tab ? "#ffffff" : "#475569" }}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold pb-3">
                    <th className="pb-3 px-3">İlan ID</th>
                    <th className="pb-3 px-3">Malzeme Adı / Alt Tür</th>
                    <th className="pb-3 px-3">Miktar (kg)</th>
                    <th className="pb-3 px-3">Birim Fiyat</th>
                    <th className="pb-3 px-3">Sertifika (3.1)</th>
                    <th className="pb-3 px-3">Konum</th>
                    <th className="pb-3 px-3 text-right">Eylemler</th>
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
                        <td className="py-3 px-3 font-mono font-bold" style={{ color: "#123873" }}>{item.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{item.title}</td>
                        
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {activeTab === "benim" && editingId === item.id ? (
                            <input
                              type="text"
                              defaultValue={item.amount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="border border-[#123873] bg-slate-50 px-2 py-1 rounded-lg text-xs outline-none w-24 font-bold"
                            />
                          ) : (
                            item.amount
                          )}
                        </td>

                        <td className="py-3 px-3 font-black text-slate-900">
                          {activeTab === "benim" && editingId === item.id ? (
                            <input
                              type="text"
                              defaultValue={item.price}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="border border-[#123873] bg-slate-50 px-2 py-1 rounded-lg text-xs outline-none w-28 font-bold"
                            />
                          ) : (
                            item.price
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {item.hasCertificate ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border" style={{ backgroundColor: "rgba(18, 56, 115, 0.1)", color: "#123873", borderColor: "rgba(18, 56, 115, 0.2)" }}>
                              ✓ Mevcut
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Yok
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">📍 {item.location}</td>
                        
                        <td className="py-3 px-3 text-right space-x-1.5">
                          {activeTab === "aktif" ? (
                            <>
                              <Link
                                href={`/malzemeler/detay?id=${item.id}`}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg transition text-[11px] inline-block"
                              >
                                Görüntüle
                              </Link>

                              <Link
                                href={`/teklifler?ilan=${item.id}&baslik=${encodeURIComponent(item.title)}&fiyat=${item.price}`}
                                style={{ backgroundColor: "#123873" }}
                                className="hover:opacity-90 text-white font-bold px-2.5 py-1.5 rounded-lg transition text-[11px] inline-block shadow-sm"
                              >
                                Teklif Ver / Pazarlık Yap
                              </Link>
                            </>
                          ) : (
                            editingId === item.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  style={{ backgroundColor: "#123873" }}
                                  className="hover:opacity-90 text-white font-bold px-2.5 py-1.5 rounded-lg transition text-[11px]"
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

              {/* YÜKLENİYOR / HATA / BOŞ DURUMLARI */}
              {loading && (
                <div className="py-10 text-center space-y-2">
                  <div className="inline-block w-5 h-5 border-2 border-slate-200 border-t-[#123873] rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-semibold pt-1">İlanlar yükleniyor...</p>
                </div>
              )}

              {!loading && error && (
                <div className="py-10 text-center space-y-2">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-xs font-bold text-red-700">{error}</p>
                  <button onClick={loadListings} className="text-xs font-bold text-[#123873] hover:underline">
                    Tekrar Dene
                  </button>
                </div>
              )}

              {!loading && !error && currentListings.length === 0 && (
                <div className="py-10 text-center space-y-1">
                  <span className="text-2xl">📭</span>
                  <p className="text-xs font-bold text-slate-700">Henüz ilan yok.</p>
                  <p className="text-[11px] text-slate-400">Yeni bir ilan oluşturduğunuzda burada görünecek.</p>
                </div>
              )}

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}